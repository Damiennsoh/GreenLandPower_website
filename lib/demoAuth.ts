// Demo Authentication for Admin Panel
// This is a simple demo authentication system without Firebase Auth
// Replace with Firebase Auth or your preferred auth provider when needed

export interface DemoUser {
  email: string;
  password: string;
}

const DEMO_CREDENTIALS = {
  email: 'admin@greenland.com',
  password: 'demo123456',
};

export const demoLogin = (email: string, password: string): DemoUser | null => {
  if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
    return { email, password: '' };
  }
  return null;
};

export const demoLogout = () => {
  // Clear any stored session
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('demoAdminSession');
  }
};

export const getDemoSession = (): DemoUser | null => {
  if (typeof window !== 'undefined') {
    const session = sessionStorage.getItem('demoAdminSession');
    return session ? JSON.parse(session) : null;
  }
  return null;
};

export const setDemoSession = (user: DemoUser) => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('demoAdminSession', JSON.stringify(user));
  }
};

export const isDemoAuthed = (): boolean => {
  return getDemoSession() !== null;
};
