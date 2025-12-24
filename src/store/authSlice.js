// src/store/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile: null,  // { id, full_name, role, company_id }
  loading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
      state.loading = false;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setProfile, clearProfile, setLoading } = authSlice.actions;
export default authSlice.reducer;