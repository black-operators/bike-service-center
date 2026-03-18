// Constants for API error messages and status codes
export const API_ERRORS = {
  UNAUTHORIZED: 'Unauthorized. Please login again.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  BAD_REQUEST: 'Invalid request. Please check your input.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT: 'Request timeout. Please try again.',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export const REQUEST_CONFIG = {
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh-token',
  },

  // Bookings
  BOOKINGS: {
    LIST: '/bookings',
    CREATE: '/bookings',
    GET: (id) => `/bookings/${id}`,
    UPDATE: (id) => `/bookings/${id}`,
    DELETE: (id) => `/bookings/${id}`,
    BY_USER: (userId) => `/bookings/user/${userId}`,
  },

  // Services
  SERVICES: {
    LIST: '/services',
    CREATE: '/services',
    GET: (id) => `/services/${id}`,
    UPDATE: (id) => `/services/${id}`,
    DELETE: (id) => `/services/${id}`,
    BY_CATEGORY: (category) => `/services/category/${category}`,
  },

  // Gallery
  GALLERY: {
    LIST: '/gallery',
    CREATE: '/gallery',
    GET: (id) => `/gallery/${id}`,
    UPDATE: (id) => `/gallery/${id}`,
    DELETE: (id) => `/gallery/${id}`,
    BY_CATEGORY: (category) => `/gallery/category/${category}`,
  },

  // Invoices
  INVOICES: {
    LIST: '/invoices',
    CREATE: '/invoices',
    GET: (id) => `/invoices/${id}`,
    UPDATE: (id) => `/invoices/${id}`,
    DELETE: (id) => `/invoices/${id}`,
    GENERATE: (bookingId) => `/invoices/generate/${bookingId}`,
  },

  // Parts
  PARTS: {
    LIST: '/parts',
    CREATE: '/parts',
    GET: (id) => `/parts/${id}`,
    UPDATE: (id) => `/parts/${id}`,
    DELETE: (id) => `/parts/${id}`,
    BY_CATEGORY: (category) => `/parts/category/${category}`,
    SEARCH: (query) => `/parts/search/${query}`,
  },

  // Staff
  STAFF: {
    LIST: '/staff',
    CREATE: '/staff',
    GET: (id) => `/staff/${id}`,
    UPDATE: (id) => `/staff/${id}`,
    DELETE: (id) => `/staff/${id}`,
    BY_DEPARTMENT: (department) => `/staff/department/${department}`,
  },

  // Users
  USERS: {
    PROFILE: '/users/profile',
    BOOKINGS: '/users/bookings',
    INVOICES: '/users/invoices',
  },

  // Settings
  SETTINGS: '/settings',

  // Reports
  REPORTS: {
    SALES: '/reports/sales',
    REVENUE: '/reports/revenue',
    STAFF: '/reports/staff',
    BOOKINGS: '/reports/bookings',
  },
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER: 'user',
  REFRESH_TOKEN: 'refreshToken',
  SETTINGS: 'appSettings',
  THEME: 'theme',
};

// Service Categories
export const SERVICE_CATEGORIES = {
  WASHING: 'washing',
  MODIFICATION: 'modification',
  EV_SERVICE: 'ev-service',
  PARTS: 'parts',
};

// Staff Positions
export const STAFF_POSITIONS = {
  MANAGER: 'manager',
  TECHNICIAN: 'technician',
  ACCOUNTANT: 'accountant',
  SUPERVISOR: 'supervisor',
};

// Staff Departments
export const STAFF_DEPARTMENTS = {
  WASHING: 'washing',
  MODIFICATION: 'modification',
  EV_SERVICE: 'ev-service',
  PARTS: 'parts',
  ADMIN: 'admin',
};

// Invoice Status
export const INVOICE_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  CANCELLED: 'cancelled',
  OVERDUE: 'overdue',
};

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Permissions
export const PERMISSIONS = {
  CREATE_BOOKINGS: 'create_bookings',
  EDIT_BOOKINGS: 'edit_bookings',
  DELETE_BOOKINGS: 'delete_bookings',
  VIEW_INVOICES: 'view_invoices',
  CREATE_INVOICES: 'create_invoices',
  MANAGE_STAFF: 'manage_staff',
  MANAGE_GALLERY: 'manage_gallery',
  MANAGE_SERVICES: 'manage_services',
  MANAGE_PARTS: 'manage_parts',
  VIEW_REPORTS: 'view_reports',
};
