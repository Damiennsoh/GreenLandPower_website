import { put, del, list } from '@vercel/blob';

/**
 * Upload a portfolio image to Vercel Blob storage
 * @param file - The file to upload (File object from form input)
 * @param filename - Optional custom filename (defaults to file name)
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

    console.log('[v0] Uploading portfolio image to Blob:', uniqueFilename);

    // Upload to Vercel Blob with private access
    const blob = await put(uniqueFilename, file, {
      access: 'private', // Private by default for admin uploads
      addRandomSuffix: false, // We already have unique name with timestamp
    });

    console.log('[v0] Blob upload successful:', blob.url);

    return {
      url: blob.url,
      pathname: blob.pathname,
    };
  } catch (error) {
    console.error('[v0] Error uploading to Blob:', error);
    throw new Error(`Failed to upload image to blob storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a portfolio image from Vercel Blob storage
 * @param pathname - The pathname of the blob to delete (from the blob object)
 */
export async function deletePortfolioImageFromBlob(pathname: string): Promise<void> {
  try {
    if (!pathname) {
      throw new Error('No pathname provided');
    }

    console.log('[v0] Deleting portfolio image from Blob:', pathname);
    await del(pathname);
    console.log('[v0] Blob deletion successful');
  } catch (error) {
    console.error('[v0] Error deleting from Blob:', error);
    throw new Error(`Failed to delete image from blob storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * List portfolio images in Vercel Blob storage
 * @returns Promise with list of blobs in portfolio folder
 */
export async function listPortfolioImages(): Promise<Array<{ pathname: string; url: string }>> {
  try {
    console.log('[v0] Listing portfolio images from Blob');
    
    const { blobs } = await list({
      prefix: 'portfolio/',
    });

    const images = blobs.map((blob) => ({
      pathname: blob.pathname,
      url: blob.url,
    }));

    console.log('[v0] Found', images.length, 'portfolio images');
    return images;
  } catch (error) {
    console.error('[v0] Error listing blobs:', error);
    return [];
  }
}

/**
 * Get image URL - tries blob first, then falls back to public directory
 * @param imageIdentifier - Either blob pathname or public directory path
 * @returns The full image URL
 */
export function getImageUrl(imageIdentifier: string): string {
  if (!imageIdentifier) {
    return '';
  }

  // If it's already a full Blob URL (starts with http), return as-is
  if (imageIdentifier.startsWith('http')) {
    return imageIdentifier;
  }

  // If it looks like a blob pathname, construct the URL
  if (imageIdentifier.startsWith('portfolio/')) {
    // This would be constructed by Blob service, but we'll return the identifier
    // The actual URL should come from uploadPortfolioImageToBlob response
    return imageIdentifier;
  }

  // Otherwise treat as public directory path
  return imageIdentifier;
}

/**
 * Verify if an image exists by checking if it can be accessed
 * @param imageUrl - The image URL to verify
 * @returns Promise with boolean indicating if image exists
 */
export async function verifyImageExists(imageUrl: string): Promise<boolean> {
  try {
    if (!imageUrl) return false;

    const response = await fetch(imageUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn('[v0] Error verifying image:', error);
    return false;
  }
}
