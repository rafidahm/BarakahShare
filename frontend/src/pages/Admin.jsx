import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getAuth } from '../services/auth';
import api from '../services/api';
import QuoteBox from '../components/QuoteBox';
import Card from '../components/Card';
import {
  UserGroupIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const { user } = getAuth();
    if (user?.role !== 'admin') {
      // Check with API in case JWT is outdated
      api.get('/users/me')
        .then(response => {
          const currentUser = response.data;
          if (currentUser.role !== 'admin') {
            navigate('/dashboard');
          } else {
            // User is admin, but JWT had old role - refresh token
            const { token } = getAuth();
            if (token) {
              setAuth(token, currentUser);
            }
            fetchStats();
          }
        })
        .catch(() => {
          navigate('/dashboard');
        });
      return;
    }

    fetchStats();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'items') {
      fetchItems();
    } else if (activeTab === 'requests') {
      fetchRequests();
    } else if (activeTab === 'feedbacks') {
      fetchFeedbacks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      setError('');
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load statistics.';
      console.error('Error fetching stats:', err);
      setError(`Failed to load statistics: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      setError('');
      const response = await api.get('/admin/users');
      setUsers(response.data.users || []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load users.';
      console.error('Error fetching users:', err);
      setError(`Failed to load users: ${errorMsg}. Status: ${err.response?.status}. Check console for details.`);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchItems = async () => {
    setLoadingItems(true);
    try {
      setError('');
      const response = await api.get('/admin/items');
      setItems(response.data.items || []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load items.';
      console.error('Error fetching items:', err);
      setError(`Failed to load items: ${errorMsg}. Status: ${err.response?.status}. Check console for details.`);
    } finally {
      setLoadingItems(false);
    }
  };

  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      setError('');
      const response = await api.get('/admin/requests');
      setRequests(response.data.requests || []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load requests.';
      console.error('Error fetching requests:', err);
      setError(`Failed to load requests: ${errorMsg}. Status: ${err.response?.status}. Check console for details.`);
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchFeedbacks = async () => {
    setLoadingFeedbacks(true);
    try {
      setError('');
      const response = await api.get('/feedback');
      setFeedbacks(response.data.feedbacks || []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load feedbacks.';
      console.error('Error fetching feedbacks:', err);
      setError(`Failed to load feedbacks: ${errorMsg}. Status: ${err.response?.status}. Check console for details.`);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }
    try {
      await api.delete(`/admin/items/${itemId}`);
      fetchItems();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete item.');
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await api.patch(`/admin/requests/${requestId}/approve`);
      fetchRequests();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve request.');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await api.patch(`/admin/requests/${requestId}/reject`);
      fetchRequests();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject request.');
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this request?')) {
      return;
    }
    try {
      await api.delete(`/admin/requests/${requestId}`);
      fetchRequests();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete request.');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading && !stats) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <QuoteBox />

      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-semibold mb-2">{error}</p>
          {error.includes('403') || error.includes('Admin access required') ? (
            <div className="text-sm mt-2">
              <p className="mb-2">⚠️ Your JWT token has an outdated role. To fix this:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Click <strong>Logout</strong> in the navbar (top right)</li>
                <li>Click <strong>Login</strong> again</li>
                <li>Sign in with your Google account</li>
                <li>Come back to this page - it should work!</li>
              </ol>
              <p className="mt-2 text-xs italic">
                Note: If you just made yourself admin, you need to logout/login to get a fresh JWT token with the admin role.
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 font-semibold ${activeTab === 'stats' ? 'text-primary border-b-2 border-primary' : 'text-gray-600'}`}
        >
          <ChartBarIcon className="w-5 h-5 inline mr-2" />
          Statistics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 font-semibold ${activeTab === 'users' ? 'text-primary border-b-2 border-primary' : 'text-gray-600'}`}
        >
          <UserGroupIcon className="w-5 h-5 inline mr-2" />
          Users
        </button>
        <button
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2 font-semibold ${activeTab === 'items' ? 'text-primary border-b-2 border-primary' : 'text-gray-600'}`}
        >
          <CubeIcon className="w-5 h-5 inline mr-2" />
          Items
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 font-semibold ${activeTab === 'requests' ? 'text-primary border-b-2 border-primary' : 'text-gray-600'}`}
        >
          <ClipboardDocumentListIcon className="w-5 h-5 inline mr-2" />
          Requests
        </button>
        <button
          onClick={() => setActiveTab('feedbacks')}
          className={`px-4 py-2 font-semibold ${activeTab === 'feedbacks' ? 'text-primary border-b-2 border-primary' : 'text-gray-600'}`}
        >
          <ChatBubbleLeftRightIcon className="w-5 h-5 inline mr-2" />
          Feedback
        </button>
      </div>

      {/* Statistics Tab */}
      {activeTab === 'stats' && stats && (
        <div>
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <p className="text-gray-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-primary">{stats.totalUsers}</p>
            </Card>
            <Card>
              <p className="text-gray-600 mb-1">Total Items</p>
              <p className="text-3xl font-bold text-primary">{stats.totalItems}</p>
            </Card>
            <Card>
              <p className="text-gray-600 mb-1">Total Requests</p>
              <p className="text-3xl font-bold text-primary">{stats.totalRequests}</p>
            </Card>
            <Card>
              <p className="text-gray-600 mb-1">Pending Requests</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingRequests}</p>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <h3 className="text-lg font-bold mb-4">Items by Category</h3>
              <div className="space-y-2">
                {stats.itemsByCategory?.map((item) => (
                  <div key={item.category} className="flex justify-between">
                    <span>{item.category}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-bold mb-4">Items by Type</h3>
              <div className="space-y-2">
                {stats.itemsByType?.map((item) => (
                  <div key={item.type} className="flex justify-between">
                    <span>{item.type}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-bold mb-4">Requests by Status</h3>
              <div className="space-y-2">
                {stats.requestsByStatus?.map((req) => (
                  <div key={req.status} className="flex justify-between">
                    <span>{req.status}</span>
                    <span className="font-semibold">{req.count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          {loadingUsers ? (
            <Card>
              <div className="text-center py-8">Loading users...</div>
            </Card>
          ) : (
            <Card>
              <h2 className="text-xl font-bold mb-4">All Users ({users.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Department</th>
                      <th className="text-left py-2">Items</th>
                      <th className="text-left py-2">Requests</th>
                      <th className="text-left py-2">Role</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="py-2">{user.name}</td>
                        <td className="py-2 text-sm text-gray-600">{user.email}</td>
                        <td className="py-2 text-sm">{user.department || '-'}</td>
                        <td className="py-2">{user._count.items}</td>
                        <td className="py-2">{user._count.requests}</td>
                        <td className="py-2">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="text-sm border rounded px-2 py-1"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {user.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Items Tab */}
      {activeTab === 'items' && (
        <div>
          {loadingItems ? (
            <Card>
              <div className="text-center py-8">Loading items...</div>
            </Card>
          ) : (
            <Card>
              <h2 className="text-xl font-bold mb-4">All Items ({items.length})</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-bold">{item.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${item.type === 'Donate' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {item.type}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${item.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                          item.status === 'CLAIMED' ? 'bg-blue-100 text-blue-800' :
                            item.status === 'IN_USE' ? 'bg-yellow-100 text-yellow-800' :
                              item.status === 'PENDING_RETURN' ? 'bg-orange-100 text-orange-800' :
                                item.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800' :
                                  item.status === 'RETURNED' ? 'bg-teal-100 text-teal-800' :
                                    'bg-gray-100 text-gray-800'
                          }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Category: {item.category} | Condition: {item.condition}</p>
                      <p className="text-sm text-gray-600">Owner: {item.owner?.name} ({item.owner?.email})</p>
                      <p className="text-sm text-gray-600">Requests: {item._count.requests}</p>
                      {item.description && (
                        <p className="text-sm text-gray-700 mt-2">{item.description}</p>
                      )}

                      {/* Item History Timeline */}
                      {item.requests && item.requests.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-semibold text-gray-700 mb-2">📅 Item History:</p>
                          <div className="space-y-1">
                            {item.requests.map((req) => (
                              <div key={req.id} className="text-xs text-gray-600">
                                <span className="font-semibold">{req.user?.name}:</span>
                                {req.approvedOn && (
                                  <span className="ml-2">✓ Approved {new Date(req.approvedOn).toLocaleDateString()}</span>
                                )}
                                {req.lentOn && (
                                  <span className="ml-2">
                                    → {item.type === 'Donate' && req.status === 'Claimed' ? 'Claimed' :
                                      item.type === 'Donate' ? 'Donated' :
                                        'Lent'} {new Date(req.lentOn).toLocaleDateString()}
                                  </span>
                                )}
                                {req.returnedOn && (
                                  <span className="ml-2">← Returned {new Date(req.returnedOn).toLocaleDateString()}</span>
                                )}
                                <span className={`ml-2 px-2 py-0.5 rounded text-xs ${req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                  req.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                    req.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-800'
                                  }`}>
                                  {req.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete Item"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div>
          {loadingRequests ? (
            <Card>
              <div className="text-center py-8">Loading requests...</div>
            </Card>
          ) : (
            <Card>
              <h2 className="text-xl font-bold mb-4">All Requests ({requests.length})</h2>
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold">{request.item.name}</h3>
                        <p className="text-sm text-gray-600">Requested by: {request.user?.name} ({request.user?.email})</p>
                        <p className="text-sm text-gray-600">Item Owner: {request.item.owner?.name} ({request.item.owner?.email})</p>
                        {request.message && (
                          <p className="text-sm text-gray-700 mt-2 italic">"{request.message}"</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Created: {new Date(request.createdAt).toLocaleString()}
                        </p>

                        {/* Request Timeline */}
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-semibold text-gray-700 mb-2">📅 Request Timeline:</p>
                          <div className="space-y-1 text-xs text-gray-600">
                            {request.approvedOn && (
                              <div>
                                <span className="font-semibold">✓ Approved:</span> {new Date(request.approvedOn).toLocaleString()}
                              </div>
                            )}
                            {request.lentOn && (
                              <div>
                                <span className="font-semibold">→ {request.item.type === 'Donate' ? 'Donated' : 'Lent'}:</span> {new Date(request.lentOn).toLocaleString()}
                              </div>
                            )}
                            {request.returnedOn && (
                              <div>
                                <span className="font-semibold">← Returned:</span> {new Date(request.returnedOn).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {request.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleApproveRequest(request.id)}
                            className="btn-primary text-sm flex items-center space-x-1"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="btn-secondary text-sm flex items-center space-x-1"
                          >
                            <XCircleIcon className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteRequest(request.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded text-sm"
                        title="Delete Request"
                      >
                        <TrashIcon className="w-4 h-4 inline mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Feedback Tab */}
      {activeTab === 'feedbacks' && (
        <div>
          {loadingFeedbacks ? (
            <Card>
              <div className="text-center py-8">Loading feedback...</div>
            </Card>
          ) : (
            <Card>
              <h2 className="text-xl font-bold mb-4">User Feedback ({feedbacks.length})</h2>
              {feedbacks.length === 0 ? (
                <p className="text-center text-gray-600 py-8">No feedback submitted yet.</p>
              ) : (
                <div className="space-y-4">
                  {feedbacks.map((feedback) => (
                    <div key={feedback.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {feedback.user?.picture ? (
                              <img
                                src={feedback.user.picture}
                                alt={feedback.user.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center">
                                <span className="text-orange-700 font-semibold">
                                  {feedback.user?.name?.charAt(0) || '?'}
                                </span>
                              </div>
                            )}
                            <div>
                              <h3 className="font-bold text-gray-900">{feedback.user?.name}</h3>
                              <p className="text-sm text-gray-600">{feedback.user?.email}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${feedback.type === 'Report' ? 'bg-red-100 text-red-800' :
                              feedback.type === 'Query' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                            }`}>
                            {feedback.type}
                          </span>
                          <p className="text-xs text-gray-500">
                            {new Date(feedback.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-gray-800 whitespace-pre-wrap">{feedback.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
