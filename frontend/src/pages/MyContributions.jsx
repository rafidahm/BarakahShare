import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, getAuth } from '../services/auth';
import api from '../services/api';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const MyContributions = () => {
  const navigate = useNavigate();
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
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
    // Use the status field directly from the database
    return item.status || 'AVAILABLE';
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

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      setError('');
      setSuccess('');
      await api.delete(`/items/${itemToDelete.id}`);
      setSuccess('Item deleted successfully!');
      setShowDeleteModal(false);
      setItemToDelete(null);

      // Refresh the items list
      const response = await api.get('/items?limit=1000');
      const allItems = response.data.items || [];
      const ownedItems = allItems.filter(item => item.ownerId === authUser?.id);
      setMyItems(ownedItems);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete item.');
      setShowDeleteModal(false);
      setItemToDelete(null);
      setTimeout(() => setError(''), 5000);
    }
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

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
              <div className="flex gap-2 mt-4">
                {getItemStatus(item) === 'AVAILABLE' && (
                  <Link
                    to={`/edit-item/${item.id}`}
                    className="btn-primary flex-1 text-center block"
                  >
                    Manage Item
                  </Link>
                )}
                {getItemStatus(item) === 'AVAILABLE' && (
                  <button
                    onClick={() => handleDeleteClick(item)}
                    className="btn-secondary px-4 py-2 flex items-center justify-center"
                    title="Delete Item"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setItemToDelete(null);
        }}
        title="Delete Item"
      >
        {itemToDelete && (
          <div>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete "{itemToDelete.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex-1"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setItemToDelete(null);
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyContributions;

