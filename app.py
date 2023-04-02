from flask import Flask, render_template,request, jsonify
import numpy as np
from scipy.fft import fft, rfft
from scipy.fft import fftfreq, rfftfreq
from scipy.signal import find_peaks

app = Flask(__name__)

@app.route('/')
def Sampling_Studio():
    return render_template('main.html')

@app.route('/calculate-fft-max', methods=['POST'])
def calculate_fft_max():
    array = request.get_json()
    
    # fourier = fft(array)
    # N = len(array)
    # normalize = N/2
    # sampling_rate = 1000.0 # It's used as a sample spacing
    # frequency_axis = fftfreq(N, d=1.0/sampling_rate)
    # norm_amplitude = np.abs(fourier)/normalize
    
    # indices = np.where(norm_amplitude >= 1.0)
    # max_freq_index = indices[0][np.argmax(norm_amplitude[indices])]

    # max_frequency = frequency_axis[max_freq_index]
    # print(max_frequency)
    fft_signal = fft(array) # Perform the FFT on the signal
    freqs = np.fft.fftfreq(len(array),d=1/1000) # Get the corresponding frequency values
    abs_fft_signal = np.abs(freqs) # Get the absolute value of the FFT signal
    peaks, _ = find_peaks(abs_fft_signal) # Find the indices of the peaks
    print(freqs[peaks[len(peaks)-1]])
    max_frequency=1
    # max_freq_index = np.argmax(np.abs(fft_signal)) # Find the index of the highest amplitude component
    # # max_frequency = freqs[max_freq_index] # Get the frequency value of the highest amplitude component
    # max_frequency = np.max(freqs) # Get the frequency value of the highest amplitude component

    
    
    
    
    return jsonify({'fftMaxMagnitude': max_frequency})

if __name__ == '__main__':
    app.run(debug=True)