import {createSlice} from "@reduxjs/toolkit";
 
const initialState = {
    searchValue:"",
    searchValueEmpty:true,
}

const globalSearchSlice = createSlice({
    name:"globalSearch",
    initialState,
    reducers:{ 
        toggleSearchValue: (state,action)=>{
            let searchV = action.payload;
          state.searchValue = searchV;
          if(searchV == ""){
            state.searchValueEmpty = true;
          }else{
            state.searchValueEmpty = false;
          }
        },
       
    }

})
export const{toggleSearchValue} = globalSearchSlice.actions;
export default globalSearchSlice.reducer;