import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAuthenticated, getAuth } from '../services/auth';
import api from '../services/api';
import Card from '../components/Card';
import Modal from '../components/Modal';
import FeedbackBox from '../components/FeedbackBox';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

const MyWishlist = () => {
    const navigate = useNavigate();
    const [wishPosts, setWishPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingWishId, setDeletingWishId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [wishToDelete, setWishToDelete] = useState(null);
    const { user } = getAuth();

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }
        fetchMyWishPosts();
    }, [navigate]);

    const fetchMyWishPosts = async () => {
        try {
            const response = await api.get('/wishlist');
            // Filter to show only current user's wishes
            const myWishes = response.data.wishPosts.filter(post => post.userId === user?.id);
            setWishPosts(myWishes);
        } catch (error) {
            console.error('Failed to fetch wish posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteWish = async (wishId) => {
        setWishToDelete(wishId);
        setShowDeleteModal(true);
    };

    const confirmDeleteWish = async () => {
        if (!wishToDelete) return;

        setDeletingWishId(wishToDelete);
        setShowDeleteModal(false);

        try {
            await api.delete(`/wishlist/${wishToDelete}`);
            // Refresh the wishlist
            await fetchMyWishPosts();
        } catch (error) {
            console.error('Failed to delete wish:', error);
            alert(error.response?.data?.message || 'Failed to delete wish. Please try again.');
        } finally {
            setDeletingWishId(null);
            setWishToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setWishToDelete(null);
    };

    return (
        <>
            <div className="container mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-10">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-4xl font-bold text-gray-900">
                            My Wishlist
                        </h1>
                        <Link
                            to="/wishlist"
                            className="btn-primary flex items-center gap-2"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Add New Wish
                        </Link>
                    </div>
                    <p className="text-gray-600 text-lg">
                        Manage your wishlist items. Delete wishes once you've found what you need!
                    </p>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="text-gray-600">Loading your wishes...</div>
                    </div>
                ) : wishPosts.length === 0 ? (
                    /* Empty State */
                    <Card className="text-center py-12">
                        <div className="max-w-md mx-auto">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                No Wishes Yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                You haven't posted any wishes yet. Share what you need with the community!
                            </p>
                            <Link
                                to="/wishlist"
                                className="btn-primary inline-flex items-center gap-2"
                            >
                                <PlusIcon className="w-5 h-5" />
                                Post Your First Wish
                            </Link>
                        </div>
                    </Card>
                ) : (
                    /* Wishlist Grid */
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishPosts.map((post) => (
                            <Card key={post.id} className="hover:shadow-lg transition-shadow border border-gray-200 relative">
                                {/* Delete Button */}
                                <button
                                    onClick={() => handleDeleteWish(post.id)}
                                    disabled={deletingWishId === post.id}
                                    className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
                                    title="Delete this wish"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>

                                {/* Image */}
                                {post.imageUrl && (
                                    <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-200">
                                        <img
                                            src={`http://localhost:4000${post.imageUrl}`}
                                            alt={post.itemName}
                                            className="h-full object-contain"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Item Name */}
                                <h3 className="text-xl font-bold text-gray-900 mb-2 pr-8">
                                    {post.itemName}
                                </h3>

                                {/* Description */}
                                {post.description && (
                                    <p className="text-sm text-gray-600 mb-4">
                                        {post.description}
                                    </p>
                                )}

                                {/* Posted Date */}
                                <div className="pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-500">
                                        Posted on {new Date(post.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Info Box */}
                {wishPosts.length > 0 && (
                    <Card className="mt-8 bg-blue-50 border border-blue-200">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-blue-900 mb-1">Tip</h4>
                                <p className="text-sm text-blue-800">
                                    Once someone donates or lends the item you wished for, remember to delete your wish to keep the community wishlist clean and up-to-date!
                                </p>
                            </div>
                        </div>
                    </Card>
                )}
            </div>

            {/* Feedback Box */}
            <FeedbackBox />

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={cancelDelete}
                title="Delete Wish"
            >
                <p className="text-gray-700 mb-6">
                    Are you sure you want to delete this wish? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={cancelDelete}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmDeleteWish}
                        disabled={deletingWishId !== null}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {deletingWishId ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default MyWishlist;
