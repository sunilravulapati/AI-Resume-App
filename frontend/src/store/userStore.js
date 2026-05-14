import { create } from 'zustand';
import axios from 'axios';

axios.defaults.withCredentials = true; 

const useUserStore = create((set) => ({
  userRecord: null,
  loading: true,
  fetchUser: async () => {
    set({ loading: true });
    try {
      const res = await axios.get('https://ai-resume-tauw.onrender.com/api/user/profile');
      set({ userRecord: res.data, loading: false });
    } catch {
      set({ userRecord: null, loading: false });
    }
  },
  clearUser: async () => {
    await axios.post('https://ai-resume-tauw.onrender.com/api/user/logout');
    set({ userRecord: null });
  },
}));

export default useUserStore;