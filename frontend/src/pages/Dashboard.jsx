import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../services/auth';
import api from '../services/api';
import QuoteBox from '../components/QuoteBox';
import Card from '../components/Card';
import { BookOpenIcon, HeartIcon, PlusIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await api.get('/users/me');
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Refetch when page becomes visible (e.g., navigating back from profile)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUser();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <QuoteBox />
      
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-1">Items Donated</p>
              <p className="text-3xl font-bold text-primary">{user?.itemsDonated || 0}</p>
            </div>
            <BookOpenIcon className="w-12 h-12 text-primary opacity-50" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-1">Items Requested</p>
              <p className="text-3xl font-bold text-primary">{user?.itemsRequested || 0}</p>
            </div>
            <HeartIcon className="w-12 h-12 text-primary opacity-50" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-1">Role</p>
              <p className="text-lg font-semibold text-primary capitalize">{user?.role || 'user'}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/donate" className="btn-primary w-full flex items-center justify-center space-x-2">
              <PlusIcon className="w-5 h-5" />
              <span>Add New Item</span>
            </Link>
            <Link to="/browse" className="btn-secondary w-full text-center block">
              Browse Items
            </Link>
            <Link to="/my-requests" className="btn-secondary w-full text-center block">
              My Requests
            </Link>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-4">Profile</h2>
          <div className="flex items-start space-x-4 mb-4">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-20 h-20 rounded-full border-2 border-primary object-cover"
                key={user.picture} // Force re-render when picture changes
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold border-2 border-primary">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-bold">{user?.name}</h3>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
          <div className="space-y-2 pt-4 border-t">
            {user?.department && (
              <p><span className="font-semibold">Department:</span> {user.department}</p>
            )}
            {user?.semester && (
              <p><span className="font-semibold">Semester:</span> {user.semester}</p>
            )}
            {user?.whatsapp && (
              <p><span className="font-semibold">WhatsApp:</span> {user.whatsapp}</p>
            )}
            <p><span className="font-semibold">Member since:</span> {new Date(user?.createdAt).toLocaleDateString()}</p>
            <Link to="/profile" className="text-primary hover:underline text-sm mt-2 inline-block">
              Update Profile →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
