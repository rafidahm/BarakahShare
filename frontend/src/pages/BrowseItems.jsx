import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/Card';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getAuth } from '../services/auth';

const BrowseItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRequests, setUserRequests] = useState([]);
  const { user } = getAuth();
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    q: ''
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.type) params.append('type', filters.type);
      if (filters.q) params.append('q', filters.q);

      const response = await api.get(`/items?${params.toString()}`);
      const allItems = response.data.items || [];
      // Filter out items that are CLAIMED (have approved requests)
      const availableItems = allItems.filter(item => {
        const hasApproved = item.requests?.some(r => r.status === 'Approved');
        return !hasApproved; // Only show items without approved requests
      });
      setItems(availableItems);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.category, filters.type, filters.q]);

  const fetchUserRequests = useCallback(async () => {
    try {
      const response = await api.get('/requests/my');
      setUserRequests(response.data.requests || []);
    } catch (error) {
      console.error('Failed to fetch user requests:', error);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (user?.id) {
      fetchUserRequests();
    }
  }, [user?.id, fetchUserRequests]);


  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
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

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Browse Items</h1>

      <Card className="mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="q"
                value={filters.q}
                onChange={handleFilterChange}
                placeholder="Search items..."
                className="input-field pl-10"
              />
            </div>
          </div>
          <div>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">All Categories</option>
              <option value="Books">Books</option>
              <option value="Laptops">Laptops</option>
              <option value="Calculators">Calculators</option>
              <option value="Notes">Notes</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">All Types</option>
              <option value="Donate">Donate</option>
              <option value="Lend">Lend</option>
            </select>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-12">Loading items...</div>
      ) : items.length === 0 ? (
        <Card>
          <p className="text-center text-gray-600 py-8">No items found. Try adjusting your filters.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
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
              ) : (() => {
                // Check if current user has already requested this item
                const userRequest = userRequests.find(r => r.itemId === item.id || r.item?.id === item.id);
                const hasUserRequest = userRequest !== undefined;
                const isPending = userRequest?.status === 'Pending';
                const isApproved = userRequest?.status === 'Approved';
                
                if (hasUserRequest) {
                  return (
                    <div className={`px-4 py-2 rounded text-center text-sm font-semibold ${
                      isPending ? 'bg-yellow-100 text-yellow-800' : 
                      isApproved ? 'bg-green-100 text-green-800' : 
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {isPending ? 'PENDING' : isApproved ? 'CLAIMED' : 'Requested'}
                    </div>
                  );
                }
                
                return (
                  <Link
                    to={`/request/${item.id}`}
                    className="btn-primary w-full text-center block"
                  >
                    Request Item
                  </Link>
                );
              })()}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseItems;
