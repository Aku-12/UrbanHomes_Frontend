import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, ArrowRight, MessageCircle, Facebook, Instagram, Twitter, Linkedin, ChevronDown, Clock, User, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../components/ui';
import { contactApi } from '../api';
import { Header, Footer } from '../components/layout';

const ContactPage = () => {
  // Get user from localStorage
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user from localStorage');
      }
    }
  }, []);
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  // Messages/Replies state
  const [userMessages, setUserMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [lookupEmail, setLookupEmail] = useState('');
  const [showMessages, setShowMessages] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Auto-fetch messages if user is logged in
  useEffect(() => {
    if (user?.email) {
      setLookupEmail(user.email);
      fetchUserMessages(user.email);
      // Pre-fill form with user info
      setFormData(prev => ({
        ...prev,
        name: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  // Fetch user's messages by email
  const fetchUserMessages = async (email) => {
    if (!email) return;
    try {
      setMessagesLoading(true);
      const response = await contactApi.getContactsByEmail(email);
      setUserMessages(response.data || []);
      setShowMessages(true);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Handle lookup
  const handleLookupMessages = () => {
    if (!lookupEmail) {
      toast.error('Please enter your email address');
      return;
    }
    fetchUserMessages(lookupEmail);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await contactApi.submitContact({
        name: `${formData.name} ${formData.lastName}`.trim(),
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        phone: formData.phone,
      });

      if (response.success) {
        toast.success('Message sent successfully!');
        const submittedEmail = formData.email;
        setFormData({
          name: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
          phone: '',
          subject: '',
          message: '',
        });
        // Refresh messages list
        if (submittedEmail) {
          fetchUserMessages(submittedEmail);
        }
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to send message. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      question: 'How do I rent a room?',
      answer: 'Simply search for rooms in your desired location, select one, and follow the "Book Now" link. You\'ll be guided through the secure booking process.'
    },
    {
      question: 'How do I list my room?',
      answer: 'Create an account, click "List a Room", and follow the form to upload photos, amenities, and pricing details.'
    },
    {
      question: 'Are listings verified?',
      answer: 'Yes, our team verifies all listings to ensure accurate photos, descriptions, and authentic listings from trustworthy owners.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, and online transfers. All payments are encrypted and secure.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="pt-20 pb-16">
        {/* Header Section */}
        <div className="text-center mb-16 px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Get in Touch
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm">
            Have questions or need help? We're here to assist you.
            Reach out and let's discuss finding your perfect room.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-0 sm:px-0 lg:px-2 mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information - Left Side */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Contact Information
              </h2>
              <p className="text-sm text-gray-600 mb-8">
                Reach out to our friendly team. We're always happy to help and typically respond within 24 hours.
              </p>

              {/* Contact Items */}
              <div className="space-y-6 mb-10">
                {/* Office */}
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500 text-white mr-4 flex-shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Our Office</p>
                    <p className="text-sm text-gray-600">Kathmandu, Nepal</p>
                    <p className="text-sm text-gray-600">Mon - Sat, 9am - 5pm</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500 text-white mr-4 flex-shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Email Us</p>
                    <p className="text-sm text-gray-600">support@urbanhomes.com</p>
                    <p className="text-sm text-gray-600">inquiry@urbanhomes.com</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500 text-white mr-4 flex-shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Call Us</p>
                    <p className="text-sm text-gray-600">+977-1-2345678</p>
                    <p className="text-sm text-gray-600">Sun - Fri, 9am - 5pm</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <p className="font-semibold text-gray-900 mb-4">Follow Us</p>
                <div className="flex gap-4">
                  <a href="#" className="text-gray-600 hover:text-green-500 transition">
                    <Facebook size={20} />
                  </a>
                  <a href="#" className="text-gray-600 hover:text-green-500 transition">
                    <Instagram size={20} />
                  </a>
                  <a href="#" className="text-gray-600 hover:text-green-500 transition">
                    <Twitter size={20} />
                  </a>
                  <a href="#" className="text-gray-600 hover:text-green-500 transition">
                    <Linkedin size={20} />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form - Right Side */}
            <div className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Send Us a Message
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="First Name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="hello@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+977-1-2345678"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <div className="relative">
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                      required
                    >
                      <option value="">Select a topic</option>
                      <option value="Room Inquiry">Room Inquiry</option>
                      <option value="Booking Help">Booking Help</option>
                      <option value="List a Room">List a Room</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    placeholder="Tell us how we can help you..."
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    required
                  />
                </div>

                {/* Response time note */}
                <p className="text-xs text-gray-600 pt-2">
                  We'll respond within 2 hours.
                </p>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Messages & Replies Section */}
        <div className="max-w-7xl mx-auto px-0 sm:px-0 lg:px-2 mb-20">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Your Messages & Replies
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              View your previous messages and our responses.
            </p>

            {/* Email Lookup */}
            {!user && (
              <div className="flex gap-3 mb-6">
                <input
                  type="email"
                  placeholder="Enter your email to view messages"
                  value={lookupEmail}
                  onChange={(e) => setLookupEmail(e.target.value)}
                  className="flex-1 px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  onClick={handleLookupMessages}
                  disabled={messagesLoading}
                  className="px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition disabled:opacity-50"
                >
                  {messagesLoading ? 'Loading...' : 'View Messages'}
                </button>
              </div>
            )}

            {/* Messages List */}
            {messagesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : showMessages && userMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No messages found for this email.</p>
                <p className="text-sm">Send us a message using the form above!</p>
              </div>
            ) : showMessages && userMessages.length > 0 ? (
              <div className="space-y-4">
                {userMessages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`border rounded-lg overflow-hidden ${
                      selectedMessage?._id === msg._id ? 'border-green-500' : 'border-gray-200'
                    }`}
                  >
                    {/* Message Header */}
                    <button
                      onClick={() => setSelectedMessage(selectedMessage?._id === msg._id ? null : msg)}
                      className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          msg.status === 'replied' ? 'bg-green-500' : msg.status === 'read' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900">{msg.subject}</p>
                          <p className="text-xs text-gray-500">{formatDate(msg.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {msg.replies?.length > 0 && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                            {msg.replies.length} {msg.replies.length === 1 ? 'reply' : 'replies'}
                          </span>
                        )}
                        <ChevronRight
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            selectedMessage?._id === msg._id ? 'rotate-90' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {/* Message Details */}
                    {selectedMessage?._id === msg._id && (
                      <div className="p-4 space-y-4">
                        {/* Original Message */}
                        <div className="flex justify-start">
                          <div className="max-w-[80%]">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-gray-700">You</span>
                              <span className="text-xs text-gray-400">{formatDate(msg.createdAt)}</span>
                            </div>
                            <div className="bg-gray-100 rounded-lg rounded-bl-none px-4 py-3">
                              <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.message}</p>
                            </div>
                          </div>
                        </div>

                        {/* Replies */}
                        {msg.replies?.map((reply, index) => (
                          <div key={index} className="flex justify-end">
                            <div className="max-w-[80%]">
                              <div className="flex items-center justify-end gap-2 mb-1">
                                <span className="text-xs text-gray-400">{formatDate(reply.repliedAt)}</span>
                                <span className="text-xs font-medium text-green-600">
                                  {reply.repliedBy?.firstName || 'Admin'} {reply.repliedBy?.lastName || ''}
                                </span>
                              </div>
                              <div className="bg-green-500 text-white rounded-lg rounded-br-none px-4 py-3">
                                <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* No replies yet */}
                        {(!msg.replies || msg.replies.length === 0) && (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            <Clock className="w-5 h-5 mx-auto mb-2 text-gray-300" />
                            <p>We're reviewing your message and will respond soon.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : !showMessages && (
              <div className="text-center py-8 text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Enter your email above to view your message history.</p>
              </div>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-0 sm:px-0 lg:px-2">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-600">
                Find quick answers to common questions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0">
                      <MessageCircle className="text-green-500" size={20} />
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      {faq.question}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 ml-8">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactPage;