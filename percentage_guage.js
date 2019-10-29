
// set global width and heights to use for our svgs - you can choose not to use these and specify custom values
var width_guage = document.getElementById("content_size").offsetWidth / 4

var height_guage = width_guage;
var padding = 5;

// Bring data in
var request = new XMLHttpRequest();
request.open("GET", 'level_2_risk_explained_burden_2017_west_sussex.json', false);
request.send(null);

var explained_burden = JSON.parse(request.responseText);

var svg_attributed = d3.select("#fillgauge1")
.append("svg")
.attr("width", width_guage)
.attr("height", height_guage)
.append("g");

var gauge1 = loadLiquidFillGauge("fillgauge1", 55);

var config1 = liquidFillGaugeDefaultSettings();
   config1.circleColor = "#FF7777";
     config1.textColor = "#FF4444";
     config1.waveTextColor = "#FFAAAA";
     config1.waveColor = "#FFDDDD";
     config1.circleThickness = 0.2;
     config1.textVertPosition = 0.2;
     config1.waveAnimateTime = 1000;


// try https://codepen.io/herudea/pen/YpEeRW
