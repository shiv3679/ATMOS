// src/components/ResultsDisplay.js

import React from 'react';

function ResultsDisplay({ results }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Results</h2>
      {results ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            {/* Display results here */}
            {Object.entries(results).map(([metric, value]) => (
              <p key={metric}>
                <strong>{metric}:</strong> {value}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-500">No results to display.</p>
      )}
    </div>
  );
}

export default ResultsDisplay;
