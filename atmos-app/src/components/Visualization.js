// src/components/Visualization.js

import React from 'react';
import Plot from 'react-plotly.js';

function Visualization({ results, observationData }) {
  if (!results || !observationData) {
    return null;
  }

  const { lat, lon, values } = observationData;

  // Flatten the values and create matching lat/lon arrays
  const flatValues = values.flat();
  const latArray = [];
  const lonArray = [];

  for (let i = 0; i < lat.length; i++) {
    for (let j = 0; j < lon.length; j++) {
      latArray.push(lat[i]);
      lonArray.push(lon[j]);
    }
  }

  // Plotly data for the observation plot
  const data = [
    {
      type: 'scattergeo',
      mode: 'markers',
      lat: latArray,
      lon: lonArray,
      marker: {
        size: 2,
        color: flatValues,
        colorscale: 'Viridis',
        colorbar: {
          title: 'Temperature (K)',
        },
      },
    },
  ];

  const layout = {
    title: 'Observation Data',
    geo: {
      projection: {
        type: 'natural earth',
      },
      showland: true,
      landcolor: 'rgb(217, 217, 217)',
      showocean: true,
      oceancolor: 'rgb(204, 224, 255)',
      showcountries: true,
      countrycolor: 'rgb(255, 255, 255)',
      showsubunits: true,
      subunitcolor: 'rgb(255, 255, 255)',
    },
    width: 800,
    height: 600,
  };

  return (
    <div className="mb-8 mt-8">
      {/* Display evaluation results */}
      <h2 className="text-2xl font-semibold mb-4">Evaluation Results</h2>
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
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Observation Data Plot</h2>
        <Plot data={data} layout={layout} />
      </div>
    </div>
  );
}

export default Visualization;
