import { React, useState, useEffect } from "react";
import { motion } from "framer-motion";
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

import Spinner from 'react-bootstrap/Spinner';
import useCSVExport from "hooks/useCSVExport";
import SaveToCollection from "./BulkAddToCollection";
import BulkAddToCollection from "./BulkAddToCollection";

function DisplayResult(props) {
    const exportToCSV = useCSVExport();
    const [currentPage,setCurrentPage] = useState('list');
    const isValidColor = (color) => {
        const style = new Option().style;
        style.color = color;
        return style.color !== '';
    };



    return (
        <>
            <div className="flex items-start justify-between">
                {/* <span className="text-[1.4em] font-bold">{props?.selectedType == 'entity'? 'Entities':'Posts'} | */}
                <span className="text-[1.4em] font-bold capitalize">{props?.selectedType} |
                    <span className="text-[0.8em] capitalize">
                        {props.posts.length > 0 ? ` (${props.posts.length})` : "No Record Found"}
                    </span>
                </span>
                <Button variant="warning" className="btn-sm border-r-0" onClick={() => props?.setCurrentPage('choose')}>Back To Filter</Button>

            </div>
            <div className="px-0">
        <hr className="border-[#454240] mt-4 pt-0 " />
      </div>
            {currentPage == 'list' && (<>
            {props.posts.length > 0 ? (
                <>
                    <div className="modal-body" style={{
                        maxHeight: '60vh',
                        overflowY: 'auto',
                        scrollbarWidth: 'thin'
                    }}>
                        <div className="list-group">
                            {props.posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="p-2 d-flex gap-3 py-3 bg-[#1F2F3F] hover:bg-[#3F1F2F] mb-1"
                                >
                                    <div className="d-flex w-100 justify-content-between">
                                        <div>
                                            <h6 className="mb-1 fw-bold">
                                                <i

                                                    className={`${post.icon || 'fas fa-question-circle'} text-${post.color || 'muted'}`}
                                                    style={{
                                                        color: isValidColor(post.color) ? post.color : '#6c757d',
                                                        fontSize: '1.2rem',
                                                        marginRight: '8px'
                                                    }}
                                                />
                                                {post.title}
                                            </h6>
                                            <p className="mb-0 text-muted small">{post.description}</p>
                                        </div>
                                        <small className="text-nowrap">
                                            {new Date(post.created_at).toLocaleDateString()}
                                        </small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="modal-footer">
                    <button

  onClick={() => exportToCSV(props?.posts, 'map-posts.csv')}
  className="btn btn-success"
  disabled={props?.posts.length === 0}
>
  <i className="fas fa-download me-2"></i>
  Export Selected ({props?.posts.length})
</button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={()=>setCurrentPage('collection')}
                >
                  Add to Collection
                </button>
              </div>

                </>
            ) : (
                <div className="modal-body" style={{
                    minHeight: '60vh',
                    overflowY: 'auto',
                    scrollbarWidth: 'thin'
                }}>
                    <div className="alert alert-info mb-0">
                        No Records found in the selected area
                    </div>
                </div>
            )}
            </>)}

            {currentPage == 'collection' && (<>
             <BulkAddToCollection selectedPosts={props?.posts} selectedType={props?.selectedType} setCurrentPage={setCurrentPage}/>
            </>)}
        </>
    );
}

export default DisplayResult;