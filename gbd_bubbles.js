// set global width and heights to use for our svgs - you can choose not to use these and specify custom values
// var width = window.innerWidth / 100 * 50;
var width_bubble = document.getElementById("content_size").offsetWidth;

var height = 500;

// margins
var margin = {top: 30,
              right: 30,
              bottom: 150,
              left: 60};

// Specify a colour palette and order
var cause_categories = ["HIV/AIDS and sexually transmitted infections", "Respiratory infections and tuberculosis", "Enteric infections", "Neglected tropical diseases and malaria", "Other infectious diseases", "Maternal and neonatal disorders", "Nutritional deficiencies", "Neoplasms", "Cardiovascular diseases", "Chronic respiratory diseases", "Digestive diseases", "Neurological disorders", "Mental disorders", "Substance use disorders", "Diabetes and kidney diseases", "Skin and subcutaneous diseases", "Sense organ diseases", "Musculoskeletal disorders", "Other non-communicable diseases", "Transport injuries", "Unintentional injuries", "Self-harm and interpersonal violence"]

var color_cause_group = d3.scaleOrdinal()
  .domain(cause_categories)
  .range(["#F8DDEB", "#F2B9BF", "#EE9187", "#EA695C", "#D84D42", "#AD3730", "#7A1C1C", '#BCD6F7','#97C4F0','#67A8E7','#528CDB','#376ACB',"#1845A5", '#CFD6F6','#ADB9ED','#8B96DD','#6978D0', "#4E4FB8", "#3E3294", "#B5DCD0", "#76B786", '#477A49']);

var measure_categories = ['Deaths', 'YLLs (Years of Life Lost)', 'YLDs (Years Lived with Disability)', 'DALYs (Disability-Adjusted Life Years)']

var label_key = d3.scaleOrdinal()
    .domain(measure_categories)
    .range(['deaths', 'YLLs', 'YLDs', ' DALYs'])

var xLabel = 190
var xCircle = 100
var yCircle = 190

/////////////////////
// Level 3 bubbles //
/////////////////////

// append the svg object to the body of the page - this is created before the data is loaded.
var svg_bubbles = d3.select("#my_deaths_bubble_dataviz")
.append("svg")
.attr("width", width_bubble)
.attr("height", height)

var request = new XMLHttpRequest();
request.open("GET", "./Number_bubbles_df_level_3_2017_west_sussex.json", false);
request.send(null);
var json_bubble_data = JSON.parse(request.responseText); // parse the fetched json data into a variable

bubble_data = json_bubble_data.filter(function(d){
  return d.Sex === 'Both' &
  +d.Year === 2017 &
  d.Measure === measure_categories[0]});

// We need to create a dropdown button for the user to choose which area to be displayed on the figure.
d3.select("#selectSexBubblesButton")
.selectAll('myOptions')
.data(['Both','Male','Female'])
.enter()
.append('option')
.text(function (d) {
  return d; }) // text to appear in the menu - this does not have to be as it is in the data (you can concatenate other values).
.attr("value", function (d) {
  return d; }) // corresponding value returned by the button

// We need to create a dropdown button for the user to choose which area to be displayed on the figure.
d3.select("#selectMeasureBubblesButton")
  .selectAll('myOptions')
	.data(measure_categories)
  .enter()
	.append('option')
  .text(function (d) {
    return d; }) // text to appear in the menu - this does not have to be as it is in the data (you can concatenate other values).
  .attr("value", function (d) {
    return d; }) // corresponding value returned by the button

// Create functions to show, move, and hide the tooltip
var tooltip_fg_2 = d3.select("#my_deaths_bubble_dataviz")
.append("div")
.style("opacity", 0)
.attr("class", "tooltip_bubbles")
.style("position", "absolute")
.style("z-index", "10")
.style("background-color", "white")
.style("border", "solid")
.style('font-size', '12px')
.style("border-width", "1px")
.style("border-radius", "5px")
.style("padding", "10px")

// This creates the function for what to do when someone moves the mouse over a circle (e.g. move the tooltip in relation to the mouse cursor).
var showTooltip_fg_2 = function(d) {
tooltip_fg_2
 .html("<h3>" + d.Cause + "</h3><p class = 'tooltip_b'>In " + d.Year + ", there were <strong>" + d3.format(",.0f")(d.Value) + "</strong> " + label_key(d.Measure) + " among " + d.Sex.toLowerCase().replace('both', 'both males and female') + "s caused by " + d.Cause + ".</p><p  class = 'tooltip_b'>This is part of the " + d['Cause group'] + " disease group.</p>")
 .style("top", (event.pageY - 10) + "px")
 .style("left", (event.pageX + 10) + "px")
.style('opacity', 1)
}

var forceXSplit = d3.forceX(function(d) {
  if (d['Cause group'] === 'Neoplasms') {
    return (width_bubble / 100) * 15 }
    else {
    return (width_bubble / 100) * 50 }
          })
.strength(0.05)

var forceYSplit = d3.forceY(function(d) {
  if (d['Cause group'] === 'Neoplasms') {
    return height / 2 }
    else {
    return height / 2 }
          })
  .strength(0.05)

// I think I probably will need to grab the bubble size key and update that too when switch-two is changed as the scale is updated (people might think size of deaths bubble is the same as yll when its like 5x as big)
var svg_size_key = d3.select("#chart_legend")
  .append("svg")
  .attr("width", 350)
  .attr("height", 400)

function update_bubbles(data) {

var selectedSexBubblesOption = d3.select('#selectSexBubblesButton').property("value")
var selectedMeasureBubblesOption = d3.select('#selectMeasureBubblesButton').property("value")

// This selects the text on the figure and removes it imediately
svg_bubbles
 .selectAll("text")
 .remove();

// This selects the whole div, changes the r value for all circles to 0 and then removes the svg before new plots are rebuilt.
svg_bubbles
 .selectAll("*")
 .transition()
 .duration(750)
 .attr("r", 0)
 .remove();

svg_size_key
 .selectAll("*")
 .remove();

data = json_bubble_data.filter(function(d){
    return d.Sex === selectedSexBubblesOption &
          +d.Year === 2017 &
          d.Measure === selectedMeasureBubblesOption})

data = data.sort(function(a, b) {
    return d3.descending(a['Cause group'], b['Cause group']);
    });

// Grab the lowest number of deaths
var min_value = d3.min(data, function(d) {
  return +d.Value;
  })

// Grab the highest number of value
var max_value = d3.max(data, function(d) {
  return +d.Value;
  })

// Select the div id total_death_string (this is where you want the result of this to be displayed in the html page)
d3.select("#selected_bubbles_title")
  	.data(data)
  	.text(function(d){
  	return "Level 3 causes of " + label_key(d.Measure) + '; ' + d.Sex.toLowerCase().replace('both', 'both males and female') + 's; all ages; West Sussex; 2017' });

// Size scale for bubbles
var size = d3.scaleLinear()
  .domain([0, max_value])
  .range([1, 75]) // circle scale

// Initialize the circle
var node = svg_bubbles.append("g")
 .selectAll("circle")
 .data(data)
 .enter()
 .append("circle")
 .attr("class", "node")
 .attr("r", function(d) {
   return size(d.Value)
   })
 .style("fill", function(d) {
  return color_cause_group(d['Cause group'])
  })
 .style('stroke', '#fff')
 .style("fill-opacity", 1)
 .on("mouseover", function() {
   return tooltip_fg_2.style("visibility", "visible");
   })
 .on("mousemove", showTooltip_fg_2)
 .on("mouseout", function() {
   return tooltip_fg_2.style("visibility", "hidden");
    })
 .call(d3.drag()
 .on("start", dragstarted)
 .on("drag", dragged)
 .on("end", dragended));

// Features of the forces applied to the nodes:
var simulation = d3.forceSimulation()
 .force("center", d3.forceCenter().x(width_bubble/2).y(height/2))
 .force("charge", d3.forceManyBody().strength(.1))
 .force("collide", d3.forceCollide().strength(.2).radius(function(d) {
    return (size(d.Value) + 3)})
    .iterations(1)) // Force that avoids circle overlapping

simulation
 .nodes(data)
 .on("tick", function(d) { node
 .attr("cx", function(d) {
      return d.x; })
 .attr("cy", function(d) {
      return d.y; })
    });

simulation
.force("x", forceXSplit)
.force("y", forceYSplit)
.force("collide", d3.forceCollide().strength(.2).radius(function(d) {
   return (size(d.Value) + 1)}))
.alphaTarget(0);

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(.03).restart(); d.fx = d.x;
    d.fy = d.y;
  }

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
  }

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(.03); d.fx = null;
    d.fy = null;
   }

svg_bubbles
.append("text")
.attr('id', 'bubble_label_text')
.attr("text-anchor", "start")
.attr("y", function(d) {
  if (selectedMeasureBubblesOption === 'YLLs (Years of Life Lost)') {
    return 150 }
    else if (selectedMeasureBubblesOption === 'YLDs (Years Lived with Disability)') {
    return 220 }
    else {
    return 180 }
          })
.attr("x", function(d) {
  if (selectedMeasureBubblesOption === 'YLDs (Years Lived with Disability)') {
    return 120 }
    else {
    return 60 }
          })
.attr('opacity', 0)
.transition()
.duration(2000)
.attr('opacity', 1)
.style('font-weight', 'bold')
.text('Neoplasms');

svg_bubbles
.append("text")
.attr("text-anchor", "start")
.attr("y", function(d) {
  if (selectedMeasureBubblesOption === 'DALYs (Disability-Adjusted Life Years)') {
    return 60 }
    else {
    return 100 }
          })
.attr("x", (width_bubble / 100) * 40 )
.attr('opacity', 0)
.transition()
.duration(2000)
.attr('opacity', 1)
.style('font-weight', 'bold')
.text('Other conditions');

// Key size
var valuesToShow = [10, max_value / 4, max_value / 2, max_value]

svg_size_key
 .selectAll("legend")
 .data(valuesToShow)
 .enter()
 .append("circle")
 .attr("cx", xCircle)
 .attr("cy", function(d) {
   return yCircle - size(d)
   })
 .attr("r", function(d) {
   return size(d)
   })
 .style("fill", "none")
 .attr("stroke", "black")

 // Add svg_size_key: segments
 svg_size_key
 .selectAll("legend")
 .data(valuesToShow)
 .enter()
 .append("line")
 .attr('x1', function(d) {
 return xCircle + size(d)
 })
 .attr('x2', xLabel)
 .attr('y1', function(d) {
 return yCircle - size(d)
 })
 .attr('y2', function(d) {
 return yCircle - size(d)
 })
 .attr('stroke', 'black')
 .style('stroke-dasharray', ('2,2'))

 // Add svg_size_key: labels
 svg_size_key
 .selectAll("legend")
 .data(valuesToShow)
 .enter()
 .append("text")
 .attr('x', xLabel)
 .attr('y', function(d) {
 return yCircle - size(d)
 })
 .text(function(d) {
  return d3.format(",.0f")(d) + ' ' + label_key(selectedMeasureBubblesOption)
 })
 .attr("font-size", 11)
 .attr('alignment-baseline', 'top')
}

// Initialize the plot with the first dataset
update_bubbles(bubble_data)

  d3.select("#selectSexBubblesButton").on("change", function(d) {
var selectedSexBubblesOption = d3.select('#selectSexBubblesButton').property("value")
var selectedMeasureBubblesOption = d3.select('#selectMeasureBubblesButton').property("value")
  update_bubbles(bubble_data)
  })

d3.select("#selectMeasureBubblesButton").on("change", function(d) {
var selectedSexBubblesOption = d3.select('#selectSexBubblesButton').property("value")
var selectedMeasureBubblesOption = d3.select('#selectMeasureBubblesButton').property("value")
  update_bubbles(bubble_data)
  })
