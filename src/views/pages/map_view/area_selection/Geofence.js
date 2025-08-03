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
                        <span className="my-font-family-overpass-mono font-semibold text-[#dbdbde]">Geofence :

                        </span>
                        {/* <Button variant="default" className="btn-sm" onClick={() => props?.setCurrentPage('choose')}>Back To Filter</Button> */}

                    </div>
                    <div className="px-0">
        <hr className="border-[#2e2c2b] mt-0 mb-6 pt-0 " />
      </div>
         <div className="modal-body">
            { showError &&
         <div className="alert alert-danger mb-0">

                Please enter a name for the geo-fence
              </div>
              }
        <div className="geo-fence-form">
              <label htmlFor="geoFenceName" className="form-label fw-bold my-label">
                Enter Name
              </label>
              <input
                type="text"
                id="geoFenceName"
                className="block w-full mb-3 my-input"
                placeholder="Enter geo-fence name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSaving}
              />

              <label htmlFor="description" className="form-label fw-bold my-label">
                 Description
              </label>
              <input
                type="text"
                id="description"
                className="mb-3 block w-full my-input"
                placeholder="Enter Desription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSaving}
              />
              <div className=" mb-0   my-label shadow-sm p-4">
                {props?.posts?.length === 0 && "No posts found in the selected area. "}
                You can save this area as a geo-fence to monitor future posts.
              </div>
            </div>
            </div>
            <div className="modal-footer border-none">
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
              className="my-btn-green2 "
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