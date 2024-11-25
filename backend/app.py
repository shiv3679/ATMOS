from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import os
import numpy as np
import xarray as xr
import matplotlib.pyplot as plt
import cartopy.crs as ccrs
import cartopy.feature as cfeature
import json

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def calculate_mae(simulation_data, observation_data):
    mae = np.abs(simulation_data - observation_data)
    return mae

def calculate_rmse(simulation_data, observation_data):
    rmse = np.sqrt((simulation_data - observation_data) ** 2)
    return rmse

@app.route('/evaluate', methods=['POST'])
def evaluate():
    simulation_file = request.files.get('simulationFile')
    observation_file = request.files.get('observationFile')
    metrics = request.form.get('metrics')
    variable_name = request.form.get('variable')
    calc_mode = request.form.get('calcMode')  # Spatial, Temporal, or Overall

    if not simulation_file or not observation_file or not metrics or not calc_mode:
        return jsonify({'error': 'Missing files or parameters'}), 400

    metrics = json.loads(metrics)
    calc_mode = calc_mode.lower()  # Convert to lowercase for easier handling
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

        if not variable_name:
            variable_name = list(sim_ds.data_vars.keys())[0]

        sim_data = sim_ds[variable_name]
        obs_data = obs_ds[variable_name]

        sim_data, obs_data = xr.align(sim_data, obs_data, join='inner')

        # Calculate metrics
        results = {}
        for metric in metrics:
            func = metric_functions.get(metric)
            if not func:
                results[metric] = 'Metric not implemented'
                continue

            if calc_mode == 'spatial':
                result = func(sim_data, obs_data).mean(dim='time').values
            elif calc_mode == 'temporal':
                result = func(sim_data, obs_data).mean(dim=['lat', 'lon']).values
            else:  # Overall
                result = func(sim_data, obs_data).mean().values

            results[metric] = result.tolist() if isinstance(result, np.ndarray) else float(result)

        # Generate plot based on calculation mode
        plot_filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'metric_plot.png')
        if calc_mode == 'spatial':
            # Spatial plot at t=0
            spatial_data = obs_data.isel(time=0).squeeze()
            lat = spatial_data.coords['lat'].values
            lon = spatial_data.coords['lon'].values

            plt.figure(figsize=(12, 8))
            ax = plt.axes(projection=ccrs.PlateCarree())
            mesh = ax.pcolormesh(lon, lat, spatial_data, cmap='viridis', transform=ccrs.PlateCarree())
            ax.add_feature(cfeature.LAND, edgecolor='black')
            ax.add_feature(cfeature.COASTLINE)
            plt.colorbar(mesh, ax=ax, orientation='vertical', label='Value')
            plt.title(f'Spatial Plot for {variable_name} at t=0')
        elif calc_mode == 'temporal':
            # Temporal plot (mean over spatial dimensions)
            temporal_data = obs_data.mean(dim=['lat', 'lon']).values
            time = obs_data.coords['time'].values

            plt.figure(figsize=(12, 8))
            plt.plot(time, temporal_data, label=f'{variable_name}')
            plt.xlabel('Time')
            plt.ylabel('Value')
            plt.title(f'Temporal Plot for {variable_name}')
            plt.grid()
            plt.legend()
        else:  # Overall
            # Placeholder for overall summary or heatmap
            overall_data = obs_data.mean(dim='time').squeeze()
            lat = overall_data.coords['lat'].values
            lon = overall_data.coords['lon'].values

            plt.figure(figsize=(12, 8))
            ax = plt.axes(projection=ccrs.PlateCarree())
            mesh = ax.pcolormesh(lon, lat, overall_data, cmap='viridis', transform=ccrs.PlateCarree())
            ax.add_feature(cfeature.LAND, edgecolor='black')
            ax.add_feature(cfeature.COASTLINE)
            plt.colorbar(mesh, ax=ax, orientation='vertical', label='Value')
            plt.title(f'Overall Spatial Plot for {variable_name}')

        plt.savefig(plot_filepath, bbox_inches='tight')
        plt.close()

        sim_ds.close()
        obs_ds.close()

        return jsonify({
            'results': results,
            'plotUrl': '/uploads/metric_plot.png'
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/uploads/<filename>', methods=['GET'])
def serve_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True)
