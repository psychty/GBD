var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .rangeRound([height, 0]);

var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));

var svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var active_link = "0"; //to control legend selections and hover
var legendClassArray = []; //store legend classes to select bars in plotSingle()
var y_orig; //to store original y-posn

var request = new XMLHttpRequest();
  request.open("GET", "./test_stack_data.json", false);
  request.send(null);
  var data = JSON.parse(request.responseText); // parse the fetched json data into a variable

color
.domain(d3.keys(data[0]).filter(function(key) { return key !== "State"; }));

data.forEach(function(d) {
    var mystate = d.State; //add to stock code
    var y0 = 0;
    d.ages = color.domain().map(function(name) { return {mystate:mystate, name: name, y0: y0, y1: y0 += +d[name]}; });
    d.total = d.ages[d.ages.length - 1].y1;
  });

data
.sort(function(a, b) { return b.total - a.total; });

x
.domain(data.map(function(d) { return d.State; }));

y
.domain([0, d3.max(data, function(d) { return d.total; })]);

svg
.append("g")
.attr("class", "x axis")
.attr("transform", "translate(0," + height + ")")
.call(xAxis);

svg
.append("g")
.attr("class", "y axis")
.call(yAxis)
.append("text")
.attr("transform", "rotate(-90)")
.attr("y", 6)
.attr("dy", ".71em")
.style("text-anchor", "end")
.text("Population");

// function for tooltip
var stack_mo_tooltip = function(d){

var delta = d.y1 - d.y0;
var xPos = parseFloat(d3.select(this).attr("x"));
var yPos = parseFloat(d3.select(this).attr("y"));
var height = parseFloat(d3.select(this).attr("height"))

d3.select(this).attr("stroke","blue").attr("stroke-width",0.8);

svg
.append("text")
.attr("x",xPos)
.attr("y",yPos +height/2)
.attr("class","tooltip")
.text(d.name +": "+ d3.format(',.0f')(delta) + ' kittens');

   }

var stack_mo_tooltip_out = function(){
svg
 .select(".tooltip").remove();
  d3.select(this).attr("stroke","none").attr("stroke-width",0);
  }

var highlight_selection = function(d){
if (active_link === "0") { //nothing selected, turn on this selection
    d3.select(this)
.style("stroke", "black")
.style("stroke-width", 2);

active_link = this.id.split("id").pop();
plotSingle(this);

for (i = 0; i < legendClassArray.length; i++) {
if (legendClassArray[i] != active_link) {
  d3.select("#id" + legendClassArray[i])
  .style("opacity", 0.5);
  }
  }

  } else { //deactivate
if (active_link === this.id.split("id").pop()) {//active square selected; turn it OFF
      d3.select(this)
  .style("stroke", "none");

active_link = "0"; //reset

//restore remaining boxes to normal opacity
for (i = 0; i < legendClassArray.length; i++) {
  d3.select("#id" + legendClassArray[i])
  .style("opacity", 1);
  }

//restore plot to original
restorePlot(d);
  }
  }

  }

//restore shifted bars to original position and restore opacity of other bars
var restorePlot = function(d) {
state.selectAll("rect").forEach(function (d, i) {

d3.select(d[idx])
  .transition()
  .duration(1000)
  .attr("y", y_orig[i]);
  })

for (i = 0; i < legendClassArray.length; i++) {
  if (legendClassArray[i] != class_keep) {
d3.selectAll(".class" + legendClassArray[i])
  .transition()
  .duration(1000)
  .delay(750)
  .style("opacity", 1);
      }
    }
  }

var plotSingle = function(d) {

class_keep = d.id.split("id").pop();
idx = legendClassArray.indexOf(class_keep);

//erase all but selected bars by setting opacity to 0
for (i = 0; i < legendClassArray.length; i++) {
  if (legendClassArray[i] != class_keep) {
d3.selectAll(".class" + legendClassArray[i])
  .transition()
  .duration(1000)
  .style("opacity", 0);
  }
  }

//lower the bars to start on x-axis
y_orig = [];
state.selectAll("rect").forEach(function (d, i) {

//get height and y position of base bar and selected bar
h_keep = d3.select(d[idx]).attr("height");
y_keep = d3.select(d[idx]).attr("y");
      //store y_base in array to restore plot
y_orig.push(y_keep);

h_base = d3.select(d[0]).attr("height");
y_base = d3.select(d[0]).attr("y");

h_shift = h_keep - h_base;
y_new = y_base - h_shift;

//reposition selected bars
d3.select(d[idx])
  .transition()
  .ease("bounce")
  .duration(1000)
  .delay(750)
  .attr("y", y_new);

  })
  }

  // Do the plotting

var state = svg.selectAll(".state")
.data(data)
.enter()
.append("g")
.attr("class", "g")
.attr("transform", function(d) { return "translate(" + "0" + ",0)"; });

state
.selectAll("rect")
.data(function(d) {
      return d.ages;
    })
.enter()
.append("rect")
.attr("width", x.rangeBand())
.attr("y", function(d) {
  return y(d.y1); })
.attr("x",function(d) { //add to stock code
  return x(d.mystate); })
.attr("height", function(d) { return y(d.y0) - y(d.y1); })
.attr("class", function(d) {
  classLabel = d.name.replace(/\s/g, ''); //remove spaces
  return "class" + classLabel;
  })
.style("fill", function(d) { return color(d.name); });

state
.selectAll("rect")
.on("mouseover", stack_mo_tooltip)
.on("mouseout", stack_mo_tooltip_out)

var legend = svg.selectAll(".legend")
.data(color.domain().slice().reverse())
.enter().append("g")
        //.attr("class", "legend")
.attr("class", function (d) {
          legendClassArray.push(d.replace(/\s/g, '')); //remove spaces
    return "legend";
    })
.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

//reverse order to match order in which bars are stacked
legendClassArray = legendClassArray.reverse();

legend
.append("rect")
.attr("x", width - 18)
.attr("width", 18)
.attr("height", 18)
.style("fill", color)
.attr("id", function (d, i) {
  return "id" + d.replace(/\s/g, '');
  })
.on("click", highlight_selection)

legend
.append("text")
.attr("x", width - 24)
.attr("y", 9)
.attr("dy", ".35em")
.style("text-anchor", "end")
.text(function(d) { return d; });
