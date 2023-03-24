//import FFT from 'fft.js';

const layout = { title: 'Original Signal', yaxis: { title: 'Amplitude', fixedrange: true }, xaxis: { title: 'Frequency', fixedrange: true, rangemode: 'tozero'}, width : 1000 }; // fixedrange -> No pan when there is no signal
const plotDiv = document.getElementById('graph1');
const config = {
    displayModeBar: false, //disable plotlytool bar when there is no signal
}
Plotly.newPlot(plotDiv, [], layout, config);



const layout2 = { title: 'Reconstructed Signal', yaxis: { title: 'y', fixedrange: true }, xaxis: { title: 'x', fixedrange: true, rangemode: 'tozero'}, width : 1000 }; // fixedrange -> No pan when there is no signal
const plotDiv2 = document.getElementById('graph2');
const config2 = {
    displayModeBar: false, //disable plotlytool bar when there is no signal
}
Plotly.newPlot(plotDiv2, [], layout2, config2);

const layout3 = { title: 'Difference between Original and reconstructed', yaxis: { title: 'y', fixedrange: true }, xaxis: { title: 'x', fixedrange: true, rangemode: 'tozero'}, width : 1000 }; // fixedrange -> No pan when there is no signal
const plotDiv3 = document.getElementById('graph3');
const config3 = {
    displayModeBar: false, //disable plotlytool bar when there is no signal
}
Plotly.newPlot(plotDiv3, [], layout3, config3);




/////////////////////variables for signal parameters
let fmax;
let amplitudeofsig;
let time=[];
let Amplitude_1=[];
let timeofsig=5;
let stepofsig=0.001;
let addedsignals=0;

let samplingflag =false;
function importSignal() {
// Get the selected file
const fileInput = document.getElementById('sig');
const file = fileInput.files[0];

// Create a new FileReader object
const reader = new FileReader();

// Define a callback function to handle the file data
reader.onload = (event) => {
// Get the file data as a string
const fileData = event.target.result;

// Split the string into lines
const lines = fileData.split(/\r?\n/);

// Initialize arrays for the x and y values


// Loop through the lines and split each line into columns
for (let i = 0; i < lines.length; i++) {
    const columns = lines[i].split(',');

    // Store the column values in their respective arrays
    time.push(parseFloat(columns[0]));
    Amplitude_1.push(parseFloat(columns[1]));
}

// Create a new trace for the signal data
if (addedsignals==0){
const trace = {
    x: time,
    y: Amplitude_1,
    type: 'scatter',
    mode: 'lines',
    line: {
        color: 'blue'
    },
};

// Update the plot with the new trace
Plotly.newPlot(plotDiv, [trace], layout, config);
addedsignals=addedsignals+1;
}
}
// Read the file as text

reader.readAsText(file);
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//sampling 

var SRSLider = document.getElementById("sampling");
var SROutput = document.getElementById("SROutput");
SROutput.innerHTML = SRSLider.value;
SROutput.innerHTML = SRSLider.value + " fmax";
///showing sampling rate
SRSLider.oninput = () => {
    SROutput.innerHTML = SRSLider.value + " fmax";
  };
/////////actually sampling 
SRSLider.addEventListener("mouseup", async function () {
    calc_fmax_via_fft();
    let samplingRate = SRSLider.value*fmax;
    let sampleX = [];
    let sampleY = [];
    let step = (time.length) / (samplingRate) ; /////////// sampling step equation
    ////////// (samples * sampling period )
    //console.log(step);
    let index

    for (let i = 0; i < time.length; i += step) {
      index = Math.round(i) //saving x and y coordinates to demonstrate the samples
      sampleX.push(time[index]);
      sampleY.push(Amplitude_1[index]);
    }
    //console.log(sampleX.length);
    if (!samplingflag){
    Plotly.addTraces(plotDiv, {x: sampleX,y: sampleY,  type: 'scatter', mode: 'markers',});}
    else{
        
    }
  });


  function calc_fmax_via_fft(){
    // Calculate the spectrum using FFT algorithm
    const fft = new FFT(Amplitude_1.length);
    const spectrum = fft.createComplexArray(); // Create a complex array for the spectrum
    fft.realTransform(spectrum, Amplitude_1);
  // Calculate the corresponding frequencies for the spectrum
  const sampleRate = 1 / time[1]; // Assumes evenly spaced samples
  const frequencies = Array.from({ length: spectrum.length }, (v, i) => i * sampleRate / spectrum.length);

  return { frequencies, spectrum };

  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///Signal mixing
var ampSlider = document.getElementById("Amplitude");
var ampOutput = document.getElementById("ampOutput");
var freqSlider = document.getElementById("maxfreq");
var freqOutput = document.getElementById("freqOutput");
let addSignalBtn = document.getElementById("mixSignalbtn");
ampOutput.innerHTML = ampSlider.value;
freqOutput.innerHTML = freqSlider.value;
ampOutput.innerHTML = ampSlider.value + " mV";
freqOutput.innerHTML = freqSlider.value + " Hz";
ampSlider.oninput = () => {
  ampOutput.innerHTML = ampSlider.value + " mV";
};
freqSlider.oninput = () => {
  freqOutput.innerHTML = freqSlider.value + " Hz";
};


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////generate signal func
  function generate(amp, f, times =timeofsig, step = stepofsig) {
    const exp = "amp * Math.sin(2*pi*x*f)";
    const pi = Math.PI;
    fmax = f;
    amplitudeofsig= amp;
    
    let xdata = [];
    let ydata = [];
    for (let x = 0; x <= times; x += step) {
      xdata.push(x);
      ydata.push(eval(exp));
    }
    
    if (addedsignals==0){
    time =[...xdata];
    Amplitude_1=[...ydata];
    }
   
  }

mixSignalbtn.onclick =async () => {
  if (addedsignals==0){
  generate(ampSlider.value,freqSlider.value);
  

    const trace = {
        x: time,
        y: Amplitude_1,
        type: 'scatter',
        mode: 'lines',
        line: {
            color: 'blue'
        },
    };
    
    // Update the plot with the new trace
    Plotly.newPlot(plotDiv, [trace], layout, config);
    addedsignals=addedsignals+1;
    }
}