import {createSlice} from "@reduxjs/toolkit";
 
const initialState = {
    collections:[],
    collectionOn:true,
    collectionName:"",
    collectionId : 0,
    collectionOwner:"",
    collectionAccessLevel:0
}

const collectionSlice = createSlice({
    name:"collection",
    initialState,
    reducers:{ 
        addCollections: (state,action)=>{
          const {name,collectionId,owner,accessLevel,collectionData} = action.payload;
          state.collections = collectionData;
          state.collectionName = name;
          state.collectionOn = true;
          state.collectionId = collectionId;
          state.collectionOwner=owner;
          state.collectionAccessLevel=accessLevel;
        },
        removeCollections: (state,action)=>{
          state.collections = [];
          state.collectionOn = false;
          state.collectionName = "";
          state.collectionId = 0;
          state.collectionOwner="";
          state.collectionAccessLevel=0;

        }
    }

})
export const{addCollections,removeCollections} = collectionSlice.actions;
export default collectionSlice.reducer;