// src/pages/Home.js

import React, { useState } from 'react';
import axios from 'axios';
import FileUpload from '../components/FileUpload';
import ProcessingOptions from '../components/ProcessingOptions';
import Visualization from '../components/Visualization';

function Home() {
  const [simulationFile, setSimulationFile] = useState(null);
  const [observationFile, setObservationFile] = useState(null);
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [evaluationResults, setEvaluationResults] = useState(null);
  const [observationData, setObservationData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEvaluate = () => {
    setIsLoading(true);
    const formData = new FormData();

    // Debug statements
    console.log('simulationFile:', simulationFile);
    console.log('observationFile:', observationFile);
    console.log('selectedMetrics:', selectedMetrics);

    formData.append('simulationFile', simulationFile);
    formData.append('observationFile', observationFile);
    formData.append('metrics', JSON.stringify(selectedMetrics));

    axios
      .post('http://localhost:5000/evaluate', formData)
      .then((response) => {
        console.log('Response data:', response.data);
        setEvaluationResults(response.data.results);
        setObservationData(response.data.observationData);
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('An error occurred during evaluation.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">NWP Model Evaluation Tool</h1>

      {/* Descriptive paragraph */}
      <p className="mb-8 text-gray-700">
        Welcome to the NWP Model Evaluation Tool. This application allows you to upload your simulation and observation NetCDF files, select from a wide range of evaluation metrics, and visualize the comparison results. Simply upload your files, choose the metrics you're interested in, and click "Evaluate" to see the results.
      </p>

      {/* File Upload for Simulation File */}
      <FileUpload
        label="Upload Simulation File"
        file={simulationFile}
        setFile={setSimulationFile}
      />

      {/* File Upload for Observation File */}
      <FileUpload
        label="Upload Observation File"
        file={observationFile}
        setFile={setObservationFile}
      />

      {/* Metrics Selection */}
      <ProcessingOptions
        selectedMetrics={selectedMetrics}
        setSelectedMetrics={setSelectedMetrics}
      />

      {/* Evaluate Button */}
      <div className="mt-4">
        <button
          onClick={handleEvaluate}
          disabled={!simulationFile || !observationFile || selectedMetrics.length === 0 || isLoading}
          className={`px-4 py-2 rounded-md text-white ${
            simulationFile && observationFile && selectedMetrics.length > 0 && !isLoading
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? 'Evaluating...' : 'Evaluate'}
        </button>
      </div>

      {/* Visualization */}
      {evaluationResults && observationData && (
        <Visualization
          results={evaluationResults}
          observationData={observationData}
        />
      )}
    </div>
  );
}

export default Home;
