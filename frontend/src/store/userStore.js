import { create } from 'zustand';
import axios from 'axios';

axios.defaults.withCredentials = true; 
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

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
}));

export default useUserStore;