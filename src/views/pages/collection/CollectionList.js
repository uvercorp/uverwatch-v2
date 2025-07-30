import React from "react";
import { Spinner } from "react-bootstrap";
import { CiEdit } from "react-icons/ci";

function CollectionList(props) {
  const isValidColor = (color) => {
    const style = new Option().style;
    style.color = color;
    return style.color !== '';
  };

  return (
    <div className=" bg-gradient-to-b from-[#080808] to-[#1c1b1a] text-white flex items-center justify-center p-0">
      <div className=" md:min-h-[550px] rounded-xl w-full max-w-3xl p-6 shadow-xl " style={{border: "1px solid #2e2c2b"}}>
      <div className="flex items-start justify-between mb-3">
                            <h2 className="text-xl font-semibold mb-6 text-gray-100">Collections | <span className="text-[0.6em] capitalize"> List  </span></h2>
                            <button
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-md transition-colors"
            onClick={() => props?.toggleFormType('add', '')}
          >
            Add Collection
          </button>

                        </div>
        
      

        <hr className="border-[#2e2c2b] mb-6" />

        {/* Body content */}
        <div className="min-h-[300px]">
          {!props.pending && props?.collections?.length < 1 && (
            <div className="flex justify-center items-center">
              <div className="bg-[#2e2c2b] text-gray-300 p-5 rounded font-semibold text-lg">
                No Results Found
              </div>
            </div>
          )}

          {props.pending && (
            <div className="flex items-center justify-center mb-4">
              <Spinner animation="grow" variant="warning" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {props?.collections?.map((record, index) => (
              <div
                key={index}
                className="bg-[#1c1b1a] hover:bg-[#3b3229] transition-colors p-3 rounded-md flex justify-between items-start text-gray-200 "
                style={{border:"1px solid rgb(150, 146, 140)"}}
             >
                <div onClick={() => props?.searchCollection(record)} className="cursor-pointer">
                  <div className="flex items-center mb-1">
                    <i
                      className={`${record?.icon || 'fas fa-question-circle'}`}
                      style={{
                        color: isValidColor(record.color) ? record.color : '#9ca3af',
                        fontSize: '1.2rem',
                        marginRight: '8px'
                      }}
                    />
                    <span>{record.name}</span>
                    <span className="ml-2 text-xs text-red-800 capitalize">{record.type}</span>
                  </div>
                  <div className="text-xs text-gray-400">{record.description}</div>
                </div>
                <div onClick={() => props?.toggleFormType('update', record)}>
                  <CiEdit className="h-5 w-5 cursor-pointer text-yellow-400 hover:text-yellow-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CollectionList;
