import React, { useState } from 'react';
import axios from 'axios';
import FileUpload from '../components/FileUpload';
import ProcessingOptions from '../components/ProcessingOptions';

function Home() {
  const [simulationFile, setSimulationFile] = useState(null);
  const [observationFile, setObservationFile] = useState(null);
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [calcMode, setCalcMode] = useState('overall'); // Default mode
  const [variables, setVariables] = useState([]); // Variable options
  const [selectedVariable, setSelectedVariable] = useState(''); // Selected variable
  const [evaluationResults, setEvaluationResults] = useState(null);
  const [plotImages, setPlotImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (file, setFile, isSimulation) => {
    setFile(file);
    const formData = new FormData();
    formData.append('file', file);

    // Fetch variables only for the observation file
    if (!isSimulation) {
      axios
        .post('http://localhost:5000/get-variables', formData)
        .then((response) => {
          setVariables(response.data.variables);
          setSelectedVariable(response.data.variables[0]); // Default to the first variable
        })
        .catch(() => alert('Failed to fetch variables.'));
    }
  };

  const handleEvaluate = () => {
    setIsLoading(true);
    const formData = new FormData();

    formData.append('simulationFile', simulationFile);
    formData.append('observationFile', observationFile);
    formData.append('metrics', JSON.stringify(selectedMetrics));
    formData.append('variable', selectedVariable); // Include selected variable
    formData.append('calcMode', calcMode);

    axios
      .post('http://localhost:5000/evaluate', formData)
      .then((response) => {
        setEvaluationResults(response.data.results);
        setPlotImages(response.data.plotUrls);
      })
      .catch(() => alert('Evaluation failed.'))
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-8">NWP Model Evaluation Tool</h1>
      <p className="mb-8 text-gray-700 text-center">
        Upload simulation and observation NetCDF files, select evaluation metrics, and visualize the results in an interactive manner.
      </p>

      <FileUpload
        label="Upload Simulation File"
        file={simulationFile}
        setFile={(file) => handleFileUpload(file, setSimulationFile, true)}
      />
      <FileUpload
        label="Upload Observation File"
        file={observationFile}
        setFile={(file) => handleFileUpload(file, setObservationFile, false)}
      />

      {variables.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Select Variable</h2>
          <select
            value={selectedVariable}
            onChange={(e) => setSelectedVariable(e.target.value)}
            className="border p-2 rounded-md"
          >
            {variables.map((variable) => (
              <option key={variable} value={variable}>
                {variable}
              </option>
            ))}
          </select>
        </div>
      )}

      <ProcessingOptions selectedMetrics={selectedMetrics} setSelectedMetrics={setSelectedMetrics} />

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Calculation Mode</h2>
        <select
          value={calcMode}
          onChange={(e) => setCalcMode(e.target.value)}
          className="border p-2 rounded-md"
        >
          <option value="overall">Overall</option>
          <option value="spatial">Spatial</option>
          <option value="temporal">Temporal</option>
        </select>
      </div>

      <button
        onClick={handleEvaluate}
        disabled={!simulationFile || !observationFile || selectedMetrics.length === 0 || isLoading}
        className={`px-6 py-2 rounded-lg font-semibold shadow-md ${
          simulationFile && observationFile && selectedMetrics.length > 0 && !isLoading
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-400 text-gray-700 cursor-not-allowed'
        }`}
      >
        {isLoading ? 'Evaluating...' : 'Evaluate'}
      </button>

      {evaluationResults && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Evaluation Results</h2>
          <div className="bg-gray-100 p-4 rounded-md shadow-md overflow-auto max-h-64">
            <pre className="text-sm">{JSON.stringify(evaluationResults, null, 2)}</pre>
          </div>
        </div>
      )}

      {plotImages.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Generated Plots</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plotImages.map((plotUrl, index) => (
              <img
                key={index}
                src={`http://localhost:5000${plotUrl}`}
                alt={`Plot ${index + 1}`}
                className="rounded-lg shadow-md"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
