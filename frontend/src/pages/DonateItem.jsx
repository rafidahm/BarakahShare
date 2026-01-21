import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../services/auth';
import api from '../services/api';
import Card from '../components/Card';
import Modal from '../components/Modal';

const DonateItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: 'Other',
    condition: '',
    type: 'Donate',
    description: '',
    imageUrl: '',
    contact: '',
    quantity: 1,
    personalInfo: '',
    message: ''
  });
  const [tags, setTags] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const availableTags = ['#Heavy', '#Fragile', '#MustPickUp'];

  if (!isAuthenticated()) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear validation error for this field
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: ''
      });
    }
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = Math.max(1, formData.quantity + delta);
    setFormData({
      ...formData,
      quantity: newQuantity
    });
  };

  const toggleTag = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return;
      }

      setPhotoFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    }

    if (!formData.condition) {
      errors.condition = 'Please select a condition';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Build description with additional info
      let fullDescription = formData.description || '';
      if (formData.quantity > 1) {
        fullDescription = `Quantity: ${formData.quantity}\n${fullDescription}`;
      }
      if (tags.length > 0) {
        fullDescription = `${fullDescription}\n\nTags: ${tags.join(', ')}`;
      }
      if (formData.personalInfo) {
        fullDescription = `${fullDescription}\n\nPersonal Info: ${formData.personalInfo}`;
      }
      if (formData.message) {
        fullDescription = `${fullDescription}\n\nMessage: ${formData.message}`;
      }

      const submitFormData = new FormData();
      submitFormData.append('name', formData.name);
      submitFormData.append('category', formData.category);
      submitFormData.append('condition', formData.condition);
      submitFormData.append('type', 'Donate');
      submitFormData.append('description', fullDescription.trim());
      submitFormData.append('contact', formData.contact);

      if (photoFile) {
        submitFormData.append('photo', photoFile);
      } else if (formData.imageUrl) {
        submitFormData.append('imageUrl', formData.imageUrl);
      }

      await api.post('/items', submitFormData);

      setSuccess(true);
      setFormData({
        name: '',
        category: 'Other',
        condition: '',
        type: 'Donate',
        description: '',
        imageUrl: '',
        contact: '',
        quantity: 1,
        personalInfo: '',
        message: ''
      });
      setTags([]);
      setPhotoFile(null);
      setPhotoPreview(null);
      setValidationErrors({});
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">🎁 Donate Form</h1>
      <p className="text-gray-600 mb-6">Share your items with the IIUC community</p>

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
              className={`input-field ${validationErrors.name ? 'border-red-500' : ''}`}
              placeholder="e.g., Introduction to Computer Science Textbook"
            />
            {validationErrors.name && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold mb-2">Optional image upload</label>
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
                className="h-48 object-contain rounded-lg mb-2 border bg-gray-50 mx-auto block"
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
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">Optional description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="input-field"
              placeholder="Additional details about the item..."
            />
          </div>

          {/* Quantity Selector */}
          <div>
            <label className="block text-sm font-semibold mb-2">Quantity</label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => handleQuantityChange(-1)}
                className="w-10 h-10 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors font-bold"
              >
                −
              </button>
              <span className="text-xl font-semibold w-12 text-center">{formData.quantity}</span>
              <button
                type="button"
                onClick={() => handleQuantityChange(1)}
                className="w-10 h-10 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Personal Info */}
          <div>
            <label className="block text-sm font-semibold mb-2">Optional personal info</label>
            <input
              type="text"
              name="personalInfo"
              value={formData.personalInfo}
              onChange={handleChange}
              className="input-field"
              placeholder="Any additional information about yourself"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold mb-2">Optional message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="3"
              className="input-field"
              placeholder="Any special message for recipients..."
            />
          </div>

          {/* Condition Selector */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Condition <span className="text-red-500">*</span>
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className={`input-field ${validationErrors.condition ? 'border-red-500' : ''}`}
            >
              <option value="">Select condition</option>
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
            </select>
            {validationErrors.condition && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.condition}</p>
            )}
          </div>

          {/* Quick Tags */}
          <div>
            <label className="block text-sm font-semibold mb-2">Quick tags (click-to-add)</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tags.includes(tag)
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            {tags.length > 0 && (
              <p className="text-xs text-gray-600 mt-2">Selected: {tags.join(', ')}</p>
            )}
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-semibold mb-2">Contact Information <span className="text-red-500">*</span></label>
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
            {loading ? 'Submitting...' : 'Submit Donation'}
          </button>
        </form>
      </Card>

      <Modal
        isOpen={success}
        onClose={() => {
          setSuccess(false);
          navigate('/browse');
        }}
        title="Success! 🎉"
      >
        <p className="text-gray-700 mb-4">
          Your item has been successfully donated! It will now be visible to other students.
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