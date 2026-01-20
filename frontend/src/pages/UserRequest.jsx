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
    // Use the status field directly from the database
    return item.status || 'AVAILABLE';
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

      // Call status update endpoint
      await api.patch(`/items/${itemId}/status`, { status: action });
      setSuccess(`Item status updated to ${action} successfully.`);

      setTimeout(() => setSuccess(''), 3000);
      setShowStatusModal(false);
      setSelectedItem(null);
      setStatusAction('');
      fetchItemsWithRequests();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to update status to ${action}.`);
      setShowStatusModal(false);
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
                <div className="grid md:grid-cols-[60%_40%] gap-6">
                  {/* Box 1 - Item Info */}
                  <div className="border-r pr-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-3">{item.name}</h2>
                        <div className="flex items-center gap-2 mb-4">
                          <span className={`px-3 py-1 rounded text-sm font-semibold ${item.type === 'Donate'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {item.type}
                          </span>
                          <span className={`px-3 py-1 rounded text-sm font-semibold ${status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                            status === 'CLAIMED' ? 'bg-blue-100 text-blue-800' :
                              status === 'COMPLETED' ? 'bg-purple-100 text-purple-800' :
                                status === 'IN_USE' ? 'bg-yellow-100 text-yellow-800' :
                                  status === 'RETURNED' ? 'bg-teal-100 text-teal-800' :
                                    'bg-gray-100 text-gray-800'
                            }`}>
                            {status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-semibold">Category:</span> {item.category}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-semibold">Condition:</span> {item.condition}
                        </p>
                      </div>
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-32 h-32 object-cover rounded-lg ml-4"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                    </div>

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


                  </div>

                  {/* Box 2 - Quick Actions */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>

                    {/* Phase 1: PENDING - Show pending requests with Approve/Decline buttons */}
                    {pendingRequests.length > 0 && !approvedRequest && (
                      <div className="space-y-3">
                        {pendingRequests.map((request) => (
                          <div key={request.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="font-semibold mb-1">{request.user?.name || 'Anonymous'}</p>
                            <p className="text-xs text-gray-600 mb-2">{request.user?.email}</p>
                            {request.message && (
                              <p className="text-sm text-gray-700 mb-3 italic">"{request.message}"</p>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(request.id, item.id)}
                                className="btn-primary text-sm px-4 py-2 flex-1"
                              >
                                {isDonation ? 'Approve Donation' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleReject(request.id)}
                                className="btn-secondary text-sm px-4 py-2 flex-1"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Phase 2 & 3: Show summary when there's an approved request */}
                    {approvedRequest && (
                      <div className="space-y-4">
                        {/* Summary Section */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-base mb-3">
                            {isDonation ? 'Donation Summary' : 'Lending Summary'}
                          </h4>

                          {/* Status Badge */}
                          <div className="mb-3">
                            <p className="text-xs text-gray-600 mb-1">Status</p>
                            <span className={`px-3 py-1 rounded text-sm font-semibold inline-block ${status === 'CLAIMED' ? 'bg-blue-100 text-blue-800' :
                                status === 'IN_USE' ? 'bg-blue-100 text-blue-800' :
                                  status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                    status === 'RETURNED' ? 'bg-green-100 text-green-800' :
                                      'bg-gray-100 text-gray-800'
                              }`}>
                              {status === 'CLAIMED' ? (isDonation ? 'APPROVED' : 'CLAIMED') :
                                status === 'IN_USE' ? 'IN USE' :
                                  status === 'COMPLETED' ? '✅ COMPLETED' :
                                    status === 'RETURNED' ? '✅ RETURNED' :
                                      status}
                            </span>
                          </div>

                          {/* Owner info */}
                          <div className="mb-2">
                            <p className="text-xs text-gray-600">
                              {isDonation ? 'Donated by' : 'Lent by'}
                            </p>
                            <p className="text-sm font-medium">You</p>
                          </div>

                          {/* Recipient/Borrower info - only show after approval */}
                          {approvedRequest && (
                            <div className="mb-2">
                              <p className="text-xs text-gray-600">
                                {isDonation ? 'Recipient' : 'Borrowed by'}
                              </p>
                              <p className="text-sm font-medium">{approvedRequest.user?.name || 'Anonymous'}</p>
                              <p className="text-xs text-gray-500">{approvedRequest.user?.email}</p>
                            </div>
                          )}

                          {/* Approved date - only show when available */}
                          {approvedRequest?.createdAt && (
                            <div className="mb-2">
                              <p className="text-xs text-gray-600">Approved on</p>
                              <p className="text-sm">{new Date(approvedRequest.createdAt).toLocaleDateString()}</p>
                            </div>
                          )}

                          {/* Completion/Return date - only show when status is COMPLETED or RETURNED */}
                          {(status === 'COMPLETED' || status === 'RETURNED') && item.updatedAt && (
                            <div className="mb-2">
                              <p className="text-xs text-gray-600">
                                {isDonation ? 'Completed on' : 'Returned on'}
                              </p>
                              <p className="text-sm">{new Date(item.updatedAt).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons - Phase 2 only (CLAIMED or IN_USE) */}
                        {status === 'CLAIMED' && (
                          <button
                            onClick={() => openStatusModal(item, isDonation ? 'COMPLETED' : 'IN_USE')}
                            className="btn-primary w-full"
                          >
                            {isDonation ? 'Confirm Handover' : 'Mark as IN USE'}
                          </button>
                        )}

                        {status === 'IN_USE' && !isDonation && (
                          <button
                            onClick={() => openStatusModal(item, 'RETURNED')}
                            className="btn-primary w-full"
                          >
                            Mark as Returned
                          </button>
                        )}

                        {/* Phase 3: No buttons, just summary (COMPLETED or RETURNED) */}
                      </div>
                    )}

                    {/* Show message when no pending requests and no approved request */}
                    {pendingRequests.length === 0 && !approvedRequest && (
                      <div className="text-center text-gray-500 text-sm py-4">
                        No pending requests
                      </div>
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

