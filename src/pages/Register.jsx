import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input, Button, Checkbox } from '../components/ui';
import { authApi } from '../api';
import urbanLogo from '../assets/urbanlogo.svg';
import loginBg from '../assets/images/login-bg.jpg';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      toast.error('Please enter your first and last name');
      return false;
    }
    if (!formData.email) {
      toast.error('Please enter your email address');
      return false;
    }
    if (!formData.phone) {
      toast.error('Please enter your phone number');
      return false;
    }
    if (!formData.password) {
      toast.error('Please enter a password');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (!agreeToTerms) {
      toast.error('Please agree to the Terms of Service and Privacy Policy');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await authApi.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      if (response.success) {
        toast.success('Account created successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Background Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src={loginBg}
          alt="Cozy living room"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Content on image */}
        <div className="absolute inset-0 flex flex-col justify-start p-12">
          {/* Logo */}
          <div className="mb-16">
            <img src={urbanLogo} alt="Urban Homes" className="h-12 brightness-0 invert" />
          </div>

          {/* Tagline */}
          <h2 className="text-3xl lg:text-4xl font-light text-white italic leading-tight">
            Join thousands finding<br />
            their perfect home
          </h2>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 bg-white py-8">
        <div className="max-w-lg w-full mx-auto">
          {/* Mobile Logo */}
          <div className="mb-6 lg:hidden">
            <img src={urbanLogo} alt="Urban Homes" className="h-10" />
          </div>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Your Account
            </h1>
            <p className="text-gray-600">Start your journey to finding the perfect room</p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields - Two columns */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                type="text"
                name="firstName"
                placeholder="Akash"
                value={formData.firstName}
                onChange={handleChange}
                icon={User}
                required
              />
              <Input
                label="Last Name"
                type="text"
                name="lastName"
                placeholder="Chaudhary"
                value={formData.lastName}
                onChange={handleChange}
                icon={User}
                required
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              name="email"
              placeholder="akash12@example.com"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              required
            />

            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              placeholder="+977 9867543212"
              value={formData.phone}
              onChange={handleChange}
              icon={Phone}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              icon={Lock}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              icon={ShieldCheck}
              required
            />

            {/* Terms Agreement */}
            <div className="flex items-start gap-2">
              <Checkbox
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="mt-0.5"
              />
              <span className="text-sm text-gray-600">
                I agree to Urban Homes'{' '}
                <Link to="/terms" className="text-green-600 hover:text-green-700 font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-green-600 hover:text-green-700 font-medium">
                  Privacy Policy
                </Link>
              </span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              showArrow
              className="w-full"
            >
              Create Account
            </Button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
