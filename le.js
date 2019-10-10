// set global width and heights to use for our svgs - you can choose not to use these and specify custom values
var width = window.innerWidth / 2;
var height = 500;

// margins
var margin = {top: 30,
              right: 30,
              bottom: 150,
              left: 60};

// Line chart
var height_le = 300;

// append the svg object to the body of the page
var svg_le = d3.select("#le_timeseries_datavis")
.append("svg")
.attr("width", width)
.attr("height", height_le + margin.top + 100)
.append("g")
.attr("transform",
"translate(" + margin.left + "," + margin.top + ")");

// Bring data in for figure 6
var request = new XMLHttpRequest();
    request.open("GET", "./LE_HALE_1990_2017_NN.json", false);
    request.send(null);

var json = JSON.parse(request.responseText); // parse the fetched json data into a variable

le = json.filter(function(d){ // gets a subset of the json data - This time it excludes SE and England values
  return d.measure === 'Life expectancy' &
         d.Area === 'West Sussex'})
        .sort(function(a, b) {
  return d3.ascending(a.Year, b.Year);
  });

// List of areas in the data set (which we sort by our neighbour rank order first)
var areas = d3.map(le.sort(function(a,b){
    return d3.ascending(a.Neighbour_rank, b.Neighbour_rank)}), function(d){
    return(d.Area)})
    .keys()

// List of years in the dataset
var years_le = d3.map(le, function(d){
  return(d.Year)})
  .keys()

// group the data: I want to draw one line per group
var sex_group = d3.nest() // nest function allows to group the calculation per level of a factor
.key(function(d) { return d.Sex;})
.entries(le);

hale = json.filter(function(d){ // gets a subset of the json data - This time it excludes SE and England values
  return d.measure === 'HALE (Healthy life expectancy)' &
         d.Area === 'West Sussex'})
        .sort(function(a, b) {
  return d3.ascending(a.Year, b.Year);
  });

  // group the data: I want to draw one line per group
  var sex_group_hale = d3.nest() // nest function allows to group the calculation per level of a factor
  .key(function(d) { return d.Sex;})
  .entries(hale);

// Add X axis
var x = d3.scaleLinear()
.domain(d3.extent(le, function(d){
    return d.Year; }))
.range([0, width - margin.left - 50]);

svg_le
.append("g")
.attr("transform", "translate(0," + height_le + ")")
.call(d3.axisBottom(x).ticks(years_le.length, '0f'));

// Add Y axis
var y = d3.scaleLinear()
    .domain([0, 90]) // Add the ceiling
    .range([height_le, 0 ]);

svg_le
.append("g")
.call(d3.axisLeft(y).ticks(20));

// color palette
var res = sex_group.map(function(d){ return d.key }) // list of group names

var color = d3.scaleOrdinal()
.domain(['Both', 'Female', 'Male'])
.range(["#172243","#00C3FF", "#fd6400"])

// Its opacity is set to 0: we don't see it by default.
var le_tooltip = d3.select("#le_timeseries_datavis")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("border", "solid")
  .style("border-width", "1px")
  .style("border-radius", "5px")
  .style("padding", "10px")

// A function that change this tooltip when the user hover a point.
// Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
var mouseover = function(d) {
le_tooltip
  .style("opacity", 1)
}

var mousemove = function(d) {
le_tooltip
.html(d.Sex + ' life expectancy at birth:<br>' + d3.format('.1f')(d.Estimate) + ' years')
.style("left", (d3.mouse(this)[0]+90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
.style("top", (d3.mouse(this)[1]) + "px")
}

// A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
var mouseleave = function(d) {
le_tooltip
.transition()
.duration(1000)
.style("opacity", 0)
}

// Draw the line
svg_le
.selectAll(".line")
.data(sex_group)
.enter()
.append("path")
.attr("fill", "none")
.attr("stroke", function(d){ return color(d.key) })
.attr("stroke-width", 1.5)
.attr("d", function(d){
  return d3.line()
.x(function(d) { return x(d.Year); })
.y(function(d) { return y(+d.Estimate); })
  (d.values)
  })
  .attr("class", function(d){ return d.key })
.on("mouseover", mouseover)
.on("mousemove", mousemove)
.on("mouseleave", mouseleave)

svg_le
   // First we need to enter in a group
.selectAll("myDots")
.data(sex_group)
.enter()
.append('g')
.attr("class", function(d){ return d.key })
.style("fill", function(d){ return color(d.key) })
.selectAll("myPoints")
.data(function(d){ return d.values })
.enter()
.append("circle")
.attr("cx", function(d) { return x(d.Year) } )
.attr("cy", function(d) { return y(+d.Estimate) } )
.attr("r", 3.5)
.attr("stroke", "white")
.attr("class", function(d){ return d.key })
.on("mouseover", mouseover)
.on("mousemove", mousemove)
.on("mouseleave", mouseleave)

// dashed lines
// .style("stroke-dasharray", "3,3")

// Draw the line
svg_le
.selectAll(".line")
.data(sex_group_hale)
.enter()
.append("path")
.attr("fill", "none")
.attr("stroke", function(d){ return color(d.key) })
.attr("stroke-width", 1.5)
 .style("stroke-dasharray", "6,1")
.attr("d", function(d){
  return d3.line()
.x(function(d) { return x(d.Year); })
.y(function(d) { return y(+d.Estimate); })
  (d.values)
  })
  .attr("class", function(d){ return d.key })
.on("mouseover", mouseover)
.on("mousemove", mousemove)
.on("mouseleave", mouseleave)

svg_le
.append("text")
.attr("x", width / 100 * 10)
.attr("y", 20)
.style('font-size', '10px')
.text('The solid top line shows life expectancy')

svg_le
.append("text")
.attr("x", width / 100 * 40)
.attr("y", 90)
.style('font-size', '10px')
.text('The dashed bottom line shows healthy life expectancy')

svg_le
.append("text")
.attr("x", width - 260)
.attr("y", 175)
.style('font-size', '10px')
.text('Click on a label below to')

svg_le
.append("text")
.attr("x", width - 260)
.attr("y", 185)
.style('font-size', '10px')
.text('show/hide each line')

// Add one dot in the legend for each name.
svg_le
.selectAll("mydots")
.data(sex_group)
.enter()
.append("circle")
.attr("cx", width - 250)
.attr("cy", function(d, i){ return 200 + i * 20}) // 100 is where the first dot appears. 25 is the distance between dots
.attr("r", 5)
.style("fill", function(d){ return color(d.key)})
.style("alignment-baseline", "middle")

// Add one dot in the legend for each name.
svg_le
.selectAll("mylabels")
.data(sex_group)
.enter()
.append("text")
.attr("x", width - 240)
.attr("y", function(d, i){ return 205 + i * 20}) // 100 is where the first dot appears. 25 is the distance between dots
.style("fill", function(d){ return color(d.key)})
.text(function(d){ return d.key.replace('Both', 'Both males and female') + 's'})
.style('font-size', '12px')
.attr("text-anchor", "left")
.style("alignment-baseline", "middle")
.on("click", function(d){
  currentOpacity = d3.selectAll("." + d.key).style("opacity")  // is the element currently visible ?
  d3.selectAll("." + d.key).transition().style("opacity", currentOpacity == 1 ? 0:1)   // Change the opacity: from 0 to 1 or from 1 to 0
})

// By default lets hide male and females
d3.selectAll(".Male").style("opacity", 0)
d3.selectAll(".Female").style("opacity", 0)

// Add X axis label:
svg_le
.append("text")
.attr("text-anchor", "end")
.attr("x", width/2)
.attr("y", height_le + margin.top + 10)
.text("Year");

// Y axis label:
svg_le
.append("text")
.attr('id', 'axis_y_title')
.attr("text-anchor", "end")
.attr("transform", "rotate(-90)")
.attr("y", - margin.left + 20)
.attr("x", - margin.top - 60)
.text('Years');

// We need to create a dropdown button for the user to choose which area to be displayed on the figure.
d3.select("#selectLEAreaButton")
  .selectAll('myOptions')
 	.data(areas)
  .enter()
	.append('option')
  .text(function (d) {
        return d; })
  .attr("value", function (d) {
        return d; })
