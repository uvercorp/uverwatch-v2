'use client'
import React,{ReactNode} from 'react'
import  { Provider } from 'react-redux'
import {store} from "./store"

// interface ReduxProviderProps {
//   children: ReactNode;
// }

const ReduxProvider = ({ children }) => {
  // const ReduxProvider: React.FC<ReduxProviderProps> = ({ children }) => {

// const ReduxProvider:any = ({children}) =>{
  return (
    <Provider store={store}>
     {children}
    </Provider>
  )
}

export default ReduxProvider