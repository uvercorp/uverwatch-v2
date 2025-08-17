import React, { useState } from 'react';
import { CSVLink } from 'react-csv';
import Papa from 'papaparse';
import { Button } from "react-bootstrap";
import axiosInstance from "services/axios";
import { toggleToaster, selectToasterData, selectToasterStatus } from "provider/features/helperSlice";
import { useSelector, useDispatch } from "react-redux";
import Spinner from "react-bootstrap/Spinner";

const CsvImporter = ({ surveyFields, survey, setShowCsv, maxRows = 100, minRows = 5 }) => {
  const [csvData, setCsvData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isValid, setIsValid] = useState(false);
   const [pending, setPending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
    const dispatch = useDispatch();

  // Generate template CSV data with headers only
  const generateFileName = (str) => {
    return str
      .toLowerCase()
      .replace(/\s+/g, '-') // replace spaces with dashes
      .replace(/[^\w-]/g, '') // remove non-word chars
      + '.csv';
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

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true, // Add this to skip empty lines
      complete: (results) => {
        const { data, errors, meta } = results;

        // Filter out any completely empty rows that might have slipped through
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

        // Validate data rows - more robust checking
        const rowErrors = [];
        filteredData.forEach((row, index) => {
          // Check if this row has the expected number of fields
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


    const handleImport44 = async () => {
      setPending(true);
      try {
        const results = await axiosInstance.post(
          "publishPost",
          {id:1},
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }
        );
        if (results?.data?.status === "success") {
          dispatch(
            toggleToaster({
              isOpen: true,
              toasterData: { type: "success", msg: "Post Added Successfully" },
            })
          );
          setPending(false);
          // props.populateList(results?.data?.data);
          history.push("/deployment/data_view");
        }
      } catch (error) {
        console.error("Error adding post:", error);
        setPending(false);
      }
    };
  
  const handleImportold = () => {
    if (isValid) {
      // Here you would send csvData to your API
      console.log('Valid data to import:', csvData);
      alert(`Successfully imported ${csvData.length} records`);
    }
  };


  const handleImport = async () => {
    alert('passing here');

  if (isValid) {
    try {
      // Convert data to CSV string
      const csvContent = Papa.unparse({
        fields: surveyFields,
        data: csvData
      });
      
      // Create blob and form data
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const formData = new FormData();
      formData.append('csv_file', blob, 'import.csv'); 
      
      // Add additional parameters
      formData.append('deployment', 1);
      formData.append('survey_id', 2);
      formData.append('user_type', 'csv-import');
      formData.append('id', 1);
      // Add any other required parameters
      
      // Send to backend
      const response = await axiosInstance.post('publishPost', 
        formData,
        {
          headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
        }
      );

      if (response.data.status === 'success') {
        alert(`Successfully imported ${response.data.imported} posts!`);
        setShowCsv(false);
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed. Check console for details.');
    }
  }
};

  return (

    <div className="csv-importer relative h-[calc(100vh-120px)] bg-[#3F1F2F] text-gray-100 p-2 px-4 pt-0 ">
      {/* <h2 className="text-2xl font-bold mb-4 text-blue-400">CSV Import</h2> */}
      <div className="flex items-start justify-between">
              <span className="my-font-family-overpass-mono font-semibold text-[#dbdbde] text-[1.3em]">
              CSV Importer: {" "}
                <span className="text-[0.6em] capitalize"> {survey?.survey_name} </span>{" "}
              </span>
              {/* <button className="my-btn-cancel" onClick={() => props?.setCurrentPage('list')}>Cancel</button> */}
            </div>
            <div className="py-4">
          <hr className="border-[#d1c4be] mt-0 mb-2 pt-0 " />
        </div>
<div className='grid grid-cols-2 gap-3'>
      <div className="template-section mb-6">
        <h3 className="text-xl font-semibold mb-2 text-blue-300">1. Download Template</h3>
        <CSVLink
          data={generateTemplate()}
          // filename="survey_import_template.csv"
          filename={generateFileName(survey?.survey_name)}
          className="my-btn-blue bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 "
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
          className=" block w-full px-3 py-1.5 text-base font-normal my-input"
        />

        {validationErrors.length > 0 && (
          <div className=" bg-red-900  text-red-100 mt-3 p-3 max-h-[150px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
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

            <div

            className="mt-0"
          >
            <h4 className=" font-semibold mb-2 text-blue-300 flex items-start justify-between">
                <span className='text-lg'>Data Preview </span>
                {/* <p className="text-gray-400 text-[0.7em]">Showing {Math.min(5, csvData.length)} of {csvData.length} rows</p> */}
                <p className="text-gray-400 text-[0.7em]">Showing  {csvData.length} rows</p>
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
                  {/* {csvData.slice(0, 5).map((row, index) => ( */}
                  {csvData.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}>
                      {surveyFields.map(field => (
                        <td key={field} className="border text-[0.9em] border-gray-700 px-4 py-0.25 w-full truncate">{row[field] || <em className="text-gray-400">empty</em>}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div  className="absolute bottom-0 left-0 right-0 my-gradient-bg p-2 pt-0 shadow-lg " >
            {isValid && (
              <>
                <div className=" bg-green-900  text-green-100 mb-1 p-1 px-3 ">
                  CSV file is valid! Ready to import {csvData.length} records.
                </div>
                </>
            )}
                <div className='flex item-start justify-between'>

            <Button
              variant="dark"
              onClick={() => setShowCsv(false)}
              className="mt-1 bg-gray-700 hover:bg-gray-600 text-white"
            >
              Cancel
            </Button>
            {isValid && (
              <>

                <button
                  onClick={handleImport}
                  className="my-btn-green bg-green-600 hover:bg-green-700 text-white px-4 py-2  mt-0"
                >
                  Confirm Import
                </button>
              </>
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
              className=" mt-1 bg-red-700 hover:bg-red-600 text-white"
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