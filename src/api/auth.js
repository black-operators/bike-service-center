// NOTE: 'authToken' এর বদলে 'token' ব্যবহার করা হয়েছে যাতে Login.js এর সাথে মিল থাকে
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
  window.dispatchEvent(new Event('authChange'));
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const removeAuthToken = () => {
  localStorage.removeItem('token');
  window.dispatchEvent(new Event('authChange'));
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

// ==========================
// User Utility Functions (CRASH PROOF ADDED)
// ==========================

export const setUser = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
  window.dispatchEvent(new Event('authChange'));
};

export const getUser = () => {
  try {
    const user = localStorage.getItem('user');
    
    // Safety Check: যদি ডাটা না থাকে বা "undefined" স্ট্রিং হয়ে থাকে
    if (!user || user === "undefined" || user === "null") {
      return null;
    }
    
    return JSON.parse(user);
  } catch (error) {
    console.error("Error parsing user data:", error);
    // ডাটা করাপ্ট হলে রিমুভ করে দাও যাতে অ্যাপ ক্র্যাশ না করে
    localStorage.removeItem('user');
    return null;
  }
};

export const removeUser = () => {
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('authChange'));
};

export const getUserId = () => {
  const user = getUser();
  return user?._id || null;
};

export const hasPermission = (permission) => {
  const user = getUser();
  return user?.permissions?.includes(permission) || false;
};

// ==========================
// Token Utility Functions
// ==========================

export const setRefreshToken = (token) => {
  localStorage.setItem('refreshToken', token);
};

export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

export const removeRefreshToken = () => {
  localStorage.removeItem('refreshToken');
};

// ==========================
// Session/Auth State
// ==========================

export const clearAuthData = () => {
  removeAuthToken();
  removeRefreshToken();
  removeUser();
  // ইভেন্ট ডিসপ্যাচ রিমুভ ফাংশনগুলোর ভেতরেই হচ্ছে
};

export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const decoded = JSON.parse(jsonPayload);
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

// ==========================
// Session Storage
// ==========================

export const setSessionData = (key, value) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

export const getSessionData = (key) => {
  try {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error parsing session data for ${key}:`, error);
    return null;
  }
};

export const removeSessionData = (key) => {
  sessionStorage.removeItem(key);
};

// ==========================
// Local Preferences
// ==========================

export const setPreference = (key, value) => {
  localStorage.setItem(`pref_${key}`, JSON.stringify(value));
};

export const getPreference = (key, defaultValue = null) => {
  try {
    const value = localStorage.getItem(`pref_${key}`);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error(`Error parsing preference for ${key}:`, error);
    return defaultValue;
  }
};

export const removePreference = (key) => {
  localStorage.removeItem(`pref_${key}`);
};

// ==========================
// Role-Based Access Control
// ==========================

export const userHasRole = (role) => {
  const user = getUser();
  return user?.role === role || user?.roles?.includes(role) || false;
};

export const userHasAnyRole = (roles) => {
  const user = getUser();
  if (!user) return false;
  return roles.some(role => userHasRole(role));
};

export const userHasAllPermissions = (permissions) => {
  return permissions.every(permission => hasPermission(permission));
};

export const userHasAnyPermission = (permissions) => {
  return permissions.some(permission => hasPermission(permission));
};