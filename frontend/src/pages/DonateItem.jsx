import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../services/auth';
import api from '../services/api';
import QuoteBox from '../components/QuoteBox';
import Card from '../components/Card';
import Modal from '../components/Modal';

const DonateItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    condition: '',
    type: 'Donate',
    description: '',
    imageUrl: '',
    contact: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isAuthenticated()) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return;
      }

      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitFormData = new FormData();
      submitFormData.append('name', formData.name);
      submitFormData.append('category', formData.category);
      submitFormData.append('condition', formData.condition);
      submitFormData.append('type', formData.type);
      submitFormData.append('description', formData.description);
      submitFormData.append('contact', formData.contact);
      
      // If file is uploaded, use it; otherwise use imageUrl if provided
      if (photoFile) {
        submitFormData.append('photo', photoFile);
      } else if (formData.imageUrl) {
        submitFormData.append('imageUrl', formData.imageUrl);
      }

      await api.post('/items', submitFormData);
      
      setSuccess(true);
      setFormData({
        name: '',
        category: '',
        condition: '',
        type: 'Donate',
        description: '',
        imageUrl: '',
        contact: ''
      });
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <QuoteBox />
      
      <h1 className="text-3xl font-bold mb-6">Donate or Lend an Item</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2">Item Name *</label>
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

          <div>
            <label className="block text-sm font-semibold mb-2">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="input-field"
            >
              <option value="">Select category</option>
              <option value="Books">Books</option>
              <option value="Laptops">Laptops</option>
              <option value="Calculators">Calculators</option>
              <option value="Notes">Notes</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Condition *</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              required
              className="input-field"
            >
              <option value="">Select condition</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Type *</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="Donate"
                  checked={formData.type === 'Donate'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Donate (Give away permanently)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="Lend"
                  checked={formData.type === 'Lend'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Lend (Temporary)
              </label>
            </div>
          </div>

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

          <div>
            <label className="block text-sm font-semibold mb-2">Item Photo (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="input-field mb-2"
            />
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg mb-2 border"
              />
            )}
            <p className="text-xs text-gray-500 mb-2">
              Or paste an image URL:
            </p>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              disabled={!!photoFile}
              className="input-field"
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload from device (max 10MB) or paste URL. Accepted formats: JPG, PNG, GIF, WEBP
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Contact Information *</label>
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

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Item'}
          </button>
        </form>
      </Card>

      <Modal
        isOpen={success}
        onClose={() => {
          setSuccess(false);
          navigate('/browse');
        }}
        title="Success!"
      >
        <p className="text-gray-700 mb-4">
          Your item has been successfully added! It will now be visible to other students.
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            navigate('/browse');
          }}
          className="btn-primary w-full"
        >
          Browse Items
        </button>
      </Modal>
    </div>
  );
};

export default DonateItem;
