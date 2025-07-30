// import React, { useState, useEffect } from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faLink, faLock } from '@fortawesome/free-solid-svg-icons';


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
import { IconPicker } from "others/icons/IconPicker";
import { Icon } from "@iconify/react";


const PostLinking = ({ post, posts, userAccess }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [existingLinks, setExistingLinks] = useState([]);
  const [linkDescription, setLinkDescription] = useState('');
      const [pending, setPending] = useState(false);
         const dispatch = useDispatch();
  
  const isValidColor = (color) => {
    const style = new Option().style;
    style.color = color;
    return style.color !== '';
  };

  // Load existing links
  useEffect(() => {
 
    getLinksData(post?.id);
  }, [post?.id]);

  // Search handler
  useEffect(() => {
    if (searchTerm) {
      const results = posts.filter(p => {
        if (p.id === post?.id) return false;
        
        const matchesSearch = Object.keys(p).some(key => {
          if (key === 'post_values') {
            return p[key].some(item => 
              item.field_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.field_value.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          return String(p[key]).toLowerCase().includes(searchTerm.toLowerCase());
        });

        return matchesSearch;
      });
      
      setFilteredPosts(results);
    } else {
      setFilteredPosts([]);
    }
  }, [searchTerm, posts, post?.id]);


  const createLink = async (linkedPost) => {
    if (!linkDescription.trim()) {
      alert('Please enter a link description');
      return;
    }

    // try {
    //   await axios.post('/api/post-links', {
    //     post_id: post?.id,
    //     linked_to: linkedPostId,
    //     how: linkDescription
    //   });
    //   // Update local state
    //   setExistingLinks([...existingLinks, {
    //     post: post?.id,
    //     linked_to: linkedPostId,
    //     how: linkDescription
    //   }]);
    //   setLinkDescription('');
    // } catch (error) {
    //   console.error('Linking failed:', error);
    //   alert('Linking failed. Please check permissions.');
    // }

    setPending(true);
    let deployment = localStorage.getItem('deployment');
        try {
          const data = {
            post_id: post?.id,
            linked_to: linkedPost.id,
            deployment:JSON.parse(deployment).id,
            how: linkDescription
          };
          const response = await axiosInstance.post('createLink', data, {
            headers: {
              'Content-Type': 'application/json',
              "Authorization": `Bearer ${localStorage.getItem('access')}`
            },
          });
          if (response?.data?.status === "success") {
            dispatch(toggleToaster({ isOpen: true, toasterData: { type: "success", msg: "Link Created successfully." } }));
            // Update local state
      setExistingLinks([...existingLinks, {
        post: post?.id,
        color: linkedPost?.color,
        icon: linkedPost?.icon,
        linked_to: linkedPost.id,
        how: linkDescription
      }]);
      setLinkDescription('');
            // props.setShow(false); // Close the modal
          }
        } catch (err) {
          // console.error(err);
          dispatch(toggleToaster({ isOpen: true, toasterData: { type: "error", msg: "An error occurred. Please try again." } }));
        } finally {
          setPending(false);
        }
  };

    const getLinksData = async (post_id) => {
        setPending(true);
        try {
            const response = await axiosInstance.get('getPostLinks/' +post_id,
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
                let dData = response?.data;
                setExistingLinks(dData?.links);
                

            }
        } catch (err) {
            setPending(false);


        }

    }

  
  return (
    <div className="container-fluid md:min-h-[500px] md:max-h-[500px]">
      <div className="row">
        {/* Current Post */}
        <div className="col-md-4 border-right p-0 pr-1">
           <div className="border-l">
                  <h2 className="mb-2 mt-0 text-lg font-semibold text-gray-900 dark:text-white">
                    <i
          
                      className={`${post?.icon || 'fas fa-question-circle'} text-${post?.color || 'muted'}`}
                      style={{
                        color: isValidColor(post?.color) ? post?.color : '#6c757d',
                        fontSize: '1.2rem',
                        marginRight: '8px'
                      }}
                    />
                    {post?.title}
                  </h2>
                  <p className="text-[0.84em]">{post?.description}</p>
                </div>
          <div className="mb-3">
            <h5>Existing Links:</h5>
            {existingLinks.map(link => (
              <div key={link.id} className="alert alert-secondary py-2">
                <i
          
                      className={`${link?.icon || 'fas fa-question-circle'} text-${post?.color || 'muted'}`}
                      style={{
                        color: isValidColor(link?.color) ? link?.color : '#6c757d',
                        fontSize: '1.2rem',
                        marginRight: '8px'
                      }}
                    />
               <span className="text-amber-800"> Linked to:</span> <span className="text-gray-800">{posts.find(p => p.id === link.linked_to)?.title}</span>
                <br/>
                <small ><span className="text-amber-800">Relationship: </span><span className="text-gray-800">{link.how}</span></small>
                <br/>
                <small ><span className="text-amber-800">Assessment: </span><span className="text-gray-800">{link.assessment}</span></small>
              </div>
            ))}
          </div>
        </div>

        {/* Search Area */}
       
        <div className="col-md-8">
          <div className="mb-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search posts to link..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <small className="form-text text-muted flex items-start justify-between">
              <div>
              Start typing to search available posts
                </div>
                <div>
              Results {filteredPosts.length}
                </div>
            </small>
          </div>
          {pending && (
                  <div className="flex items-center justify-center mb-4">
                    <Spinner animation="grow" variant="warning" />
                  </div>
                )}
          {searchTerm && (
            <div className="list-group">
              {filteredPosts.map(targetPost => {
                const isLinked = existingLinks.some(link => link.linked_to === targetPost.id);
                const hasAccess = targetPost.access_level <= userAccess;

                return (
                  <div key={targetPost.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5>
                          <i
          
          className={`${targetPost?.icon || 'fas fa-question-circle'} text-${targetPost?.color || 'muted'}`}
          style={{
            color: isValidColor(targetPost?.color) ? targetPost?.color : '#6c757d',
            fontSize: '1.2rem',
            marginRight: '8px'
          }}
        /> {targetPost.title}</h5>
                        <p className="mb-1 text-[0.84em]">{targetPost.description}</p>
                        <small className="text-muted">
                          Access Level: {targetPost.access_level}
                        </small>
                      </div>

                      <div className='pl-2'>
                        {!hasAccess && (
                          <span className="text-danger mr-2">
                            <i className="fas fa-lock"></i>
                            <span className="ml-2">No Access</span>
                          </span>
                        )}

                        {hasAccess && !isLinked && (<>
                        <label>How</label>
                          <div className="input-group">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Relationship description"
                              value={linkDescription}
                              onChange={(e) => setLinkDescription(e.target.value)}
                            />
                            <div className="input-group-append">
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => createLink(targetPost)}
                              >
                                <i className="fas fa-exchange-alt"></i>
                              </button>
                            </div>
                          </div>
                          </>
                        )}

                        {isLinked && (
                          <span className="text-success">
                           
                            <i className="fas fa-exchange-alt"></i>
                            <span className="ml-2">Linked</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {searchTerm && filteredPosts.length === 0 && (
            <div className="alert alert-info mt-3">
              No matching posts found. Try different search terms.
            </div>
          )}
          </div>
      </div>
    </div>
  );
};

export default PostLinking;