import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated, getAuth } from '../services/auth';
import QuoteBox from '../components/QuoteBox';
import Card from '../components/Card';
import FeedbackBox from '../components/FeedbackBox';
import api from '../services/api';
import { BookOpenIcon, HeartIcon, TrashIcon } from '@heroicons/react/24/outline';

const Landing = () => {
  const authenticated = isAuthenticated();
  const { user } = getAuth();
  const [recentItems, setRecentItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [wishPosts, setWishPosts] = useState([]);
  const [loadingWishes, setLoadingWishes] = useState(true);
  const [deletingWishId, setDeletingWishId] = useState(null);

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
    fetchWishPosts();
  }, []);

  const fetchWishPosts = async () => {
    try {
      const response = await api.get('/wishlist');
      setWishPosts(response.data.wishPosts || []);
    } catch (error) {
      console.error('Failed to fetch wish posts:', error);
    } finally {
      setLoadingWishes(false);
    }
  };

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

  const handleDeleteWish = async (wishId) => {
    if (!window.confirm('Are you sure you want to delete this wish? This action cannot be undone.')) {
      return;
    }

    setDeletingWishId(wishId);
    try {
      await api.delete(`/wishlist/${wishId}`);
      // Refresh the wishlist
      await fetchWishPosts();
    } catch (error) {
      console.error('Failed to delete wish:', error);
      alert(error.response?.data?.message || 'Failed to delete wish. Please try again.');
    } finally {
      setDeletingWishId(null);
    }
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {recentItems.map((item) => (
              <Card key={item.id} className="relative !p-0 flex flex-col h-full">
                <div className="flex flex-col justify-between flex-grow p-6">
                  <div>
                    {item.imageUrl && (
                      <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center relative">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full object-contain"
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
                    <p className="text-xs text-gray-500">
                      By {item.owner?.name || 'Anonymous'}
                    </p>
                  </div>
                  <div>
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
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <QuoteBox autoRefresh={true} interval={5000} />

      {/* Community Wishes Section */}
      <div className="mb-12 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Community Wishes</h2>
          <Link to="/wishlist" className="text-primary hover:underline font-semibold">
            Post Your Wish →
          </Link>
        </div>
        {loadingWishes ? (
          <div className="text-center py-8">Loading wishes...</div>
        ) : wishPosts.length === 0 ? (
          <Card>
            <p className="text-center text-gray-600 py-8">
              No wishes posted yet. Be the first to share what you need!
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishPosts.slice(0, 6).map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow border border-gray-200 relative">
                {/* Delete button - only visible to wish owner */}
                {user && post.userId === user.id && (
                  <button
                    onClick={() => handleDeleteWish(post.id)}
                    disabled={deletingWishId === post.id}
                    className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
                    title="Delete this wish"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
                {post.imageUrl && (
                  <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-200">
                    <img
                      src={`http://localhost:4000${post.imageUrl}`}
                      alt={post.itemName}
                      className="h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-4">{post.itemName}</h3>
                <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                  {post.user?.picture ? (
                    <img
                      src={post.user.picture}
                      alt={post.user.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                      <span className="text-gray-700 font-semibold text-sm">
                        {post.user?.name?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{post.user?.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

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

      {/* Feedback Box */}
      <FeedbackBox />
    </div>
  );
};

export default Landing;
