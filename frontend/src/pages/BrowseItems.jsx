import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import QuoteBox from '../components/QuoteBox';
import Card from '../components/Card';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const BrowseItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    q: ''
  });

  useEffect(() => {
    fetchItems();
  }, [filters]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.type) params.append('type', filters.type);
      if (filters.q) params.append('q', filters.q);

      const response = await api.get(`/items?${params.toString()}`);
      setItems(response.data.items || []);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const getStatusBadge = (type) => {
    return type === 'Donate' 
      ? <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">Donate</span>
      : <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">Lend</span>;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <QuoteBox />
      
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
            <Card key={item.id}>
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                {getStatusBadge(item.type)}
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
              <Link
                to={`/request/${item.id}`}
                className="btn-primary w-full text-center block"
              >
                Request Item
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseItems;
