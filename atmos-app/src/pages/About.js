import React from 'react';

function About() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-8">About This Project</h1>
      <div className="text-lg text-gray-700 space-y-6">
        <p>
          The <span className="font-semibold text-blue-600">NWP Model Evaluation Tool</span> is a state-of-the-art web application designed to facilitate the evaluation and analysis of numerical weather prediction (NWP) models.
        </p>
        <p>
          This tool allows researchers and professionals in the field of climate science to compare simulation data with observational datasets. Users can upload NetCDF files, calculate key metrics such as{' '}
          <span className="font-semibold">Mean Absolute Error (MAE)</span> and{' '}
          <span className="font-semibold">Root Mean Square Error (RMSE)</span>, and visualize results through spatial and temporal plots.
        </p>
        <p>
          The project is tailored to provide:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>Easy-to-use interface for uploading and selecting datasets.</li>
          <li>Dynamic metric calculation for comparing simulation and observation data.</li>
          <li>Interactive visualizations to explore spatial and temporal variations.</li>
        </ul>
        <p>
          Built with modern web technologies, this application aims to bridge the gap between data and actionable insights in the field of weather prediction and climate modeling.
        </p>
        <p>
          <span className="font-semibold text-blue-600">Our Mission:</span> To empower researchers with intuitive tools for evaluating and improving weather prediction models.
        </p>
      </div>
    </div>
  );
}

export default About;
