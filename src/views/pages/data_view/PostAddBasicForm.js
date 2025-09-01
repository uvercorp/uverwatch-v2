import { React, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useHistory } from "react-router-dom";
import swal from "sweetalert";
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
} from "react-bootstrap";
import { useLocation, NavLink } from "react-router-dom";
import {
	toggleLoadingBar,
	selectLoadingBar,
	toggleToaster,
	selectToasterData,
	selectToasterStatus,
} from "provider/features/helperSlice";
import { useSelector, useDispatch } from "react-redux";
import LoadingIcon from "others/icons/LoadingIcon";
import axiosInstance from "services/axios";
import Spinner from "react-bootstrap/Spinner";
import MapTest from "views/Maptest";
import MapPositionSelect from "../posts/MapPositionSelect";
import TagInput from "../posts/TagInput";
import { IconPicker } from "others/icons/IconPicker";
import useGeoLocation from "hooks/useGeoLocation";

function PostAddBasicForm(props) {
	const [surveys, setPosts] = useState([]);
	const [categories, setCategories] = useState([]);
	const [accessLevel, setAccessLevel] = useState([]);
	const [impactLevel, setImpactLevel] = useState([]);
	const [priorityLevel, setPriorityLevel] = useState([]);
	const [statuses, setStatus] = useState([]);
	const [tagsList, setTagsList] = useState([]);
	const dispatch = useDispatch();
	const [pending, setPending] = useState(false);
	const [setupComplete, setSetupComplete] = useState(false);
	let navigate = useHistory();
	const [deploymentId, setDeploymentId] = useState(null);
	const location = useGeoLocation();

	const [formValue, setFormValue] = useState({
		id: "",
		deployment: props?.deploymentId,
		title: "",
		description: "",
		latitude: location.latitude,
		longitude: location.longitude,
		icon: "",
		color: "",
		tags: "",
		assessment: "",
		access_level: "",
		impact_level: "",
		priority_level: "",
		post_status: "",
		full_address: "",
		formatted_address: "",
		deployment_survey: props?.record.id,
		deployment_sub_category: "",
		user_type: props?.userId == null ? "anonymous" : "member",
		deployment_user: props?.userId,
	});

	useEffect(() => {
		if (props.record && props.formType == "update") {
			setFormValue(props.record);
			// alert(props.record.tags);
			// setFormValue({
			//   ...formValue,
			//   tags: props.record.tags
			// });
		} else {
			setFormValue({
				id: "",
				deployment: props?.deploymentId,
				title: "",
				latitude: location.latitude,
				longitude: location.longitude,
				icon: "",
				color: "",
				tags: "",
				assessment: "",
				access_level: "",
				impact_level: "",
				priority_level: "",
				post_status: "",
				full_address: "",
				formatted_address: "",
				deployment_survey: props?.record.id,
				deployment_sub_category: "",
				user_type: props?.userId == null ? "anonymous" : "member",
				deployment_user: props?.userId,
			});
		}
	}, [props.record, props.formType, props.deploymentId, props.userId]);

	const handleIconSelection = ({ iconClass, color }) => {
		setFormValue({
			...formValue,
			icon: iconClass,
			color: color,
		});
		console.log(formValue);
	};

	const handleChange = (event) => {
		setFormValue({
			...formValue,
			[event.target.name]: event.target.value,
		});
	};

	const handleLocationChange = (lat, long, fullAddress, formattedAddress) => {
		setFormValue({
			...formValue,
			longitude: long,
			latitude: lat,
			full_address: fullAddress,
			formatted_address: formattedAddress,
		});
	};

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
			}, 5000);
		}
	};

	const handleUpdate = () => {
		if (validateformData(formValue, setInvalidFields)) {
			updateRecordInstance(formValue);
		} else {
			setTimeout(() => {
				// Your data here
				setInvalidFields("");
			}, 5000);
		}
	};

	const [invalidFields, setInvalidFields] = useState("");
	function validateformData(formData, setInvalidFields) {
		const invalidFields = []; // Array to store invalid field messages

		// Check for empty required fields
		if (!formData.title) {
			invalidFields.push("Title");
		}
		if (!formData.description) {
			invalidFields.push("Description");
		}
		if (!formData.latitude) {
			invalidFields.push("Latitude");
		}
		if (!formData.longitude) {
			invalidFields.push("Longitude");
		}
		if (!formData.tags) {
			invalidFields.push("Tags");
		}

		if (!formData.access_level) {
			invalidFields.push("Access Level");
		}
		if (props.record?.priority_enabled && !formData.priority_level) {
			invalidFields.push("Priority Level");
		}
		if (props.record?.impact_enabled && !formData.impact_level) {
			invalidFields.push("Impact Level");
		}

		if (!formData.post_status) {
			invalidFields.push("Status");
		}

		if (categories.length > 0) {
			if (!formData.deployment_sub_category) {
				invalidFields.push("Category");
			}
		}

		if (invalidFields.length > 0) {
			const errorText = `Please fill in the following required fields: ${invalidFields.join(
				", "
			)}`;
			setInvalidFields(errorText); // Update state with comma-separated error message
			return false; // Invalid data
		}

		return true; // Valid data
	}

	const addRecordInstance = async (data) => {
		setPending(true);
		const results = await axiosInstance.post(
			"addPostBasic",
			JSON.stringify(data),
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("access")}`,
				},
				//   withCredentials: true
			}
		);
		if (results?.data?.status == "success") {
			dispatch(
				toggleToaster({
					isOpen: true,
					toasterData: { type: "success", msg: "Post Added Successfully" },
				})
			);

			setPending(false);
			props.populateList(results?.data?.data);
			navigate.push("/deployment/data_view");
		}
	};

	const updateRecordInstance = async (data) => {
		setPending(true);
		const results = await axiosInstance.post(
			"updatePostBasic",
			JSON.stringify(data),
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("access")}`,
				},
				//   withCredentials: true
			}
		);
		if (results?.data?.status == "success") {
			dispatch(
				toggleToaster({
					isOpen: true,
					toasterData: { type: "success", msg: "Post Updated Successfully" },
				})
			);

			setPending(false);
			props.setShow(false);
			window.location.replace("/deployment/data_view");
			// props.updateListRecord(results?.data?.data);
		}
	};

	const handleDelete = (val) => {
		swal({
			title: "Confirm Deletion",
			text: "Once Confirmed, Record Will Be Deleted",
			icon: "warning",
			buttons: ["Cancel", "Confirm"],
			dangerMode: true,
		}).then((willDelete) => {
			if (willDelete) {
				deleteRecord(val);
			} else {
				// swal("No Action Taken!");
			}
		});
	};

	const deleteRecord = async (idD) => {
		setPending(true);
		const results = await axiosInstance.post(
			"deleteDeploymentPost",
			JSON.stringify({ id: idD }),
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("access")}`,
				},
			}
		);
		if (results?.data?.status == "success") {
			dispatch(
				toggleToaster({
					isOpen: true,
					toasterData: { type: "success", msg: " Deleted Successfully" },
				})
			);

			setPending(false);
			props?.updateListRecordDelete(idD);
		} else {
			//  alert("not deleted");
		}
	};

	useEffect(() => {
		let deployment = localStorage.getItem("deployment");

		if (deployment && deployment !== undefined) {
		} else {
			window.location.replace("/pages/login");
		}
		if (deployment && deployment !== undefined) {
			getLookupData(JSON.parse(deployment).id);
			setDeploymentId(JSON.parse(deployment).id);
		}
	}, []);

	const getLookupData = async (deployment_id) => {
		setPending(true);
		try {
			const response = await axiosInstance.get(
				"getPostLookups/" + deployment_id,
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem("access")}`,
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
				setTagsList(dData?.tags || []); // Add this line
				// console.log(dData);
				if (
					dData?.categories?.length == 0 ||
					(props.record?.priority_enabled && dData?.priority_levels?.length == 0) ||
					dData?.access_levels?.length == 0 ||
					(props.record?.impact_enabled && dData?.impact_levels?.length == 0) ||
					dData?.tags?.length == 0 ||
					dData?.statuses?.length == 0
				) {
					// alert('not completed')
					setSetupComplete(false);
				} else {
					setSetupComplete(true);
				}
			}
		} catch (err) {
			setPending(false);
		}
	};


	useEffect(() => {
		if (!formValue.latitude && !formValue.longitude) {
			if (location.latitude && location.longitude) {
				setFormValue({
					...formValue,
					latitude: location.latitude,
					longitude: location.longitude,
				});
			}
		}
	}, [location]);

	return (
		<>
			<div className="min-h-lvh flex items-start justify-center">
				<div
					className={
						props?.formType == "add"
							? "md:min-w-[80%] md:min-h-[80%]"
							: "md:min-w-[100%]"
					}
				>
					<Card className="my-gradient-bg">
						<Card.Header>
							<Card.Title as="h4">
								<div className="flex items-start justify-between my-sidebar-link">
									<span className="my-font-family-overpass-mono font-semibold text-[#dbdbde]">
										Post :{" "}
										<span className="text-[0.6em] capitalize">
											{" "}
											{props?.formType}{" "}
										</span>{" "}
										<span className="text-[0.6em] capitalize font-bold">
											{props?.record.survey_name}
										</span>
									</span>
									{/* <Button variant="default" onClick={() => props?.setCurrentPage('list')}>Cancel</Button> */}
								</div>
							</Card.Title>
						</Card.Header>
						<div className="px-4">
							<hr className="border-[#2e2c2b] mt-0 mb-2 pt-0 " />
						</div>
						<Card.Body>
							{pending && (
								<div className="flex items-center justify-center mb-4">
									<Spinner animation="grow" variant="warning" />
								</div>
							)}
							<motion.div
								initial={{ y: 25, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{
									duration: 0.75,
								}}
								className="nav-bar"
							>
								<div className="md:min-h-[450px] relative md:px-10">
									<div>
										<Row>
											<Col className="pr-1" md="12">
												<label className="my-label">
													Location :{" "}
													<span className="itali">
														{formValue?.full_address}
													</span>
												</label>
												<div className="min-h-[250px] text-center bg-blue-100 border border-1 mr-2">
													<MapPositionSelect
														mapHeight={"250px"}
														onLocationChange={handleLocationChange}
														latitude={formValue?.latitude}
														longitude={formValue?.longitude}
													/>
													{/* <MapPositionSelect mapHeight={'250px'} onLocationChange={handleLocationChange} latitude="5.884479389490895" longitude="-0.18007437721544675" /> */}
												</div>
											</Col>
										</Row>
										<div className="grid gap-6 mb-6 md:grid-cols-2 pt-4">
											<div>
												<label
													htmlFor="latitude"
													className="block mb-2 text-sm font-medium my-label"
												>
													Latitude
												</label>
												<input
													type="text"
													id="latitude"
													name="latitude"
													onChange={handleChange}
													disabled
													value={formValue.latitude}
													className="my-input block p-2.5 w-full "
													placeholder=""
													required
												/>
											</div>
											<div>
												<label
													htmlFor="longitude"
													className="block mb-2 text-sm font-medium my-label"
												>
													Longitude
												</label>
												<input
													type="text"
													id="longitude"
													name="longitude"
													onChange={handleChange}
													disabled
													value={formValue.longitude}
													className="my-input block p-2.5 w-full "
													placeholder=""
													required
												/>
											</div>
										</div>
										<div className="grid gap-6  md:grid-cols-2 ">
											<div className="mb-6">
												<label
													htmlFor="survey_description"
													className="block mb-2 text-sm font-medium my-label"
												>
													Pick An Icon And Color
												</label>
												<IconPicker
													onSelection={handleIconSelection}
													initialIconClass={formValue.icon}
													initialColor={formValue.color}
												/>
											</div>
											<div className="mb-6">
												<label
													htmlFor="title"
													className="block mb-2 text-sm font-medium my-label"
												>
													Title
												</label>
												<input
													type="text"
													onChange={handleChange}
													name="title"
													value={formValue.title}
													id="title"
													className=" my-input block p-2.5 w-full "
													placeholder="Title of post"
													required
												/>
											</div>
										</div>

										<div className="mb-6">
											<label
												htmlFor="description"
												className="block mb-2 text-sm font-medium my-label"
											>
												Describe the post
											</label>
											<textarea
												id="description"
												onChange={handleChange}
												name="description"
												value={formValue.description}
												rows="3"
												class="my-input block p-2.5 w-full "
												placeholder="Post Description..."
											></textarea>
										</div>
										<div className="grid gap-6 md:grid-cols-2 ">
											<div className="mb-6">
												<label
													htmlFor="deployment_sub_category"
													className="block mb-2 text-sm font-medium my-label"
												>
													Category
												</label>

												<select
													style={{ width: "100%" }}
													className="my-input  min-h-[2.5em] "
													value={formValue.deployment_sub_category}
													required
													onChange={handleChange}
													name="deployment_sub_category"
												>
													<option>Select Category</option>
													{categories?.map((record, index) => (
														<option key={index} value={record?.id}>
															{record?.name}
														</option>
													))}
												</select>
											</div>
											{/* <div className="mb-6">
                        <label
                          htmlFor="tags"
                          className="block mb-2 text-sm font-medium my-label"
                        >
                          Tags (comma seperated tags)
                        </label>
                        <input
                          type="text"
                          onChange={handleChange}
                          name="tags"
                          value={formValue.tags}
                          id="title"
                          className="my-input block p-2.5 w-full "
                          placeholder="Tags eg: tag1,tag2,tag3"
                          required
                        />
                      </div> */}
											<div className="mb-6  max-w-[436px]">
												<label
													htmlFor="tags"
													className="block mb-2 text-sm font-medium my-label"
												>
													Tags (comma seperated tags) {formValue.tags}
												</label>

												<TagInput
													initialTags={formValue?.tags}
													onTagsChange={(tags) =>
														setFormValue({ ...formValue, tags })
													}
													allTags={tagsList}
												/>
											</div>
											<div className="mb-6">
												<label
													htmlFor="assessment"
													className="block mb-2 text-sm font-medium my-label"
												>
													Assessment (text to help with understanding )
												</label>
												<input
													type="text"
													onChange={handleChange}
													name="assessment"
													value={formValue.assessment}
													id="title"
													className="my-input block p-2.5 w-full "
													placeholder="Write Assessment"
													required
												/>
											</div>
										</div>
										<div className="grid gap-6 md:grid-cols-2 ">
											<div className="mb-6">
												<label
													htmlFor="access_level"
													className="block mb-2 text-sm font-medium my-label"
												>
													Access Level
												</label>

												<select
													style={{ width: "100%" }}
													className="my-input  min-h-[2.5em] "
													value={formValue.access_level}
													required
													onChange={handleChange}
													name="access_level"
												>
													<option>Select Access Level</option>
													{accessLevel?.map((record, index) => (
														<option key={index} value={record?.level}>
															{record?.name} level[{record?.level}]{" "}
														</option>
													))}
												</select>
											</div>
											{props.record?.impact_enabled && (
												<div className="mb-6">
													<label
														htmlFor="impact_level"
														className="block mb-2 text-sm font-medium my-label"
													>
														Impact Level
													</label>

													<select
														style={{ width: "100%" }}
														className="my-input  min-h-[2.5em] "
														value={formValue.impact_level}
														required
														onChange={handleChange}
														name="impact_level"
													>
														<option>Select Impact Level</option>
														{impactLevel?.map((record, index) => (
															<option key={index} value={record?.level}>
																{record?.name} level[{record?.level}]{" "}
															</option>
														))}
													</select>
												</div>
											)}
											{props.record?.priority_enabled && (
												<div className="mb-6">
													<label
														htmlFor="priority_level"
														className="block mb-2 text-sm font-medium my-label"
													>
														Priority Level
													</label>

													<select
														style={{ width: "100%" }}
														className="my-input  min-h-[2.5em] "
														value={formValue.priority_level}
														required
														onChange={handleChange}
														name="priority_level"
													>
														<option>Select Priority Level</option>
														{priorityLevel?.map((record, index) => (
															<option key={index} value={record?.level}>
																{record?.name} level[{record?.level}]
															</option>
														))}
													</select>
												</div>
											)}
											<div className="mb-6">
												<label
													htmlFor="status"
													className="block mb-2 text-sm font-medium my-label"
												>
													Post Status
												</label>

												<select
													style={{ width: "100%" }}
													className="my-input  min-h-[2.5em] "
													value={formValue.post_status}
													required
													onChange={handleChange}
													name="post_status"
												>
													<option>Select Status Level</option>
													{statuses?.map((record, index) => (
														<option key={index} value={record?.id}>
															{record?.name}{" "}
														</option>
													))}
												</select>
											</div>
										</div>
										<div>
											{invalidFields !== "" && (
												<p className="bg-red-700 shadow text-left p-2 text-white">
													{invalidFields}
												</p>
											)}
										</div>
										{/* <div className="absolute bottom-0 left-0 right-0 p-2 "> */}
										{!setupComplete ? (
											<>
												<div className="md:flex items-center justify-center">
													<div className="bg-white  font-semibold text-[1.2em] text-red-500">
														Please You need to Finish Setup at Settings Before
														You Can Add A post; Especialy Category, Access
														Level, Impact Level, Priority Level{" "}
													</div>
												</div>
											</>
										) : (
											<>
												<div className=" p-2 ">
													<div className="flex items-start justify-between">
														<span>.</span>
														<div className="flex items-end gap-2">
															{props.formType == "add" && (
																<>
																	<button
																		type="submit"
																		onClick={() =>
																			props?.setCurrentPage("list")
																		}
																		className="text-black bg-gray-200 hover:bg-gray-100  font-medium  text-sm w-full sm:w-auto px-5 py-2.5 text-center "
																	>
																		Cancel
																	</button>
																	<button
																		type="submit"
																		onClick={handleSubmit}
																		className="text-white bg-yellow-500 hover:bg-yellow-600  font-medium text-sm w-full sm:w-auto px-5 py-2.5 text-center "
																		disabled={pending}
																	>
																		{pending ? "Submitting..." : "Submit"}
																	</button>
																</>
															)}
															{props.formType == "update" && (
																<>
																	<button
																		type="submit"
																		onClick={() => props.setShow(false)}
																		className="text-black bg-gray-200 hover:bg-gray-100  font-medium  text-sm w-full sm:w-auto px-5 py-2.5 text-center "
																	>
																		Cancel
																	</button>
																	<button
																		type="submit"
																		onClick={handleUpdate}
																		className="text-white bg-green-500 hover:bg-green-600  font-medium text-sm w-full sm:w-auto px-5 py-2.5 text-center "
																		disabled={pending}
																	>
																		{pending ? "Saving..." : "Save Changes"}
																	</button>
																</>
															)}
														</div>
													</div>
												</div>
											</>
										)}
									</div>
								</div>
							</motion.div>
						</Card.Body>
					</Card>
				</div>
			</div>
		</>
	);
}

export default PostAddBasicForm;
