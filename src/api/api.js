import axiosInstance from './axiosInstance';

// =============== AUTH APIs ===============
export const authAPI = {
  register: (userData) => axiosInstance.post('/auth/register', userData),
  login: (credentials) => axiosInstance.post('/auth/login', credentials),
  logout: () => axiosInstance.post('/auth/logout'),
  getCurrentUser: () => axiosInstance.get('/auth/me'),
  refreshToken: () => axiosInstance.post('/auth/refresh-token'),
};

// =============== BOOKING APIs ===============
export const bookingAPI = {
  getAll: () => axiosInstance.get('/bookings'),
  getById: (id) => axiosInstance.get(`/bookings/${id}`),
  create: (data) => axiosInstance.post('/bookings', data),
  update: (id, data) => axiosInstance.put(`/bookings/${id}`, data),
  delete: (id) => axiosInstance.delete(`/bookings/${id}`),
  getByUser: (userId) => axiosInstance.get(`/bookings/user/${userId}`),
  updateStatus: (id, status) => axiosInstance.patch(`/bookings/${id}`, { status }),
};

// =============== SERVICE APIs ===============
export const serviceAPI = {
  getAll: () => axiosInstance.get('/services'),
  getById: (id) => axiosInstance.get(`/services/${id}`),
  create: (data) => axiosInstance.post('/services', data),
  update: (id, data) => axiosInstance.put(`/services/${id}`, data),
  delete: (id) => axiosInstance.delete(`/services/${id}`),
  getByCategory: (category) => axiosInstance.get(`/services/category/${category}`),
};

// =============== GALLERY APIs ===============
export const galleryAPI = {
  getAll: () => axiosInstance.get('/gallery'),
  getById: (id) => axiosInstance.get(`/gallery/${id}`),
  create: (data) => axiosInstance.post('/gallery', data),
  update: (id, data) => axiosInstance.put(`/gallery/${id}`, data),
  delete: (id) => axiosInstance.delete(`/gallery/${id}`),
  getByCategory: (category) => axiosInstance.get(`/gallery/category/${category}`),
};

// =============== INVOICE APIs ===============
export const invoiceAPI = {
  getAll: () => axiosInstance.get('/invoices'),
  getById: (id) => axiosInstance.get(`/invoices/${id}`),
  create: (data) => axiosInstance.post('/invoices', data),
  update: (id, data) => axiosInstance.put(`/invoices/${id}`, data),
  delete: (id) => axiosInstance.delete(`/invoices/${id}`),
  updateStatus: (id, status) => axiosInstance.patch(`/invoices/${id}`, { status }),
  generate: (bookingId) => axiosInstance.post(`/invoices/generate/${bookingId}`),
};

// =============== PART APIs ===============
export const partAPI = {
  getAll: () => axiosInstance.get('/parts'),
  getById: (id) => axiosInstance.get(`/parts/${id}`),
  create: (data) => axiosInstance.post('/parts', data),
  update: (id, data) => axiosInstance.put(`/parts/${id}`, data),
  delete: (id) => axiosInstance.delete(`/parts/${id}`),
  getByCategory: (category) => axiosInstance.get(`/parts/category/${category}`),
  search: (query) => axiosInstance.get(`/parts/search/${query}`),
};

// =============== STAFF APIs ===============
export const staffAPI = {
  getAll: () => axiosInstance.get('/staff'),
  getById: (id) => axiosInstance.get(`/staff/${id}`),
  create: (data) => axiosInstance.post('/staff', data),
  update: (id, data) => axiosInstance.put(`/staff/${id}`, data),
  delete: (id) => axiosInstance.delete(`/staff/${id}`),
  getByDepartment: (department) => axiosInstance.get(`/staff/department/${department}`),
  getRoles: () => axiosInstance.get('/staff/roles'),
  createRole: (data) => axiosInstance.post('/staff/roles', data),
  deleteRole: (id) => axiosInstance.delete(`/staff/roles/${id}`),
};

// =============== USER APIs ===============
export const userAPI = {
  getProfile: () => axiosInstance.get('/users/profile'),
  updateProfile: (data) => axiosInstance.put('/users/profile', data),
  getBookings: () => axiosInstance.get('/users/bookings'),
  getInvoices: () => axiosInstance.get('/users/invoices'),
  changePassword: (data) => axiosInstance.post('/users/change-password', data),
};

// =============== SETTINGS APIs ===============
export const settingsAPI = {
  get: () => axiosInstance.get('/settings'),
  update: (data) => axiosInstance.put('/settings', data),
};

// =============== REPORT APIs ===============
export const reportAPI = {
  getSalesReport: (params) => axiosInstance.get('/reports/sales', { params }),
  getRevenueReport: (params) => axiosInstance.get('/reports/revenue', { params }),
  getStaffReport: (params) => axiosInstance.get('/reports/staff', { params }),
  getBookingReport: (params) => axiosInstance.get('/reports/bookings', { params }),
};
