import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/userSlice';
import helperReducer from '../features/helperSlice';
import globalSearchReducer from '../features/globalSearchSlice';
import  collectionReducer from '../features/collectionSlice';


export const store = configureStore({
  reducer: {
    user: userReducer,
    helper: helperReducer,
    globalSearch: globalSearchReducer,
    collection: collectionReducer
  },

});
