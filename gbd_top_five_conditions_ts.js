// over_time_top_five_rate_datavis

var color_cause_group_tf = d3.scaleOrdinal()
  .domain(["HIV/AIDS and sexually transmitted infections", "Respiratory infections and tuberculosis", "Enteric infections", "Neglected tropical diseases and malaria", "Other infectious diseases", "Maternal and neonatal disorders", "Nutritional deficiencies", "Neoplasms", "Cardiovascular diseases", "Chronic respiratory diseases", "Digestive diseases", "Neurological disorders", "Mental disorders", "Substance use disorders", "Diabetes and kidney diseases", "Skin and subcutaneous diseases", "Sense organ diseases", "Musculoskeletal disorders", "Other non-communicable diseases", "Transport injuries", "Unintentional injuries", "Self-harm and interpersonal violence"])
  .range(["#F8DDEB", "#F2B9BF", "#EE9187", "#EA695C", "#D84D42", "#AD3730", "#7A1C1C", '#BCD6F7','#97C4F0','#67A8E7','#528CDB','#376ACB',"#1845A5", '#CFD6F6','#ADB9ED','#8B96DD','#6978D0', "#4E4FB8", "#3E3294", "#B5DCD0", "#76B786", '#477A49']);

var width = document.getElementById("content_size").offsetWidth;

// margins
var margin = {
  top: 30,
  right: 30,
  bottom: 150,
  left: 60
  };

///////////////////////////////////////////
// Line chart top five causes timeseries //
///////////////////////////////////////////

var height_tf_ts = 300;
// append the svg object to the body of the page

var tf_ts_svg = d3.select("#over_time_top_five_rate_datavis")
  .append("svg")
  .attr("width", width)
  .attr("height", height_tf_ts + margin.top + 100)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Bring data in
var request = new XMLHttpRequest();
request.open("GET", "./Rate_top_five_ts.json", false);
request.send(null);
var json_tf_ts = JSON.parse(request.responseText); // parse the fetched json data into a variable

var sexes_tf = ['Both','Male','Female']

var measures_tf = ['Deaths', 'YLLs (Years of Life Lost)', 'YLDs (Years Lived with Disability)', 'DALYs (Disability-Adjusted Life Years)']

// We need to create a dropdown button for the user to choose which area to be displayed on the figure.
d3.select("#selectMeasure_ts_Button")
  .selectAll('myOptions')
  .data(measures_tf)
  .enter()
  .append('option')
  .text(function (d) {
        return d; }) // text to appear in the menu - this does not have to be as it is in the data (you can concatenate other values).
  .attr("value", function (d) {
        return d; }) // corresponding value returned by the button

// We need to create a dropdown button for the user to choose which area to be displayed on the figure.
d3.select("#selectSex_ts_Button")
  .selectAll('myOptions')
  .data(sexes_tf)
  .enter()
  .append('option')
  .text(function (d) {
        return d; }) // text to appear in the menu - this does not have to be as it is in the data (you can concatenate other values).
  .attr("value", function (d) {
        return d; }) // corresponding value returned by the button

// We need to create a dropdown button for the user to choose which area to be displayed on the figure.
d3.select("#selectArea_ts_Button")
  .selectAll('myOptions')
  .data(['West Sussex', 'South East England','England'])
  .enter()
  .append('option')
  .text(function (d) {
        return d; }) // text to appear in the menu - this does not have to be as it is in the data (you can concatenate other values).
  .attr("value", function (d) {
        return d; }) // corresponding value returned by the button

var selected_sex_tf_option = d3.select('#selectSex_ts_Button').property("value")
var selected_measure_tf_option = d3.select("#selectMeasure_ts_Button").property('value')

ts_top_five_chosen = json_tf_ts.filter(function (d) { // gets a subset of the json data - This time it excludes SE and England values
    return d.measure === selected_measure_tf_option &
        d.Sex === selected_sex_tf_option
})
    .sort(function (a, b) {
        return d3.ascending(a.Year, b.Year);
    });

// List of years in the dataset
var years_tf_ts = d3.map(ts_top_five_chosen, function (d) {
  return (d.Year)
  })
  .keys()

var x_tf_ts = d3.scaleLinear()
.domain(d3.extent(ts_top_five_chosen, function(d) { return d.Year; }))
.range([0, width - margin.left - 50]);

var xAxis_fg_tf = tf_ts_svg
.append("g")
.attr("transform", "translate(0," + height_tf_ts + ")")

xAxis_fg_tf
.call(d3.axisBottom(x_tf_ts).ticks(years_tf_ts.length,'0f'))

// group the data: I want to draw one line per group
var tf_ts_group = d3.nest() // nest function allows to group the calculation per level of a factor
.key(function(d) { return d.Cause;})
.entries(ts_top_five_chosen);

// Add Y axis
var y_tf_ts = d3.scaleLinear()
.domain([0, d3.max(ts_top_five_chosen, function(d) { return +d.Estimate; })])
.range([height_tf_ts, 0]);

var y_tf_ts_axis = tf_ts_svg
.append("g")
.call(d3.axisLeft(y_tf_ts));

var lines_tf = tf_ts_svg
.selectAll(".line")
.data(tf_ts_group)

lines_tf
.enter()
.append("path")
.attr('id', 'tf_lines_old')
.merge(lines_tf) // get the already existing elements as well
.transition() // and apply changes to all of them
.duration(1000)
.attr("fill", "none")
.attr("stroke", function(d){ return color_cause_group_tf(d.key) })
.attr("stroke-width", 1.5)
.attr("d", function(d){
    return d3.line()
  .x(function(d) { return x_tf_ts(d.Year); })
  .y(function(d) { return y_tf_ts(+d.Estimate); })
  (d.values)
})

lines_tf
.on("mouseover", function(){return tooltip.style("visibility", "visible");})
.on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
.on("mouseout", function(){return tooltip.style("visibility", "hidden");});


// Finally, if any original bars need to go now these are removed.
lines_tf
.exit()
.remove()

data = tf_ts_group

tf_ts_svg
.selectAll("myDots")
.data(tf_ts_group)
.enter()
.append('g')
.attr('id', 'tf_dots_old')
.style("fill", function(d){ return color_cause_group_tf(d.key) })
// Second we need to enter in the 'values' part of this group
.selectAll("myPoints")
.data(function(d){ return d.values })
.enter()
.append("circle")
  .attr("cx", function(d) { return x_tf_ts(d.Year) } )
  .attr("cy", function(d) { return y_tf_ts(d.Estimate) } )
  .attr("r", 5)
  .attr("stroke", "white")

tf_ts_svg
.selectAll("myLabels")
.data(tf_ts_group)
.enter()
.append('g')
.append("text")
.attr('id', 'tf_text_old')
.datum(function(d) { return {key: d.key, value: d.values[0]}; })
// .datum(function(d) { return {key: d.key, value: d.values[d.values.length / 2]}; })
.attr("transform", function(d) { return "translate(" + x_tf_ts(d.value.Year) + "," + y_tf_ts(d.value.Estimate) + ")"; }) // Put the text at the position of the last point
.attr('y', -10) // shift the text a bit more right
.text(function(d) { return d.key; })
.style("fill", function(d){ return color_cause_group_tf(d.key) })
.style("font-size", 8)


// This is a function to update the chart with new data (it filters the larger dataset)
function update_fg_tf_ts(selected_measure_tf_option) {

tf_ts_svg
.selectAll("#tf_lines_old")
.transition()
.duration(500)
.remove()

tf_ts_svg
.selectAll("#tf_dots_old")
.transition()
.duration(500)
.remove()

tf_ts_svg
.selectAll("#tf_text_old")
.transition()
.duration(500)
.remove()

var new_sex_tf_option = d3.select('#selectSex_ts_Button').property("value")
var new_measure_tf_option = d3.select("#selectMeasure_ts_Button").property('value')

new_filter = json_tf_ts.filter(function (d) { // gets a subset of the json data - This time it excludes SE and England values
    return d.measure === new_measure_tf_option &
        d.Sex === new_sex_tf_option
})
    .sort(function (a, b) {
        return d3.ascending(a.Year, b.Year);
    });

var new_tf_ts_group = d3.nest() // nest function allows to group the calculation per level of a factor
.key(function(d) { return d.Cause;})
.entries(new_filter);

// Update y axis limits
y_tf_ts
.domain([0, d3.max(new_filter, function(d) { return +d.Estimate; })])

// Redraw axis
y_tf_ts_axis
.transition()
.duration(1000)
.call(d3.axisLeft(y_tf_ts));

var lines_tf = tf_ts_svg
.selectAll(".line")
.data(new_tf_ts_group)

setTimeout(function(){
lines_tf
.enter()
.append("path")
.attr('id', 'tf_lines_old')
.merge(lines_tf) // get the already existing elements as well
.transition() // and apply changes to all of them
.duration(1000)
.attr("fill", "none")
.attr("stroke", function(d){ return color_cause_group_tf(d.key) })
.attr("stroke-width", 1.5)
.attr("d", function(d){
    return d3.line()
  .x(function(d) { return x_tf_ts(d.Year); })
  .y(function(d) { return y_tf_ts(+d.Estimate); })
  (d.values)
})

tf_ts_svg
.selectAll("myDots")
.data(new_tf_ts_group)
.enter()
.append('g')
.attr('id', 'tf_dots_old')
.style("fill", function(d){ return color_cause_group_tf(d.key) })
// Second we need to enter in the 'values' part of this group
.selectAll("myPoints")
.data(function(d){ return d.values })
.enter()
.append("circle")
  .attr("cx", function(d) { return x_tf_ts(d.Year) } )
  .attr("cy", function(d) { return y_tf_ts(d.Estimate) } )
  .attr("r", 5)
  .attr("stroke", "white")

tf_ts_svg
.selectAll("myLabels")
.data(new_tf_ts_group)
.enter()
.append('g')
.append("text")
.attr('id', 'tf_text_old')
.datum(function(d) { return {key: d.key, value: d.values[0]}; })
// .datum(function(d) { return {key: d.key, value: d.values[d.values.length / 2]}; })
.attr("transform", function(d) { return "translate(" + x_tf_ts(d.value.Year) + "," + y_tf_ts(d.value.Estimate) + ")"; }) // Put the text at the position of the last point
.attr('y', -10) // shift the text a bit more right
.text(function(d) { return d.key; })
.style("fill", function(d){ return color_cause_group_tf(d.key) })
.style("font-size", 8)

}, 500);

lines_tf
.exit()
.remove()

}

d3.select("#selectSex_ts_Button").on("change", function (d) {
  update_fg_tf_ts(data)
})

d3.select("#selectMeasure_ts_Button").on("change", function (d) {
  update_fg_tf_ts(data)
})

d3.select("#selectArea_ts_Button").on("change", function (d) {
  update_fg_tf_ts(data)
})
