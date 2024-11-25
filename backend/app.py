from flask import Flask, request, jsonify, send_from_directory
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

        if not variable_name:
            variable_name = list(sim_ds.data_vars.keys())[0]

        sim_data = sim_ds[variable_name]
        obs_data = obs_ds[variable_name]

        sim_data, obs_data = xr.align(sim_data, obs_data, join='inner')

        results = {}
        plot_urls = []

        if calc_mode == 'spatial':
            for metric in metrics:
                func = metric_functions.get(metric)
                if func:
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
                    results[metric] = metric_data.values.tolist()

        elif calc_mode == 'temporal':
            plt.figure(figsize=(12, 8))
            for metric in metrics:
                func = metric_functions.get(metric)
                if func:
                    temporal_data = func(sim_data, obs_data).mean(dim=['lat', 'lon']).values
                    time = obs_ds.coords['time'].values
                    plt.plot(time, temporal_data, label=metric)
                    results[metric] = temporal_data.tolist()
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
                    result = func(sim_data, obs_data).mean().values
                    results[metric] = result.tolist() if isinstance(result, np.ndarray) else float(result)

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
