import { create } from 'zustand';
import axios from 'axios';

axios.defaults.withCredentials = true; 
const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
// Clean up the URL: remove trailing slash and accidental trailing /api
const cleanUrl = rawUrl.replace(/\/+$/, '').replace(/\/api$/, '');
axios.defaults.baseURL = cleanUrl;

const useUserStore = create((set) => ({
  userRecord: null,
  loading: true,
  fetchUser: async () => {
    set({ loading: true });
    try {
      const res = await axios.get('/api/user/profile');
      set({ userRecord: res.data, loading: false });
    } catch {
      set({ userRecord: null, loading: false });
    }
  },
  clearUser: async () => {
    await axios.post('/api/user/logout');
    set({ userRecord: null });
  },
  updateProfile: async (updatedData) => {
    const res = await axios.put('/api/user/profile', updatedData);
    set({ userRecord: res.data.user });
    return res.data;
  },
}));

export default useUserStore;