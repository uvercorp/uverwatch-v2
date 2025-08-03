import { React, useState,useEffect } from "react";
import { motion } from "framer-motion";
import { Link,NavLink } from "react-router-dom";
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { useLocation, useHistory } from "react-router-dom";
import { toggleLoadingBar, selectLoadingBar, toggleToaster, selectToasterData, selectToasterStatus } from 'provider/features/helperSlice';
import { useSelector, useDispatch } from 'react-redux';
import LoadingIcon from 'others/icons/LoadingIcon';
import axiosInstance from "services/axios";
// react-bootstrap components
import {
    Badge,
    Button,
    Card,
    Navbar,
    Nav,
    Table,
    Container,
    Row,
    Col,
    Form
} from "react-bootstrap";
import DeploymentInfo from "./DeploymentInfo";
import OrganizationInfo from "./OrganizationInfo";
import AccountInfo from "./AccountInfo";
import PreviewInfo from "./PreviewInfo";

function CreateDeploymentPage(props) {
    const [pending, setPending] = useState(false);
    const [isPasswordValidated, setPasswordValidated] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [lookup, setLookup] = useState();
    let navigate = useHistory();
    const dispatch = useDispatch();


    const getDeploymentLookup=async()=>{
        const results = await axiosInstance.get('getDeploymentLookup',
        {
            headers: {
              'Content-Type': 'application/json',
              "Authorization": `Bearer ${localStorage.getItem('access')}`
          },
        }

        );

    //    console.log(results?.data);
         if(results?.data){
          setLookup(results?.data?.deployment_data);

         }
      }
      useEffect(()=>{

          getDeploymentLookup();
      }, []);

    const toggleCurrentPage = (type) => {

        if (type === 'add') {
            if (currentPage === 4) {

            } else {
                setCurrentPage(parseInt(currentPage) + 1);
            }

        } else {
            if (currentPage === 1) {

            } else {
                setCurrentPage(parseInt(currentPage) - 1);
                // alert(currentPage)

            }

        }
    }
    const [formValue, setFormValue] = useState(
        {
            url: '',
            name: '',
            deployment_category: '',
            organization_name: '',
            size_of_organization: '',
            display_name: '',
            email: '',
            password: '',
            admin_name: '',
        }
    );
    const handleChange = (event) => {
        setFormValue({
            ...formValue,
            [event.target.name]: event.target.value
        });

        // console.log(formValue);
    }

    const [invalidFields, setInvalidFields] = useState('');
    function validatedeploymentData(deploymentData, setInvalidFields) {
        const invalidFields = []; // Array to store invalid field messages

        // Check for empty required fields
        if (!deploymentData.url) {
            invalidFields.push('Deployment Url');
        }
        if (!deploymentData.name) {
            invalidFields.push('Name');
        }
        if (!deploymentData.deployment_category) {
            invalidFields.push('Catchment Area');
        }
        if (!deploymentData.size_of_organization) {
            invalidFields.push('Organization Size');
        }
        if (!deploymentData.organization_name) {
            invalidFields.push('Organization Name');
        }
        if (!deploymentData.email) {
            invalidFields.push('Email');
        }
        if (!deploymentData.display_name) {
            invalidFields.push('Display Name');
        }
        if (!deploymentData.admin_name) {
            invalidFields.push('Admin Name');
        }
        if (!deploymentData.password) {
            invalidFields.push('Password');
        }


        if (invalidFields.length > 0) {
            const errorText = `Please fill in the following required fields: ${invalidFields.join(', ')}`;
            setInvalidFields(errorText); // Update state with comma-separated error message
            // alert(invalidFields);
            return false; // Invalid data
        }

        return true; // Valid data
    }

    const handleSubmit = () => {
        if (validatedeploymentData(formValue, setInvalidFields)) {
              createDeployment(formValue);

        } else {
            setTimeout(() => {
                // Your data here
                setInvalidFields("");
            }, 8000)
        }

    };
    const createDeployment = async (data) => {

        setPending(true);
        const results = await axiosInstance.post('createDeployment',
            JSON.stringify(data),
            {
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${localStorage.getItem('access')}`
                },
                //   withCredentials: true
            }
        );
        let res = results?.data;
        if (res?.status == 'success') {
            console.log(results?.data);
            setPending(false);

            dispatch(toggleToaster({ isOpen: true, toasterData: { type: "success", msg:"Deployment Created You Can Login Now" } }));
            // setCurrentPage(1);
            navigate.push('/pages/login');
            // props.populateList(results?.data);

        }else{
            dispatch(toggleToaster({ isOpen: true, toasterData: { type: "error", msg: res?.message+" You Can Login Now" } }));
            setCurrentPage(1);
        }
    }
    return (
        <>
            <motion.div
                initial={{ y: 25, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                    duration: 0.75,
                }}
                className="nav-bar"
            >
                <main className="bg-[#080808] min-h-screen ">

                    <section >
                    <div className="flex flex-col items-center justify-center text-white pt-16">
                    <div className="mb-4">
            <img src="../../logo.jpg" className='h-[90px]' />
          </div>

          {/* Log In Text */}
          <h1 className="text-[1em]  mb-6 text-center my-font-family-evogria">CREATE DEPLOYMENT</h1>
          </div>
                        <div className="container mx-auto px-2 md:px-4">
                            <div className="flex flex-wrap">
                                <div className="lg:pt-12 pt-2 md:pt-6 w-full md:w-12/12 px-0 md:px-8 text-center">
                                    <div className="relative flex flex-col min-w-0 break-words bg-[#080808] w-full mb-4 shadow-md rounded-md">
                                        <div className="p-2 md:p-4">

                                            <div className="grid grid-cols-1 md:flex md:items-start md:justify-between p-2 gap-2">
                                                {/* #3B404C,bg-blue-500 */}
                                                <div className="md:min-h-[480px] w-full md:w-1/12 bg-[#080808] shadow-md p-2"></div>
                                                <div className="md:min-h-[500px] w-full md:w-4/12 my-gradient-bg shadow-md p-2">
                                                    <div className="p-4 grid grid-cols-4 gap-2 md:grid-cols-1">
                                                        <div className="flex items-start justify-start mb-3">

                                                            <div className={`border-1 border-white rounded-full text-white p-[4px] h-[35px] w-[35px] ${parseInt(currentPage) > 0 ? 'bg-[#1b543a]' : ''
                                                                }`} style={{ border: "1px solid white" }}>1</div>
                                                            <div className=" grid-cols-1 pl-4 hidden md:block">
                                                                <div className="text-left font-bold text-gray-400">STEP 1</div>
                                                                <div className="text-left font-bold text-gray-100 uppercase">Your Deployment</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start justify-start mb-3">

                                                            <div className={`border-1 border-white rounded-full text-white p-[4px] h-[35px] w-[35px] ${parseInt(currentPage) > 1 ? 'bg-[#1b543a]' : ''
                                                                }`} style={{ border: "1px solid white" }}>2</div>
                                                            <div className="hidden grid-cols-1 pl-4 items-start justify-start md:block">
                                                                <div className="text-left font-bold text-gray-400 uppercase">Step 2</div>
                                                                <div className="text-left font-bold text-gray-100 uppercase">Your Organisation</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start justify-start mb-3">

                                                            <div className={`border-1 border-white rounded-full text-white p-[4px] h-[35px] w-[35px] ${parseInt(currentPage) > 2 ? 'bg-[#1b543a]' : ''
                                                                }`} style={{ border: "1px solid white" }}>3</div>
                                                            <div className="hidden grid-cols-1 pl-4 md:block">
                                                                <div className="text-left font-bold text-gray-400 uppercase">Step 3</div>
                                                                <div className="text-left font-bold text-gray-100 uppercase">Your Account</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start justify-start">

                                                            <div className={`border-1 border-white rounded-full text-white p-[4px] h-[35px] w-[35px] ${parseInt(currentPage) > 3 ? 'bg-[#1b543a]' : ''
                                                                }`} style={{ border: "1px solid white" }}>4</div>
                                                            <div className="hidden grid-cols-1 pl-4 md:block">
                                                                <div className="text-left font-bold text-gray-400 uppercase">Step 4</div>
                                                                <div className="text-left font-bold text-gray-100 uppercase">Confirm</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="hidden md:flex md:items-center md:justify-center pt-20 w-full max-w-md text-center ">
              <a
                href="#"
                className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
              >
                Already have an account?
                <NavLink
          key=''
          to='login'>
            <span className="underline text-white">Login</span>
            </NavLink>
              </a>
            </div>
                                                </div>
                                                <div className="md:min-h-[150px] w-full md:w-7/12 my-gradient-bg md:pl-5 md:p-3">
                                                    {parseInt(currentPage) == 1 &&
                                                        <DeploymentInfo formValue={formValue} setFormValue={setFormValue} handleChange={handleChange} />
                                                    }
                                                    {parseInt(currentPage) == 2 &&
                                                        <OrganizationInfo formValue={formValue} setFormValue={setFormValue} handleChange={handleChange} lookup={lookup}/>
                                                    }
                                                    {parseInt(currentPage) == 3 &&
                                                        <AccountInfo formValue={formValue} setFormValue={setFormValue} handleChange={handleChange} isPasswordValidated={isPasswordValidated} setPasswordValidated={setPasswordValidated} />
                                                    }
                                                    {parseInt(currentPage) == 4 &&
                                                        <PreviewInfo formValue={formValue} lookup={lookup}/>
                                                    }
                                                    <div className="block">
                                                    {invalidFields !== "" && (<p className='bg-red-700 shadow text-left p-3 rounded-xl text-white'>{invalidFields}</p>)}
                                                    </div>
                                                    <div className='flex items-center justify-between mt-4'>



                                                        {parseInt(currentPage) > 1 &&

                                                            <a onClick={() => toggleCurrentPage('substract')}
                                                                className="my-btn-green btn text-white  text-xs font-bold uppercase px-4 py-2 shadow hover:shadow-md outline-none focus:outline-none lg:mr-1 lg:mb-0 ml-3 mb-3 ease-linear transition-all duration-150"
                                                                style={{backgroundColor:'#1b543a'}}
                                                            >
                                                                <i className="fas fa-arrow-alt-circle-left"></i> Back
                                                            </a>
                                                        }
                                                        {parseInt(currentPage) == 1 &&
                                                            <a></a>
                                                        }
                                                        {parseInt(currentPage) < 4 && <>

                                                        {(parseInt(currentPage) == 3 && isPasswordValidated) ?
                                                            <a onClick={() => toggleCurrentPage('add')}
                                                                className="my-btn-green btn text-white  text-xs font-bold uppercase px-4 py-2 shadow hover:shadow-md outline-none focus:outline-none lg:mr-1 lg:mb-0 ml-3 mb-3 ease-linear transition-all duration-150"
                                                                style={{backgroundColor:'#1b543a'}}
                                                            >
                                                                Next  <i className="fas fa-arrow-alt-circle-right"></i>
                                                            </a>
                                                            :""}


                                                        {parseInt(currentPage) !== 3 && (
                                                            <a onClick={() => toggleCurrentPage('add')}
                                                                className="my-btn-green  btn text-white  text-xs font-bold uppercase px-4 py-2 shadow hover:shadow-md outline-none focus:outline-none lg:mr-1 lg:mb-0 ml-3 mb-3 ease-linear transition-all duration-150"
                                                                style={{backgroundColor:'#1b543a'}}
                                                            >
                                                                Next  <i className="fas fa-arrow-alt-circle-right"></i>
                                                            </a>)
                                                            }

                                                        </>}
                                                        {parseInt(currentPage) == 4 &&
                                                            <>


                                                                {pending ? <button className="btn bg-blue-500 text-white hover:bg-blue-700" disabled={true}  style={{backgroundColor:'#1b543a'}}><LoadingIcon /> processing..</button> : <>
                                                                    {/* <a onClick={handleSubmit} className="btn bg-blue-500 text-black hover:bg-blue-700">Submit </a>  */}
                                                                    <button
                                                                        //  onClick={() => toggleCurrentPage('add')}
                                                                        onClick={handleSubmit}
                                                                        // to="/deployment/map_view"
                                                                        className="bg-green-700 btn text-white  text-xs font-bold uppercase px-4 py-2 shadow hover:shadow-md outline-none focus:outline-none lg:mr-1 lg:mb-0 ml-3 mb-3 ease-linear transition-all duration-150"
                                                                        style={{backgroundColor:'#1b543a'}}
                                                                    >
                                                                        Submit  <i className="fas fa-arrow-alt-circle-ok"></i>
                                                                    </button>
                                                                    {/* <a onClick={handleUpdate} className="btn bg-green-500 text-white hover:bg-green-700">Update </a> */}

                                                                </>
                                                                }

                                                                {/* </div> */}
                                                            </>
                                                        }
                                                    </div>
                                                </div>

                                            </div>
                                        </div>

                                    </div>
                                </div>


                            </div>


                        </div>
                    </section>



                </main>
            </motion.div>
        </>
    );
}

export default CreateDeploymentPage;
