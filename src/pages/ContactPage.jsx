import { useState } from 'react';
import { Mail, Phone, MapPin, ArrowRight, MessageCircle, Facebook, Instagram, Twitter, Linkedin, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../components/ui';
import { contactApi } from '../api';
import { Header, Footer } from '../components/layout';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

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
        setFormData({
          name: '',
          lastName: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
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