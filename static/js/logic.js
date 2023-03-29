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
let components_list={};
let numberofcomponents=0;
let fmax;
let amplitudeofsig;
let time=[];
let Amplitude_1=[];
let timeofsig=5;                       
let stepofsig=0.001;
let addedsignals=0;
let originalsignal={amplitude:0,freq:0,x:[],y:[],name:"main_signal"};
//var component={amplitude:0,freq:0,x:[],y:[],name:"freq="+0+",amp="+0};

let samplingflag =false;
let copytime=[];let copyamp=[];
/////DROPDOWN MENU
let signalsMenu = document.getElementById("addedcomponents");
signalsMenu.options.length = 0;
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
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
if (numberofcomponents>0){Plotly.deleteTraces(plotDiv, 0);}
// Initialize arrays for the x and y values
if (samplingflag) {Plotly.deleteTraces(plotDiv, 1);
}
if (addedsignals>0){
 // time=[];
 // Amplitude_1=[];
  copyamp=[];
  copytime=[];
  numberofcomponents=numberofcomponents-1;
  if (numberofcomponents==-1){numberofcomponents=0;}
  signalsMenu.options.length = 0;

}
// Loop through the lines and split each line into columns
for (let i = 0; i < lines.length; i++) {
    const columns = lines[i].split(',');

    // Store the column values in their respective arrays
    //time.push(parseFloat(columns[0]));
    //Amplitude_1.push(parseFloat(columns[1]));
    /////////other naming for signals that are put after components
   copytime.push(parseFloat(columns[0]));
   copyamp.push(parseFloat(columns[1]));
}

// Create a new trace for the signal data
if (numberofcomponents==0){
  time=[...copytime];
  Amplitude_1=[...copyamp];
const trace = {
    x: time,
    y: Amplitude_1,
    name:"original",
    type: 'scatter',
    mode: 'lines',
    line: {
        color: 'blue'
    },
};
    let option = document.createElement("option");
    option.text = `Signal${numberofcomponents}  imported Signal`;
    option.value = `${originalsignal["name"]}`;
    signalsMenu.appendChild(option);
// Update the plot with the new trace
Plotly.newPlot(plotDiv, [trace], layout, config);
addedsignals=addedsignals+1;
originalsignal.x=[...time];
originalsignal.y=[...Amplitude_1];
components_list[originalsignal["name"]]=originalsignal;
numberofcomponents=numberofcomponents+1;

}
else {
  
  addedsignals=addedsignals+1;
originalsignal['x']=[...copytime];
originalsignal['y']=[...copyamp];
components_list[originalsignal["name"]]=originalsignal;
let option = document.createElement("option");
    option.text = `Signal${numberofcomponents}  imported Signal`;
    option.value = `${originalsignal["name"]}`;
    signalsMenu.appendChild(option);
numberofcomponents=numberofcomponents+1;
  for (let i=0;i<5000;i+=1){
    Amplitude_1[i]=Amplitude_1[i]+originalsignal['y'][i];
    }
const trace={
  x: time,
  y: Amplitude_1,name:"original",
  type: 'scatter',
  mode: 'lines',
  line: {
      color: 'blue'
  },
};
//Plotly.deleteTraces(plotDiv, 0);
Plotly.newPlot(plotDiv, [trace], layout, config);

}
}
// Read the file as text

reader.readAsText(file);
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//sampling 

var SRSLider = document.getElementById("sampling");
var SROutput = document.getElementById("SROutput");
SROutput.innerHTML = SRSLider.value;
SROutput.innerHTML = SRSLider.value + " Hz";
///showing sampling rate
SRSLider.oninput = () => {
    SROutput.innerHTML = SRSLider.value + " Hz";
  };
/////////actually sampling 
let sampleX = [];
let sampleY = [];
let constructx=[];
let constructy=[];
SRSLider.addEventListener("mouseup", async function () {
    let samplingRate = SRSLider.value;
    sampleX = [];
    sampleY = [];
    let step = (time.length)/time[time.length-1] / (samplingRate) ; /////////// sampling step equation
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
    Plotly.addTraces(plotDiv, {x: sampleX,y: sampleY,  type: 'scatter',name:"sampled points", mode: 'markers',});
    samplingflag=true;}
    else {
      Plotly.deleteTraces(plotDiv, 1);
      Plotly.addTraces(plotDiv, {x: sampleX,y: sampleY,  type: 'scatter',name:"sampled points", mode: 'markers',});

    }
//////////////////////RECONSTRUCTION
// Resample using sinc interpolation
constructx=[...time];
constructy=[];
//constructy=sincInterpolation(time,sampleY,samplingRate,constructx);
let Fs = samplingRate;
    //calculating the reconstructed signal using sinc interpolation
    for (let itr = 0; itr < time.length; itr += 1) {
      let interpolatedValue = 0;
      for (let itrS = 0; itrS < sampleY.length; itrS += 1) {
        let intrpolationComp =
         Math.PI * (constructx[itr] - itrS / Fs) * Fs;
        interpolatedValue +=
          sampleY[itrS] *
          (Math.sin(intrpolationComp) / intrpolationComp);
      }
      constructy.push(interpolatedValue);
    }




console.log(constructy);
const trace = {
  x: constructx,
  y: constructy,
  type: 'scatter',
  mode: 'lines',
  line: {
    color: 'blue'
  },
  name: 'Resampled Signal'
};
Plotly.newPlot(plotDiv2, [trace]);
  });

  
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
freqSlider.oninput = ()=> {
  freqOutput.innerHTML = freqSlider.value + " Hz";
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////generate signal func
//let component={amplitude:0,freq:0, x :[],y :[],name:"freq="+0+",amp="+0};
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
    var component = {};
component["amplitude"]=amp;
component["freq"]=f;
component["x"]=[...xdata];
component["y"]=ydata;
component["name"]="freq="+f+",amp="+amp;
    components_list[ component["name"] ]=component;
    let option = document.createElement("option");
    option.text = `Signal${numberofcomponents}  ${component["name"]}`;
    option.value = `${component["name"]}`;
    signalsMenu.appendChild(option);

    
    return component;
  }

mixSignalbtn.onclick =async () => {
  generatedsignal =generate(ampSlider.value,freqSlider.value);
  if (samplingflag)
{Plotly.deleteTraces(plotDiv, 1);samplingflag=false;}
  if (numberofcomponents==0)
  {
    time=[...generatedsignal.x];
    Amplitude_1=[...generatedsignal.y];
    numberofcomponents=numberofcomponents+1;

    
  }
  else {
for (let i=0;i<5000;i+=1){
Amplitude_1[i]=Amplitude_1[i]+generatedsignal['y'][i];
}
numberofcomponents=numberofcomponents+1;

  }

    const trace = {
        x: time,
        y: Amplitude_1,
        type: 'scatter',name:"original",
        mode: 'lines',
        line: {
            color: 'blue'
        },
    };
    if(numberofcomponents>1)
    {Plotly.deleteTraces(plotDiv, 0);}
    
    // Update the plot with the new trace
    Plotly.newPlot(plotDiv, [trace], layout, config);
    }
////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////DELETE SECTION

let deleteBtn = document.getElementById("delete");


deleteBtn.onclick = async ()=>{
if (samplingflag)
{Plotly.deleteTraces(plotDiv, 1);samplingflag=false;}
let deletedcomponent=signalsMenu.value;
for (let i=0;i<5000;i+=1){

Amplitude_1[i]=Amplitude_1[i]-components_list[deletedcomponent].y[i];
}
delete components_list[deletedcomponent];
numberofcomponents=numberofcomponents-1;
if (deletedcomponent=="main_signal"){addedsignals==addedsignals-1;}
signalsMenu.remove(signalsMenu.selectedIndex);
Plotly.deleteTraces(plotDiv, 0);
const trace = {
  x: time,
  y: Amplitude_1,name:"original",
  type: 'scatter',
  mode: 'lines',
  line: {
      color: 'blue'
  },
};
Plotly.newPlot(plotDiv, [trace], layout, config);

}
function sincInterpolation(time, sampleY, Fs, newTime) {
  // create a new array to store the reconstructed signal
  let constructy = [];

  // loop through the new time values and calculate the interpolated values
  for (let i = 0; i < newTime.length; i++) {
    let sum = 0;
    for (let j = 0; j < sampleY.length; j++) {
      let sincComp = (newTime[i] - time[j]) * Math.PI * Fs;
      if (sincComp === 0) {
        sum += sampleY[j];
      } else {
        sum += sampleY[j] * (Math.sin(sincComp) / sincComp);
      }
    }
    constructy.push(sum);
  }

  return constructy;
}
/////////////////////////////////Saving 
let saveBtn = document.getElementById("save");
function saveCSV(x, y) {
  let csvData = [];
  for (let i = 0; i < x.length; i += 1) {
    csvData.push([x[i], y[i]]);
  }
  return csvData;
}
let downloadLink = document.getElementById("download");
saveBtn.onclick = () => {
  let csvData = [];
  
    csvData = saveCSV(time, Amplitude_1);
  
  let csv = "time,amplitude\n";
  //merge the data with CSV
  csvData.forEach(function (row) {
    csv += row.join(",");
    csv += "\n";
  });
  //display the created CSV data on the web browser
  downloadLink.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
  //provide the name for the CSV file to be downloaded
  downloadLink.download = "Signal.csv";
};
