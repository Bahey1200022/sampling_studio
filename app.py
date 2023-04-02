from flask import Flask, render_template,request, jsonify
import numpy as np
from scipy.fft import fft, rfft
from scipy.fft import fftfreq, rfftfreq

app = Flask(__name__)

@app.route('/')
def Sampling_Studio():
    return render_template('main.html')

@app.route('/calculate-fft-max', methods=['POST'])
def calculate_fft_max():
    array = request.get_json()
    # fft = np.fft.fft(array)
# Get the magnitudes of the FFT coefficients
    # fft_magnitudes = np.abs(fft)

    # # Get the frequencies corresponding to the FFT coefficients
    # sampling_rate = 1000  # This is the number of samples per second
    # frequencies = np.fft.fftfreq(len(fft_magnitudes), 1 / sampling_rate)

    # # Get the index of the maximum magnitude of the FFT coefficients
    # max_magnitude_index = np.argmax(fft_magnitudes)

    # # Get the frequency corresponding to the maximum magnitude
    # max_frequency = frequencies[max_magnitude_index]
    fourier = fft(array)
    N = len(array)
    normalize = N/2
    sampling_rate = 1000.0 # It's used as a sample spacing
    frequency_axis = fftfreq(N, d=1.0/sampling_rate)
    norm_amplitude = np.abs(fourier)/normalize
    
    indices = np.where(norm_amplitude >= 1.0)
    max_freq_index = indices[0][np.argmax(norm_amplitude[indices])]

    max_frequency = frequency_axis[max_freq_index]
    print(max_frequency)


    
    
    
    
    return jsonify({'fftMaxMagnitude': max_frequency})

if __name__ == '__main__':
    app.run(debug=True)