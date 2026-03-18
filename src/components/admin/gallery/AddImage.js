import React, { useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { compressImage } from '../../../api/helpers';

const AddImage = () => {
  const MAX_UPLOAD_MB = 1.8;

  const [formData, setFormData] = useState({
    description: '',
    category: 'washing',
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const categories = ['washing', 'modification', 'ev-service', 'parts', 'others'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    setFormData(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!formData.image) {
        throw new Error('Please select an image');
      }

      const data = new FormData();
      data.append('description', formData.description);
      data.append('category', formData.category);
      
      // Compress image before upload (same helper pattern as parts inventory)
      // Keep request size safe and retry compression internally if needed
      let imageToUpload = formData.image;
      try {
        imageToUpload = await compressImage(formData.image, {
          maxSizeMB: MAX_UPLOAD_MB,
          maxWidthOrHeight: 1600,
          quality: 0.75,
          minQuality: 0.4,
          maxAttempts: 10
        });
      } catch (compressionError) {
        console.error('Image compression failed:', compressionError);
        throw new Error('Image compression failed. Please try a smaller JPG/PNG image.');
      }

      if (imageToUpload.size > MAX_UPLOAD_MB * 1024 * 1024) {
        throw new Error(`Image is still too large even after multiple compression attempts. Please keep it under ${MAX_UPLOAD_MB}MB.`);
      }

      data.append('image', imageToUpload);

      // use /add endpoint so server logging/middleware remains clear
      await axiosInstance.post('/gallery/add', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 0 // allow longer for large files
      });

      setMessage('Image added successfully!');
      setFormData({ description: '', category: 'washing', image: null });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error adding image: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Add Gallery Image</h1>

      {message && (
        <div className={`mb-4 p-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 max-w-2xl">

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            rows="4"
            placeholder="Image description"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Image</label>
          <input
            type="file"
            onChange={handleImageChange}
            required
            accept="image/png, image/jpeg, image/jpg, image/webp, image/avif, image/gif, image/bmp, image/tiff"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          {loading ? 'Adding...' : 'Add Image'}
        </button>
      </form>
    </div>
  );
};

export default AddImage;
