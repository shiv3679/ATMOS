from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import xarray as xr
import numpy as np
import matplotlib.pyplot as plt
import cartopy.crs as ccrs
import cartopy.feature as cfeature
import json

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Metric calculation functions
def calculate_mae(simulation_data, observation_data):
    """Calculate Mean Absolute Error."""
    mae = np.abs(simulation_data - observation_data)
    return mae

def calculate_rmse(simulation_data, observation_data):
    """Calculate Root Mean Square Error."""
    rmse = np.sqrt((simulation_data - observation_data) ** 2)
    return rmse

def validate_and_extract_dimensions(data, required_dims):
    """Validate and extract required dimensions from the dataset."""
    dims = data.dims
    missing_dims = [dim for dim in required_dims if dim not in dims]

    if missing_dims:
        raise ValueError(f"Missing dimensions: {', '.join(missing_dims)}")

    return dims

@app.route('/get-variables', methods=['POST'])
def get_variables():
    """Endpoint to get variable names from a NetCDF file."""
    uploaded_file = request.files.get('file')
    if not uploaded_file:
        return jsonify({'error': 'File is missing'}), 400

    file_path = os.path.join(app.config['UPLOAD_FOLDER'], uploaded_file.filename)
    uploaded_file.save(file_path)

    try:
        ds = xr.open_dataset(file_path)
        variables = list(ds.data_vars.keys())
        ds.close()
        os.remove(file_path)
        return jsonify({'variables': variables}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/evaluate', methods=['POST'])
def evaluate():
    """Endpoint to evaluate metrics and generate plots."""
    simulation_file = request.files.get('simulationFile')
    observation_file = request.files.get('observationFile')
    metrics = request.form.get('metrics')
    variable_name = request.form.get('variable')  # Selected variable
    calc_mode = request.form.get('calcMode')  # Spatial, Temporal, or Overall

    if not simulation_file or not observation_file or not metrics or not calc_mode:
        return jsonify({'error': 'Missing files or parameters'}), 400

    metrics = json.loads(metrics)
    calc_mode = calc_mode.lower()
    metric_functions = {
        'Mean Absolute Error (MAE)': calculate_mae,
        'Root Mean Square Error (RMSE)': calculate_rmse,
    }

    simulation_filepath = os.path.join(app.config['UPLOAD_FOLDER'], simulation_file.filename)
    observation_filepath = os.path.join(app.config['UPLOAD_FOLDER'], observation_file.filename)
    simulation_file.save(simulation_filepath)
    observation_file.save(observation_filepath)

    try:
        sim_ds = xr.open_dataset(simulation_filepath)
        obs_ds = xr.open_dataset(observation_filepath)

        if variable_name not in sim_ds.data_vars or variable_name not in obs_ds.data_vars:
            return jsonify({'error': f'Variable "{variable_name}" not found in files.'}), 400

        sim_data = sim_ds[variable_name]
        obs_data = obs_ds[variable_name]

        # Validate dimensions
        required_dims = ['lat', 'lon', 'time']
        try:
            validate_and_extract_dimensions(sim_data, required_dims)
            validate_and_extract_dimensions(obs_data, required_dims)
        except ValueError as e:
            return jsonify({'error': str(e)}), 400

        # Align datasets
        sim_data, obs_data = xr.align(sim_data, obs_data, join='inner')

        results = {}
        plot_urls = []

        if calc_mode == 'spatial':
            for metric in metrics:
                func = metric_functions.get(metric)
                if func:
                    try:
                        metric_data = func(sim_data, obs_data).mean(dim='time')
                        lat = metric_data.coords['lat'].values
                        lon = metric_data.coords['lon'].values
                        plot_filepath = os.path.join(app.config['UPLOAD_FOLDER'], f'spatial_{metric}.png')
                        plt.figure(figsize=(12, 8))
                        ax = plt.axes(projection=ccrs.PlateCarree())
                        mesh = ax.pcolormesh(
                            lon,
                            lat,
                            metric_data,
                            cmap='viridis',
                            transform=ccrs.PlateCarree(),
                        )
                        ax.add_feature(cfeature.LAND, edgecolor='black')
                        ax.add_feature(cfeature.COASTLINE)
                        plt.colorbar(mesh, ax=ax, orientation='vertical', label=metric)
                        plt.title(f'Spatial Plot for {metric}')
                        plt.savefig(plot_filepath, bbox_inches='tight')
                        plt.close()
                        plot_urls.append(f'/uploads/spatial_{metric}.png')
                        results[metric] = float(np.nanmean(metric_data))
                    except Exception as e:
                        results[metric] = f"Error calculating metric: {str(e)}"

        elif calc_mode == 'temporal':
            plt.figure(figsize=(12, 8))
            for metric in metrics:
                func = metric_functions.get(metric)
                if func:
                    try:
                        temporal_data = func(sim_data, obs_data).mean(dim=['lat', 'lon']).values
                        time = obs_ds.coords['time'].values
                        plt.plot(time, temporal_data, label=metric)
                        results[metric] = float(np.nanmean(temporal_data))
                    except Exception as e:
                        results[metric] = f"Error calculating metric: {str(e)}"
            plt.xlabel('Time')
            plt.ylabel('Metric Value')
            plt.title('Temporal Plot')
            plt.legend()
            plot_filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'temporal_plot.png')
            plt.grid()
            plt.savefig(plot_filepath, bbox_inches='tight')
            plt.close()
            plot_urls.append('/uploads/temporal_plot.png')

        else:  # Overall
            for metric in metrics:
                func = metric_functions.get(metric)
                if func:
                    try:
                        overall_result = float(func(sim_data, obs_data).mean())
                        results[metric] = overall_result
                    except Exception as e:
                        results[metric] = f"Error calculating metric: {str(e)}"

        sim_ds.close()
        obs_ds.close()

        return jsonify({
            'results': results,
            'plotUrls': plot_urls,
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/uploads/<filename>', methods=['GET'])
def serve_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True)
