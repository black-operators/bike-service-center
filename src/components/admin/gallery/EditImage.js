import React, { useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';

const EditImage = () => {
  const [imageId, setImageId] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    category: 'washing'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const categories = ['washing', 'modification', 'ev-service', 'parts'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFetch = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/gallery/${imageId}`);
      setFormData({
        description: response.data.description,
        category: response.data.category
      });
      setMessage('Image loaded successfully!');
    } catch (error) {
      setMessage('Error loading image: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosInstance.put(`/gallery/${imageId}`, formData);
      setMessage('Image updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating image: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Edit Gallery Image</h1>

      {message && (
        <div className={`mb-4 p-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-8 max-w-2xl mb-8">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={imageId}
            onChange={(e) => setImageId(e.target.value)}
            placeholder="Enter Image ID"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleFetch}
            disabled={loading || !imageId}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition font-semibold"
          >
            Load
          </button>
        </div>
      </div>

      {/* always show form once an image has been loaded */}
      {imageId && !loading && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 max-w-2xl">

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              rows="4"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            {loading ? 'Updating...' : 'Update Image'}
          </button>
        </form>
      )}
    </div>
  );
};

export default EditImage;
