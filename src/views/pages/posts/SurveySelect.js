import { React, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useHistory } from "react-router-dom";
// react-bootstrap components
import {
    Card,
    Container,
} from "react-bootstrap";
import axiosInstance from "services/axios";
import Spinner from 'react-bootstrap/Spinner';

function SurveySelect(props) {
    const [surveys, setSurveys] = useState([]);
    const [deploymentId, setDeploymentId] = useState(null);
    const [userId, setUserId] = useState(null);
    const [pending, setPending] = useState(false);
    const history = useHistory();

    useEffect(() => {
        let deployment = localStorage.getItem('deployment');
        if (deployment && deployment !== undefined) {
            getSurveyData(JSON.parse(deployment).id);
            setDeploymentId(JSON.parse(deployment).id);
        } else {
            window.location.replace('/pages/login');
        }

        let user = localStorage.getItem('currentUser');
        if (user && user !== undefined) {
            setUserId(JSON.parse(user).id);
        }
    }, []);

    const getSurveyData = async (deployment_id) => {
        setPending(true);
        try {
            const response = await axiosInstance.get('getDeploymentSurvey/' + deployment_id,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${localStorage.getItem('access')}`
                    },
                }
            );
            setPending(false);
            if (response?.data) {
                let dData = response?.data?.surveys;
                dData.unshift({ id: 0, survey_name: 'Basic Post', survey_description: 'desc' })
                setSurveys(dData);
            }
        } catch (err) {
            setPending(false);
        }
    }

    const handleSurveySelect = (survey) => {
        if (survey.id == 0) {
            // Navigate to basic post
            history.push('/deployment/post/add/basic');
        } else {
            // Navigate to custom post with survey ID
            history.push(`/deployment/post/add/${survey.id}`);
        }
    };

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
                        <div className="strpied-tabled-with-hover my-black-bg shadow-lg" style={{ border: "1px solid #23201e" }}>
                            <Card.Header>
                                <Card.Title as="h4" className="font-bold px-2 my-sidebar-link border-b py-2 text-white my-font-family-courier-prime text-[1.2em]">Choose A Tasking</Card.Title>

                            </Card.Header>
                            <div className="table-full-width table-responsive px-0">
                                <div className="md:min-h-[300px] px-4 pb-4">

                                    {pending && (<div className="flex items-center justify-center mb-4">
                                        <Spinner animation="grow" variant="warning" />
                                    </div>)}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-x-4">

                                        {surveys?.map((record, index) => (
                                            <div style={{ border: "1px solid #23201e", textDecoration: "none" }} key={index} className=" bg-[#0e0b0a] hover:bg-[#261f1b]  p-3 cursor-pointer py-3 hover:underline capitalize hover:text-white my-sidebar-link" onClick={() => handleSurveySelect(record)}>{record.survey_name}</div>
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