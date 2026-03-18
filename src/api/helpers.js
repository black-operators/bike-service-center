import axiosInstance from './axiosInstance';
import { REQUEST_CONFIG, HTTP_STATUS } from './constants';

// Retry logic for failed requests
const retryRequest = async (config, retries = REQUEST_CONFIG.RETRY_ATTEMPTS) => {
  try {
    return await axiosInstance.request(config);
  } catch (error) {
    if (retries > 0 && error.response?.status >= 500) {
      await new Promise(resolve =>
        setTimeout(resolve, REQUEST_CONFIG.RETRY_DELAY)
      );
      return retryRequest(config, retries - 1);
    }
    throw error;
  }
};

// Helper to handle API responses
export const handleAPIResponse = (response) => {
  if (response.status === HTTP_STATUS.OK || response.status === HTTP_STATUS.CREATED) {
    return response.data;
  }
  throw new Error(`Unexpected status: ${response.status}`);
};

// Helper to handle API errors
export const handleAPIError = (error) => {
  let errorMessage = 'An error occurred';

  if (error.response) {
    const { status, data } = error.response;
    errorMessage = data.message || data.error || `Error: ${status}`;
  } else if (error.request) {
    errorMessage = 'No response from server';
  } else {
    errorMessage = error.message;
  }

  console.error('API Error:', errorMessage);
  return errorMessage;
};

// Generic API call wrapper with error handling
export const apiCall = async (method, url, data = null, config = {}) => {
  try {
    const requestConfig = {
      method,
      url,
      ...config,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestConfig.data = data;
    }

    const response = await retryRequest(requestConfig);
    return handleAPIResponse(response);
  } catch (error) {
    throw new Error(handleAPIError(error));
  }
};

// GET request helper
export const getRequest = (url, config = {}) => {
  return apiCall('GET', url, null, config);
};

// POST request helper
export const postRequest = (url, data, config = {}) => {
  return apiCall('POST', url, data, config);
};

// PUT request helper
export const putRequest = (url, data, config = {}) => {
  return apiCall('PUT', url, data, config);
};

// PATCH request helper
export const patchRequest = (url, data, config = {}) => {
  return apiCall('PATCH', url, data, config);
};

// DELETE request helper
export const deleteRequest = (url, config = {}) => {
  return apiCall('DELETE', url, null, config);
};

// Upload file helper (FormData)
export const uploadFile = (url, file, fieldName = 'file') => {
  const formData = new FormData();
  formData.append(fieldName, file);

  return postRequest(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Batch requests
export const batchRequests = (requests) => {
  return Promise.all(requests);
};

/**
 * Compress an image file to ensure it stays under size limits (Vercel has 4.5MB limit)
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @param {number} options.maxSizeMB - Maximum file size in MB (default: 1)
 * @param {number} options.maxWidthOrHeight - Maximum width or height in pixels (default: 1920)
 * @param {number} options.quality - JPEG quality 0-1 (default: 0.8)
 * @returns {Promise<File>} - Compressed image file
 */
export const compressImage = (file, options = {}) => {
  const {
    maxSizeMB = 1,
    maxWidthOrHeight = 1920,
    quality = 0.8,
    minQuality = 0.45,
    maxAttempts = 8
  } = options;

  return new Promise((resolve, reject) => {
    // Skip compression for non-image files
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    // Check if file is already small enough
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size <= maxSizeBytes) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = async () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidthOrHeight) {
            height = Math.round((height * maxWidthOrHeight) / width);
            width = maxWidthOrHeight;
          }
        } else {
          if (height > maxWidthOrHeight) {
            width = Math.round((width * maxWidthOrHeight) / height);
            height = maxWidthOrHeight;
          }
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable for compression'));
          return;
        }

        let currentWidth = width;
        let currentHeight = height;
        let currentQuality = quality;
        let attempt = 0;
        let latestCompressedFile = file;

        const canvasToBlob = (targetQuality) => new Promise((resolveBlob) => {
          canvas.toBlob(resolveBlob, 'image/jpeg', targetQuality);
        });

        while (attempt < maxAttempts) {
          canvas.width = currentWidth;
          canvas.height = currentHeight;
          ctx.clearRect(0, 0, currentWidth, currentHeight);
          ctx.drawImage(img, 0, 0, currentWidth, currentHeight);

          // Convert to blob with current compression settings
          const blob = await canvasToBlob(currentQuality);

          if (!blob) {
            reject(new Error('Canvas compression failed'));
            return;
          }

          latestCompressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });

          if (latestCompressedFile.size <= maxSizeBytes) {
            console.log(`Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(latestCompressedFile.size / 1024 / 1024).toFixed(2)}MB`);
            resolve(latestCompressedFile);
            return;
          }

          attempt += 1;
          currentQuality = Math.max(minQuality, currentQuality * 0.85);

          // If still too large, also reduce dimensions progressively
          currentWidth = Math.max(640, Math.round(currentWidth * 0.9));
          currentHeight = Math.max(640, Math.round(currentHeight * 0.9));
        }

        console.warn(
          `Image still above target size after ${maxAttempts} attempts: ${(latestCompressedFile.size / 1024 / 1024).toFixed(2)}MB`
        );
        resolve(latestCompressedFile);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file for compression'));
    };
  });
};

/**
 * Compress multiple image files
 * @param {File[]} files - Array of image files to compress
 * @param {Object} options - Compression options (same as compressImage)
 * @returns {Promise<File[]>} - Array of compressed image files
 */
export const compressImages = async (files, options = {}) => {
  const compressedFiles = await Promise.all(
    files.map(file => compressImage(file, options))
  );
  return compressedFiles;
};

const getSupportedVideoMimeType = () => {
  const supportedTypes = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm'
  ];
  return supportedTypes.find((type) => window.MediaRecorder?.isTypeSupported(type)) || '';
};

/**
 * Compress a video file in the browser using canvas + MediaRecorder.
 * Audio is captured via Web Audio API so it works even with muted=true (no autoplay issues).
 * At most 2 passes are performed to avoid re-loading the blob many times.
 */
export const compressVideo = (file, options = {}) => {
  const {
    maxSizeMB = 49,
    maxWidthOrHeight = 1920,
    frameRate = 30,
    minBitrate = 350000,
    maxBitrate = 8000000,
    audioBitrate = 128000,
  } = options;

  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('video/')) {
      resolve(file);
      return;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size <= maxSizeBytes) {
      resolve(file);
      return;
    }

    if (
      typeof window === 'undefined' ||
      typeof document === 'undefined' ||
      typeof window.MediaRecorder === 'undefined'
    ) {
      reject(new Error('Video compression is not supported in this browser.'));
      return;
    }

    const mimeType = getSupportedVideoMimeType();
    if (!mimeType) {
      reject(new Error('This browser does not support video transcoding for upload.'));
      return;
    }

    const sourceUrl = URL.createObjectURL(file);

    const cleanup = () => URL.revokeObjectURL(sourceUrl);

    /**
     * Performs a single transcode pass.
     * Creates ONE video element, plays it once, records it, then resolves.
     */
    const transcodeOnce = (width, height, bitrate) =>
      new Promise((resolvePass, rejectPass) => {
        const video = document.createElement('video');
        video.preload = 'auto';
        video.src = sourceUrl;
        // Keep muted for autoplay reliability. Audio is captured separately.
        video.muted = true;
        video.volume = 0;
        video.playsInline = true;

        video.onloadedmetadata = async () => {
          // ── Canvas (video frames) ───────────────────────────────────────
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx || typeof canvas.captureStream !== 'function') {
            rejectPass(new Error('Canvas capture not supported in this browser.'));
            return;
          }

          const videoStream = canvas.captureStream(frameRate);

          // ── Audio (prefer native captureStream track, fallback to Web Audio) ──
          let audioTracks = [];
          let audioCtx = null;
          try {
            const elementCapture =
              (typeof video.captureStream === 'function' && video.captureStream()) ||
              (typeof video.mozCaptureStream === 'function' && video.mozCaptureStream()) ||
              null;

            if (elementCapture) {
              audioTracks = elementCapture.getAudioTracks();
            }

            if (!audioTracks || audioTracks.length === 0) {
              audioCtx = new (window.AudioContext || window.webkitAudioContext)();
              const source = audioCtx.createMediaElementSource(video);
              const dest = audioCtx.createMediaStreamDestination();
              // Route through gain=0 so the user doesn't hear playback
              const gain = audioCtx.createGain();
              gain.gain.value = 0;
              source.connect(dest);        // capture path
              source.connect(gain);        // silent playback path
              gain.connect(audioCtx.destination);
              audioTracks = dest.stream.getAudioTracks();
            }
          } catch (_audioErr) {
            // Audio capture failed — continue with video-only
            audioTracks = [];
          }

          const stream = new MediaStream([
            ...videoStream.getVideoTracks(),
            ...audioTracks,
          ]);

          // ── MediaRecorder ───────────────────────────────────────────────
          let recorder;
          try {
            const recorderOptions = {
              mimeType,
              videoBitsPerSecond: bitrate,
            };

            if (audioTracks.length > 0) {
              recorderOptions.audioBitsPerSecond = audioBitrate;
            }

            recorder = new MediaRecorder(stream, recorderOptions);
          } catch (err) {
            rejectPass(err);
            return;
          }

          const chunks = [];
          let rafId;

          const stopAll = () => {
            window.cancelAnimationFrame(rafId);
            stream.getTracks().forEach((t) => t.stop());
            videoStream.getTracks().forEach((t) => t.stop());
            if (audioCtx) audioCtx.close().catch(() => {});
          };

          const drawFrame = () => {
            if (!video.paused && !video.ended) {
              ctx.drawImage(video, 0, 0, width, height);
              rafId = window.requestAnimationFrame(drawFrame);
            }
          };

          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) chunks.push(e.data);
          };

          recorder.onerror = (e) => {
            stopAll();
            rejectPass(e.error || new Error('MediaRecorder error during compression.'));
          };

          recorder.onstop = () => {
            stopAll();
            const blob = new Blob(chunks, { type: mimeType });
            const outFile = new File(
              [blob],
              `${file.name.replace(/\.[^.]+$/, '') || 'gallery-video'}.webm`,
              { type: mimeType.split(';')[0], lastModified: Date.now() }
            );
            resolvePass(outFile);
          };

          video.onplay = () => drawFrame();
          video.onended = () => {
            window.cancelAnimationFrame(rafId);
            if (recorder.state !== 'inactive') recorder.stop();
          };

          recorder.start(250);

          try {
            if (audioCtx?.state === 'suspended') {
              await audioCtx.resume();
            }
            await video.play();
          } catch (playErr) {
            if (recorder.state !== 'inactive') recorder.stop();
            rejectPass(playErr);
          }
        };

        video.onerror = () => rejectPass(new Error('Failed to load video for compression.'));
      });

    // ── Metadata pass ─────────────────────────────────────────────────────
    const metaVideo = document.createElement('video');
    metaVideo.preload = 'metadata';
    metaVideo.src = sourceUrl;
    metaVideo.muted = true;

    metaVideo.onloadedmetadata = async () => {
      try {
        const duration = Math.max(metaVideo.duration || 0, 1);
        const origW = metaVideo.videoWidth || 1280;
        const origH = metaVideo.videoHeight || 720;
        const scale = Math.min(1, maxWidthOrHeight / Math.max(origW, origH));
        const w1 = Math.max(426, Math.round(origW * scale));
        const h1 = Math.max(240, Math.round(origH * scale));

        // Reserve bitrate budget for audio and keep a small safety margin for container overhead.
        const totalTargetBitrate = Math.floor((maxSizeBytes * 8) / duration * 0.95);
        const neededBitrate = Math.max(minBitrate, totalTargetBitrate - audioBitrate);
        const bitrate1 = Math.min(maxBitrate, Math.max(minBitrate, neededBitrate));

        console.log(`Video compression pass 1: ${w1}x${h1} @ ${Math.round(bitrate1 / 1000)}kbps`);
        let result = await transcodeOnce(w1, h1, bitrate1);
        console.log(`Pass 1 result: ${(result.size / 1024 / 1024).toFixed(2)}MB`);

        if (result.size > maxSizeBytes) {
          // One more pass with reduced dimensions and bitrate
          const w2 = Math.max(426, Math.round(w1 * 0.9));
          const h2 = Math.max(240, Math.round(h1 * 0.9));
          const bitrate2 = Math.max(minBitrate, Math.round(bitrate1 * 0.8));
          console.log(`Video compression pass 2: ${w2}x${h2} @ ${Math.round(bitrate2 / 1000)}kbps`);
          result = await transcodeOnce(w2, h2, bitrate2);
          console.log(`Pass 2 result: ${(result.size / 1024 / 1024).toFixed(2)}MB`);
        }

        console.log(
          `Video compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(result.size / 1024 / 1024).toFixed(2)}MB`
        );
        cleanup();
        resolve(result);
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    metaVideo.onerror = () => {
      cleanup();
      reject(new Error('Failed to read video metadata for compression.'));
    };
  });
};
