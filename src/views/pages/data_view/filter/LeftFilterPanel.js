import { React, useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from 'framer-motion';
const FilterSection = ({ title, items, selectedItems, toggleItem }) => {
    return (
       
      <div className="mb-6">
        <h3 className="my-sidebar-link font-bold tracking-wide uppercase text-sm mb-2">{title}</h3>
        {/* <div className="space-y-2 max-h-40 overflow-y-auto pr-1"> */}
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
  
          {items.map((item) => {
            const isSelected = selectedItems.includes(item);
            return (
              <div
                key={item}
                onClick={() => toggleItem(item)}
                className="flex items-center cursor-pointer group"
              >
                <div className="w-5 h-5 border border-gray-500 mr-2 flex items-center justify-center my-black-bg group-hover:bg-gray-900">
                  {isSelected && <span className="text-red-500 font-bold text-sm">X</span>}
                </div>
                <span className={`text-sm ${isSelected ? 'text-red-500 font-semibold' : 'my-sidebar-link'}`}>
                  {item}
                </span>
              </div>
            );
          })}
        </div>
        <hr className="border-gray-700 mt-4" />
      </div>
    );
  };
  
  export default function LeftFilterPanel(props) {
//   const SidebarFilterPanel = () => {
    const [selected, setSelected] = useState([]);
  
    const toggleItem = (item) => {
      
      setSelected((prev) =>
        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
      );
      
    };
  
    const layers = ['Basic', 'Entity X126', 'Target V12', 'Cocobod', 'Antioch','more','lears','here'];
    const entities = ['Black Shmo', 'Atta Ayi', 'Driver Blue', 'X Com'];
    const trackers = ['Driver 1', 'Phone 243', 'Driver Blue', 'X Com','more','pass','com'];
  
    return (
        <motion.div
        initial={{ y: 25, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
            duration: 0.75,
        }}
        
    >
      <div className="my-black-bg px-4 w-64 h-full overflow-y-auto pt-2">
        {/* <FilterSection title="Layers" items={layers} selectedItems={selected} toggleItem={toggleItem} /> */}
        {/* <FilterSection title="Entities" items={entities} selectedItems={selected} toggleItem={toggleItem} /> */}
        
        <div className="mb-6">
        <h3 className="my-sidebar-link font-bold tracking-wide uppercase text-sm mb-2">Layers({props?.selectedSurveys.length})</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
  
          {props?.uniqueSurveys.map((item) => {
            const isSelected = props?.selectedSurveys.includes(item);
            return (
              <div
                key={item}
                onClick={() => {toggleItem(item); props.handleSurveyChange(item)}}
                className="flex items-center cursor-pointer group"
              >
                <div className="w-5 h-5 border border-gray-500 mr-2 flex items-center justify-center my-black-bg group-hover:bg-gray-900">
                  {isSelected && <span className="text-red-500 font-bold text-sm">X</span>}
                </div>
                <span className={`text-sm ${isSelected ? 'text-red-500 font-semibold' : 'my-sidebar-link'}`}>
                  {item}
                </span>
              </div>
            );
          })}
        </div>
        <hr className="border-gray-700 mt-4" />
      </div>

      <div className="mb-6">
        <h3 className="my-sidebar-link font-bold tracking-wide uppercase text-sm mb-2">Entites({props?.selectedEntities.length})</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
  
          {props?.uniqueEntities.map((item) => {
            const isSelected = props?.selectedEntities.includes(item);
            return (
              <div
                key={item}
                onClick={() => {toggleItem(item); props.handleEntityChange(item)}}
                className="flex items-center cursor-pointer group"
              >
                <div className="w-5 h-5 border border-gray-500 mr-2 flex items-center justify-center my-black-bg group-hover:bg-gray-900">
                  {isSelected && <span className="text-red-500 font-bold text-sm">X</span>}
                </div>
                <span className={`text-sm ${isSelected ? 'text-red-500 font-semibold' : 'my-sidebar-link'}`}>
                  {item}
                </span>
              </div>
            );
          })}
        </div>
        <hr className="border-gray-700 mt-4" />
      </div>
      

        
        {/* <FilterSection title="Trackers" items={trackers} selectedItems={selected} toggleItem={toggleItem} /> */}
      </div>
      </motion.div>
    );
  };
  