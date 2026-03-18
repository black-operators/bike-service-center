import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { compressVideo } from '../../../api/helpers';
import { Upload, X, Loader2, Video } from "lucide-react";

const AddVideo = ({ onSuccess }) => {
  // Keep gallery videos under 50MB as requested.
  const MAX_VIDEO_MB = 50;

  const [formData, setFormData] = useState({
    category: 'General Service',
    file: null
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // গ্যালারির ক্যাটাগরিগুলো
  const categories = [
    'General Service', 'Engine Work', 'Washing', 
    'Modification', 'Painting & Wrap', 'Second Hand Bike', 
    'EV Service', 'Spare Parts', 'Others'
  ];

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleCategoryChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      category: e.target.value
    }));
  };

  const handleVideoChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) {
        setMessage('Video is above 50MB. It will be compressed before upload.');
      } else {
        setMessage('');
      }
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setFormData(prev => ({ ...prev, file: selectedFile }));
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      setMessage('Please select a video file to upload.');
      return;
    }

    setLoading(true);

    try {
      let videoToUpload = formData.file;
      try {
        videoToUpload = await compressVideo(formData.file, {
          maxSizeMB: MAX_VIDEO_MB,
          maxWidthOrHeight: 1920,
          frameRate: 30,
          minBitrate: 350000,
          maxBitrate: 8000000,
          audioBitrate: 128000,
        });
      } catch (compressionError) {
        console.error('Video compression failed:', compressionError);
        throw new Error(compressionError.message || 'Video compression failed. Try again.');
      }

      if (videoToUpload.size > MAX_VIDEO_MB * 1024 * 1024) {
        throw new Error(`Compressed video is still above ${MAX_VIDEO_MB}MB upload limit. Please choose a shorter or lower-quality video.`);
      }

      const { data: signData } = await axiosInstance.get('/gallery/direct/signature');

      const cloudFormData = new FormData();
      cloudFormData.append('file', videoToUpload);
      cloudFormData.append('api_key', signData.apiKey);
      cloudFormData.append('timestamp', String(signData.timestamp));
      cloudFormData.append('signature', signData.signature);
      cloudFormData.append('folder', signData.folder || 'gallery');

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signData.cloudName}/${signData.resourceType || 'video'}/upload`,
        {
          method: 'POST',
          body: cloudFormData,
        }
      );

      const cloudinaryResult = await cloudinaryResponse.json();
      if (!cloudinaryResponse.ok) {
        throw new Error(cloudinaryResult?.error?.message || 'Cloudinary upload failed.');
      }

      await axiosInstance.post('/gallery/direct', {
        category: formData.category,
        description: '',
        image: cloudinaryResult.secure_url,
        cloudinary_id: cloudinaryResult.public_id,
      }, {
        timeout: 0,
      });

      setMessage('Video added to Gallery successfully!');
      setFormData({ category: 'General Service', file: null });
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setPreview(null);
      setTimeout(() => setMessage(''), 3000);
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      setMessage('Error adding video: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
        <Video className="text-[#003B6A]" size={32} /> Add Gallery Video
      </h1>

      {message && (
        <div className={`mb-6 p-4 rounded-lg font-bold ${message.includes('Error') || message.includes('large') || message.includes('select') ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-gray-100">
        
        <div className="mb-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleCategoryChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003B6A] focus:border-transparent transition appearance-none bg-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Video Upload Area */}
        <div className="mb-8">
          <label className="block text-sm font-bold text-gray-700 mb-2">Upload Video File</label>
          
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50 relative hover:bg-gray-100 transition">
            <input
              type="file"
              id="videoUpload"
              onChange={handleVideoChange}
              accept="video/mp4,video/webm,video/ogg,video/quicktime" // শুধুমাত্র ভিডিও সাপোর্ট করবে
              className="hidden"
            />

            {!preview ? (
              <label htmlFor="videoUpload" className="cursor-pointer flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 bg-blue-100 text-[#003B6A] rounded-full flex items-center justify-center mb-2 shadow-sm">
                  <Video size={32} />
                </div>
                <span className="font-bold text-gray-700 text-lg">Click to Browse Video</span>
                <span className="text-sm text-gray-500">Supported formats: MP4, MOV, WEBM. Videos are auto-compressed before upload.</span>
              </label>
            ) : (
              <div className="relative inline-block w-full max-w-md mx-auto">
                <video 
                  src={preview} 
                  controls 
                  className="w-full rounded-lg shadow-lg border border-gray-200 bg-black max-h-64" 
                />
                <button 
                  type="button" 
                  onClick={() => { setFormData(prev => ({ ...prev, file: null })); setPreview(null); }} 
                  className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-xl transition transform hover:scale-110"
                  title="Remove Video"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !formData.file}
          className="w-full bg-[#003B6A] hover:bg-blue-800 disabled:bg-gray-400 text-white font-bold py-3.5 px-4 rounded-xl transition-all flex justify-center items-center gap-2 shadow-lg disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 className="animate-spin" size={22} /> Compressing & Uploading...</>
          ) : (
            <><Upload size={22} /> Publish Video to Gallery</>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddVideo;