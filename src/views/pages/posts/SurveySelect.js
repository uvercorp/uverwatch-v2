import { React, useState, useEffect } from "react";
import {motion} from "framer-motion";
// react-bootstrap components
import {
    Badge,
    Button,
    Card,
    Form,
    Navbar,
    Nav,
    Container,
    Row,
    Col,
    Tab
} from "react-bootstrap";
import { useLocation, NavLink } from "react-router-dom";
import { toggleLoadingBar, selectLoadingBar, toggleToaster, selectToasterData, selectToasterStatus } from 'provider/features/helperSlice';
import { useSelector, useDispatch } from 'react-redux';
import LoadingIcon from 'others/icons/LoadingIcon';
import axiosInstance from "services/axios";
import Spinner from 'react-bootstrap/Spinner';

function SurveySelect(props) {

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
                <div className="min-h-lvh flex items-start justify-center ">

                    <div className="min-w-[95%] mt-[1%] md:min-w-[45%] md:min-h-[45%] md:mt-[10%] border-[#23201e]">
                        <div className="strpied-tabled-with-hover my-black-bg shadow-lg" style={{border:"1px solid #23201e"}}>
                            <Card.Header>
                                <Card.Title as="h4" className="font-bold px-2 my-sidebar-link border-b py-2 text-white my-font-family-courier-prime text-[1.2em]">Choose A Survey</Card.Title>

                            </Card.Header>
                            <div className="table-full-width table-responsive px-0">
                                <div className="md:min-h-[300px] px-4 pb-4">



                                    {props?.pending && (<div className="flex items-center justify-center mb-4">
                                        <Spinner animation="grow" variant="warning" />
                                    </div>)}
                                   
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-x-4">

                                        {props?.surveys?.map((record, index) => (
                                            <div style={{border:"1px solid #23201e",textDecoration:"none"}} key={index} className="rounded-lg bg-[#0e0b0a] hover:bg-[#261f1b]  p-3 cursor-pointer py-3 hover:underline capitalize hover:text-white my-sidebar-link" onClick={() => props?.toggleFormType('add', record)}>{record.survey_name}</div>
                                        ))}

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </motion.div>
            <Container fluid>

            </Container>
        </>
    );
}

export default SurveySelect;