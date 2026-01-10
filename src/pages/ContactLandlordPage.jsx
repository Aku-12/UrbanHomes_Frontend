import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  Paperclip, 
  Star, 
  Clock, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle,
  MessageCircle,
  User,
  Wifi,
  WifiOff
} from 'lucide-react';
import { getOrCreateConversation, getMessages, sendMessage } from '../api/messageApi';
import { getImageUrl } from '../utils/imageUtils';
import { useSocket } from '../context';

const ContactLandlordPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const conversationRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);

  const { socket, isConnected } = useSocket();

  const quickReplies = [
    "Thank you!",
    "When can I move in?",
    "Is this still available?"
  ];

  // Keep ref updated
  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

  useEffect(() => {
    fetchConversation();
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('new_message', ({ conversationId, message }) => {
      if (conversationRef.current?.conversation?._id === conversationId) {
        setMessages(prev => {
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
    });

    socket.on('user_typing', ({ conversationId, userName }) => {
      if (conversationRef.current?.conversation?._id === conversationId) {
        setIsTyping(true);
        setTypingUser(userName);
      }
    });

    socket.on('user_stop_typing', ({ conversationId }) => {
      if (conversationRef.current?.conversation?._id === conversationId) {
        setIsTyping(false);
        setTypingUser(null);
      }
    });

    return () => {
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, [socket]);

  // Join conversation room
  useEffect(() => {
    if (!socket || !conversation?.conversation?._id) return;

    socket.emit('join_conversation', conversation.conversation._id);

    return () => {
      socket.emit('leave_conversation', conversation.conversation._id);
    };
  }, [socket, conversation?.conversation?._id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversation = async () => {
    try {
      setLoading(true);
      const data = await getOrCreateConversation(roomId);
      setConversation(data);
      
      if (data.conversation._id) {
        const messagesData = await getMessages(data.conversation._id);
        setMessages(messagesData.messages);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content = newMessage) => {
    if (!content.trim() || !conversation?.conversation?._id) return;

    try {
      setSending(true);
      
      // Stop typing indicator when sending
      if (socket && typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        socket.emit('stop_typing', { conversationId: conversation.conversation._id });
      }
      
      const data = await sendMessage(conversation.conversation._id, content);
      setMessages(prev => [...prev, data.message]);
      setNewMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleQuickReply = (reply) => {
    handleSendMessage(reply);
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    if (socket && conversation?.conversation?._id) {
      socket.emit('typing', { conversationId: conversation.conversation._id });
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing after 2 seconds
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { conversationId: conversation.conversation._id });
      }, 2000);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const currentUserId = JSON.parse(localStorage.getItem('user'))?._id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error && !conversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="text-green-600 hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { room, landlord, landlordStats } = conversation || {};
  
  // Get tenant ID from conversation - the current user viewing this page is the tenant
  const tenantId = conversation?.conversation?.tenant?.toString() || currentUserId;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Room Details
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Landlord Profile Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4">
                  {landlord?.avatar ? (
                    <img 
                      src={getImageUrl(landlord.avatar)} 
                      alt={landlord.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{landlord?.fullName || 'Landlord'}</h2>
                <div className="flex items-center text-green-600 mt-1">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">Verified Superhost</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-center gap-6 mb-6 pb-6 border-b">
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900">{landlordStats?.totalReviews || 0}</p>
                  <p className="text-xs text-gray-500">Reviews</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <p className="text-lg font-semibold text-gray-900">{landlordStats?.avgRating || '4.9'}</p>
                  </div>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900">{landlordStats?.yearsHosting || 1}</p>
                  <p className="text-xs text-gray-500">yrs Hosting</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="text-sm truncate">{landlord?.email || 'email@example.com'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="text-sm">{landlord?.phone || '+977 98XXXXXXXX'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="text-sm">{room?.location || 'Location'}</span>
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Response Time</p>
                    <p className="text-xs text-gray-500">Responds within 1 hour</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
              {/* Messages Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageCircle className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">Messages</h3>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${
                    isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    {isConnected ? 'Live' : 'Offline'}
                  </div>
                </div>
                {room && (
                  <div className="flex items-center mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-16 h-12 rounded-lg overflow-hidden mr-3">
                      <img 
                        src={getImageUrl(room.images?.[0])} 
                        alt={room.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{room.title}</p>
                      <p className="text-xs text-gray-500">{room.location}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <MessageCircle className="w-12 h-12 mb-3 text-gray-300" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start a conversation with the landlord</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    // Get sender ID as string
                    const senderId = typeof msg.sender === 'object' 
                      ? (msg.sender?._id || '').toString() 
                      : (msg.sender || '').toString();
                    
                    // Check if this message was sent by the tenant (current user)
                    const isOwnMessage = senderId === tenantId?.toString() || senderId === currentUserId?.toString();
                    
                    const senderName = typeof msg.sender === 'object' 
                      ? `${msg.sender?.firstName || ''} ${msg.sender?.lastName || ''}`.trim() || 'Landlord'
                      : 'Landlord';
                    
                    return (
                      <div 
                        key={msg._id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                          {/* Show sender label */}
                          <p className={`text-xs font-medium mb-1 ${isOwnMessage ? 'text-green-600' : 'text-blue-600'}`}>
                            {isOwnMessage ? 'You' : senderName}
                          </p>
                          <div 
                            className={`inline-block rounded-2xl px-4 py-3 ${
                              isOwnMessage 
                                ? 'bg-green-500 text-white rounded-br-sm' 
                                : 'bg-blue-500 text-white rounded-bl-sm'
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                          </div>
                          <p className={`text-xs text-gray-400 mt-1`}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              <div className="px-4 py-2 border-t bg-gray-50">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      disabled={sending}
                      className="flex-shrink-0 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 hover:border-green-300 transition-colors disabled:opacity-50"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
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
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={sending}
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!newMessage.trim() || sending}
                    className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactLandlordPage;
