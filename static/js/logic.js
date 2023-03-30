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
    
    let step = (time.length)/time[time.length-2] / (samplingRate) ; /////////// sampling step equation
    ////////// (samples * sampling period )
    
    
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
        if(!isNaN(constructx[itr]))
        {
          let intrpolationComp =
          Math.PI * (constructx[itr] - itrS / Fs) * Fs;
          if(!isNaN(sampleY[itrS]))
          {
            interpolatedValue += sampleY[itrS] *
            (Math.sin(intrpolationComp) / intrpolationComp);
          }
        }
      }
      constructy.push(interpolatedValue);
    }





//console.log(constructy);
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
if (numberofcomponents==0){
Amplitude_1=[];
}
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
// function sincInterpolation(time, sampleY, Fs, newTime) {
//   // create a new array to store the reconstructed signal
//   let constructy = [];

//   // loop through the new time values and calculate the interpolated values
//   for (let i = 0; i < newTime.length; i++) {
//     let sum = 0;
//     for (let j = 0; j < sampleY.length; j++) {
//       let sincComp = (newTime[i] - time[j]) * Math.PI * Fs;
//       if (sincComp === 0) {
//         sum += sampleY[j];
//       } else {
//         sum += sampleY[j] * (Math.sin(sincComp) / sincComp);
//       }
//     }
//     constructy.push(sum);
//   }

//   return constructy;
// }
//////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////NOISE
var snrSlider = document.getElementById("noise");
var snrOutput = document.getElementById("snrOutput");
let SNR = snrSlider.value;

snrSlider.oninput = async function () {
  snrOutput.innerHTML  = snrSlider.value;
  
};
let noise_array=[];
snrSlider.addEventListener('mouseup',  () => {
noise_array=[];
let SNR =snrSlider.value;

//let copiedY = [...Amplitude_1];
      //we calculate the average of the square values of y (aka the power)
      var sum_power = 0;
      for (let itr = 0; itr < Amplitude_1.length; itr += 1) {

        if(!isNaN(Amplitude_1[itr])) //ignore Nans
        {
          let powerComponent = Math.pow(Amplitude_1[itr], 2);
        sum_power += powerComponent;
        }
        
      }

      //then we get the average of the power (divide by the number of values)
      let signal_power = Math.sqrt(sum_power / Amplitude_1.length);
      

      //we add a random noise component based on the SNR to the signal values
      for (let itr = 0; itr < Amplitude_1.length; itr += 1) {
        let noiseComponent = this.getNormalDistRand(0,signal_power / SNR);
        
        Amplitude_1[itr] =Amplitude_1[itr] + noiseComponent;
          noise_array.push(noiseComponent);
      }

      

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


});
/////////////////////////////////////////////////////////////
//////////////////DELETE
let deletenoise = document.getElementById("deletenoise");
deletenoise.onclick = async ()=>{
  let withoutnoise=[];
for(let purecounter=0;purecounter<Amplitude_1.length;purecounter++){
  withoutnoise.push(0);///initialise array
}
var keys=Object.keys(components_list);
//console.log(components_list[keys[0]]);
for (let sig_compo=0;sig_compo<keys.length;sig_compo++){
  for (let i =0;i<Amplitude_1.length;i++){
    withoutnoise[i]=withoutnoise[i]+components_list[keys[sig_compo]].y[i];
  
}
}
//console.log(withoutnoise);
Amplitude_1=withoutnoise;
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
//For generating a gaussian distributed variable
function boxMullerTransform() {
  const u1 = Math.random();
  const u2 = Math.random();

  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);

  return { z0, z1 };
  // return z0;
}
function getNormalDistRand(mean, stddev) {
  const { z0, _ } = boxMullerTransform();
  return z0 * stddev + mean;
}




















///////////////////////////////////////////////////////////////Saving 
////////////////////////////////////////////////////////////////////////////////////////
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
