import { useState, useEffect, useRef, Component } from 'react';
import { 
  MessageCircle, 
  Send, 
  Search, 
  User,
  Clock,
  Home,
  ChevronRight,
  Check,
  CheckCheck,
  RefreshCw,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import { getImageUrl } from '../../utils/imageUtils';
import { useSocket } from '../../context';
import api from '../../api/axios';

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('MessagesManagement Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <AdminLayout>
          <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] text-red-500">
            <AlertCircle className="w-16 h-16 mb-4" />
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Reload Page
            </button>
          </div>
        </AdminLayout>
      );
    }
    return this.props.children;
  }
}

const MessagesManagementContent = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const selectedConversationRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Safely get socket - may be null if not connected
  const socketContext = useSocket() || {};
  const socket = socketContext.socket;
  const isConnected = socketContext.isConnected || false;
  
  // Safely parse current user ID
  const currentUserId = (() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user?.id || user?._id;
    } catch {
      return null;
    }
  })();

  // Keep ref updated with latest selectedConversation
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    fetchConversations();
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    socket.on('new_message', ({ conversationId, message }) => {
      console.log('Received new message:', message);
      
      // Update messages if we're in the same conversation
      if (selectedConversationRef.current?._id === conversationId) {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
      
      // Update conversation list
      setConversations(prev => prev.map(conv => 
        conv._id === conversationId 
          ? { 
              ...conv, 
              lastMessage: message.content, 
              lastMessageAt: message.createdAt,
              unreadCount: selectedConversationRef.current?._id === conversationId 
                ? 0 
                : (conv.unreadCount || 0) + 1
            } 
          : conv
      ));
    });

    // Listen for typing indicators
    socket.on('user_typing', ({ conversationId, userName }) => {
      if (selectedConversationRef.current?._id === conversationId) {
        setIsTyping(true);
        setTypingUser(userName);
      }
    });

    socket.on('user_stop_typing', ({ conversationId }) => {
      if (selectedConversationRef.current?._id === conversationId) {
        setIsTyping(false);
        setTypingUser(null);
      }
    });

    // Listen for message notifications (for badge updates)
    socket.on('message_notification', ({ conversationId }) => {
      if (selectedConversationRef.current?._id !== conversationId) {
        fetchConversations(true);
      }
    });

    return () => {
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
      socket.off('message_notification');
    };
  }, [socket]);

  // Join/leave conversation rooms
  useEffect(() => {
    if (!socket || !selectedConversation?._id) return;

    try {
      socket.emit('join_conversation', selectedConversation._id);
    } catch (err) {
      console.error('Error joining conversation room:', err);
    }

    return () => {
      try {
        if (socket && selectedConversation?._id) {
          socket.emit('leave_conversation', selectedConversation._id);
        }
      } catch (err) {
        console.error('Error leaving conversation room:', err);
      }
    };
  }, [socket, selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await api.get('/messages/conversations');
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchMessages = async (conversationId, silent = false) => {
    try {
      if (!silent) setMessagesLoading(true);
      setError(null);
      console.log('Fetching messages for conversation:', conversationId);
      const response = await api.get(`/messages/conversations/${conversationId}/messages`);
      console.log('Messages response:', response.data);
      setMessages(response.data.messages || []);
      
      // Update unread count in conversations list
      if (!silent) {
        setConversations(prev => prev.map(conv => 
          conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
        ));
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to load messages');
      if (!silent) {
        toast.error(err.response?.data?.message || 'Failed to load messages');
      }
    } finally {
      if (!silent) setMessagesLoading(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    console.log('Selected conversation:', conversation);
    setSelectedConversation(conversation);
    setMessages([]);
    setError(null);
    fetchMessages(conversation._id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      
      // Stop typing indicator when sending
      if (socket && typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        socket.emit('stop_typing', { conversationId: selectedConversation._id });
      }
      
      const response = await api.post(`/messages/conversations/${selectedConversation._id}/messages`, {
        content: newMessage
      });
      setMessages(prev => [...prev, response.data.message]);
      setNewMessage('');
      toast.success('Message sent!');
      
      // Update last message in conversations list
      setConversations(prev => prev.map(conv => 
        conv._id === selectedConversation._id 
          ? { 
              ...conv, 
              lastMessage: newMessage, 
              lastMessageAt: new Date().toISOString() 
            } 
          : conv
      ));
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    if (socket && selectedConversation?._id) {
      socket.emit('typing', { conversationId: selectedConversation._id });
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing after 2 seconds
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { conversationId: selectedConversation._id });
      }, 2000);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const tenantName = `${conv.tenant?.firstName || ''} ${conv.tenant?.lastName || ''}`.toLowerCase();
    const roomTitle = conv.room?.title?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return tenantName.includes(query) || roomTitle.includes(query);
  });

  const getTenantName = (conv) => {
    if (conv.tenant?.firstName || conv.tenant?.lastName) {
      return `${conv.tenant?.firstName || ''} ${conv.tenant?.lastName || ''}`.trim();
    }
    return 'Unknown User';
  };

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-80px)] flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-500 text-sm mt-1">
                Respond to tenant inquiries and messages
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MessageCircle className="w-4 h-4" />
              <span>{conversations.length} conversations</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Conversations List */}
          <div className="w-80 border-r border-gray-100 bg-white flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                  <MessageCircle className="w-8 h-8 mb-2 text-gray-300" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv._id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                      selectedConversation?._id === conv._id ? 'bg-green-50 border-l-4 border-l-green-600' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Tenant Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {conv.tenant?.avatar ? (
                          <img 
                            src={getImageUrl(conv.tenant.avatar)} 
                            alt={getTenantName(conv)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {getTenantName(conv)}
                          </h3>
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {formatTime(conv.lastMessageAt)}
                          </span>
                        </div>
                        
                        {/* Room Info */}
                        <div className="flex items-center text-xs text-gray-500 mb-1">
                          <Home className="w-3 h-3 mr-1" />
                          <span className="truncate">{conv.room?.title || 'Unknown Room'}</span>
                        </div>
                        
                        {/* Last Message */}
                        <p className="text-sm text-gray-500 truncate">
                          {conv.lastMessage || 'No messages yet'}
                        </p>
                        
                        {/* Unread Badge */}
                        {conv.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-green-600 text-white rounded-full mt-1">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Messages Panel */}
          <div className="flex-1 flex flex-col bg-gray-50">
            {selectedConversation ? (
              <>
                {/* Conversation Header */}
                <div className="bg-white border-b border-gray-100 px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {selectedConversation?.tenant?.avatar ? (
                        <img 
                          src={getImageUrl(selectedConversation.tenant.avatar)} 
                          alt={getTenantName(selectedConversation)}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <User className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="font-semibold text-gray-900">
                        {getTenantName(selectedConversation)}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {selectedConversation?.tenant?.email || 'No email'}
                      </p>
                    </div>
                    
                    {/* Room Card */}
                    {selectedConversation?.room && (
                      <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                        <div className="w-12 h-10 rounded overflow-hidden bg-gray-200">
                          {(() => {
                            const images = selectedConversation.room?.images;
                            const firstImage = Array.isArray(images) ? images[0] : null;
                            const imageUrl = firstImage ? getImageUrl(firstImage) : null;
                            return imageUrl ? (
                              <img 
                                src={imageUrl} 
                                alt={selectedConversation.room?.title || 'Room'}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : null;
                          })()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                            {selectedConversation.room?.title || 'Unknown Room'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Rs. {selectedConversation.room?.price?.toLocaleString() || '0'}/mo
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full text-red-500">
                      <AlertCircle className="w-12 h-12 mb-3" />
                      <p className="font-medium">Error loading messages</p>
                      <p className="text-sm text-gray-500">{error}</p>
                      <button 
                        onClick={() => fetchMessages(selectedConversation._id)}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <MessageCircle className="w-12 h-12 mb-3 text-gray-300" />
                      <p>No messages in this conversation</p>
                      <p className="text-sm">Send a message to start the conversation</p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      if (!msg) return null;
                      // Get sender ID as string for comparison
                      const senderId = typeof msg.sender === 'object' 
                        ? (msg.sender?._id || '').toString() 
                        : (msg.sender || '').toString();
                      // Check if admin sent this message
                      const isOwnMessage = senderId === currentUserId?.toString();
                      
                      // Get actual sender name from the message
                      const senderName = typeof msg.sender === 'object'
                        ? `${msg.sender?.firstName || ''} ${msg.sender?.lastName || ''}`.trim()
                        : '';
                      
                      return (
                        <div 
                          key={msg._id || index}
                          className={`flex w-full ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex flex-col max-w-[60%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                            {/* Sender info */}
                            <div className={`flex items-center gap-2 mb-1`}>
                              {!isOwnMessage && (
                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                  {selectedConversation?.tenant?.avatar ? (
                                    <img 
                                      src={getImageUrl(selectedConversation.tenant.avatar)} 
                                      alt=""
                                      className="w-full h-full object-cover"
                                      onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                  ) : (
                                    <User className="w-3 h-3 text-gray-400" />
                                  )}
                                </div>
                              )}
                              <span className={`text-xs font-medium ${isOwnMessage ? 'text-blue-600' : 'text-green-600'}`}>
                                {isOwnMessage ? 'You (Admin)' : (senderName || getTenantName(selectedConversation))}
                              </span>
                            </div>
                            {/* Message bubble */}
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                isOwnMessage
                                  ? 'bg-blue-500 text-white rounded-br-sm'
                                  : 'bg-green-500 text-white rounded-bl-sm'
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                            </div>
                            {/* Time and read status */}
                            <div className={`flex items-center gap-1 mt-1`}>
                              <span className="text-xs text-gray-400">
                                {formatTime(msg.createdAt)}
                              </span>
                              {isOwnMessage && (
                                msg.isRead
                                  ? <CheckCheck className="w-3 h-3 text-blue-500" />
                                  : <Check className="w-3 h-3 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies */}
                <div className="px-6 py-2 bg-white border-t border-gray-100">
                  <div className="flex gap-2 overflow-x-auto">
                    {[
                      "Thanks for your interest!",
                      "The room is available.",
                      "When would you like to visit?",
                      "Please call me to discuss."
                    ].map((reply, index) => (
                      <button
                        key={index}
                        onClick={() => setNewMessage(reply)}
                        className="flex-shrink-0 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Input */}
                <div className="bg-white border-t border-gray-100 p-4">
                  {/* Typing Indicator */}
                  {isTyping && typingUser && (
                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                      <span>{typingUser} is typing...</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={handleInputChange}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your reply..."
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={sending}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <MessageCircle className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Select a conversation</h3>
                <p className="text-sm">Choose a conversation from the list to view messages</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// Wrap with Error Boundary
const MessagesManagement = () => (
  <ErrorBoundary>
    <MessagesManagementContent />
  </ErrorBoundary>
);

export default MessagesManagement;
