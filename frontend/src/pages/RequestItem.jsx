import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { isAuthenticated, getAuth } from '../services/auth';
import api from '../services/api';
import Card from '../components/Card';
import Modal from '../components/Modal';

const RequestItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userRequest, setUserRequest] = useState(null);
  const { user } = getAuth();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    fetchItem();
    fetchUserRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  const fetchItem = async () => {
    try {
      const response = await api.get(`/items/${id}`);
      const itemData = response.data;
      setItem(itemData);

      // Check if user is the owner
      if (user && itemData.ownerId === user.id) {
        setError('You cannot request your own item. This item belongs to you.');
      }

      // Check if item is already claimed (has approved request)
      const hasApproved = itemData.requests?.some(r => r.status === 'Approved');
      if (hasApproved && user && itemData.ownerId !== user.id) {
        setError('This item has already been claimed by another user.');
      }
    } catch (error) {
      console.error('Failed to fetch item:', error);
      setError(error.response?.data?.message || 'Item not found.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRequests = async () => {
    try {
      const response = await api.get('/requests/my');
      const requests = response.data.requests || [];
      const userReq = requests.find(r => r.itemId === id || r.item?.id === id);
      setUserRequest(userReq || null);
    } catch (error) {
      console.error('Failed to fetch user requests:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRequesting(true);
    setError('');

    try {
      await api.post('/requests', {
        itemId: id,
        message: message || undefined
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send request. Please try again.');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <p className="text-center text-red-600">Item not found.</p>
          <Link to="/browse" className="btn-primary mt-4 inline-block">
            Browse Items
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">

      <Link to="/browse" className="text-primary hover:underline mb-4 inline-block">
        ← Back to Browse
      </Link>

      <Card className="mb-6">
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-64 object-cover rounded-lg mb-4"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold">{item.name}</h1>
          <span className={`px-3 py-1 rounded text-sm font-semibold ${item.type === 'Donate'
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
            }`}>
            {item.type}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Category</p>
            <p className="font-semibold">{item.category}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Condition</p>
            <p className="font-semibold">{item.condition}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Owner</p>
            <p className="font-semibold">{item.owner?.name || 'Anonymous'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Contact</p>
            <p className="font-semibold">{item.contact}</p>
          </div>
        </div>

        {item.description && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-1">Description</p>
            <p className="text-gray-700">{item.description}</p>
          </div>
        )}
      </Card>

      {user && item.ownerId === user.id ? (
        <Card>
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4">
            <p className="font-semibold mb-2">⚠️ Cannot Request Own Item</p>
            <p className="mb-4">You cannot request or borrow your own item. This item belongs to you.</p>
            <Link to="/browse" className="btn-primary inline-block">
              Browse Other Items
            </Link>
          </div>
        </Card>
      ) : (
        <Card>
          <h2 className="text-xl font-bold mb-4">Send Request</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {userRequest && (
            <div className={`px-4 py-3 rounded-lg mb-4 ${userRequest.status === 'Pending'
                ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                : userRequest.status === 'Approved'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-gray-50 border border-gray-200 text-gray-800'
              }`}>
              <p className="font-semibold mb-1">
                {userRequest.status === 'Pending' ? '⏳ Request PENDING' :
                  userRequest.status === 'Approved' ? '✅ Request APPROVED - CLAIMED' :
                    'Request Status: ' + userRequest.status}
              </p>
              {userRequest.message && (
                <p className="text-sm mt-2 italic">"{userRequest.message}"</p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Message (Optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="4"
                className="input-field"
                placeholder="Add a message to the owner (e.g., when you need it, why you need it)..."
                disabled={!!userRequest}
              />
            </div>

            <button
              type="submit"
              disabled={requesting || (user && item.ownerId === user.id) || !!userRequest}
              className="btn-primary w-full disabled:opacity-50"
            >
              {userRequest
                ? (userRequest.status === 'Pending' ? 'Request Pending...' : 'Already Requested')
                : (requesting ? 'Sending Request...' : 'Send Request')
              }
            </button>
          </form>
        </Card>
      )}

      <Modal
        isOpen={success}
        onClose={() => {
          setSuccess(false);
          navigate('/my-requests');
        }}
        title="Request Sent!"
      >
        <p className="text-gray-700 mb-4">
          Your request has been sent to the item owner. They will review it and get back to you.
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            navigate('/my-requests');
          }}
          className="btn-primary w-full"
        >
          View My Requests
        </button>
      </Modal>
    </div>
  );
};

export default RequestItem;
