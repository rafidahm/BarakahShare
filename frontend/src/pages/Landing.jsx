import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated, getAuth } from '../services/auth';
import QuoteBox from '../components/QuoteBox';
import Card from '../components/Card';
import api from '../services/api';
import { BookOpenIcon, HeartIcon } from '@heroicons/react/24/outline';

const Landing = () => {
  const authenticated = isAuthenticated();
  const { user } = getAuth();
  const [recentItems, setRecentItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  useEffect(() => {
    const fetchRecentItems = async () => {
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
        setLoadingItems(false);
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
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          IIUCShare
        </h1>
        <p className="text-2xl text-primary mb-2">Share Knowledge, Share Barakah</p>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          A charity-driven platform where IIUC students can donate, lend, and request academic items. 
          Together, we build a stronger community through sharing.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="card text-center">
          <BookOpenIcon className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Donate Items</h2>
          <p className="text-gray-600 mb-6">
            Share your academic resources with fellow students. Books, notes, calculators, and more can help others succeed.
          </p>
          {authenticated ? (
            <Link to="/donate" className="btn-primary inline-block">
              Donate Now
            </Link>
          ) : (
            <Link to="/login" className="btn-primary inline-block">
              Login to Donate
            </Link>
          )}
        </div>

        <div className="card text-center">
          <HeartIcon className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Lend Items</h2>
          <p className="text-gray-600 mb-6">
            Temporarily share your academic resources with fellow students. Lend your items for others to use while you retain ownership.
          </p>
          {authenticated ? (
            <Link to="/lend" className="btn-primary inline-block">
              Lend Now
            </Link>
          ) : (
            <Link to="/login" className="btn-primary inline-block">
              Login to Lend
            </Link>
          )}
        </div>
      </div>

      {recentItems.length > 0 && (
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Recent Items</h2>
            <Link to="/recent-items" className="text-primary hover:underline font-semibold">
              View All →
            </Link>
          </div>
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
        </div>
      )}

      <QuoteBox autoRefresh={true} interval={5000} />

      <div className="card bg-gradient-to-r from-primary/10 to-primary-light/10 border-2 border-primary/20 mt-6">
        <h2 className="text-2xl font-bold mb-4 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
              1
            </div>
            <h3 className="font-semibold mb-2">Sign In</h3>
            <p className="text-sm text-gray-600">Login with your IIUC email (@ugrad.iiuc.ac.bd)</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
              2
            </div>
            <h3 className="font-semibold mb-2">Share or Request</h3>
            <p className="text-sm text-gray-600">Donate items you no longer need or request items you need</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
              3
            </div>
            <h3 className="font-semibold mb-2">Connect</h3>
            <p className="text-sm text-gray-600">Item owners approve requests and you coordinate the exchange</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
