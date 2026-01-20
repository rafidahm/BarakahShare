import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { isAuthenticated, getAuth } from '../services/auth';
import api from '../services/api';
import Card from '../components/Card';
import Modal from '../components/Modal';

const EditItem = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = getAuth();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: 'Other',
        condition: '',
        description: '',
        contact: ''
    });

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }

        fetchItem();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, navigate]);

    const fetchItem = async () => {
        try {
            const response = await api.get(`/items/${id}`);
            const itemData = response.data;

            // Check if user is owner
            if (!user || itemData.ownerId !== user.id) {
                setError('You can only edit your own items.');
                setLoading(false);
                return;
            }

            // Check if item status is AVAILABLE
            if (itemData.status !== 'AVAILABLE') {
                setError(`Cannot edit item. This item has status: ${itemData.status}. You can only edit items with status AVAILABLE.`);
                setLoading(false);
                return;
            }

            setItem(itemData);
            setFormData({
                name: itemData.name || '',
                category: itemData.category || 'Other',
                condition: itemData.condition || '',
                description: itemData.description || '',
                contact: itemData.contact || ''
            });
        } catch (error) {
            console.error('Failed to fetch item:', error);
            setError(error.response?.data?.message || 'Item not found.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await api.patch(`/items/${id}`, formData);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update item. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    if (error && !item) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-2xl">
                <Card>
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                    <Link to="/my-contributions" className="btn-primary inline-block">
                        Back to My Contributions
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <h1 className="text-3xl font-bold mb-2">Edit Item</h1>
            <p className="text-gray-600 mb-6">Update your item details</p>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Product Name */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Product name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="input-field"
                            placeholder="e.g., Introduction to Computer Science Textbook"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className="input-field"
                        >
                            <option value="Books">Books</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Clothing">Clothing</option>
                            <option value="Furniture">Furniture</option>
                            <option value="Sports">Sports</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Condition */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Condition <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="condition"
                            value={formData.condition}
                            onChange={handleChange}
                            required
                            className="input-field"
                        >
                            <option value="">Select condition</option>
                            <option value="New">New</option>
                            <option value="Like New">Like New</option>
                            <option value="Good">Good</option>
                            <option value="Fair">Fair</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className="input-field"
                            placeholder="Additional details about the item..."
                        />
                    </div>

                    {/* Contact */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Contact Information <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="contact"
                            value={formData.contact}
                            onChange={handleChange}
                            required
                            className="input-field"
                            placeholder="Phone number or email for contact"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary flex-1 disabled:opacity-50"
                        >
                            {submitting ? 'Updating...' : 'Update Item'}
                        </button>
                        <Link
                            to="/my-contributions"
                            className="btn-secondary flex-1 text-center"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </Card>

            <div className="text-center mt-6">
                <Link
                    to="/my-contributions"
                    className="text-primary hover:underline inline-block"
                >
                    Back to My Contributions
                </Link>
            </div>

            <Modal
                isOpen={success}
                onClose={() => {
                    setSuccess(false);
                    navigate('/my-contributions');
                }}
                title="Success! 🎉"
            >
                <p className="text-gray-700 mb-4">
                    Your item has been successfully updated!
                </p>
                <button
                    onClick={() => {
                        setSuccess(false);
                        navigate('/my-contributions');
                    }}
                    className="btn-primary w-full"
                >
                    Back to My Contributions
                </button>
            </Modal>
        </div>
    );
};

export default EditItem;
