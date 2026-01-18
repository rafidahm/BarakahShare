import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, setAuth, getAuth } from '../services/auth';
import api from '../services/api';
import QuoteBox from '../components/QuoteBox';
import Card from '../components/Card';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    department: '',
    semester: '',
    whatsapp: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await api.get('/users/me');
        setUser(response.data);
        setFormData({
          department: response.data.department || '',
          semester: response.data.semester || '',
          whatsapp: response.data.whatsapp || ''
        });
        setPhotoPreview(response.data.picture || null);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

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
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
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
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const submitFormData = new FormData();
      submitFormData.append('department', formData.department);
      submitFormData.append('semester', formData.semester);
      submitFormData.append('whatsapp', formData.whatsapp);
      
      if (photoFile) {
        submitFormData.append('photo', photoFile);
      }

      const response = await api.patch('/users/me', submitFormData);
      
      const updatedUser = response.data;
      setUser(updatedUser);
      setPhotoFile(null); // Clear file after successful upload
      
      // Update localStorage with new user data (including updated picture)
      const { token } = getAuth();
      if (token) {
        setAuth(token, updatedUser);
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <QuoteBox />
      
      <h1 className="text-3xl font-bold mb-6">Update Profile</h1>

      <Card>
        <div className="flex items-center space-x-4 mb-6">
          {photoPreview ? (
            <img
              src={photoPreview}
              alt={user?.name}
              className="w-24 h-24 rounded-full border-4 border-primary object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold border-4 border-primary">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-sm text-gray-500 mt-1">
              {user?.picture?.startsWith('http') && !photoFile ? 'Profile photo from Google account' : 'Your profile photo'}
            </p>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            Profile updated successfully!
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Profile Photo (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload a photo from your device (max 5MB). Accepted formats: JPG, PNG, GIF, WEBP
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Department (Optional)</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Select Department</option>
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Electrical & Electronic Engineering">Electrical & Electronic Engineering</option>
              <option value="Business Administration">Business Administration</option>
              <option value="Economics">Economics</option>
              <option value="English Language & Literature">English Language & Literature</option>
              <option value="Islamic Studies">Islamic Studies</option>
              <option value="Arabic Language & Literature">Arabic Language & Literature</option>
              <option value="Law">Law</option>
              <option value="Shariah">Shariah</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Semester (Optional)</label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Select Semester</option>
              <option value="1st Semester">1st Semester</option>
              <option value="2nd Semester">2nd Semester</option>
              <option value="3rd Semester">3rd Semester</option>
              <option value="4th Semester">4th Semester</option>
              <option value="5th Semester">5th Semester</option>
              <option value="6th Semester">6th Semester</option>
              <option value="7th Semester">7th Semester</option>
              <option value="8th Semester">8th Semester</option>
              <option value="9th Semester">9th Semester</option>
              <option value="10th Semester">10th Semester</option>
              <option value="11th Semester">11th Semester</option>
              <option value="12th Semester">12th Semester</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">WhatsApp Number (Optional)</label>
            <input
              type="tel"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., 01712345678 or +8801712345678"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your WhatsApp number for contact (will be visible to other users when they request your items)
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </Card>
    </div>
  );
};

export default Profile;
