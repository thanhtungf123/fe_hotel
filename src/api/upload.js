// Enhanced Upload API with better error handling
import axios from './axiosInstance';

/**
 * Upload file to backend (Cloudinary)
 * @param {File} file - The file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<{url: string}>} - Uploaded file URL
 */
export async function uploadFile(file, options = {}) {
  // Validate file
  if (!file) {
    throw new Error('Không có file để upload');
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('File quá lớn. Kích thước tối đa: 10MB');
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Chỉ chấp nhận file ảnh (JPG, PNG, etc.)');
  }

  const fd = new FormData();
  fd.append('file', file);

  try {
    const { data } = await axios.post('/uploads/id-card', fd, {
      headers: { 
        'Content-Type': 'multipart/form-data' 
      },
      timeout: 30000, // 30 seconds
      ...options
    });

    if (!data || !data.url) {
      throw new Error('Server không trả về URL');
    }

    return data; // { url }
  } catch (error) {
    // Enhanced error messages
    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data?.error;

      if (status === 500) {
        throw new Error(
          message || 
          'Lỗi server khi upload. Vui lòng kiểm tra kết nối Cloudinary hoặc thử lại sau.'
        );
      } else if (status === 400) {
        throw new Error(message || 'File không hợp lệ');
      } else if (status === 413) {
        throw new Error('File quá lớn');
      } else if (status === 415) {
        throw new Error('Định dạng file không được hỗ trợ');
      } else {
        throw new Error(message || `Lỗi upload (${status})`);
      }
    } else if (error.request) {
      // Request was made but no response
      throw new Error(
        'Không thể kết nối đến server. Vui lòng kiểm tra backend đã chạy chưa.'
      );
    } else {
      // Something else happened
      throw new Error(error.message || 'Lỗi không xác định khi upload');
    }
  }
}

/**
 * Upload multiple files
 * @param {File[]} files - Array of files to upload
 * @returns {Promise<string[]>} - Array of uploaded URLs
 */
export async function uploadMultipleFiles(files) {
  if (!files || files.length === 0) {
    throw new Error('Không có file để upload');
  }

  const uploadPromises = files.map(file => uploadFile(file));
  
  try {
    const results = await Promise.all(uploadPromises);
    return results.map(r => r.url);
  } catch (error) {
    throw new Error(`Upload thất bại: ${error.message}`);
  }
}

/**
 * Upload room image to Cloudinary
 * @param {File} file - The image file to upload
 * @returns {Promise<{url: string}>} - Uploaded image URL
 */
export async function uploadRoomImage(file) {
  // Validate file
  if (!file) {
    throw new Error('Không có file để upload');
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('File quá lớn. Kích thước tối đa: 10MB');
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Chỉ chấp nhận file ảnh (JPG, PNG, etc.)');
  }

  const fd = new FormData();
  fd.append('file', file);

  try {
    const { data } = await axios.post('/uploads/room-image', fd, {
      headers: { 
        'Content-Type': 'multipart/form-data' 
      },
      timeout: 30000, // 30 seconds
    });

    if (!data || !data.url) {
      throw new Error('Server không trả về URL');
    }

    return data; // { url }
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data?.error;

      if (status === 500) {
        throw new Error(
          message || 
          'Lỗi server khi upload. Vui lòng kiểm tra kết nối Cloudinary hoặc thử lại sau.'
        );
      } else if (status === 400) {
        throw new Error(message || 'File không hợp lệ');
      } else if (status === 413) {
        throw new Error('File quá lớn');
      } else if (status === 415) {
        throw new Error('Định dạng file không được hỗ trợ');
      } else {
        throw new Error(message || `Lỗi upload (${status})`);
      }
    } else if (error.request) {
      throw new Error(
        'Không thể kết nối đến server. Vui lòng kiểm tra backend đã chạy chưa.'
      );
    } else {
      throw new Error(error.message || 'Lỗi không xác định khi upload');
    }
  }
}

/**
 * Validate image file before upload
 * @param {File} file - File to validate
 * @returns {boolean} - True if valid
 */
export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'Không có file' };
  }

  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Định dạng không hợp lệ. Chỉ chấp nhận: JPG, PNG, GIF, WEBP' 
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `File quá lớn (${(file.size / 1024 / 1024).toFixed(2)}MB). Tối đa: 10MB` 
    };
  }

  return { valid: true };
}
