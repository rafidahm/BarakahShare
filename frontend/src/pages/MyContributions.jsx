import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, getAuth } from '../services/auth';
import api from '../services/api';
import Card from '../components/Card';
import { PlusIcon } from '@heroicons/react/24/outline';

const MyContributions = () => {
  const navigate = useNavigate();
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: authUser } = getAuth();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const fetchMyItems = async () => {
      try {
        // Fetch all items and filter by ownerId on client side
        // In a real implementation, you'd want a backend endpoint like /items/my
        const response = await api.get('/items?limit=1000');
        const allItems = response.data.items || [];
        const ownedItems = allItems.filter(item => item.ownerId === authUser?.id);
        setMyItems(ownedItems);
      } catch (error) {
        console.error('Failed to fetch my items:', error);
      } finally {
        setLoading(false);
      }
    };

    if (authUser?.id) {
      fetchMyItems();
    }

    // Refetch when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && authUser?.id) {
        fetchMyItems();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [navigate, authUser?.id]);

  const getItemStatus = (item) => {
    if (!item.requests || item.requests.length === 0) {
      return 'Available';
    }
    const hasApproved = item.requests.some(r => r.status === 'Approved');
    if (hasApproved) {
      return 'Claimed';
    }
    return 'Available';
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Available': 'bg-green-100 text-green-800',
      'Claimed': 'bg-gray-100 text-gray-800',
      'Pending': 'bg-yellow-100 text-yellow-800'
    };
    return (
      <span className={`${colors[status] || 'bg-gray-100 text-gray-800'} px-2 py-1 rounded text-xs font-semibold`}>
        {status}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Contributions</h1>
        <Link to="/donate" className="btn-primary flex items-center space-x-2">
          <PlusIcon className="w-5 h-5" />
          <span>Add New Item</span>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading your items...</div>
      ) : myItems.length === 0 ? (
        <Card>
          <p className="text-center text-gray-600 py-8">
            You haven't contributed any items yet. <Link to="/donate" className="text-primary hover:underline">Start donating</Link> or <Link to="/lend" className="text-primary hover:underline">lending</Link> items to help others.
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myItems.map((item) => (
            <Card key={item.id} className="relative">
              {item.imageUrl && (
                <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              {!item.imageUrl && (
                <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                {getStatusBadge(getItemStatus(item))}
              </div>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-semibold">Type:</span> {item.type}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-semibold">Category:</span> {item.category}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-semibold">Condition:</span> {item.condition}
              </p>
              {item.description && (
                <p className="text-sm text-gray-700 mb-3 line-clamp-2">{item.description}</p>
              )}
              {item.requests && item.requests.length > 0 && (
                <p className="text-xs text-gray-600 mb-3">
                  <span className="font-semibold">Requests:</span> {item.requests.filter(r => r.status === 'Pending').length} pending
                  {item.requests.filter(r => r.status === 'Approved').length > 0 && (
                    <span className="ml-2 text-green-700">
                      • {item.requests.filter(r => r.status === 'Approved').length} approved
                    </span>
                  )}
                </p>
              )}
              <Link
                to={`/request/${item.id}`}
                className="btn-primary w-full text-center block mt-4"
              >
                Manage Item
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyContributions;

