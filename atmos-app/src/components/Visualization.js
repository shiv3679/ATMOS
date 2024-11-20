// src/components/Visualization.js

import React from 'react';
import Plot from 'react-plotly.js';

function Visualization({ results, observationData }) {
  return (
    <div className="mb-8 mt-8">
      <h2 className="text-2xl font-semibold mb-4">Evaluation Results</h2>
      {/* Display results in a table */}
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 bg-blue-600 text-white">Metric</th>
            <th className="py-2 px-4 bg-blue-600 text-white">Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(results).map(([metric, value]) => (
            <tr key={metric}>
              <td className="border px-4 py-2">{metric}</td>
              <td className="border px-4 py-2">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Plot the observation data */}
      {observationData && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Observation Data Plot</h2>
          <Plot
            data={[
              {
                x: observationData.lon,
                y: observationData.lat,
                z: observationData.values,
                type: 'heatmap',
                colorscale: 'Viridis',
              },
            ]}
            layout={{
              width: 700,
              height: 500,
              title: 'Observation Data Heatmap',
              xaxis: { title: 'Longitude' },
              yaxis: { title: 'Latitude' },
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Visualization;
