import { del, list } from '@vercel/blob';

/**
 * Upload an image to Vercel Blob storage via the secure API route
 * @param file - The file to upload
 * @param filename - Optional custom filename
 * @returns Promise with blob URL
 */
export async function uploadPortfolioImageToBlob(
  file: File,
  filename?: string
): Promise<{ url: string; pathname: string }> {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedName = filename || file.name;
    const extension = sanitizedName.split('.').pop();
    const baseName = sanitizedName.replace(/\.[^.]*$/, '');
    const uniqueFilename = `portfolio/${baseName}-${timestamp}.${extension}`;

    console.log('[v0] Proxying upload to API:', uniqueFilename);

    // Call our internal API route instead of @vercel/blob directly on client
    const response = await fetch(`/api/upload?filename=${encodeURIComponent(uniqueFilename)}`, {
      method: 'POST',
      body: file,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${errorText}`);
    }

    const blob = await response.json();
    console.log('[v0] Proxy upload successful:', blob.url);

    return {
      url: blob.url,
      pathname: blob.pathname,
    };
  } catch (error) {
    console.error('[v0] Error in proxy upload:', error);
    throw new Error(`Failed to upload image to blob storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a portfolio image from Vercel Blob storage
 * @param pathname - The pathname of the blob to delete
 */
export async function deletePortfolioImageFromBlob(pathname: string): Promise<void> {
  try {
    if (!pathname) {
      throw new Error('No pathname provided');
    }

    console.log('[v0] Deleting portfolio image from Blob:', pathname);
    
    // Deletion still requires token. Since we don't have a del proxy yet,
    // we use the token if available, but ideally this should also be proxied.
    await del(pathname, {
      token: process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN,
    });
    
    console.log('[v0] Blob deletion successful');
  } catch (error) {
    console.error('[v0] Error deleting from Blob:', error);
    throw new Error(`Failed to delete image from blob storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * List portfolio images in Vercel Blob storage
 */
export async function listPortfolioImages(): Promise<Array<{ pathname: string; url: string }>> {
  try {
    console.log('[v0] Listing portfolio images from Blob');
    
    const { blobs } = await list({
      prefix: 'portfolio/',
      token: process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN,
    });

    const images = blobs.map((blob) => ({
      pathname: blob.pathname,
      url: blob.url,
    }));

    return images;
  } catch (error) {
    console.error('[v0] Error listing blobs:', error);
    return [];
  }
}

export function getImageUrl(imageIdentifier: string): string {
  if (!imageIdentifier) return '';
  if (imageIdentifier.startsWith('http')) return imageIdentifier;
  return imageIdentifier;
}

export async function verifyImageExists(imageUrl: string): Promise<boolean> {
  try {
    if (!imageUrl) return false;
    const response = await fetch(imageUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}
