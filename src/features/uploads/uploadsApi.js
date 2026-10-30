import api from '@/lib/api';
import { CLOUDINARY_FOLDERS } from '@/lib/constants';

/**
 * Uploads a single media or document file to Cloudinary via admin-backend.
 *
 * @param {File} file - Browser File object
 * @param {string} folder - Destination folder on Cloudinary (default: CLOUDINARY_FOLDERS.BLOGS)
 * @returns {Promise<Object>} Uploaded file metadata { url, secure_url, public_id, ... }
 */
export const uploadFileApi = async (file, folder = CLOUDINARY_FOLDERS.BLOGS) => {
  const formData = new FormData();
  formData.append('file', file);
  if (folder) {
    formData.append('folder', folder);
  }

  const response = await api.post('/uploads', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data?.data?.file || response.data?.data || response.data;
};

/**
 * Removes an asset from Cloudinary by its public ID or full URL.
 *
 * @param {string} publicIdOrUrl - Cloudinary public_id or asset URL
 * @returns {Promise<Object>} Deletion result
 */
export const deleteFileApi = async (publicIdOrUrl) => {
  const response = await api.delete('/uploads', {
    data: {
      public_id: publicIdOrUrl,
    },
  });

  return response.data?.data || response.data;
};
