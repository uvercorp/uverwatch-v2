import React, { useState, useEffect, useRef } from 'react';
import { CSVLink } from 'react-csv';
import Papa from 'papaparse';
import { Button } from "react-bootstrap";
import axiosInstance from "services/axios";
import Spinner from "react-bootstrap/Spinner";
import { toggleLoadingBar, selectLoadingBar, toggleToaster, selectToasterData, selectToasterStatus } from '../../../../provider/features/helperSlice';
import { useSelector, useDispatch } from "react-redux";

const CsvImporter = ({ surveyFields, survey, setShowCsv, maxRows = 100, minRows = 5 }) => {
  const [csvData, setCsvData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
    const dispatch = useDispatch();
  const [isValid, setIsValid] = useState(false);
  const [pending, setPending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('idle');
  const [importSessionId, setImportSessionId] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const ws = useRef(null);

  // Generate a unique session ID for progress tracking
  const generateSessionId = () => {
    return 'csv-import-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  };

  // Initialize WebSocket connection
  const initWebSocket = (sessionId) => {
    // Close existing connection if any
    if (ws.current) {
      ws.current.close();
    }

    // Create new WebSocket connection
    const socketUrl = `ws://${window.location.hostname}:8080`;
    ws.current = new WebSocket(socketUrl);
    
    ws.current.onopen = () => {
      console.log("WebSocket connected");
      // Register this client for progress updates
      ws.current.send(JSON.stringify({
        type: 'register',
        session_id: sessionId
      }));
    };
    
    ws.current.onmessage = (event) => {
      
      try {
        const data = JSON.parse(event.data);
        
        if (data.session_id === sessionId && data.type === 'progress') {
          setImportProgress(data.progress);
          
          if (data.progress === 100) {
            setImportStatus('completed');
            setPending(false);
            setImportResult(data);
            
            if (data.imported > 0) {
              alert(`Successfully imported ${data.imported} posts!`);
            } else {
              // alert('Import completed but no posts were imported. Please check your CSV file.');
            }
            
            // Close WebSocket connection
            if (ws.current) {
              ws.current.close();
              ws.current = null;
            }
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      // Fallback to polling if WebSocket fails
      startProgressPolling(sessionId);
    };
    
    ws.current.onclose = () => {
      console.log('WebSocket connection closed');
    };
  };

  // Fallback polling mechanism
  const startProgressPolling = (sessionId) => {
    const interval = setInterval(() => {
      checkImportProgress(sessionId);
    }, 500);
    
    // Store interval ID for cleanup
    ws.current.pollingInterval = interval;
  };

  const checkImportProgress = async (sessionId) => {
    try {
      const response = await axiosInstance.get("checkImportProgress", {
        params: { session_id: sessionId },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });
      
      setImportProgress(response.data.progress);
      
      if (response.data.status === 'completed') {
        // Import completed
        if (ws.current && ws.current.pollingInterval) {
          clearInterval(ws.current.pollingInterval);
        }
        setImportStatus('completed');
        setPending(false);
        setImportResult(response.data);
        
        if (response.data.imported > 0) {
          // alert(`Successfully imported ${response.data.imported} posts!`);
        } else {
          // alert('Import completed but no posts were imported. Please check your CSV file.');
        }
      } else if (response.data.status === 'not_found') {
        // Session not found, might be completed and cleaned up
        if (ws.current && ws.current.pollingInterval) {
          clearInterval(ws.current.pollingInterval);
        }
        setImportStatus('completed');
        setPending(false);
        setImportProgress(100);
      }
    } catch (error) {
      console.error('Error checking progress:', error);
    }
  };

  // Clean up WebSocket connection on unmount
  useEffect(() => {
    return () => {
      if (ws.current) {
        if (ws.current.pollingInterval) {
          clearInterval(ws.current.pollingInterval);
        }
        ws.current.close();
      }
    };
  }, []);

  // Generate template CSV data with headers only
  const generateFileName = (str) => {
    return str
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '') + '.csv';
  };

  const generateTemplate = () => {
    const headers = surveyFields.map(field => ({
      label: field,
      key: field
    }));

    return [headers.reduce((acc, header) => {
      acc[header.key] = '';
      return acc;
    }, {})];
  };

  // Handle file upload and validation
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setValidationErrors([]);
    setIsValid(false);
    setShowPreview(true);
    setImportStatus('idle');
    setImportProgress(0);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const { data, errors, meta } = results;

        // Filter out any completely empty rows
        const filteredData = data.filter(row =>
          Object.values(row).some(value => value !== undefined && value !== '')
        );

        // Check row limit
        if (maxRows && filteredData.length > maxRows) {
          setValidationErrors([`Maximum ${maxRows} rows allowed. File has ${filteredData.length} rows.`]);
          return;
        }

        // Check minimum rows requirement
        if (minRows && filteredData.length < minRows) {
          setValidationErrors([`Minimum ${minRows} rows required. File has only ${filteredData.length} rows.`]);
          return;
        }

        // Validate headers
        const expectedFields = new Set(surveyFields);
        const actualFields = new Set(meta.fields || []);

        const missingFields = [...expectedFields].filter(f => !actualFields.has(f));
        const extraFields = [...actualFields].filter(f => !expectedFields.has(f));

        const headerErrors = [];
        if (missingFields.length > 0) {
          headerErrors.push(`Missing required fields: ${missingFields.join(', ')}`);
        }
        if (extraFields.length > 0) {
          headerErrors.push(`Unexpected fields: ${extraFields.join(', ')}`);
        }

        // Validate data rows
        const rowErrors = [];
        filteredData.forEach((row, index) => {
          const rowFieldCount = Object.keys(row).filter(key => row[key] !== undefined && row[key] !== '').length;

          if (rowFieldCount < expectedFields.size) {
            rowErrors.push(`Row ${index + 1}: Missing values for ${[...expectedFields].filter(f => !row[f] && row[f] !== 0).join(', ')}`);
            return;
          }

          surveyFields.forEach(field => {
            if (expectedFields.has(field) && (row[field] === undefined || row[field] === '')) {
              rowErrors.push(`Row ${index + 1}: ${field} is required`);
            }
          });
        });

        // Add parsing errors if any
        const parsingErrors = errors.map(e => {
          if (e.type === 'FieldMismatch') {
            return `Row ${e.row + 1}: Too few fields - expected ${expectedFields.size} fields but found ${e.row.length}`;
          }
          return e.message;
        });

        const allErrors = [...headerErrors, ...rowErrors, ...parsingErrors];

        if (allErrors.length > 0) {
          setValidationErrors(allErrors);
        } else {
          setCsvData(filteredData);
          setIsValid(true);
          setShowPreview(true);
        }
      },
      error: (error) => {
        setValidationErrors([error.message]);
      }
    });
  };

  const handleImport = async () => {
    if (isValid) {
      try {
        setPending(true);
        setImportStatus('processing');
        setImportProgress(0);
        
        // Generate a session ID for progress tracking
        const sessionId = generateSessionId();
        setImportSessionId(sessionId);
        
        // Initialize WebSocket for real-time updates
        initWebSocket(sessionId);
        // startProgressPolling(sessionId);

        // Convert data to CSV string
        const csvContent = Papa.unparse({
          fields: surveyFields,
          data: csvData
        });

        // Create blob and form data
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const formData = new FormData();
        formData.append('csv_file', blob, 'import.csv');
        
        // Add session ID to track progress
        formData.append('session_id', sessionId);

        // Add additional parameters
        formData.append('deployment', survey?.deployment);
        formData.append('survey_id', survey?.id);
        formData.append('survey_name', 'custom');
        formData.append('source', 'csv');
        formData.append('user_type', 'csv-import');
        formData.append('id', 1);

        // Send to backend
        const response = await axiosInstance.post(
          "completeCsvImport",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }
        );

        // The WebSocket will handle progress updates, so we don't need to do anything here
        if (response.data.status === 'success' && importProgress < 100) {
          // In case WebSocket missed the final update, we can set progress to 100
          setImportProgress(100);
          setImportStatus('completed');
          setPending(false);
           dispatch(
                    toggleToaster({
                      isOpen: true,
                      toasterData: { type: "success", msg: response.data.message },
                    })
                  );
                setShowCsv(false);
                  
        }
      } catch (error) {
        console.error('Import failed:', error);
        setImportStatus('error');
        setPending(false);
        // if (ws.current) {
        //   ws.current.close();
        //   ws.current = null;
        // }
        alert('Import failed. Check console for details.');
      }
    }
  };

  const cancelImport = () => {
    if (ws.current) {
      if (ws.current.pollingInterval) {
        clearInterval(ws.current.pollingInterval);
      }
      ws.current.close();
      ws.current = null;
    }
    
    if (importSessionId) {
      // Notify backend to cancel the import (if you implement this endpoint)
      axiosInstance.post("cancelImport", {
        session_id: importSessionId
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      }).catch(err => {
        console.error('Error canceling import:', err);
      });
    }
    
    // setImportStatus('cancelled');
    // setPending(false);
    // setImportProgress(0);
  };

  return (
    <div className="csv-importer relative h-[calc(100vh-120px)] bg-[#3F1F2F] text-gray-100 p-2 px-4 pt-0">
      <div className="flex items-start justify-between">
        <span className="my-font-family-overpass-mono font-semibold text-[#dbdbde] text-[1.3em]">
          CSV Importer:{" "}
          <span className="text-[0.6em] capitalize"> {survey?.survey_name} </span>{" "}
        </span>
      </div>
      <div className="py-4">
        <hr className="border-[#d1c4be] mt-0 mb-2 pt-0" />
      </div>
      
      {importStatus === 'processing' && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#2A1A25] p-6  shadow-xl w-96">
            <h3 className="text-lg font-medium text-white mb-4 flex items-start justify-between">
              <span>Importing Reports </span>
                        <Spinner animation="border" size="sm" className="mr-2" />
                      </h3>
            <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
              <div 
                className="bg-green-500 h-4 rounded-full transition-all duration-300" 
                style={{ width: `${importProgress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>{importProgress}% Complete</span>
              <span>{Math.round((importProgress / 100) * csvData.length)} of {csvData.length} records</span>
            </div>
            
            <p className="text-gray-400 text-sm mb-4">
              Please don't close this window while importing...
            </p>
            <Button
              variant="danger"
              onClick={cancelImport}
              className="w-full"
            >
              Cancel Import
            </Button>
          </div>
        </div>
      )}

      <div className='grid grid-cols-2 gap-3'>
        <div className="template-section mb-6">
          <h3 className="text-xl font-semibold mb-2 text-blue-300">1. Download Template</h3>
          <CSVLink
            data={generateTemplate()}
            filename={generateFileName(survey?.survey_name)}
            className="my-btn-blue bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
          >
            Download CSV Template
          </CSVLink>
          <p className="mt-2 text-gray-300 text-[0.8em]">Template includes required fields: <span className="font-mono">{surveyFields.join(', ')}</span></p>
          {maxRows && <p className="text-gray-300 text-[0.8em]">Maximum <span className="font-bold">{maxRows}</span> rows allowed per import</p>}
          <p className="text-gray-300 text-[0.8em]">Minimum <span className="font-bold">{minRows}</span> rows required per import</p>
        </div>

        <div className="import-section">
          <h3 className="text-xl font-semibold mb-2 text-blue-300">2. Import Data</h3>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full px-3 py-1.5 text-base font-normal my-input"
            disabled={pending}
          />

          {validationErrors.length > 0 && (
            <div className="bg-red-900 text-red-100 mt-3 p-3 max-h-[150px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
              <h4 className="font-bold text-lg">Validation Errors.</h4>
              <ul className="list-disc pl-5 mt-2">
                {validationErrors.map((error, index) => (
                  <li key={index} className="py-1">{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <div>
        {showPreview && (
          <div className="mt-0">
            <h4 className="font-semibold mb-2 text-blue-300 flex items-start justify-between">
              <span className='text-lg'>Data Preview</span>
              <p className="text-gray-400 text-[0.7em]">Showing {csvData.length} rows</p>
            </h4>
            <div className="table-responsive max-h-[200px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
              <table className="table-auto w-full border-collapse border border-gray-700">
                <thead>
                  <tr className="bg-gray-800">
                    {surveyFields.map(field => (
                      <th key={field} className="border border-gray-700 px-4 py-1 text-left capitalize">{field}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 5).map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}>
                      {surveyFields.map(field => (
                        <td key={field} className="border text-[0.9em] border-gray-700 px-4 py-0.25 w-full truncate">
                          {row[field] || <em className="text-gray-400">empty</em>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {csvData.length > 5 && (
                <div className="text-center py-2 text-gray-400">
                  Showing 5 of {csvData.length} rows
                </div>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 my-gradient-bg p-2 pt-0 shadow-lg">
              {isValid && (
                <div className="bg-green-900 text-green-100 mb-1 p-1 px-3">
                  CSV file is valid! Ready to import {csvData.length} records.
                </div>
              )}
              <div className='flex item-start justify-between'>
                <Button
                  variant="dark"
                  onClick={() => setShowCsv(false)}
                  className="mt-1 bg-gray-700 hover:bg-gray-600 text-white"
                  disabled={pending}
                >
                  Cancel
                </Button>
                {isValid && (
                  <button
                    onClick={handleImport}
                    className="my-btn-green bg-green-600 hover:bg-green-700 text-white px-4 py-2 mt-0"
                    disabled={pending}
                  >
                    {pending ? (
                      <>
                        <Spinner animation="border" size="sm" className="mr-2" />
                        Importing...
                      </>
                    ) : (
                      'Confirm Import'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        
        {!showPreview && (
          <div className='absolute bottom-0 left-0 right-0 p-2'>
            <Button
              variant="dark"
              onClick={() => setShowCsv(false)}
              className="mt-1 bg-red-700 hover:bg-red-600 text-white"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CsvImporter;