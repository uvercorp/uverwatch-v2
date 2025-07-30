

import React, { useRef, useContext, useState } from 'react'
import { Link } from "react-router-dom";
import { motion } from "framer-motion";


import { useLocation, useHistory } from "react-router-dom";

import { toggleLoadingBar, selectLoadingBar, toggleToaster, selectToasterData, selectToasterStatus } from 'provider/features/helperSlice';
import { useSelector, useDispatch } from 'react-redux';
import LoadingIcon from 'others/icons/LoadingIcon';
import axiosInstance from "services/axios";
import { login, logout, selectUser } from 'provider/features/userSlice';
import { Audio, Blocks } from 'react-loader-spinner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stayLoggedIn, setStayLoggedIn] = useState(false);

  const handleLogin = () => {
    console.log('Login attempted with:', { email, password, stayLoggedIn });
    // Add your login logic here
  };
  const [pending, setPending] = useState(false);
  const [pendingComplete, setPendingComplete] = useState(false);
  let locat = useLocation();
  let navigate = useHistory();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const dispatch = useDispatch();
  const [formValue, setFormValue] = useState(
    {
      email: '',
      password: '',
    }
  );

  const handleChange = (event) => {
    setFormValue({
      ...formValue,
      [event.target.name]: event.target.value
    });
  }

  const signIn = async (e) => {
    // alert('am here');
    e.preventDefault();
    console.log(formValue);
    let email = formValue.email;
    let pass = formValue.password;
    if (email == "" || pass == "") {
      alert("some fields are empty");
    } else {


      try {

        //  alert('about posting')
        setPending(true);
        const response = await axiosInstance.post('login',
          JSON.stringify({ email: formValue.email, password: formValue.password }),
          {
            headers: { 'Content-Type': 'application/json' },
            //   withCredentials: true
          }
        );
        // console.log(response)
        setPendingComplete(true);
        const accessToken = response?.data?.access_token;

        localStorage.setItem('access', accessToken)

        if (response?.data?.access_token) {
          localStorage.setItem('is_login', 'yes');
          localStorage.setItem('currentUser', JSON.stringify(response?.data.user));
          let deployment_id = response?.data?.user?.deployment;

          getDeploymentData(deployment_id);
        }
        setPending(false);

        // window.location.href="/";
      } catch (err) {
        console.log(err);


        if (!err?.response) {

          console.log('no server response');
          dispatch(toggleToaster({ isOpen: true, toasterData: { type: "error", msg: "Login Failed, Check your internet and try again" } }))
        } else if (err.response?.status === 400) {

          loginErrors = err?.response.data?.email + ' ' + err?.response.data.password;
          // alert(loginErrors);
          dispatch(toggleToaster({ isOpen: true, toasterData: { type: "error", msg: loginErrors } }))
        } else if (err.response?.status === 401) {
          console.log('Un authorized');
          // alert(err.response.data['message']);
          dispatch(toggleToaster({ isOpen: true, toasterData: { type: "error", msg: err?.response.data['message'] } }))

        } else {

          dispatch(toggleToaster({ isOpen: true, toasterData: { type: "error", msg: "Login Failed, Check your internet and try again" } }))

        }
        setPending(false);
      }
    }


  }

  const getDeploymentData = async (deployment_id) => {
    // e.preventDefault();

    try {

      //  alert('about posting')
      const response = await axiosInstance.get('getDeployment/' + deployment_id,
        {
          headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${localStorage.getItem('access')}`
          },
          //   withCredentials: true
        }
      );
      console.log(response)
      // setProgress(80)
      console.log(JSON.stringify(response?.data));


      //  localStorage.setItem('refresh', accessRefreshToken)
      if (response?.data) {

        localStorage.setItem('deployment', JSON.stringify(response?.data?.deployment))
        localStorage.setItem('settings', JSON.stringify(response?.data?.settings))
        localStorage.setItem('is_login', 'yes');


        let uData = response?.data?.deployment;
        dispatch(login(uData));
        navigate.push('/deployment/map_view');
      }

      // window.location.href="/";
    } catch (err) {
      // console.log(err?.response);
      // console.log(err?.response.data);
      // console.log(err?.response.data['detail']);

      if (!err?.response) {
        //   setErrMsg('No Server Response');
        //   onCallToast('success','');
        console.log('no server response');
        dispatch(toggleToaster({ isOpen: true, toasterData: { type: "error", msg: "Login Failed, Check your internet and try again" } }))
      } else if (err.response?.status === 400) {
        //   setErrMsg('Missing Username or Password');
        //   onCallToast('success','Email or password is Incorrect');
        loginErrors = err?.response.data?.email + ' ' + err?.response.data.password;
        // alert(loginErrors);
        dispatch(toggleToaster({ isOpen: true, toasterData: { type: "error", msg: loginErrors } }))
      } else if (err.response?.status === 401) {
        console.log('Un authorized');
        //   setErrMsg('Unauthorized');
        //   onCallToast('success','Unauthorized');
        dispatch(toggleToaster({ isOpen: true, toasterData: { type: "error", msg: err?.response.data['detail'] } }))

      } else {
        // console.log('login failed');
        dispatch(toggleToaster({ isOpen: true, toasterData: { type: "error", msg: "Login Failed, Check your internet and try again" } }))
        //   setErrMsg('Login Failed');
        //   onCallToast('success','Login Failed');
      }

    }



  }


  return (
    <div className="bg-[#080808] w-full h-screen overflow-hidden p-4">
      <motion.div
        initial={{ y: 25, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.75 }}
        className="h-full"
      >
        <div className="flex flex-col items-center justify-center text-white h-full">

          {/* Logo */}
          <div className="mb-4">
            <img src="../../logo.jpg" className='h-[90px]' />
          </div>

          {/* Log In Text */}
          <h1 className="text-[1em]  mb-6 text-center my-font-family-evogria">LOG IN</h1>

          {/* Email Input */}
          {pendingComplete ? (<>
            <div className='py-6'>
              <p className="font-bold text-2xl text-green-700">Login Succesfull</p>
              <hr className="mt-6 border-b-1 border-blueGray-300" />
              <p className="text-xs mt-4 text-[#002D74]">Preparing Deployment Dashboard.....</p>
              <div className='flex items-center justify-center'>
                <Blocks
                  height="180"
                  width="180"
                  color="#002D74"
                  ariaLabel="blocks-loading"
                  wrapperStyle={{}}
                  wrapperClass="blocks-wrapper"
                  visible={true}
                />
              </div>
            </div>
          </>) : <>
            <div className="w-full max-w-md mb-4">
              <label className="block text-sm font-medium mb-2">EMAIL</label>
              <input
                type="email"
                placeholder="Enter your email"
                // value={email}
                // onChange={(e) => setEmail(e.target.value)}
                onChange={handleChange} name="email" id="email"
                className="w-full p-2 bg-[#090a0c] border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#060709]"
              />
            </div>

            {/* Password Input */}
            <div className="w-full max-w-md mb-4">
              <label className="block text-sm font-medium mb-2">PASSWORD</label>
              <input
                type="password"
                placeholder="Enter your password"
                // value={password}
                // onChange={(e) => setPassword(e.target.value)}
                onChange={handleChange} name="password" id="password"
                className="w-full p-2 bg-[#090a0c] border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#d9dadc]"
              />
            </div>

            {/* Stay Logged In Checkbox */}
            <div className="w-full max-w-md mb-4 flex items-center">
              <input
                type="checkbox"
                checked={stayLoggedIn}
                onChange={(e) => setStayLoggedIn(e.target.checked)}
                className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-600 rounded"
              />
              <label className="text-sm">Stay logged in</label>
            </div>

            {/* Save Button */}
            {/* <div> */}
            {pending ? (
              <svg width="20" height="20" fill="currentColor" className="mr-2 animate-spin" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
                <path d="M526 1394q0 53-37.5 90.5t-90.5 37.5q-52 0-90-38t-38-90q0-53 37.5-90.5t90.5-37.5 90.5 37.5 37.5 90.5zm498 206q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-704-704q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm1202 498q0 52-38 90t-90 38q-53 0-90.5-37.5t-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-964-996q0 66-47 113t-113 47-113-47-47-113 47-113 113-47 113 47 47 113zm1170 498q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-640-704q0 80-56 136t-136 56-136-56-56-136 56-136 136-56 136 56 56 136zm530 206q0 93-66 158.5t-158 65.5q-93 0-158.5-65.5t-65.5-158.5q0-92 65.5-158t158.5-66q92 0 158 66t66 158z">
                </path>
              </svg>
            ) : <> </>}
            <button
              // onClick={handleLogin}
              onClick={signIn}
              className="w-full max-w-md bg-[#123123] text-white py-2 font-semibold hover:bg-[#165b44] transition-colors mb-4"
            >
              Login
            </button>
            {/* </div> */}

            {/* Create Account Link */}
            <div className="w-full max-w-md text-center mt-4">
              <a
                href="#"
                className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
              >
                Don't have an account? <span className="underline">Create Deployment</span>
              </a>
            </div>
          </>}

        </div>
      </motion.div>
    </div>
  );
};