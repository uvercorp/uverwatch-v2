
import { React, useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { useHistory } from "react-router-dom";
import swal from 'sweetalert';
// react-bootstrap components
import {
    Badge,
    Button,
    Card,
    Form,
    Container,
    Row,
    Col,
    Tab,
    ListGroup,
    Modal
} from "react-bootstrap";
import { useLocation, NavLink } from "react-router-dom";
import { toggleLoadingBar, selectLoadingBar, toggleToaster, selectToasterData, selectToasterStatus, selectedSingleData } from 'provider/features/helperSlice';
import { useSelector, useDispatch } from 'react-redux';
// import LoadingIcon from 'others/icons/LoadingIcon';
import axiosInstance from "services/axios";
import Spinner from 'react-bootstrap/Spinner';
import MapTest from "views/Maptest";
// import LocationSelectMap from "../settings/general/LocationSelectMap";
import { IconPicker } from "others/icons/IconPicker";
import { Icon } from "@iconify/react";
import MapPositionSelect from "views/pages/posts/MapPositionSelect";

function DetailedSingleData(props) {
    let urlLocation = useLocation();
    const searchParams = new URLSearchParams(urlLocation.search);
    // alert(searchParams);
    const selectedRecordId = searchParams.get("id") || "0";
    // alert(selectedRecordId);
    // const collectionIdNew = useSelector(selectedSingleData);
    const [post, setPost] = useState(useSelector(selectedSingleData));
    // console.warn('post:')
    // console.log(post?.record);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [flags, setFlags] = useState(0);
    const [isFlagged, setIsFlagged] = useState(false);
    const [showFlagModal, setShowFlagModal] = useState(false);
    const [flagReason, setFlagReason] = useState('');
    const [flagError, setFlagError] = useState('');
    
    const [categories, setCategories] = useState([]);
    const [accessLevel, setAccessLevel] = useState([]);
    const [impactLevel, setImpactLevel] = useState([]);
    const [priorityLevel, setPriorityLevel] = useState([]);
    const [statuses, setStatus] = useState([]);
    const dispatch = useDispatch();
    const [pending, setPending] = useState(false);
    let navigate = useHistory();
    const [deploymentId, setDeploymentId] = useState(null);
    const isValidColor = (color) => {
        const style = new Option().style;
        style.color = color;
        return style.color !== '';
    };
    const [formValue, setFormValue] = useState(
        {
            id: '',
            deployment: '',
            title: '',
            description: '',
            latitude: '',
            longitude: '',
            icon: "",
            color: "",
            tags: "",
            access_level: "",
            impact_level: "",
            priority_level: "",
            post_status: "",
            // deployment_survey: props?.record.id,
            deployment_sub_category: '',
            user_type: props?.userId == null ? 'anonymous' : 'member',
            deployment_user: props?.userId,
        }
    );

    useEffect(() => {

        if (post && post?.record) {
            setFormValue(post?.record);

        }
    }, []);

    const handleIconSelection = ({ iconClass, color }) => {

        setFormValue({
            ...formValue,
            icon: iconClass,
            color: color,
        });
        console.log(formValue)
    };

    const handleChange = (event) => {
        setFormValue({
            ...formValue,
            [event.target.name]: event.target.value
        });
    }

    const handleLocationChange = (lat, long) => {
        setFormValue({
            ...formValue,
            longitude: long,
            latitude: lat,
        });
    }


    const handleSubmit = () => {
        setFormValue({
            ...formValue,
            deployment: props?.deploymentId,
        });
        if (validateformData(formValue, setInvalidFields)) {

            addRecordInstance(formValue);


        } else {
            setTimeout(() => {
                // Your data here
                setInvalidFields("");
            }, 5000)
        }


    }

    const handleUpdate = () => {
        if (validateformData(formValue, setInvalidFields)) {
            updateRecordInstance(formValue);
        } else {
            setTimeout(() => {
                // Your data here
                setInvalidFields("");
            }, 5000)
        }

    }

    const [invalidFields, setInvalidFields] = useState('');
    function validateformData(formData, setInvalidFields) {
        const invalidFields = []; // Array to store invalid field messages

        // Check for empty required fields
        if (!formData.title) {
            invalidFields.push('Title');
        }
        if (!formData.description) {
            invalidFields.push('Description');
        }
        if (!formData.latitude) {
            invalidFields.push('Latitude');
        }
        if (!formData.longitude) {
            invalidFields.push('Longitude');
        }
        if (!formData.tags) {
            invalidFields.push('Tags');
        }

        if (categories.length > 0) {
            if (!formData.deployment_sub_category) {
                invalidFields.push('Category');
            }

        }

        if (invalidFields.length > 0) {
            const errorText = `Please fill in the following required fields: ${invalidFields.join(', ')}`;
            setInvalidFields(errorText); // Update state with comma-separated error message
            return false; // Invalid data
        }

        return true; // Valid data
    }

    const addRecordInstance = async (data) => {

        setPending(true);
        const results = await axiosInstance.post('addPostBasic',
            JSON.stringify(data),
            {
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${localStorage.getItem('access')}`
                },
                //   withCredentials: true
            }
        );
        if (results?.data?.status == "success") {

            dispatch(toggleToaster({ isOpen: true, toasterData: { type: "success", msg: "Post Added Successfully" } }))

            setPending(false);
            props.populateList(results?.data?.data);
            navigate.push('/deployment/data_view');

        }
    }

    const updateRecordInstance = async (data) => {

        setPending(true);
        const results = await axiosInstance.post('updatePostBasic',
            JSON.stringify(data),
            {
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${localStorage.getItem('access')}`
                },
                //   withCredentials: true
            }
        );
        if (results?.data?.status == "success") {

            dispatch(toggleToaster({ isOpen: true, toasterData: { type: "success", msg: "Post Updated Successfully" } }))

            setPending(false);
            props.setShow(false)
            window.location.replace('/deployment/data_view');
            // props.updateListRecord(results?.data?.data);

        }
    }


    const handleDelete = (val) => {

        swal({
            title: "Confirm Deletion",
            text: "Once Confirmed, Record Will Be Deleted",
            icon: "warning",
            buttons: ["Cancel", "Confirm"],
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {



                    deleteRecord(val);
                } else {
                    // swal("No Action Taken!");

                }
            });

    }

    const deleteRecord = async (idD) => {
        setPending(true);
        const results = await axiosInstance.post('deleteDeploymentPost',
            JSON.stringify({ id: idD }),
            {
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${localStorage.getItem('access')}`
                },
            }
        );
        if (results?.data?.status == 'success') {

            dispatch(toggleToaster({ isOpen: true, toasterData: { type: "success", msg: " Deleted Successfully" } }))

            setPending(false);
            props?.updateListRecordDelete(idD);
        } else {
            //  alert("not deleted");
        }
    }

    useEffect(() => {
        let deployment = localStorage.getItem('deployment');

        if (deployment && deployment !== undefined) {

        } else {

            window.location.replace('/pages/login');
        }
        if (deployment && deployment !== undefined) {
            getCategoryData(JSON.parse(deployment).id);
            setDeploymentId(JSON.parse(deployment).id);
        }

    }, []);

    const getCategoryData = async (deployment_id) => {
        setPending(true);
        try {
            const response = await axiosInstance.get('getPostLookups/' + deployment_id,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${localStorage.getItem('access')}`
                    },
                    //   withCredentials: true
                }
            );

            setPending(false);
            if (response?.data) {
                let dData = response?.data?.post_lookups;
                setCategories(dData?.categories);
                setImpactLevel(dData?.impact_levels);
                setAccessLevel(dData?.access_levels);
                setPriorityLevel(dData?.priority_levels);
                setStatus(dData?.statuses);
                // console.log(dData);

            }
        } catch (err) {
            setPending(false);


        }



    }

    // New comment functionality
    const handleAddComment = () => {
        if (newComment.trim()) {
            setComments([...comments, {
                id: comments.length + 1,
                text: newComment,
                timestamp: new Date().toISOString(),
                author: "Current User"
            }]);
            setNewComment('');
        }
    };

    // New flag functionality
    const handleFlagPost = () => {
        if (!isFlagged) {
            setFlags(prev => prev + 1);
            setIsFlagged(true);
            // Add API call to flag post
        }
    };

    const handleFlagClick = () => {
        setShowFlagModal(true);
    };

    const handleFlagSubmit = async () => {
        if (!flagReason.trim()) {
            setFlagError('Please provide a reason for flagging');
            return;
        }
        
        try {
            // Add your API call here
            // await axios.post('/api/flags', { 
            //     postId: post.id, 
            //     reason: flagReason 
            // });
            
            setFlags(prev => prev + 1);
            setIsFlagged(true);
            setShowFlagModal(false);
            setFlagReason('');
            setFlagError('');
        } catch (error) {
            setFlagError('Failed to submit flag. Please try again.');
        }
    };


    return (
        <>
            <div className="min-h-lvh flex items-start justify-center">
                <div className="md:min-w-[80%] md:min-h-[70%]">
                    <Card className="p-2">
                        <Card.Header>
                            <div className="flex justify-between items-center">
                                <div>
                                    <Card.Title as="h4" className="mb-0">
                                        <i

                                            className={`${post?.record?.icon || 'fas fa-question-circle'} text-${post?.record?.color || 'muted'}`}
                                            style={{
                                                color: isValidColor(post?.record?.color) ? post?.record?.color : '#6c757d',
                                                fontSize: '1.2rem',
                                                marginRight: '8px'
                                            }}
                                        /> <span className="font-semibold">
                                            {post?.record?.title || 'Loading...'}
                                        </span>
                                    </Card.Title>
                                    <small className="text-muted">
                                        Created: {post?.record?.created_at ?
                                            new Date(post.record.created_at).toLocaleDateString() : 'N/A'}
                                    </small>
                                </div>
                                <Badge bg={post?.record?.status === 'review' ? 'warning' : 'success'}>
                                    {(post?.record?.status || '').toUpperCase()}
                                </Badge>
                            </div>

                        </Card.Header>

                        <Card.Body>
                            <hr />
                            {pending && (
                                <div className="flex items-center justify-center mb-4">
                                    <Spinner animation="grow" variant="warning" />
                                </div>
                            )}

                            <motion.div
                                initial={{ y: 25, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.75 }}
                            >
                                <Row>
                                    <Col md={8}>
                                        {/* Maintain original map display */}
                                        <div className="mb-4">
                                            <h5 className="mb-3">Location</h5>
                                            <div className="min-h-[250px] border rounded">
                                                <MapPositionSelect
                                                    mapHeight="250px"
                                                    latitude={post?.record?.latitude}
                                                    longitude={post?.record?.longitude}
                                                    readOnly={true}
                                                    onLocationChange={handleLocationChange}
                                                />
                                            </div>
                                            <div className="mt-3">
                                                <Icon icon="mdi:map-marker" className="me-2" />
                                                Latitude: {post?.record?.latitude},
                                                Longitude: {post?.record?.longitude}
                                            </div>
                                        </div>
                                        <hr />
                                        <div>
                                            <label className="mb-2 mt-0 text-lg font-semibold dark:text-white">
                                                Description
                                            </label>
                                            <p className="">{post?.record?.description}</p>
                                        </div>
                                        {/* New custom fields display */}
                                        {post?.record?.post_values && (

                                            <div className="mb-4">
                                                <hr />
                                                <h5 className="mb-3">More Details</h5>
                                                <Row>
                                                    {post.record.post_values.map((field, index) => (
                                                        <Col md={6} key={index} className="mb-3">
                                                            <div className="bg-light p-3 rounded">
                                                                <strong>{field.field_name}:</strong>
                                                                <div className="text-muted">{field.field_value}</div>
                                                            </div>
                                                        </Col>
                                                    ))}
                                                </Row>
                                            </div>
                                        )}

                                        {/* New comments section */}
                                        {/* <div className="mb-4">
                                            <h5 className="mb-3">Comments ({comments.length})</h5>
                                            <div className="mb-3">
                                                <textarea
                                                    className="form-control mb-2"
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    placeholder="Add a comment..."
                                                    rows="3"
                                                />
                                                <Button
                                                    variant="primary"
                                                    onClick={handleAddComment}
                                                    disabled={pending}
                                                >
                                                    {pending ? "Posting..." : "Post Comment"}
                                                </Button>
                                            </div>
                                            <ListGroup>
                                                {comments.map(comment => (
                                                    <ListGroup.Item key={comment.id}>
                                                        <div className="d-flex justify-content-between">
                                                            <strong>{comment.author}</strong>
                                                            <small className="text-muted">
                                                                {new Date(comment.timestamp).toLocaleString()}
                                                            </small>
                                                        </div>
                                                        <p className="mb-0">{comment.text}</p>
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        </div> */}
                                    </Col>

                                    <Col md={4}>
                                        {/* Maintain original metadata display */}
                                        <div className="mb-4">
                                            <h5 className="mb-3">Post Details</h5>
                                            <div className="bg-light p-3 rounded">
                                                <div className="d-flex align-items-center mb-2">
                                                    {post?.record?.icon && (
                                                        <Icon
                                                            icon={post.record.icon}
                                                            style={{ color: post.record.color }}
                                                            className="me-2"
                                                        />
                                                    )}
                                                    <span>{post?.record?.deployment_name}</span>
                                                </div>

                                                {/* Maintain original status display */}
                                                <div className="mb-2">
                                                    <strong>Access Level:</strong> {post?.record?.access_level}
                                                </div>
                                                <div className="mb-2">
                                                    <strong>Priority Level:</strong> {post?.record?.priority_level}
                                                </div>
                                                <div className="mb-2">
                                                    <strong>Impact Level:</strong> {post?.record?.impact_level}
                                                </div>

                                                {/* New flagging system */}
                                                <div className="mt-3">
                                                    
                                                    <button 
        onClick={() => setShowFlagModal(true)}
        disabled={isFlagged}
        className={`px-4 py-2 rounded-lg transition duration-200 ${
          isFlagged 
            ? 'bg-red-500 text-white cursor-not-allowed'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        <Icon icon="mdi:flag" className="me-2" />
        {isFlagged ? 'Flagged' : 'Flag Post'} ({flags})
      </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Maintain original category information */}
                                        {post?.record?.category_name && (
                                            <div className="mb-4">
                                                <h5 className="mb-3">Category</h5>
                                                <div className="bg-light p-3 rounded">
                                                    {post.record.category_name}
                                                </div>
                                            </div>
                                        )}
                                    </Col>
                                </Row>
                            
                            </motion.div>
                            <AnimatePresence>
        {showFlagModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-[1200] flex items-start justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Modal Container */}
            <motion.div
              className="bg-white rounded-lg shadow-lg p-8 overflow-y-auto max-h-[90vh] mt-8
                        w-[90%] sm:w-[80%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]"
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {/* Modal Header */}
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Flag This Post
              </h2>

              {/* Modal Body */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for flagging
                  </label>
                  <textarea
                    value={flagReason}
                    onChange={(e) => {
                      setFlagReason(e.target.value);
                      if (flagError) setFlagError('');
                    }}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      flagError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    rows={4}
                    placeholder="Please specify the reason for flagging this post..."
                  />
                  {flagError && (
                    <p className="text-red-500 text-sm mt-1">{flagError}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowFlagModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFlagSubmit}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
                  >
                    Submit Flag
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
                        </Card.Body>
                    </Card>
                </div>
            </div>

        </>
    );
}

export default DetailedSingleData;
