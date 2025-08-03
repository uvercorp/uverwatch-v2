import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHistory } from "react-router-dom";
import { CiEdit } from "react-icons/ci";
import { IoIosList } from "react-icons/io";
import { CiBoxList } from "react-icons/ci";
import { FaShare } from "react-icons/fa";
import { format } from "timeago.js";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Dropdown } from "react-bootstrap";
import { RxDashboard } from "react-icons/rx";
import { IoArrowUpOutline } from "react-icons/io5";
import { MdOutlineDelete } from "react-icons/md";
import { MdOutlineRemoveCircle } from "react-icons/md";
import axiosInstance from "services/axios";
import {
  selectedSingleData,
  setSelectedSingleData,
} from "provider/features/helperSlice";
import { useSelector, useDispatch } from "react-redux";
import { toggleLoadingBar, selectLoadingBar, toggleToaster, selectToasterData, selectToasterStatus } from 'provider/features/helperSlice';


import AddToCollection from "../../data_view/options/AddToCollection";
import TaskForm from "./TaskForm";

function SingleTask(props) {
  const myImage =
    "data:image/png;base64,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";
  const [image, setImage] = useState();
  const [currentUser, setCurrentUer] = useState("");
  const dispatch = useDispatch();
  let navigate = useHistory();
  const [displayName, setDisplayName] = useState();
  const collectionId = useSelector((state) => state.collection.collectionId);
  const collectionOn = useSelector((state) => state.collection.collectionOn);
  const collectionOwner = useSelector(
    (state) => state.collection.collectionOwner
  );
  const [show, setShow] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState();
  const [pending, setPending] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [tasks, setTasks] = useState(0);
  const [isTaskged, setIsTaskged] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskDetail, setTaskDetail] = useState("");
  const [taskError, setTaskError] = useState("");
  const [taskAction, setTaskAction] = useState("");
  const [taskErrorAction, setTaskErrorAction] = useState("");
  const isValidColor = (color) => {
    const style = new Option().style;
    style.color = color;
    return style.color !== "";
  };
  const handleTaskSubmit = () => {
    if (!taskAction.trim()) {
      setTaskErrorAction("Please provide details for action taken");
      return;
    }
    if (!taskDetail.trim()) {
      setTaskError("Please provide  The Exact Task");
      return;
    }

    if (taskDetail.trim() !== selectedRecord.task) {
      setTaskError("Please You Must Provide The Exact Task");
      return;
    }

    // try {
    //   // Add your API call here
    //   // await axios.post('/api/tasks', {
    //   //     postId: post.id,
    //   //     detail: taskDetail
    //   // });

    //   setTasks((prev) => prev + 1);
    //   setIsTaskged(true);
    //   setShowTaskModal(false);
    //   setTaskDetail("");
    //   setTaskError("");
    //   setTaskAction("");
    //   setTaskErrorAction("");
    // } catch (error) {
    //   setTaskError("Failed to submit task. Please try again.");
    // }
    // alert("here");
    submitTask(selectedRecord?.user_assigned_post_id);
  };
  const handleDropdownToggle = (isOpen) => {
    setShowDropdown(isOpen);
  };
  useEffect(() => {
    let dp = localStorage.getItem("deployment");
    let deployment = localStorage.getItem("settings");
    if (deployment && deployment !== undefined) {
      setImage(JSON.parse(deployment).logo);
      setDisplayName(JSON.parse(dp).display_name);
    }
    let user = localStorage.getItem("currentUser");

    if (user && user !== undefined) {
      setCurrentUer(JSON.parse(user).id);
      // alert(JSON.parse(user).id);
    }
  }, []);
  const handleReadMore = (record) => {
    dispatch(setSelectedSingleData({ record }));
    navigate.push(
      "/deployment/detailed?type=" +
        (record.is_entity === "true" ? "entity" : "post") +
        "&id=" +
        record.id
    );
  };
  const [menuOpen, setMenuOpen] = useState(false);
  const handlePasswordChange = (e) => {
    e.preventDefault();
    changePassword();
    // Add password change logic here
  };
  const submitTask = async (record_id) => {
    // alert("here2");
    setPending(true);
    try {
      const results = await axiosInstance.post(
        "updateTask",
        JSON.stringify({ id: record_id, action: taskAction }),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      if (results?.data?.status === "success") {
        let newData = results?.data?.data;
        dispatch(
          toggleToaster({
            isOpen: true,
            toasterData: { type: "success", msg: results?.data?.message },
          })
        );
            setTaskDetail("");
      setTaskError("");
      setTaskAction("");
      setTaskErrorAction("");
        setPending(false);
        setShowTaskModal(false);
        props?.updateListRecordPost(newData);

      }
      if (results?.data?.status === "error") {
        let newData = results?.data?.user;
        dispatch(
          toggleToaster({
            isOpen: true,
            toasterData: { type: "error", msg: results?.data?.message },
          })
        );
        setPending(false);
        // updateListRecord(newData);
      }
    } catch (error) {
      console.error("Error deleting survey:", error);
      setPending(false);
    }
    setPending(false);
  };
  return (
    <>
      {/* const MyCard = ({ title, date, time, summary, location, tags, status, bgColor, hoverBgColor }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    return ( */}
      <div
        className={`w-full min-w-0 p-3 pt-0 text-white transition-colors duration-300 ${
          props?.post?.task_status === "pending"
            ? "bg-[#1F2F3F]"
            : "bg-[#1F2F3F]"
        }  ${
          props?.post?.task_status === "resolved"
            ? "bg-green-800"
            : "bg-[#1F2F3F]"
        }  hover:bg-[#3F1F2F] max-h-[240px] min-h-[240px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 mb-2 `}
      >
        {/* Title & Menu */}
        <div className="flex items-start justify-between py-0">
          <span className="italic text-[1.3em] text-gray-300 mr-2">Task: </span>
          <span className="text-[0.9em] pt-1 font-extrabold my-font-family-courier-prime   p-0 w-full overflow-hidden ">
            {props?.post?.task}
          </span>
        </div>
        <div className="px-0 p-0 m-0">
          <hr className="border-[#fff] mt-0  pt-0 " />
        </div>
        <span className="italic text-xs text-gray-400 mt-0">
          {props?.post?.is_entity === "true" ? "Entity" : "Report"}
        </span>
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-semibold my-font-family-courier-prime uppercase tracking-wide p-0 w-full overflow-hidden whitespace-nowrap text-ellipsis">
            {props?.post?.title}
          </h3>
          {/* <p className="text-sm mb-2 truncate max-w-[200px]">{props?.post?.description}</p> */}
        </div>

        {/* Metadata */}
        <div className="text-sm text-gray-400 mb-1">
          <span className="mr-4">
            DATE:{" "}
            {new Date(props?.post?.created_at)
              .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              })
              .replace(/\//g, ".")}
          </span>
          {/* <span className="mr-4">TIME: 2000HRS</span> */}
          <span className="mr-4">
            TIME:{" "}
            {new Date(props?.post?.created_at)
              .getHours()
              .toString()
              .padStart(2, "0")}
            {new Date(props?.post?.created_at)
              .getMinutes()
              .toString()
              .padStart(2, "0")}
            HRS
          </span>
          <span className="mr-4">
            📂{" "}
            {props?.post?.is_entity === "true"
              ? props?.post?.entity_type_name
              : props?.post?.category_name}{" "}
          </span>
        </div>

        {/* Summary */}
        {/* <p className="text-sm mb-2">{props?.post?.description}</p> */}
        <p className="text-sm mb-2 truncate w-full">
          {props?.post?.description}
        </p>

        {/* Coordinates */}
        <p className="text-xs text-gray-400 mb-1 truncate w-full">
          {props?.post?.formatted_address},{" "}
          <span className="mr-1">{props?.post?.longitude},</span>{" "}
          <span className="mr-1">{props?.post?.latitude}</span>
        </p>

        {/* Status */}
        <div className="text-xs mb-1">
          {/* {status.map((item, index) => ( */}
          <span className="mr-2 font-semibold capitalize truncate w-full">
            {props?.post?.status}{" "}
            <span className="text-xs text-gray-300">
              : {props?.post?.post_status_name}
            </span>
          </span>
          {/* ))} */}
          {/* statuse */}
        </div>

        {/* Tags */}
        <div className="flex justify-between items-start">
          <div
            className="text-sm cursor-pointer text-white hover:underline "
            onClick={() => {
              handleReadMore(props?.post);
              // props.setShow(true);
            }}
          >
            Read More
          </div>

          {props?.post?.task_status === "pending" ? (
            <>
              <div
                className="text-sm cursor-pointer text-white hover:underline "
                // onClick={() => {
                // props?.setSelectedRecord(props?.post);
                // }}
                onClick={() => {
                  setShowTaskModal(true);
                  props?.setSelectedRecord(props?.post);
                  setSelectedRecord(props?.post);
                }}
                // disabled={isTaskged}
              >
                Resolve Task
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
      <AnimatePresence>
        {showTaskModal && (
          <TaskForm
            showTaskModal={showTaskModal}
            taskDetail={taskDetail}
            setTaskDetail={setTaskDetail}
            taskAction={taskAction}
            setTaskAction={setTaskAction}
            setShowTaskModal={setShowTaskModal}
            setTaskError={setTaskError}
            taskError={taskError}
            setTaskErrorAction={setTaskErrorAction}
            taskErrorAction={taskErrorAction}
            handleTaskSubmit={handleTaskSubmit}
            pending={pending}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default SingleTask;
