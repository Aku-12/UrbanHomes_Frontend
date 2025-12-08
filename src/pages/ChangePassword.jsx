import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, KeyRound, Check, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input, Button } from '../components/ui';
import { authApi } from '../api';
import urbanLogo from '../assets/urbanlogo.svg';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: send code, 2: verify code, 3: change password
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [changeToken, setChangeToken] = useState('');
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const user = authApi.getStoredUser();

  // Password validation
  const passwordRequirements = {
    length: formData.newPassword.length >= 8,
    uppercase: /[A-Z]/.test(formData.newPassword),
    lowercase: /[a-z]/.test(formData.newPassword),
    number: /\d/.test(formData.newPassword),
    special: /[@$!%*?&]/.test(formData.newPassword),
    different: formData.newPassword !== formData.currentPassword && formData.currentPassword.length > 0,
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  const handleSendCode = async () => {
    if (!authApi.isAuthenticated()) {
      toast.error('Please log in to change your password');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.sendChangePasswordCode();
      if (response.success) {
        toast.success('Verification code sent to your email');
        setStep(2);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.verifyChangePasswordCode(code);
      if (response.success) {
        toast.success('Code verified successfully');
        setChangeToken(response.changeToken);
        setStep(3);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!formData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }

    if (!isPasswordValid) {
      toast.error('Password does not meet requirements');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.changePasswordWithVerification(
        changeToken,
        formData.currentPassword,
        formData.newPassword,
        formData.confirmPassword
      );
      if (response.success) {
        setShowSuccess(true);
        toast.success('Password updated successfully!');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      const response = await authApi.sendChangePasswordCode();
      if (response.success) {
        toast.success('New verification code sent');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const RequirementItem = ({ met, text }) => (
    <div className="flex items-center gap-2 text-sm">
      <Check size={14} className={met ? 'text-green-600' : 'text-gray-300'} />
      <span className={met ? 'text-green-600' : 'text-gray-500'}>{text}</span>
    </div>
  );

  // Success Modal
  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-green-600" size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Password Updated Successfully</h2>
            <p className="text-gray-600 text-sm">Redirecting you to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={urbanLogo} alt="Urban Homes" className="h-10" />
          </div>

          {/* Step 1: Request Verification Code */}
          {step === 1 && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <KeyRound className="text-green-600" size={28} />
                </div>
              </div>

              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Change Password
                </h1>
                <p className="text-gray-600 text-sm">
                  For security, we'll send a verification code to your email
                  {user?.email && (
                    <span className="block font-medium mt-1">{user.email}</span>
                  )}
                </p>
              </div>

              <Button
                onClick={handleSendCode}
                variant="primary"
                size="md"
                loading={loading}
                showArrow
                className="w-full"
              >
                Send Verification Code
              </Button>
            </>
          )}

          {/* Step 2: Verify Code */}
          {step === 2 && (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Enter Verification Code
                </h1>
                <p className="text-gray-600 text-sm">
                  We've sent a 6-digit code to your email
                </p>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-5">
                <Input
                  label="Verification Code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={loading}
                  showArrow
                  className="w-full"
                >
                  Verify Code
                </Button>
              </form>

              <p className="mt-4 text-center text-sm text-gray-600">
                Didn't receive the code?{' '}
                <button
                  onClick={handleResendCode}
                  disabled={loading}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Resend
                </button>
              </p>
            </>
          )}

          {/* Step 3: Enter Passwords */}
          {step === 3 && (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Set New Password
                </h1>
                <p className="text-gray-600 text-sm">
                  Enter your current password and choose a new one
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-5">
                <div>
                  <Input
                    label="Current Password"
                    type="password"
                    placeholder="Enter your current password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    icon={Lock}
                  />
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-sm text-green-600 hover:text-green-700 mt-1"
                  >
                    Forgot your password?
                  </button>
                </div>

                <Input
                  label="New Password"
                  type="password"
                  placeholder="Enter your new password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  icon={Lock}
                />

                {/* Password Requirements */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Password must contain:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <RequirementItem met={passwordRequirements.length} text="At least 8 characters" />
                    <RequirementItem met={passwordRequirements.uppercase} text="One uppercase letter" />
                    <RequirementItem met={passwordRequirements.lowercase} text="One lowercase letter" />
                    <RequirementItem met={passwordRequirements.number} text="One number" />
                    <RequirementItem met={passwordRequirements.special} text="One special character" />
                    <RequirementItem met={passwordRequirements.different} text="Different from current" />
                  </div>
                </div>

                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Confirm your new password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  icon={Lock}
                />

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={loading}
                    className="flex-1"
                  >
                    Update Password
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => navigate(-1)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </>
          )}

          {/* Back Button (only on steps 1 and 2) */}
          {step < 3 && (
            <button
              onClick={() => navigate(-1)}
              className="mt-6 flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 text-sm w-full"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
