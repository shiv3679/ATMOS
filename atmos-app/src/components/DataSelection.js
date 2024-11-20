// src/components/DataSelection.js
import React from 'react';

function DataSelection() {
  const variables = ['Temperature', 'Humidity', 'Wind Speed', 'Pressure'];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Select Data Variables</h2>
      <label htmlFor="variables" className="block text-sm font-medium text-gray-700">
        Variables:
      </label>
      <select
        id="variables"
        multiple
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none
                   focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
      >
        {variables.map((variable) => (
          <option key={variable} value={variable}>
            {variable}
          </option>
        ))}
      </select>
      {/* Add date pickers and spatial selectors as needed */}
    </div>
  );
}

export default DataSelection;
