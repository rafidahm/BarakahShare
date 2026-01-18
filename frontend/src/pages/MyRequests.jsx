import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAuthenticated } from '../services/auth';
import api from '../services/api';
import QuoteBox from '../components/QuoteBox';
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

  const getStatusBadge = (status) => {
    const styles = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800'
    };

    const displayText = status === 'Approved' ? 'CLAIMED' : status;

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
      <QuoteBox />
      
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
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{request.item.name}</h3>
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
                </div>
                <div className="ml-4">
                  {getStatusBadge(request.status)}
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-2">
                Requested on {new Date(request.createdAt).toLocaleDateString()}
              </p>
              {request.status === 'Approved' && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-green-700 font-semibold">
                    ✅ Your request has been approved! This item is CLAIMED. Please contact the owner to arrange pickup.
                  </p>
                </div>
              )}
              {request.status === 'Pending' && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    Waiting for owner approval...
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequests;
