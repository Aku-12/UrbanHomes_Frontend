import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, Home, RefreshCw } from 'lucide-react';
import { Header, Footer } from '../components/layout';

const PaymentFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Log failure for debugging
    const data = searchParams.get('data');
    if (data) {
      try {
        const decodedData = JSON.parse(atob(data));
        console.log('Payment failure data:', decodedData);
      } catch (e) {
        console.log('Failed to decode payment data');
      }
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {/* Failure Icon */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>

          {/* Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-600 mb-8">
            Unfortunately, your payment could not be processed. This could be due to insufficient balance, 
            cancelled transaction, or a technical issue.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate(-1)}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Try Again
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              View My Bookings
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Home size={18} />
              Back to Home
            </button>
          </div>

          {/* Help Info */}
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg text-left">
            <h3 className="font-medium text-yellow-800 mb-2">Common Issues:</h3>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>Insufficient balance in your eSewa wallet</li>
              <li>Transaction was cancelled before completion</li>
              <li>Session timeout - please try again</li>
              <li>Network connectivity issues</li>
            </ul>
          </div>

          {/* Contact Support */}
          <p className="mt-6 text-sm text-gray-500">
            Need help? <a href="/contact" className="text-green-600 hover:underline">Contact our support team</a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentFailure;
