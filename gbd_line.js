// set global width and heights to use for our svgs - you can choose not to use these and specify custom values
var width = window.innerWidth / 100 * 55;
var height = 500;

// margins
var margin = {top: 30,
              right: 30,
              bottom: 150,
              left: 60};

// append the svg object to the body of the page
var svg_fg_6 = d3.select("#my_line_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Bring data in
var request = new XMLHttpRequest();
    request.open("GET", "./Rate_totals_1990_2017_all_areas.json", false);
    request.send(null);
var json = JSON.parse(request.responseText); // parse the fetched json data into a variable
          // We want to coerce some fields to be integers

// Can you nest a switch so that we can choose the areas as well as the measure (Deaths, yll, yld. daly)

deaths_all_cause = json.filter(function(d){ // gets a subset of the json data
    return d.Cause === "All causes" &
        d.measure === 'Deaths'})
          .sort(function(a, b) { // sorts it according to the number of deaths (descending order)
                return d3.ascending(a.Year, b.Year);
          });

// List of groups (here I have one group per column)
var areas = d3.map(deaths_all_cause, function(d){
  return(d.Area)})
  .keys()

// List of years
var years = d3.map(deaths_all_cause, function(d){
    return(d.Year)})
    .keys()

// Add the options to the button
d3.select("#selectAreaButton")
  .selectAll('myOptions')
 	.data(areas)
  .enter()
	.append('option')
  .text(function (d) {
    return d; }) // text to appear in the menu - this does not have to be as it is in the data (you can concatenate other values).
  .attr("value", function (d) {
    return d; }) // corresponding value returned by the button

// A color scale, this is useful because it will respond to the number of elements in the array rather than needing to be hardcoded (although we will mostly know how many elements will be involved and may want to specify particular colours.)
var myColor = d3.scaleOrdinal()
  .domain(areas)
  .range(d3.schemePaired);

// Add X axis
var x = d3.scaleLinear()
  .domain(d3.extent(deaths_all_cause, function(d){
    return d.Year; }))
  .range([0, width ]);

svg_fg_6
  .append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x).ticks(years.length, '0f')); // the .length gives one tick for every item the '0f' removes the comma separator from the year.

// Add Y axis
var y = d3.scaleLinear()
  .domain([0, d3.max(deaths_all_cause, function(d) { return +d.Estimate; })]) // Add the ceiling
  .range([ height, 0 ]);

svg_fg_6
  .append("g")
  .call(d3.axisLeft(y));

var line = svg_fg_6
  .append('g')
  .append("path")
  .datum(deaths_all_cause.filter(function(d){
    return d.Area==areas[0]})) // Initialize line with first value from 'allGroup'
  .attr("d", d3.line()
  .x(function(d) { return x(d.Year) })
  .y(function(d) { return  y(+d.Estimate) }))
  .attr("stroke", function(d){ return myColor("valueA") })
  .style("stroke-width", 4)
  .style("fill", "none")

var line_eng = svg_fg_6
  .append('g')
  .append("path")
  .datum(deaths_all_cause.filter(function(d){
    return d.Area === 'England'})) // Initialize line with first value from 'allGroup'
  .attr("d", d3.line()
  .x(function(d) { return x(d.Year) })
  .y(function(d) { return  y(+d.Estimate) }))
  .attr("stroke", function(d){ return myColor("valueA") })
  .style("stroke-width", 4)
  .style("fill", "none")

// A function that update the chart
function update_fg_6(selectedGroup) {

var dataFilter = deaths_all_cause.filter(function(d){
  return d.Area==selectedGroup})

// Give these new data to update line
line
  .datum(dataFilter)
  .transition()
  .duration(1000)
  .attr("d", d3.line()
  .x(function(d) { return x(d.Year) })
  .y(function(d) { return y(+d.Estimate) })
    )
  .attr("stroke", function(d){ return myColor(selectedGroup) })
  }

// When the button is changed, run the updateChart function
d3.select("#selectAreaButton").on("change", function(d) {
var selectedOption = d3.select(this).property("value") // grab the option that has been chosen
    update_fg_6(selectedOption) // run the updateChart function with this selected option
  })
