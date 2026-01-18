import { GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { setAuth } from '../services/auth';
import Card from '../components/Card';

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/google', {
        token: credentialResponse.credential
      });

      const { token, user } = response.data;
      setAuth(token, user);
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      
      // Show specific message for domain restriction
      if (message.includes('@ugrad.iiuc.ac.bd')) {
        setError('Only IIUC undergraduate students can access IIUCShare. Please use an @ugrad.iiuc.ac.bd email address.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card>
        <h1 className="text-3xl font-bold text-center mb-6">Login to IIUCShare</h1>
        <p className="text-center text-gray-600 mb-6">
          Please sign in with your IIUC email address (@ugrad.iiuc.ac.bd)
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="text-center">
          {loading ? (
            <div className="text-primary">Logging in...</div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default Login;
