import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SingleTask from "./SingleTask";
import UpdatePostModal from "../../data_view/UpdatePostModal";
import AddToCollection from "../../data_view/options/AddToCollection";
import SharePost from "../../data_view/options/SharePost";
import AssignPost from "../../data_view/options/AssignPost";
import LinkPost from "../../data_view/options/LinkPost";
import { isPending } from "@reduxjs/toolkit";

function TaskForm(props) {
  const [show, setShow] = useState(false);
  const [tasks, setTasks] = useState(0);
  const [isTaskged, setIsTaskged] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskDetail, setTaskDetail] = useState("");
  const [taskError, setTaskError] = useState("");


  return (
    <>

                  <motion.div
                    className="fixed inset-0 bg-black bg-opacity-50 z-[1200] flex items-start justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Modal Container */}
                    <motion.div
                      className="my-gradient-bg rounded-lg shadow-lg p-8 overflow-y-auto max-h-[90vh] mt-8
                        w-[90%] sm:w-[80%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]"
                      initial={{ y: -100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -100, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      style={{ border: "1px solid #2e2c2b" }}
                    >
                      {/* Modal Header */}
                      <h2 className="text-2xl font-bold mb-6 text-gray-200">
                        Resolve This Task
                      </h2>

                      {/* Modal Body */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium my-label mb-2">
                            Action Taken
                          </label>
                          <textarea
                            value={props?.taskAction}
                            onChange={(e) => {
                              props?.setTaskAction(e.target.value);
                              if (props?.taskErrorAction) props?.setTaskErrorAction("");
                            }}
                            className={`w-full my-input p-3  ${
                              props?.taskErrorAction ? "border-red-500" : "border-gray-300"
                            }`}
                            rows={3}
                            placeholder="Please specify all the action taken on the report..."
                          />
                          {props?.taskErrorAction && (
                            <p className="text-red-500 text-sm mt-1">
                              {props?.taskErrorAction}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium my-label mb-2">
                            Task Detail
                          </label>
                          <textarea
                            value={props?.taskDetail}
                            onChange={(e) => {
                              props?.setTaskDetail(e.target.value);
                              if (props?.taskError) props?.setTaskError("");
                            }}
                            className={`w-full my-input p-3  ${
                              props?.taskError ? "border-red-500" : "border-gray-300"
                            }`}
                            rows={2}
                            placeholder="Please enter the exact task that was given"
                          />
                          {props?.taskError && (
                            <p className="text-red-500 text-sm mt-1">
                              {props?.taskError}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 mt-6">
                          <button
                            onClick={() => props?.setShowTaskModal(false)}
                            className="bg-red-500 px-2 text-white hover:bg-red-600 transition duration-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={props?.handleTaskSubmit}
                            className="my-btn-green2 "
                          >
                             {props?.pending ? "Submitting..." : "Submit"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>


    </>
  );
}

export default TaskForm;