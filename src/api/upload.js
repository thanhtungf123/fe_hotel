// src/api/upload.js
import axios from './axiosInstance';
export async function uploadFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  const { data } = await axios.post('/uploads/id-card', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data; // { url }
}
