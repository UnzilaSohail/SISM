import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  getMe: () => API.get('/auth/me'),
};

// Categories
export const categoriesAPI = {
  getAll: () => API.get('/categories'),
  getById: (id) => API.get(`/categories/${id}`),
  create: (data) => API.post('/categories', data),
  update: (id, data) => API.put(`/categories/${id}`, data),
  delete: (id) => API.delete(`/categories/${id}`),
};

// Products
export const productsAPI = {
  getAll: (params) => API.get('/products', { params }),
  getById: (id) => API.get(`/products/${id}`),
  getLowStock: () => API.get('/products/low-stock'),
  create: (data) => API.post('/products', data),
  update: (id, data) => API.put(`/products/${id}`, data),
  delete: (id) => API.delete(`/products/${id}`),
};

// Customers
export const customersAPI = {
  getAll: (params) => API.get('/customers', { params }),
  getById: (id) => API.get(`/customers/${id}`),
  create: (data) => API.post('/customers', data),
  update: (id, data) => API.put(`/customers/${id}`, data),
  delete: (id) => API.delete(`/customers/${id}`),
};

// Sales
export const salesAPI = {
  getAll: (params) => API.get('/sales', { params }),
  getById: (id) => API.get(`/sales/${id}`),
  getReport: (params) => API.get('/sales/report', { params }),
  create: (data) => API.post('/sales', data),
  updateStatus: (id, status) => API.put(`/sales/${id}`, { status }),
  delete: (id) => API.delete(`/sales/${id}`),
};

// Stock
export const stockAPI = {
  stockIn: (data) => API.post('/stock/in', data),
  stockOut: (data) => API.post('/stock/out', data),
  getHistory: (params) => API.get('/stock/history', { params }),
};

// Users (admin only)
export const usersAPI = {
  getAll: () => API.get('/users'),
  getById: (id) => API.get(`/users/${id}`),
  update: (id, data) => API.put(`/users/${id}`, data),
  delete: (id) => API.delete(`/users/${id}`),
};

export default API;
