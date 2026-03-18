import axios from 'axios';

// API Base URL - can be configured based on environment
// We want the URL to always end with `/api` because the backend
// routes are mounted under that prefix (see server/server.js).
//
// Use a fallback in case the environment variable is not defined
// (e.g. during development when `.env` hasn't been loaded yet or
// someone forgot to restart the dev server).
// The old implementation simply concatenated the value, which meant
// that if `REACT_APP_BACK_URL` was `undefined` the base url became
// `"undefined/api"` and every request failed silently.
//
// The helper below also handles a trailing slash and logs the final
// value so you can spot misconfiguration quickly.
const rawBase = process.env.REACT_APP_BACK_URL || "http://localhost:3001";
const withApi = rawBase.endsWith("/api") ? rawBase : `${rawBase.replace(/\/+$/,'')}/api`;
const API_BASE_URL = withApi;

// helpful debug message during development
if (process.env.NODE_ENV !== "production") {
  console.debug("Axios base URL set to", API_BASE_URL);
}
// Create a new map to store pending requests
const pendingRequests = new Map();

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage (using 'token' key to match auth.js)
    const token = localStorage.getItem('token');
    
    // Add token to headers if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Create a unique key for the request
    const requestKey = `${config.method}-${config.url}`;

    // Check if there's a pending request with the same key
    if (pendingRequests.has(requestKey)) {
      // Cancel the previous request
      const canceler = pendingRequests.get(requestKey);
      canceler.cancel('New request made, cancelling previous one.');
      pendingRequests.delete(requestKey);
    }

    // Create a new cancel token for the current request
    const canceler = axios.CancelToken.source();
    config.cancelToken = canceler.token;
    pendingRequests.set(requestKey, canceler);

    config.headers['X-Request-Time'] = new Date().toISOString();

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Remove the request from the pending map
    const requestKey = `${response.config.method}-${response.config.url}`;
    pendingRequests.delete(requestKey);
    return response;
  },
  (error) => {
    // Check if the error is due to a cancellation
    if (axios.isCancel(error)) {
      console.log('Request canceled:', error.message);
      // Don't treat cancellation as a real error
      return new Promise(() => {}); // Return a non-rejecting promise
    }

    // Remove the request from the pending map
    if (error.config) {
      const requestKey = `${error.config.method}-${error.config.url}`;
      pendingRequests.delete(requestKey);
    }

    // Handle other errors
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;

      switch (status) {
        case 401:
          // Only log 401 errors - don't auto-logout as it causes issues with parallel requests
          // Let protected routes/components handle auth checking instead
          console.warn('Unauthorized request:', error.config?.url);
          break;

        case 403:
          // Forbidden - Access denied
          console.error('Access denied:', error.response.data);
          break;

        case 404:
          // Not found
          console.error('Resource not found:', error.response.data);
          break;

        case 500:
          // Server error
          console.error('Server error:', error.response.data);
          break;

        default:
          console.error('Error:', error.response.data);
      }

      return Promise.reject(error.response);
    } else if (error.request) {
      // Request made but no response received
      console.error('No response received:', error.request);
      return Promise.reject(new Error('No response from server'));
    } else {
      // Error in request setup
      console.error('Error:', error.message);
      return Promise.reject(error);
    }
  }
);

export default axiosInstance;
