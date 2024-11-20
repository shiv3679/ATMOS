# backend/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np
import xarray as xr
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Create an uploads directory if it doesn't exist
UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def calculate_mae(simulation_data, observation_data):
    mae = np.mean(np.abs(simulation_data - observation_data))
    return mae

def calculate_rmse(simulation_data, observation_data):
    rmse = np.sqrt(np.mean((simulation_data - observation_data) ** 2))
    return rmse

# Add more metric functions as needed

@app.route('/evaluate', methods=['POST'])
def evaluate():
    # Get files from request
    simulation_file = request.files.get('simulationFile')
    observation_file = request.files.get('observationFile')
    metrics = request.form.get('metrics')
    variable_name = request.form.get('variable')  # If variable selection is implemented

    # Debug statements
    print(f"Received simulation_file: {simulation_file}")
    print(f"Received observation_file: {observation_file}")
    print(f"Received metrics: {metrics}")
    print(f"Received variable_name: {variable_name}")

    if not simulation_file or not observation_file or not metrics:
        print("One or more required fields are missing.")
        return jsonify({'error': 'Missing files or metrics'}), 400

    # Parse metrics safely
    metrics = json.loads(metrics)
    # List of allowed metrics
    allowed_metrics = ['Mean Absolute Error (MAE)', 'Root Mean Square Error (RMSE)']
    metric_functions = {
        'Mean Absolute Error (MAE)': calculate_mae,
        'Root Mean Square Error (RMSE)': calculate_rmse,
        # Add more mappings as you implement more metrics
    }

    # Save the uploaded files
    simulation_filepath = os.path.join(app.config['UPLOAD_FOLDER'], simulation_file.filename)
    observation_filepath = os.path.join(app.config['UPLOAD_FOLDER'], observation_file.filename)
    simulation_file.save(simulation_filepath)
    observation_file.save(observation_filepath)

    try:
        # Open the NetCDF files using xarray
        sim_ds = xr.open_dataset(simulation_filepath)
        obs_ds = xr.open_dataset(observation_filepath)

        # Use the selected variable or default to the first variable
        if not variable_name:
            variable_name = list(sim_ds.data_vars.keys())[0]

        sim_data = sim_ds[variable_name]
        obs_data = obs_ds[variable_name]

        # Align the datasets on their coordinates
        sim_data, obs_data = xr.align(sim_data, obs_data, join='inner')

        # Extract spatial coordinates (adjust coordinate names as needed)
        lat = obs_data.coords['latitude'].values if 'latitude' in obs_data.coords else \
              obs_data.coords['lat'].values if 'lat' in obs_data.coords else None
        lon = obs_data.coords['longitude'].values if 'longitude' in obs_data.coords else \
              obs_data.coords['lon'].values if 'lon' in obs_data.coords else None

        if lat is None or lon is None:
            return jsonify({'error': 'Latitude and longitude coordinates not found in the data.'}), 400

        # Convert data to lists for JSON serialization
        obs_values = obs_data.values.tolist()

        # Calculate metrics
        results = {}
        for metric in metrics:
            func = metric_functions.get(metric)
            if func:
                sim_values = sim_data.values.flatten()
                obs_values_flat = obs_data.values.flatten()
                # Remove NaNs
                mask = ~np.isnan(sim_values) & ~np.isnan(obs_values_flat)
                sim_values_clean = sim_values[mask]
                obs_values_clean = obs_values_flat[mask]
                result = func(sim_values_clean, obs_values_clean)
                results[metric] = round(float(result), 4)
            else:
                results[metric] = 'Metric not implemented'

        # Prepare data to send to frontend
        data = {
            'results': results,
            'observationData': {
                'lat': lat.tolist(),
                'lon': lon.tolist(),
                'values': obs_values,
            },
        }

        # Clean up
        sim_ds.close()
        obs_ds.close()
        os.remove(simulation_filepath)
        os.remove(observation_filepath)

        return jsonify(data), 200

    except Exception as e:
        print(f"Error during evaluation: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
