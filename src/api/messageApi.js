import api from './axios';

// Get or create conversation for a room
export const getOrCreateConversation = async (roomId) => {
  const response = await api.get(`/messages/room/${roomId}/conversation`);
  return response.data;
};

// Get messages for a conversation
export const getMessages = async (conversationId) => {
  const response = await api.get(`/messages/conversations/${conversationId}/messages`);
  return response.data;
};

// Send a message
export const sendMessage = async (conversationId, content) => {
  const response = await api.post(`/messages/conversations/${conversationId}/messages`, { content });
  return response.data;
};

// Get all conversations for the current user
export const getUserConversations = async () => {
  const response = await api.get('/messages/conversations');
  return response.data;
};

export default {
  getOrCreateConversation,
  getMessages,
  sendMessage,
  getUserConversations
};
