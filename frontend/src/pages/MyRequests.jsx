import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAuthenticated } from '../services/auth';
import api from '../services/api';
import Card from '../components/Card';

const MyRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    fetchRequests();
  }, [navigate]);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/requests/my');
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowerAction = async (itemId, action) => {
    try {
      await api.patch(`/items/${itemId}/borrower-action`, { action });
      // Refresh requests
      await fetchRequests();
    } catch (error) {
      console.error(`Failed to ${action} item:`, error);
      alert(error.response?.data?.message || `Failed to mark as ${action}`);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
      'On Hold': 'bg-orange-100 text-orange-800',
      'In Use': 'bg-blue-100 text-blue-800',
      'Pending Return': 'bg-orange-100 text-orange-800',
      Completed: 'bg-purple-100 text-purple-800',
      Claimed: 'bg-green-100 text-green-800',
      Returned: 'bg-teal-100 text-teal-800'
    };

    // Add emoji for special statuses
    const displayText = status === 'Approved' ? 'CLAIMED' :
      status === 'On Hold' ? '⏳ ON HOLD' :
        status === 'Pending Return' ? '⏳ PENDING RETURN' :
          status === 'Returned' ? '✅ RETURNED' :
            status.toUpperCase();

    return (
      <span className={`px-3 py-1 rounded text-sm font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {displayText}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Requests</h1>
        <Link to="/browse" className="btn-secondary">
          Browse More Items
        </Link>
      </div>

      {requests.length === 0 ? (
        <Card>
          <p className="text-center text-gray-600 py-8">
            You haven't made any requests yet. <Link to="/browse" className="text-primary hover:underline">Browse items</Link> to get started.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <div className="grid md:grid-cols-[60%_40%] gap-6">
                {/* Left Column - Item Info */}
                <div className="border-r pr-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-3">{request.item.name}</h3>
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`px-3 py-1 rounded text-sm font-semibold ${request.item.type === 'Donate'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {request.item.type}
                        </span>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-semibold">Category:</span> {request.item.category}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-semibold">Owner:</span> {request.item.owner?.name || 'Anonymous'}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-semibold">Contact:</span> {request.item.contact}
                      </p>
                      {request.message && (
                        <p className="text-sm text-gray-700 mt-2 italic">
                          "{request.message}"
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-3">
                        Requested on {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {request.item.imageUrl && (
                      <img
                        src={request.item.imageUrl}
                        alt={request.item.name}
                        className="w-32 h-32 object-contain rounded-lg ml-4 bg-gray-50"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Right Column - Status & Actions */}
                <div className="space-y-4">
                  {/* Date tracking based on item status and type */}
                  {(request.status === 'Approved' || request.status === 'On Hold' || request.status === 'Claimed' || request.status === 'In Use' || request.status === 'Pending Return' || request.status === 'Returned') && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                      {request.status === 'On Hold' && (
                        <p className="text-sm text-orange-700 font-semibold mb-3">
                          ⏳ Your request is ON HOLD. Waiting for the owner to confirm handover.
                        </p>
                      )}
                      {request.status === 'Approved' && (
                        <p className="text-sm text-green-700 font-semibold mb-3">
                          ✅ Your request has been approved! This item is CLAIMED. Please contact the owner to arrange pickup.
                        </p>
                      )}
                      {request.status === 'Claimed' && (
                        <p className="text-sm text-green-700 font-semibold mb-3">
                          ✅ Item CLAIMED! The donation is complete.
                        </p>
                      )}

                      {/* Show donor and recipient info for donations */}
                      {request.item.type === 'Donate' && (request.status === 'On Hold' || request.status === 'Claimed') && (
                        <>
                          <div className="text-xs text-gray-600 mb-1">
                            <span className="font-semibold">Donated by:</span> {request.item.owner?.name || 'Anonymous'}
                          </div>
                          <div className="text-xs text-gray-600 mb-2">
                            <span className="font-semibold">Received by:</span> You
                          </div>
                        </>
                      )}

                      {/* Approved date - always first */}
                      {request.approvedOn && (
                        <div className="text-xs text-gray-600">
                          <span className="font-semibold">Approved on:</span> {new Date(request.approvedOn).toLocaleDateString()}
                        </div>
                      )}

                      {/* Donated on - for completed donations */}
                      {request.item.type === 'Donate' && request.item.status === 'COMPLETED' && request.lentOn && (
                        <div className="text-xs text-gray-600">
                          <span className="font-semibold">Donated on:</span> {new Date(request.lentOn).toLocaleDateString()}
                        </div>
                      )}

                      {/* Lent on - for lending items in use or returned */}
                      {request.item.type === 'Lend' && (request.item.status === 'IN_USE' || request.item.status === 'PENDING_RETURN' || request.item.status === 'RETURNED') && request.lentOn && (
                        <div className="text-xs text-gray-600">
                          <span className="font-semibold">Lent on:</span> {new Date(request.lentOn).toLocaleDateString()}
                        </div>
                      )}

                      {/* Claimed on - for claimed donations */}
                      {request.status === 'Claimed' && request.lentOn && (
                        <div className="text-xs text-gray-600">
                          <span className="font-semibold">Claimed on:</span> {new Date(request.lentOn).toLocaleDateString()}
                        </div>
                      )}

                      {/* Returned on - for returned lending items */}
                      {request.item.type === 'Lend' && request.item.status === 'RETURNED' && request.returnedOn && (
                        <div className="text-xs text-gray-600">
                          <span className="font-semibold">Returned on:</span> {new Date(request.returnedOn).toLocaleDateString()}
                        </div>
                      )}

                      {/* Show lender and borrower info for lending */}
                      {request.item.type === 'Lend' && request.status === 'Approved' && (
                        <>
                          <div className="text-xs text-gray-600 mb-1">
                            <span className="font-semibold">Lent by:</span> {request.item.owner?.name || 'Anonymous'}
                          </div>
                          <div className="text-xs text-gray-600 mb-2">
                            <span className="font-semibold">Borrowed by:</span> You
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {request.status === 'Rejected' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-700 font-semibold mb-2">
                        Unfortunately, your request was not approved this time.
                      </p>
                      <p className="text-xs text-gray-600 mb-2">
                        The owner may have chosen another recipient or decided not to proceed with this item. Feel free to browse other available items!
                      </p>
                      <div className="text-xs text-gray-500">
                        <span className="font-semibold">Rejected on:</span> {new Date(request.updatedAt || request.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {request.status === 'Pending' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-xs text-gray-600">
                        Waiting for owner approval...
                      </p>
                    </div>
                  )}

                  {/* Lending-specific statuses and actions */}
                  {request.item.type === 'Lend' && request.status === 'Approved' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-700 font-semibold mb-3">
                        ✅ Your request is approved! Please pick up the item and confirm receipt.
                      </p>
                      <button
                        onClick={() => handleBorrowerAction(request.item.id, 'received')}
                        className="btn-primary w-full"
                      >
                        I Received It
                      </button>
                    </div>
                  )}

                  {request.item.type === 'Lend' && request.status === 'In Use' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-700 font-semibold mb-3">
                        📦 You currently have this item. Click below when you return it.
                      </p>
                      <button
                        onClick={() => handleBorrowerAction(request.item.id, 'returned')}
                        className="btn-primary w-full"
                      >
                        I Returned It
                      </button>
                    </div>
                  )}

                  {request.item.type === 'Lend' && request.status === 'Pending Return' && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <p className="text-sm text-orange-700 font-semibold mb-2">
                        ⏳ Waiting for lender to confirm they received the item back.
                      </p>
                      <p className="text-xs text-gray-600">
                        The owner will verify the return and update the status.
                      </p>
                    </div>
                  )}

                  {request.item.type === 'Lend' && request.status === 'Returned' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-700 font-semibold">
                        ✅ Return confirmed! Thank you for returning on time.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequests;
