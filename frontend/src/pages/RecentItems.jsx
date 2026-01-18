import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/Card';
import { getAuth } from '../services/auth';

const RecentItems = () => {
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = getAuth();

  useEffect(() => {
    const fetchRecentItems = async () => {
      setLoading(true);
      try {
        const response = await api.get('/items?limit=10');
        const allItems = response.data.items || [];
        // Filter out items that are CLAIMED (have approved requests)
        const availableItems = allItems.filter(item => {
          const hasApproved = item.requests?.some(r => r.status === 'Approved');
          return !hasApproved; // Only show items without approved requests
        });
        setRecentItems(availableItems);
      } catch (error) {
        console.error('Failed to fetch recent items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentItems();
  }, []);

  const getItemStatus = (item) => {
    if (!item.requests || item.requests.length === 0) {
      return 'Available';
    }
    const hasApproved = item.requests.some(r => r.status === 'Approved');
    if (hasApproved) {
      return 'Claimed';
    }
    const hasPending = item.requests.some(r => r.status === 'Pending');
    if (hasPending) {
      return 'Pending';
    }
    return 'Available';
  };

  const getTypeBadge = (type) => {
    return type === 'Donate' 
      ? <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold absolute top-2 right-2">Donate</span>
      : <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold absolute top-2 right-2">Lend</span>;
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Available': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Claimed': 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`${colors[status] || 'bg-gray-100 text-gray-800'} px-2 py-1 rounded text-xs font-semibold`}>
        {status}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Recent Items</h1>
      <p className="text-gray-600 mb-8">
        Here are the 10 most recently added items available for donation or lending.
      </p>

      {loading ? (
        <div className="text-center py-12">Loading recent items...</div>
      ) : recentItems.length === 0 ? (
        <Card>
          <p className="text-center text-gray-600 py-8">No recent items available.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentItems.map((item) => (
            <Card key={item.id} className="relative">
              {item.imageUrl && (
                <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center relative">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  {getTypeBadge(item.type)}
                </div>
              )}
              {!item.imageUrl && (
                <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center relative">
                  {getTypeBadge(item.type)}
                </div>
              )}
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                {getStatusBadge(getItemStatus(item))}
              </div>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-semibold">Category:</span> {item.category}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-semibold">Condition:</span> {item.condition}
              </p>
              {item.description && (
                <p className="text-sm text-gray-700 mb-4 line-clamp-2">{item.description}</p>
              )}
              <p className="text-xs text-gray-500 mb-4">
                By {item.owner?.name || 'Anonymous'}
              </p>
              {user && item.ownerId === user.id ? (
                <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded text-center text-sm">
                  Your Item
                </div>
              ) : (
                <Link
                  to={`/request/${item.id}`}
                  className="btn-primary w-full text-center block"
                >
                  Request Item
                </Link>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentItems;

