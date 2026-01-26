import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAuthenticated, getAuth } from '../services/auth';
import api from '../services/api';
import Card from '../components/Card';
import FeedbackBox from '../components/FeedbackBox';
import { TrashIcon, PhotoIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const WishList = () => {
    const navigate = useNavigate();
    const [itemName, setItemName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const { user } = getAuth();

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }
    }, [navigate]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!itemName.trim()) {
            setError('Please enter an item name');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('itemName', itemName);
            if (description && description.trim()) {
                formData.append('description', description);
            }
            if (image) {
                formData.append('image', image);
            }

            await api.post('/wishlist', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Reset form
            setItemName('');
            setDescription('');
            setImage(null);
            setImagePreview(null);

            // Show success message
            setShowSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create wish post');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div className="container mx-auto px-4 py-12">
                {/* Simple Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold mb-3 text-gray-900">
                        WishList
                    </h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Share what you need, and let the community help you! Post items you're looking for, and others can reach out to support you.
                    </p>
                </div>

                {/* Success Message */}
                {showSuccess ? (
                    <Card className="mb-12 max-w-2xl mx-auto border-2 border-green-200 bg-green-50">
                        <div className="text-center py-8">
                            <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-green-900 mb-3">
                                Wish Posted Successfully!
                            </h2>
                            <p className="text-green-700 mb-6">
                                Your wish has been added to the Community Wishes section on the home page.
                            </p>
                            <div className="flex justify-center space-x-4">
                                <Link
                                    to="/"
                                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all"
                                >
                                    Go to Home
                                </Link>
                                <button
                                    onClick={() => setShowSuccess(false)}
                                    className="bg-white text-green-700 px-6 py-3 rounded-lg font-semibold border-2 border-green-600 hover:bg-green-50 transition-all"
                                >
                                    Post Another Wish
                                </button>
                            </div>
                        </div>
                    </Card>
                ) : (
                    /* Post Form */
                    <Card className="mb-12 max-w-2xl mx-auto border border-gray-200">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">Wish something</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Item Name *
                                </label>
                                <input
                                    type="text"
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                    placeholder="What item do you need?"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Add more details about what you need..."
                                    rows="3"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Photo
                                </label>
                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center px-4 py-2 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <PhotoIcon className="w-5 h-5 mr-2 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-700">Choose Image</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                    {imagePreview && (
                                        <div className="relative">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-20 w-20 object-cover rounded-lg border-2 border-gray-300"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImage(null);
                                                    setImagePreview(null);
                                                }}
                                                className="absolute -top-2 -right-2 bg-gray-900 text-white rounded-full p-1 hover:bg-gray-700"
                                            >
                                                <TrashIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Posting...' : 'Post to WishList'}
                            </button>
                        </form>
                    </Card>
                )}

                {/* Info Box */}
                <Card className="max-w-2xl mx-auto border border-gray-200 bg-gray-50">
                    <div className="text-center py-6">
                        <Link to="/" className="text-primary hover:underline font-semibold text-lg">
                            View Community Wishes →
                        </Link>
                    </div>
                </Card>
            </div>

            {/* Feedback Box */}
            <FeedbackBox />
        </>
    );
};

export default WishList;
