import { useState } from 'react';
import api from '../services/api';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const FeedbackBox = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState('Feedback');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!message.trim()) {
            setError('Please enter a message');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await api.post('/feedback', { type, message });
            setShowSuccess(true);
            setMessage('');
            setType('Feedback');

            // Hide success message after 3 seconds
            setTimeout(() => {
                setShowSuccess(false);
                setIsOpen(false);
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit feedback');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-40">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-gray-900 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:bg-gray-800 flex items-center space-x-2"
                    title="Send Feedback"
                >
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                    <span className="text-sm">Feedback</span>
                </button>
            ) : (
                <div className="bg-white rounded-lg shadow-2xl p-6 w-96 border-2 border-gray-300">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center">
                            <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-gray-900" />
                            Send Us Your Feedback
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                        >
                            ×
                        </button>
                    </div>

                    {showSuccess ? (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center">
                            <p className="font-semibold">✓ Thank you for your feedback!</p>
                            <p className="text-sm mt-1">We appreciate your input.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Type
                                </label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                >
                                    <option value="Feedback">Feedback</option>
                                    <option value="Report">Report</option>
                                    <option value="Query">Query</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Message
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Share your thoughts, report an issue, or ask a question..."
                                    rows="4"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="flex space-x-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Sending...' : 'Submit'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
};

export default FeedbackBox;
