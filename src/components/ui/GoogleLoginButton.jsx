import { GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '../../api';

const GoogleLoginButton = ({ onSuccess, buttonText = 'signin_with' }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error('Failed to get Google credentials');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.googleAuth(credentialResponse.credential);

      if (response.success) {
        toast.success(response.message || 'Successfully logged in with Google!');
        if (onSuccess) {
          onSuccess(response);
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Google authentication failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google Sign-In was unsuccessful. Please try again.');
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white">
        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-700 font-medium">Signing in...</span>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        text={buttonText}
        shape="rectangular"
        size="large"
        width={400}
        theme="outline"
      />
    </div>
  );
};

export default GoogleLoginButton;
