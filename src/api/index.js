// Export all API modules
export { default as axiosInstance } from './axiosInstance';

export {
  authAPI,
  bookingAPI,
  serviceAPI,
  galleryAPI,
  invoiceAPI,
  partAPI,
  staffAPI,
  userAPI,
  settingsAPI,
  reportAPI,
} from './api';

export {
  API_ERRORS,
  HTTP_STATUS,
  REQUEST_CONFIG,
  API_ENDPOINTS,
  STORAGE_KEYS,
  SERVICE_CATEGORIES,
  STAFF_POSITIONS,
  STAFF_DEPARTMENTS,
  INVOICE_STATUS,
  BOOKING_STATUS,
  PERMISSIONS,
} from './constants';

export {
  handleAPIResponse,
  handleAPIError,
  apiCall,
  getRequest,
  postRequest,
  putRequest,
  patchRequest,
  deleteRequest,
  uploadFile,
  batchRequests,
} from './helpers';

export {
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  isAuthenticated,
  setUser,
  getUser,
  removeUser,
  getUserId,
  hasPermission,
  setRefreshToken,
  getRefreshToken,
  removeRefreshToken,
  clearAuthData,
  isTokenExpired,
  setSessionData,
  getSessionData,
  removeSessionData,
  setPreference,
  getPreference,
  removePreference,
  userHasRole,
  userHasAnyRole,
  userHasAllPermissions,
  userHasAnyPermission,
} from './auth';
