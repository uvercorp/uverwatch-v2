import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loadingBarOn: false,
  toasterOn: false,
  toasterData:{type:"",msg:""},
  loginChange:1,
  selectedSingleData:'',

};


export const helperSlice = createSlice({
  name: 'helper',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
   toggleLoadingBar:(state, action) => {
      state.loadingBarOn = action.payload;
    },
    toggleToaster:(state, action) => {
      const { isOpen,toasterData } = action.payload;
      state.toasterOn = isOpen;
      state.toasterData = toasterData;
    },
    toggleLoginChange:(state, action) => {
      state.loginChange = state.loginChange + action.payload;
    },
    setSelectedSingleData:(state, action) => {
      state.selectedSingleData = action.payload;
    },

  },

});

export const { toggleLoadingBar,toggleToaster,toggleLoginChange,setSelectedSingleData } = helperSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.helper.value)`
export const selectLoadingBar = (state) => state.helper.loadingBarOn;
export const selectToasterStatus = (state) => state.helper.toasterOn;
export const selectToasterData = (state) => state.helper.toasterData;
export const selectLoginChange = (state) => state.helper.loginChange;
export const selectedSingleData = (state) => state.helper.selectedSingleData;


export default helperSlice.reducer;
