import Cookies from 'js-cookie';

// Cookie options for security
const cookieOptions = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  expires: 7, // 7 days
};

export const authUtils = {
  // Store authentication data
  setAuth: (token, user) => {
    Cookies.set('mindcare_token', token, cookieOptions);
    Cookies.set('mindcare_user', JSON.stringify(user), cookieOptions);
  },

  // Get authentication token
  getToken: () => {
    return Cookies.get('mindcare_token');
  },

  // Get user data
  getUser: () => {
    const userStr = Cookies.get('mindcare_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
      }
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = Cookies.get('mindcare_token');
    const user = Cookies.get('mindcare_user');
    return !!(token && user);
  },

  // Check if user has specific role
  hasRole: (role) => {
    const user = authUtils.getUser();
    return user?.roles?.includes(role) || false;
  },

  // Check if user is admin
  isAdmin: () => {
    return authUtils.hasRole('ADMIN');
  },

  // Check if user is professional
  isProfessional: () => {
    return authUtils.hasRole('PROFESSIONAL');
  },

  // Check if user is patient
  isPatient: () => {
    return authUtils.hasRole('PATIENT');
  },

  // Clear authentication data
  clearAuth: () => {
    Cookies.remove('mindcare_token');
    Cookies.remove('mindcare_user');
  },

  // Format user display name
  getUserDisplayName: () => {
    const user = authUtils.getUser();
    if (user) {
      return `${user.firstName} ${user.lastName}`;
    }
    return 'User';
  },

  // Check if email is verified
  isEmailVerified: () => {
    const user = authUtils.getUser();
    return user?.emailVerified || false;
  },

  // Check if phone is verified
  isPhoneVerified: () => {
    const user = authUtils.getUser();
    return user?.phoneVerified || false;
  },

  // Get user status
  getUserStatus: () => {
    const user = authUtils.getUser();
    return user?.status || 'UNKNOWN';
  },
};
