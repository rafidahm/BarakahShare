import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, getAuth } from '../services/auth';
import api from '../services/api';
import Card from '../components/Card';
import Modal from '../components/Modal';

const UserRequest = () => {
  const navigate = useNavigate();
  const [itemsWithRequests, setItemsWithRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState('');
  const { user } = getAuth();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    fetchItemsWithRequests();

    // Refetch when page becomes visible (e.g., navigating back)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user?.id) {
        fetchItemsWithRequests();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [navigate, user?.id]);

  const fetchItemsWithRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/items?limit=1000');
      const allItems = response.data.items || [];
      
      // Filter items owned by current user that have requests
      const myItems = allItems.filter(item => item.ownerId === user?.id);
      const itemsWithReqs = myItems.filter(item => 
        item.requests && item.requests.length > 0
      );
      
      // Fetch full request details for each item
      const itemsWithFullRequests = await Promise.all(
        itemsWithReqs.map(async (item) => {
          try {
            const itemResponse = await api.get(`/items/${item.id}`);
            return itemResponse.data;
          } catch (err) {
            return item;
          }
        })
      );
      
      setItemsWithRequests(itemsWithFullRequests);
    } catch (error) {
      console.error('Failed to fetch items:', error);
      setError('Failed to load items with requests.');
    } finally {
      setLoading(false);
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
    return 'Available';
  };

  const getPendingRequests = (item) => {
    return item.requests?.filter(r => r.status === 'Pending') || [];
  };

  const getApprovedRequest = (item) => {
    return item.requests?.find(r => r.status === 'Approved') || null;
  };

  const handleApprove = async (requestId, itemId) => {
    try {
      setError('');
      setSuccess('');
      
      // Check if there's already an approved request
      const item = itemsWithRequests.find(i => i.id === itemId);
      if (item && getApprovedRequest(item)) {
        setError('This item already has an approved request. You can only approve one request.');
        return;
      }

      await api.patch(`/requests/${requestId}/approve`);
      setSuccess('Request approved successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchItemsWithRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve request.');
    }
  };

  const handleReject = async (requestId) => {
    try {
      setError('');
      setSuccess('');
      await api.patch(`/requests/${requestId}/reject`);
      setSuccess('Request rejected.');
      setTimeout(() => setSuccess(''), 3000);
      fetchItemsWithRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject request.');
    }
  };

  const handleStatusUpdate = async (itemId, action) => {
    try {
      setError('');
      setSuccess('');
      
      // For now, we'll note these actions - backend endpoints may need to be created
      // These would update item status: COMPLETED, IN_USE, RETURNED, DEACTIVATE
      
      if (action === 'DEACTIVATE') {
        const item = itemsWithRequests.find(i => i.id === itemId);
        if (getItemStatus(item) !== 'Available') {
          setError('You can only deactivate items with status AVAILABLE.');
          return;
        }
        // TODO: Call API to deactivate item
        setSuccess('Item deactivated (API endpoint needed)');
      } else {
        // TODO: Call API endpoints for COMPLETED, IN_USE, RETURNED
        setSuccess(`Item status updated to ${action} (API endpoint needed)`);
      }
      
      setTimeout(() => setSuccess(''), 3000);
      setShowStatusModal(false);
      setSelectedItem(null);
      setStatusAction('');
    } catch (err) {
      setError(err.response?.data?.message || `Failed to update status to ${action}.`);
    }
  };

  const openStatusModal = (item, action) => {
    setSelectedItem(item);
    setStatusAction(action);
    setShowStatusModal(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Request</h1>
        <Link to="/my-contributions" className="text-primary hover:underline">
          View My Contributions →
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

      {itemsWithRequests.length === 0 ? (
        <Card>
          <p className="text-center text-gray-600 py-8">
            No requests received yet. Your items will appear here when users request them.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {itemsWithRequests.map((item) => {
            const pendingRequests = getPendingRequests(item);
            const approvedRequest = getApprovedRequest(item);
            const status = getItemStatus(item);
            const isDonation = item.type === 'Donate';

            return (
              <Card key={item.id} className="relative">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Item Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">{item.name}</h2>
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`px-3 py-1 rounded text-sm font-semibold ${
                            item.type === 'Donate' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.type}
                          </span>
                          <span className={`px-3 py-1 rounded text-sm font-semibold ${
                            status === 'Available' ? 'bg-green-100 text-green-800' :
                            status === 'Claimed' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {status}
                          </span>
                        </div>
                      </div>
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-32 h-32 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-semibold">Category:</span> {item.category}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-semibold">Condition:</span> {item.condition}
                    </p>
                    
                    {/* Pending Requests Section */}
                    {pendingRequests.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h3 className="font-semibold mb-3 text-lg">Pending Requests ({pendingRequests.length})</h3>
                        <div className="space-y-3">
                          {pendingRequests.map((request) => (
                            <div key={request.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-semibold">{request.user?.name || 'Anonymous'}</p>
                                  <p className="text-xs text-gray-600">{request.user?.email}</p>
                                  {request.message && (
                                    <p className="text-sm text-gray-700 mt-2 italic">"{request.message}"</p>
                                  )}
                                  <p className="text-xs text-gray-500 mt-2">
                                    Requested on {new Date(request.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  {!approvedRequest && (
                                    <button
                                      onClick={() => handleApprove(request.id, item.id)}
                                      className="btn-primary text-sm px-4 py-2"
                                    >
                                      Approve
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleReject(request.id)}
                                    className="btn-secondary text-sm px-4 py-2"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Approved Request Section */}
                    {approvedRequest && (
                      <div className="mt-4 pt-4 border-t">
                        <h3 className="font-semibold mb-3 text-lg text-green-700">✅ Approved Request</h3>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="font-semibold">{approvedRequest.user?.name || 'Anonymous'}</p>
                          <p className="text-xs text-gray-600">{approvedRequest.user?.email}</p>
                          {approvedRequest.message && (
                            <p className="text-sm text-gray-700 mt-2 italic">"{approvedRequest.message}"</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Approved on {new Date(approvedRequest.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="md:w-48 space-y-3">
                    <h3 className="font-semibold mb-3">Actions</h3>
                    
                    {approvedRequest && status === 'Claimed' && (
                      <>
                        {isDonation ? (
                          <button
                            onClick={() => openStatusModal(item, 'COMPLETED')}
                            className="btn-primary w-full"
                          >
                            Mark COMPLETED
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => openStatusModal(item, 'IN_USE')}
                              className="btn-primary w-full"
                            >
                              Mark IN_USE
                            </button>
                            <button
                              onClick={() => openStatusModal(item, 'RETURNED')}
                              className="btn-secondary w-full"
                            >
                              Mark RETURNED
                            </button>
                          </>
                        )}
                      </>
                    )}

                    {status === 'Available' && (
                      <button
                        onClick={() => openStatusModal(item, 'DEACTIVATE')}
                        className="btn-secondary w-full"
                      >
                        Deactivate Item
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedItem(null);
          setStatusAction('');
        }}
        title={`Confirm ${statusAction}`}
      >
        {selectedItem && (
          <div>
            <p className="text-gray-700 mb-4">
              Are you sure you want to mark "{selectedItem.name}" as {statusAction}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleStatusUpdate(selectedItem.id, statusAction)}
                className="btn-primary flex-1"
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedItem(null);
                  setStatusAction('');
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

export default UserRequest;

