import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../services/auth';
import api from '../services/api';
import Card from '../components/Card';
import Modal from '../components/Modal';

const LendItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    imageUrl: '',
    contact: '',
    returnDuration: '',
    deposit: '',
    termsAccepted: false
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const categories = ['Electronics', 'Books', 'Tools', 'Clothes', 'Sports', 'Other'];
  const returnDurations = ['1 Weekend', '1 Week', '1 Month'];

  if (!isAuthenticated()) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
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
    
    if (!formData.category) {
      errors.category = 'Please select a category';
    }
    
    if (!formData.returnDuration) {
      errors.returnDuration = 'Please select return duration';
    }
    
    if (!formData.termsAccepted) {
      errors.termsAccepted = 'You must accept the terms and conditions';
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
      if (formData.returnDuration) {
        fullDescription = `Return Duration: ${formData.returnDuration}\n${fullDescription}`;
      }
      if (formData.deposit) {
        fullDescription = `${fullDescription}\n\nDeposit: ${formData.deposit}`;
      }
      fullDescription = `${fullDescription}\n\n⚠️ Please note: Before lending this item, please upload a "before" photo to document its condition.`;

      const submitFormData = new FormData();
      submitFormData.append('name', formData.name);
      submitFormData.append('category', formData.category);
      submitFormData.append('condition', 'Good'); // Default for lend items
      submitFormData.append('type', 'Lend');
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
        category: '',
        description: '',
        imageUrl: '',
        contact: '',
        returnDuration: '',
        deposit: '',
        termsAccepted: false
      });
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
      <h1 className="text-3xl font-bold mb-2">🤝 Lend Form</h1>
      <p className="text-gray-600 mb-6">Temporarily share your items with the IIUC community</p>

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
              placeholder="e.g., Scientific Calculator"
            />
            {validationErrors.name && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold mb-2">Optional image</label>
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
            <p className="text-xs text-yellow-600 mt-2 font-medium">
              📸 Reminder: Upload a "before" photo to document the item's condition before lending.
            </p>
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

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`input-field ${validationErrors.category ? 'border-red-500' : ''}`}
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {validationErrors.category && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.category}</p>
            )}
          </div>

          {/* Return Duration */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Return duration <span className="text-red-500">*</span>
            </label>
            <select
              name="returnDuration"
              value={formData.returnDuration}
              onChange={handleChange}
              className={`input-field ${validationErrors.returnDuration ? 'border-red-500' : ''}`}
            >
              <option value="">Select duration</option>
              {returnDurations.map(duration => (
                <option key={duration} value={duration}>{duration}</option>
              ))}
            </select>
            {validationErrors.returnDuration && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.returnDuration}</p>
            )}
          </div>

          {/* Deposit */}
          <div>
            <label className="block text-sm font-semibold mb-2">Optional deposit</label>
            <input
              type="text"
              name="deposit"
              value={formData.deposit}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., 500 BDT or Item as collateral"
            />
            <p className="text-xs text-gray-500 mt-1">
              Specify if you require a deposit or collateral for lending this item
            </p>
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

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
            <p className="font-semibold mb-1">⚠️ Disclaimer:</p>
            <p>By lending this item, you agree the platform is not responsible for damages. Please take a "before" photo and document the condition clearly.</p>
          </div>

          {/* Terms & Conditions */}
          <div>
            <label className="flex items-start">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className="mt-1 mr-2"
              />
              <span className="text-sm">
                I accept the terms and conditions <span className="text-red-500">*</span>
              </span>
            </label>
            {validationErrors.termsAccepted && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.termsAccepted}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !formData.termsAccepted}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Lending Item'}
          </button>
        </form>
      </Card>

      <Modal
        isOpen={success}
        onClose={() => {
          setSuccess(false);
          navigate('/browse');
        }}
        title="Success! 🤝"
      >
        <p className="text-gray-700 mb-4">
          Your item is now available for lending! Students can request to borrow it.
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

export default LendItem;
