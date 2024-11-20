// src/components/ProcessingOptions.js

import React from 'react';

function ProcessingOptions({ selectedMetrics, setSelectedMetrics }) {
  const metrics = [
    'Mean Absolute Error (MAE)',
    'Root Mean Square Error (RMSE)',
    // Add more metrics as you implement them
  ];

  const handleMetricChange = (e) => {
    const value = e.target.value;
    const isChecked = e.target.checked;

    setSelectedMetrics((prevMetrics) => {
      if (isChecked) {
        // Add the selected metric
        return [...prevMetrics, value];
      } else {
        // Remove the deselected metric
        return prevMetrics.filter((metric) => metric !== value);
      }
    });
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Select Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2 border border-gray-200 rounded-md">
        {metrics.map((metric) => (
          <label key={metric} className="inline-flex items-center">
            <input
              type="checkbox"
              value={metric}
              checked={selectedMetrics.includes(metric)}
              onChange={handleMetricChange}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2 text-gray-700">{metric}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default ProcessingOptions;
