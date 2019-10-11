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

// Bring data in for figure 6
var request = new XMLHttpRequest();
    request.open("GET", "./LE_HALE_1990_2017_NN.json", false);
    request.send(null);

var json_le = JSON.parse(request.responseText); // parse the fetched json data into a variable

var sex = ['Male', 'Female', 'Both']

var closest_year = 2017;

// List of areas in the data set (which we sort by our neighbour rank order first)
var areas = d3.map(json_le.sort(function(a,b){
    return d3.ascending(a.Neighbour_rank, b.Neighbour_rank)}), function(d){
    return(d.Area)})
    .keys()

var le = json_le.filter(function(d){
  return d.measure === 'Life expectancy' &
         d.Area === 'West Sussex'})
        .sort(function(a, b) {
  return d3.ascending(a.Year, b.Year);
      });

var hale = json_le.filter(function(d){
  return d.measure === 'HALE (Healthy life expectancy)'&
         d.Area === 'West Sussex'})
        .sort(function(a, b) {
  return d3.ascending(a.Year, b.Year);
      });

sex_group_le = d3.nest() // nest function allows to group the calculation per level of a factor
.key(function(d) { return d.Sex;})
.entries(le);

sex_group_hale = d3.nest() // nest function allows to group the calculation per level of a factor
.key(function(d) { return d.Sex;})
.entries(hale);

// List of years in the dataset
var years_le = d3.map(json_le, function(d){
  return(d.Year)})
  .keys()

// Add X axis
var x = d3.scaleLinear()
.domain(d3.extent(json_le, function(d){
  return d.Year; }))
.range([0, width - margin.left - 50]);

// append the svg object to the body of the page
var svg_le = d3.select("#le_timeseries_datavis")
.append("svg")
.attr("width", width)
.attr("height", height_le + margin.top + 100)
.append("g")
.attr("transform",
"translate(" + margin.left + "," + margin.top + ")");

svg_le
.append("g")
.attr("transform", "translate(0," + height_le + ")")
.call(d3.axisBottom(x).ticks(years_le.length, '0f'));

// Rotate the xAxis labels
svg_le
.selectAll("text")
.attr("transform", "rotate(-45)")
.style("text-anchor", "end")

// Add Y axis
var y = d3.scaleLinear()
.domain([0, 90]) // Add the ceiling
.range([height_le, 0 ]);

svg_le
.append("g")
.call(d3.axisLeft(y).ticks(20));

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

var color = d3.scaleOrdinal()
.domain(['Both', 'Female', 'Male'])
.range(["#172243","#00C3FF", "#fd6400"])

// Add one dot in the legend for each name.
svg_le
.selectAll("mydots")
.data(sex)
.enter()
.append("circle")
.attr("cx", width - 300)
.attr("cy", function(d, i){ return 200 + i * 20}) // 100 is where the first dot appears. 20 is the distance between dots
.attr("r", 4)
.style("fill", function(d){ return color(d)})
.style("alignment-baseline", "middle")

// Add one dot in the legend for each name.
svg_le
.selectAll("mylabels")
.data(sex)
.enter()
.append("text")
.attr("x", width - 295)
.attr("y", function(d, i){ return 205 + i * 20}) // 100 is where the first dot appears. 20 is the distance between dots
.style("fill", function(d){ return color(d)})
.text(function(d){ return d.replace('Both', 'Both males and female') + 's'})
.style('font-size', '11px')
.attr("text-anchor", "left")
.style("alignment-baseline", "middle")
.on("click", function(d){
  currentOpacity = d3.selectAll("." + d).style("opacity")  // is the element currently visible ?
  d3.selectAll("." + d).transition().style("opacity", currentOpacity == 1 ? 0:1)   // Change the opacity: from 0 to 1 or from 1 to 0
})

// By default lets hide male and females
svg_le
d3.selectAll(".Male").style("opacity", 0)
d3.selectAll(".Female").style("opacity", 0)

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
.attr("x", width - 300)
.attr("y", 175)
.style('font-size', '10px')
.text('Click on a label below to')

svg_le
.append("text")
.attr("x", width - 300)
.attr("y", 185)
.style('font-size', '10px')
.text('show/hide each line')

svg_le
.append("text")
.attr("x", width / 100 * 3)
.attr("y", 140)
.style('font-size', '12px')
.style('font-weight', 'bold')
.text('Life expectancy at birth')

svg_le
.append("text")
.attr("x", width / 100 * 3)
.attr("y", 225)
.style('font-size', '12px')
.style('font-weight', 'bold')
.text('Healthy expectancy at birth')

// These are all items that should update as the mouse moves

svg_le
.attr("class", 'closest_year_class')
.append("text")
.attr("x", width / 100 * 3)
.attr("y", 125)
.style('font-size', '16px')
.text(function(d){ return closest_year});

chosen_le_data_m = le.filter(function(d){
  return d.Year === closest_year &
          d.Sex === 'Male'});

chosen_le_data_f = le.filter(function(d){
  return d.Year === closest_year &
         d.Sex === 'Female'});

chosen_le_data = le.filter(function(d){
  return d.Year === closest_year &
         d.Sex === 'Both'});

chosen_hale_data_m = hale.filter(function(d){
  return d.Year === closest_year &
         d.Sex === 'Male'});

chosen_hale_data_f = hale.filter(function(d){
  return d.Year === closest_year &
         d.Sex === 'Female'});

chosen_hale_data = hale.filter(function(d){
  return d.Year === closest_year &
         d.Sex === 'Both'});

svg_le
.data(chosen_le_data_m)
.attr("class", 'closest_year_class')
.append("text")
.attr("x", width / 100 * 3)
.attr("y", 155)
.style('font-size', '10px')
.style("text-anchor", "start")
.text(function(d){ return 'Males: ' + d3.format('0.1f')(d.Estimate) + ' years'});

svg_le
.data(chosen_le_data_f)
.attr("class", 'closest_year_class')
.append("text")
.attr("x", width / 100 * 3)
.attr("y", 165)
.style('font-size', '10px')
.style("text-anchor", "start")
.text(function(d){ return 'Males: ' + d3.format('0.1f')(d.Estimate) + ' years'});

svg_le
.data(chosen_le_data)
.attr("class", 'closest_year_class')
.append("text")
.attr("x", width / 100 * 3)
.attr("y", 175)
.style('font-size', '10px')
.style("text-anchor", "start")
.text(function(d){ return 'Both: ' + d3.format('0.1f')(d.Estimate) + ' years'});

// 240 +
svg_le
.data(chosen_hale_data_m)
.attr("class", 'closest_year_class')
.append("text")
.attr("x", width / 100 * 3)
.attr("y", 240)
.style('font-size', '10px')
.style("text-anchor", "start")
.text(function(d){ return 'Males: ' + d3.format('0.1f')(d.Estimate) + ' years'});

svg_le
.data(chosen_hale_data_f)
.attr("class", 'closest_year_class')
.append("text")
.attr("x", width / 100 * 3)
.attr("y", 250)
.style('font-size', '10px')
.style("text-anchor", "start")
.text(function(d){ return 'Males: ' + d3.format('0.1f')(d.Estimate) + ' years'});

svg_le
.data(chosen_hale_data)
.attr("class", 'closest_year_class')
.append("text")
.attr("x", width / 100 * 3)
.attr("y", 260)
.style('font-size', '10px')
.style("text-anchor", "start")
.text(function(d){ return 'Both: ' + d3.format('0.1f')(d.Estimate) + ' years'});

// color palette
var res = sex_group_le.map(function(d){ return d.key }) // list of group names

// Draw the line
svg_le
.selectAll(".line")
.data(sex_group_le)
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
  .on("mousemove", mousemove)

svg_le
.selectAll("myDots")
.data(sex_group_le)
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
.on("mousemove", mousemove)

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
.style("pointer-events", "all")
.on("mousemove", mousemove)

function mousemove() {
// recover coordinate we need
var closest_year = d3.format('.0f')(x.invert(d3.mouse(this)[0]));

// This just returns an empty array
chosen_data = le.filter(function(d){
  return d.Year === closest_year});

svg_le
 .select("#closest_year_class")
 .selectAll('text')
 .remove();

// svg_le
//  .attr('class', 'closest_year_class')
//  .append("text")
//  .attr("x", width / 100 * 3)
//  .attr("y", 125)
//  .style('font-size', '16px')
//  .text(function(d){ return closest_year});
}


// Stacked bar LE

// Bring data in for figure 6
var request = new XMLHttpRequest();
    request.open("GET", "./LE_HALE_stacked_ts_1990_2017_NN.json", false);
    request.send(null);

var json_le_stack = JSON.parse(request.responseText); // parse the fetched json data into a variable

json_le_stack = json_le_stack.filter(function(d){
  return d.Area === 'West Sussex'});

groups_le = d3.map(json_le_stack, function(d){
  return(d.Sex)})
  .keys();

console.log(groups_le)

le_stack_males = json_le_stack.filter(function(d){
    return d.Sex === 'Male'});
le_stack_females = json_le_stack.filter(function(d){
    return d.Sex === 'Female'});
le_stack_both = json_le_stack.filter(function(d){
    return d.Sex === 'Both'});

// Now we can use the global width with
var height_le_stack = 400 - margin.top - margin.bottom;

var tooltip_le_stack = d3.select("#le_stacked_timeseries_datavis")
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

var showTooltip_le_stack = function(d) {

tooltip_le_stack
  .transition()
  .duration(200);

var subgroupName = d3.select(this.parentNode).datum().key;
var subgroupValue = d.data[subgroupName];

tooltip_le_stack
  .html("<h3>" + subgroupName + '</h3><p>The life expectancy at birth in West Sussex in 2017 among both males and females aged </p>')
  .style("opacity", 1)
  .style("top", (event.pageY - 10) + "px")
  .style("left", (event.pageX + 10) + "px")
  }

// append the svg object to the body of the page
var svg_le_stack = d3.select("#le_stacked_timeseries_datavis")
 .append("svg")
 .attr("width", width)
 .attr("height", height_le_stack +100)
 .append("g")
 .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Add X axis
var x_le_stack = d3.scaleBand()
  .domain(years_le)
  .range([0, width])

svg_le_stack
.append("g")
.attr("transform", "translate(0," + height_le_stack + ")")
.call(d3.axisBottom(x).ticks(years_le.length, '0f'));

svg_le_stack
 .selectAll("text")
 .attr("transform", "translate(-10,10)rotate(-45)")
 .style("text-anchor", "end")

 // Add X axis label:
 svg_le_stack
  .append("text")
  .attr("text-anchor", "end")
  .attr("x", width/2)
  .attr("y", height_le_stack + margin.top + 35)
  .text("Year");

 // Y axis label:
 svg_le_stack
  .append("text")
  .attr('id', 'axis_y_title')
  .attr("text-anchor", "end")
  .attr("transform", "rotate(-90)")
  .attr("y", - margin.left + 10)
  .attr("x", - margin.top - 60)
  .text('Years');

// Add Y axis
var y_le_stack = d3.scaleLinear()
 .domain([0, 90]) // Add the ceiling
 .range([height_le_stack, 0 ]);

svg_le_stack
.append("g")
.call(d3.axisLeft(y).ticks(20));


function update_le_stack(data) {

svg_le_stack
.selectAll("rect")
.remove();

var stackedData = d3.stack()
    .keys(sex)
      (data)

y_le_stack
  .domain([0, 90]);

// This adds a transition effect on the change between datasets (i.e. if the yaxis needs to be longer or shorter).
yAxis_le_stack
  .transition()
  .duration(1000)
  .call(d3.axisLeft(y_le_stack));

var le_bars_df = svg_le_stack.append("g")
  .selectAll("g")
  .data(stackedData) // Enter in the stack data = loop key per key = group per group
  .enter()
  .append("g")
  // .attr("fill", function(d) {
  //   return color_cause_group(d.key); })
  .selectAll("rect")
  .data(function(d) { return d; })// enter a second time = loop subgroup per subgroup to add all rectangles
  .enter()
  .append("rect")
  .attr("x", function(d) {
    return x_le_stack(d.data.Year); })
  .attr("y", function(d) {
    return y_le_stack(d[1]); })
  .attr("height", function(d) {
    return y_le_stack(d[0]) - y_le_stack(d[1]); })
  .attr("width", x_le_stack.bandwidth())
  .on("mouseover", function() {
  return tooltip_le_stack.style("visibility", "visible");
  })
  .on("mousemove", showTooltip_le_stack)
  .on("mouseout", function() {
  return tooltip_le_stack.style("visibility", "hidden");
  })
}

update_le_stack(le_stack_both)
