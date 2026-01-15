import api from './axios';

export const submitContact = async (contactData) => {
  try {
    const response = await api.post('/contact', contactData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getContactsByEmail = async (email) => {
  try {
    const response = await api.get('/contact/by-email', { params: { email } });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getContacts = async (params = {}) => {
  try {
    const response = await api.get('/contact', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getContact = async (id) => {
  try {
    const response = await api.get(`/contact/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const replyToContact = async (id, message) => {
  try {
    const response = await api.post(`/contact/${id}/reply`, { message });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateContactStatus = async (id, status) => {
  try {
    const response = await api.put(`/contact/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  submitContact,
  getContactsByEmail,
  getContacts,
  getContact,
  replyToContact,
  updateContactStatus,
};