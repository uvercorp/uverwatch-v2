import React, { useState } from 'react';
import { CSVLink } from 'react-csv';
import Papa from 'papaparse';
import { Button } from "react-bootstrap";

const CsvImporter = ({ surveyFields, setShowCsv, maxRows = 100, minRows = 5 }) => {
  const [csvData, setCsvData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Generate template CSV data with headers only
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
  const handleImport = () => {
    if (isValid) {
      // Here you would send csvData to your API
      console.log('Valid data to import:', csvData);
      alert(`Successfully imported ${csvData.length} records`);
    }
  };

  return (
    <div className="csv-importer">
      <h2>CSV Import</h2>

      <div className="template-section">
        <h3>1. Download Template</h3>
        <CSVLink
          data={generateTemplate()}
          filename="survey_import_template.csv"
          className="btn btn-primary"
        >
          Download CSV Template
        </CSVLink>
        <p>Template includes required fields: {surveyFields.join(', ')}</p>
        {maxRows && <p>Maximum {maxRows} rows allowed per import</p>}
        <p>Minimum {minRows} rows required per import</p>
      </div>

      <div className="import-section">
        <h3>2. Import Data</h3>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="form-control"
        />

        {validationErrors.length > 0 && (
          <div className="alert alert-danger mt-3">
            <h4>Validation Errors</h4>
            <ul>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {showPreview && (
          <div className="mt-4">
            <h4>Data Preview (First 5 Rows)</h4>
            <div className="table-responsive">
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    {surveyFields.map(field => (
                      <th key={field}>{field}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 5).map((row, index) => (
                    <tr key={index}>
                      {surveyFields.map(field => (
                        <td key={field}>{row[field] || <em>empty</em>}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>Showing {Math.min(5, csvData.length)} of {csvData.length} rows</p>

            {isValid && (
              <>
                <div className="alert alert-success mt-3">
                  CSV file is valid! Ready to import {csvData.length} records.
                </div>
                <button
                  onClick={handleImport}
                  className="btn btn-success"
                >
                  Confirm Import
                </button>
              </>
            )}
            <Button variant="default" onClick={() => setShowCsv(false)} className="mt-2">
              <span className="text-gray-100">Cancel</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CsvImporter;