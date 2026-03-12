import { create } from 'zustand';
import axios from 'axios';

axios.defaults.withCredentials = true; 

const useUserStore = create((set) => ({
  fetchUser: async () => {
    // No need to manually get token from localStorage! 
    // Browser sends the httpOnly cookie automatically now.
    set({ loading: true });
    try {
      const res = await axios.get(`http://localhost:4000/api/user/profile`);
      set({ userRecord: res.data, loading: false });
    } catch (error) {
      set({ userRecord: null, loading: false });
    }
  },
  
  // LOGOUT update
  clearUser: async () => {
    await axios.post("http://localhost:4000/api/user/logout"); // Backend should clear cookie
    set({ userRecord: null });
  }
}));

export default useUserStore;