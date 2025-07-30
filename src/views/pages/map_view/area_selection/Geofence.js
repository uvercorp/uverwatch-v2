import React, { useEffect, useRef, useState } from "react";
function Geofence(props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
    //   alert('Please enter a name for the geo-fence');
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
      }, 5000);
      return;
    }

    setIsSaving(true);
    try {
      await props.onSaveGeoFence({
        name: name.trim(),
        description: description.trim(),
        coordinates: props.geoFenceData
      });
      setName('');
      props.onClose();
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save geo-fence');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div >
         <div className="flex items-start justify-between">
                        <span className="text-[1.4em] font-bold">Geofence |
                           
                        </span>
                        {/* <Button variant="default" className="btn-sm" onClick={() => props?.setCurrentPage('choose')}>Back To Filter</Button> */}
        
                    </div>
                    <hr />
         <div className="modal-body">
            { showError &&
         <div className="alert alert-danger mb-0">
                
                Please enter a name for the geo-fence
              </div>
              }
        <div className="geo-fence-form">
              <label htmlFor="geoFenceName" className="form-label fw-bold">
                Enter Name
              </label>
              <input
                type="text"
                id="geoFenceName"
                className="form-control mb-3"
                placeholder="Enter geo-fence name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSaving}
              />
              
              <label htmlFor="description" className="form-label fw-bold">
                 Description
              </label>
              <input
                type="text"
                id="description"
                className="form-control mb-3"
                placeholder="Enter Desription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSaving}
              />
              <div className=" mb-0 text-black border bg-[#f5f5f5] shadow-sm p-4">
                {props?.posts?.length === 0 && "No posts found in the selected area. "}
                You can save this area as a geo-fence to monitor future posts.
              </div>
            </div>
            </div>
            <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-outline-secondary" 
              onClick={props?.onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            {/* <button 
              type="button" 
              className="btn btn-danger" 
              onClick={props?.onClearSelection}
              disabled={isSaving}
            >
              Clear Current Area
            </button> */}
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Geo-Fence'}
            </button>
          </div>
    </div>
  );
}
export default Geofence;