
// Data and colour parameters
var margin = {top: 30,
              right: 30,
              bottom: 150,
              left: 60};

var width = window.innerWidth / 100 * 55 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;

var cause_categories = ["HIV/AIDS and sexually transmitted infections", "Respiratory infections and tuberculosis", "Enteric infections", "Neglected tropical diseases and malaria", "Other infectious diseases", "Maternal and neonatal disorders", "Nutritional deficiencies", "Neoplasms", "Cardiovascular diseases", "Chronic respiratory diseases", "Digestive diseases", "Neurological disorders", "Mental disorders", "Substance use disorders", "Diabetes and kidney diseases", "Skin and subcutaneous diseases", "Sense organ diseases", "Musculoskeletal disorders", "Other non-communicable diseases", "Transport injuries", "Unintentional injuries", "Self-harm and interpersonal violence"]

var color_cause_group = d3.scaleOrdinal()
  .domain(cause_categories)
  .range(["#F8DDEB", "#F2B9BF", "#EE9187", "#EA695C", "#D84D42", "#AD3730", "#7A1C1C", '#BCD6F7','#97C4F0','#67A8E7','#528CDB','#376ACB',"#1845A5", '#CFD6F6','#ADB9ED','#8B96DD','#6978D0', "#4E4FB8", "#3E3294", "#B5DCD0", "#76B786", '#477A49']);

var request = new XMLHttpRequest();
  request.open("GET", "./Number_cause_level_2_2017_west_sussex.json", false);
  request.send(null);
var json = JSON.parse(request.responseText); // parse the fetched json data into a variable

// We want to coerce some fields to be integers
json.forEach(function(elem){
		elem.Year = parseInt(elem.Year);
    elem.Deaths_number = parseInt(elem.Deaths_number); // Cause_id does not need to be an integer but it shows that it is working in console.log
			});

data1 = json.filter(function(d){
	    return d.Sex === "Both" &
	      +d.Year === 2017});

data1 = data1.sort(function(a, b) {
          return d3.descending(a.Deaths_number, b.Deaths_number);
        });

data1 = data1.slice(0,10);

data2 = json.filter(function(d){
	    return d.Sex === "Female" &
	      +d.Year === 2017});

data2 = data2.sort(function(a, b) {
          return d3.descending(a.Deaths_number, b.Deaths_number);
        });

data2 = data2.slice(0,10);

data3 = json.filter(function(d){
	    return d.Sex === "Male" &
	      +d.Year === 2017});

data3 = data3.sort(function(a, b) {
          return d3.descending(a.Deaths_number, b.Deaths_number);
        });

data3 = data3.slice(0,10);

// Set up the svg and link to the div with the same identifier on the html page
var svg = d3.select("#top_10_bars_by_sex_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g") //The SVG <g> element is used to group SVG shapes together. Once grouped you can transform the whole group of shapes as if it was a single shape.
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")"); // http://tutorials.jenkov.com/svg/svg-transformation.html

// set the X axis across the svg
var x = d3.scaleBand() // our x axis is categorical or banded
  .range([ 0, width ])
  .padding(0.2);

var xAxis = svg.append("g")
  .attr("transform", "translate(0," + height + ")")

// set the Y axis
var y = d3.scaleLinear() // our y axis is continuous (linear)
  .range([ height, 0]);

var yAxis = svg.append("g")
  .attr("class", "myYaxis")

var tooltip = d3.select("#top_10_bars_by_sex_dataviz")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip_bars")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "1px")
  .style("border-radius", "5px")
  .style("padding", "10px")

// The tooltip function
var showTooltip = function(d) {
    tooltip
      .transition()
      .duration(200)

// The nested .replace within .toLowerCase() replaces the string 'both' (not 'Both') with 'both males and female' and then we add the s and a line break.
  tooltip
    .style("opacity", 1)
    .html("<h3>" + d.Cause + '</h3><p>The estimated number of deaths as a result of ' + d.Cause + ' in West Sussex in 2017 among ' + d.Sex.toLowerCase().replace('both', 'both males and female') + 's was <font color = "#1e4b7a"><b>' + d3.format(",.0f")(d.Deaths_number) + '</b></font>.</p><p>This is the ' + d.Death_rank + 'th/nd/rd/st highest cause of death, accounting for ' + d3.format('.0%')(d.Deaths_proportion) + ' of the total number of deaths in 2017 for this population.</p>')
    .style("top", (event.pageY - 10) + "px")
    .style("left", (event.pageX + 10) + "px")
}

// Add X axis label:
svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", width/2)
    .attr("y", height + margin.top + 70)
    .text("Cause");

// Y axis label:
svg.append("text")
    .attr('id', 'axis_y_title')
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", - margin.left + 20)
    .attr("x", - margin.top - 60)
    .text('Deaths');

// A function to create / update the plot for a given variable:
function update(data) {
  x
  .domain(data.map(function(d) { return d.Cause; })) // update the xaxis based on 'data' - so if you run update on data1, this will look at data1, get any new/unique groups and add them to the list of groups.§
  xAxis
    .transition()
    .duration(1000)
    .call(d3.axisBottom(x))

// Is this where we add wrap?
  xAxis // Rotate the xAxis labels
    .selectAll("text")
    .attr("transform", "translate(-10,10)rotate(-45)")
    .style("text-anchor", "end")
    // .call(wrap, function(d) { return d.Cause; });

    y
  .domain([0, d3.max(data, function(d) {
    return Math.ceil(d.Deaths_number / 500) * 500 // This gets the maximum deaths number rounded up to nearest 500 (ceiling)
  })]); // update the yaxis based on 'data'

// This adds a transition effect on the change between datasets (i.e. if the yaxis needs to be longer or shorter).
  yAxis
    .transition()
    .duration(1000)
    .call(d3.axisLeft(y));

  // Create the bars_df variable
  var bars_df = svg.selectAll("rect")
    .data(data)

  bars_df
    .enter()
    .append("rect") // Add a new rect for each new element
    .merge(bars_df) // get the already existing elements as well
    .transition() // and apply changes to all of them
    .duration(1000)
      .attr("x", function(d) {
        return x(d.Cause); })
      .attr("y", function(d) {
        return y(d.Deaths_number); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) {
                      return height - y(d.Deaths_number); })
      .style("fill", function(d) {
                      return color_cause_group(d.Cause)});

// You could add these .on events to the selection above, but because we have a .transition() function, it turns the selection into a transition and it is not possible to add a tooltip to a transition and so we need to use the .notation to add tooltip functions separately.
  bars_df
    .on("mouseover", function() {
    return tooltip.style("visibility", "visible");
  })
    .on("mousemove", showTooltip)
    .on("mouseout", function() {
    return tooltip.style("visibility", "hidden");
  });

// Finally, if any original bars need to go now these are removed.
  bars_df
    .exit()
    .remove()
}

// Initialize the plot with the first dataset
update(data1)
update(data1)
