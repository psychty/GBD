var data1 = [
   {group: "A", value: 4},
   {group: "B", value: 16},
   {group: "C", value: 8}
];

var data2 = [
   {group: "A", value: 7},
   {group: "B", value: 1},
   {group: "C", value: 20},
   {group: "D", value: 10}
];

var margin = {top: 30,
              right: 30,
              bottom: 70,
              left: 60};

var width = 600 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;

// link the svg to the div on the page
var svg = d3.select("#my_dataviz")
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

// A function to create / update the plot for a given variable:
function update(data) {
  x.domain(data.map(function(d) { return d.group; })) // update the xaxis based on 'data' - so if you run update on data1, this will look at data1, get any new/unique groups and add them to the list of groups.§
  xAxis.transition().duration(1000).call(d3.axisBottom(x)); // This adds a transition effect on any change in axis categories.

  y.domain([0, d3.max(data, function(d) { return d.value }) ]); // update the yaxis based on 'data'
  yAxis.transition().duration(1000).call(d3.axisLeft(y)); // This adds a transition effect on the change between datasets (i.e. if the yaxis needs to be longer or shorter).

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
        return x(d.group); })
      .attr("y", function(d) {
        return y(d.value); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) {
                      return height - y(d.value); })
      .style("fill", function(d){ // This adds a conditional fill colour to the bars.
                  if (d.group === "C"){
                    return '#000040'
                  }
                  return '#f7347a';
                });

  bars_df
    .exit()
    .remove() // If any original bars need to go now these are removed.
}

// Initialize the plot with the first dataset
update(data1)
