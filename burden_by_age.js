// Specify a colour palette and order
var cause_categories = ["HIV/AIDS and sexually transmitted infections", "Respiratory infections and tuberculosis", "Enteric infections", "Neglected tropical diseases and malaria", "Other infectious diseases", "Maternal and neonatal disorders", "Nutritional deficiencies", "Neoplasms", "Cardiovascular diseases", "Chronic respiratory diseases", "Digestive diseases", "Neurological disorders", "Mental disorders", "Substance use disorders", "Diabetes and kidney diseases", "Skin and subcutaneous diseases", "Sense organ diseases", "Musculoskeletal disorders", "Other non-communicable diseases", "Transport injuries", "Unintentional injuries", "Self-harm and interpersonal violence"]

var color_cause_group = d3.scaleOrdinal()
  .domain(cause_categories)
  .range(["#F8DDEB", "#F2B9BF", "#EE9187", "#EA695C", "#D84D42", "#AD3730", "#7A1C1C", '#BCD6F7','#97C4F0','#67A8E7','#528CDB','#376ACB',"#1845A5", '#CFD6F6','#ADB9ED','#8B96DD','#6978D0', "#4E4FB8", "#3E3294", "#B5DCD0", "#76B786", '#477A49']);

var measure_categories = ['Deaths', 'YLLs (Years of Life Lost)', 'YLDs (Years Lived with Disability)', 'DALYs (Disability-Adjusted Life Years)']

var label_key = d3.scaleOrdinal()
    .domain(measure_categories)
    .range(['deaths', 'YLLs', 'YLDs',' DALYs'])

// margins
var margin = {top: 30,
              right: 30,
              bottom: 150,
              left: 60};

// Now we can use the global width with
var width_fg_4 = window.innerWidth / 2 - margin.left - margin.right;
var height_fg_4 = 400 - margin.top - margin.bottom;

// By age level 2 conditions figure 4
var request = new XMLHttpRequest();
    request.open("GET", "./Numbers_lifecourse_persons_level_2_2017_west_sussex.json", false);
    request.send(null);
var json = JSON.parse(request.responseText); // parse the fetched json data into a variable

// By age level 2 conditions figure 4
var request = new XMLHttpRequest();
    request.open("GET", "./Numbers_lifecourse_persons_level_2_2017_west_sussex_stack_value_max.json", false);
    request.send(null);
var json_max = JSON.parse(request.responseText); // parse the fetched json data into a variable

age_groups = d3.map(json, function(d){
  return(d.Age)})
  .keys();

deaths_age = json.filter(function(d){
  return d.Measure === 'Deaths'});
yll_age = json.filter(function(d){
  return d.Measure === 'YLLs (Years of Life Lost)'});
yld_age = json.filter(function(d){
  return d.Measure === 'YLDs (Years Lived with Disability)'});
daly_age = json.filter(function(d){
  return d.Measure === 'DALYs (Disability-Adjusted Life Years)'});

var tooltip_age = d3.select("#my_lifecourse_condition_dataviz")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip_stacked_bars")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "1px")
  .style("border-radius", "5px")
  .style("padding", "10px")

var showTooltip_age = function(d, i) {
var sub_cause_groupName = d3.select(this.parentNode).datum().key;
var subgroupValue = d.data[sub_cause_groupName];
var subgroup_key = d3.select(this.parentNode).datum().index

tooltip_age
  .html("<h3>" + sub_cause_groupName + '</h3><p>The estimated number of ' + label_key(d.data.Measure) + ' as a result of ' + sub_cause_groupName.toLowerCase() + ' in West Sussex in 2017 among both males and females aged ' + d.data.Age + ' was <font color = "#1e4b7a"><b>' + d3.format(",.0f")(subgroupValue) + '</b></font>.</p><p>This is <font color = "#1e4b7a"><b>' + d3.format(",.0%")(subgroupValue/d.data.Total_in_age) + '</b></font> of the total ' + label_key(d.data.Measure) + ' in West Sussex among this age group (<font color = "#1e4b7a"><b>' + d3.format(",.0f")(d.data.Total_in_age) + '</b></font>)</p>')
  .style("opacity", 1)
  .style("top", (event.pageY - 10) + "px")
  .style("left", (event.pageX + 10) + "px")
  .style("visibility", "visible")

d3.selectAll(".myRect" + subgroup_key)
  .style("opacity", 1)
  .attr("stroke","#000")
  .attr("stroke-width",2)
  }

var mouseleave = function(d) {
var subgroup_key = d3.select(this.parentNode).datum().index
tooltip_age.style("visibility", "hidden")
d3.selectAll(".myRect" + subgroup_key)
  .attr("stroke","none")
  .attr("stroke-width",0)
  .style("opacity", 0.6)
}

// append the svg object to the body of the page
var svg_fg_4 = d3.select("#my_lifecourse_condition_dataviz")
.append("svg")
.attr("width", width)
.attr("height", height_fg_4 + 100)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Add X axis
var x_fg_4 = d3.scaleBand()
.domain(age_groups)
.range([0, width_fg_4])
.padding([0.2])

svg_fg_4
.append("g")
.attr("transform", "translate(0," + height_fg_4 + ")")
.call(d3.axisBottom(x_fg_4).tickSizeOuter(0));

svg_fg_4
.selectAll("text")
.attr("transform", "translate(-10,10)rotate(-45)")
.style("text-anchor", "end")

// Add X axis label:
svg_fg_4
.append("text")
.attr("text-anchor", "end")
.attr("x", width/2)
.attr("y", height_fg_4 + margin.top + 35)
.text("Age group");

// Y axis label:
svg_fg_4
.append("text")
.attr('id', 'axis_y_title')
.attr("text-anchor", "end")
.attr("transform", "rotate(-90)")
.attr("y", - margin.left + 10)
.attr("x", - margin.top - 60)
.text('Number');

 // // Add Y axis
var y_fg_4 = d3.scaleLinear()
.domain([0, 2000])
.range([height_fg_4, 0 ]);

var yAxis_fg_4 = svg_fg_4.append("g")
.attr("class", "myYaxis")

svg_fg_4
.append("text")
.attr("text-anchor", "start")
.attr("y", 10)
.attr("x", (width / 100) * 1)
.style('font-size', '10px')
.style('font-weight', 'bold')
.attr('opacity', 0)
.transition()
.duration(2000)
.attr('opacity', 1)
.text('Note that as the data changes,');

svg_fg_4
.append("text")
.attr("text-anchor", "start")
.attr("y", 20)
.attr("x", (width / 100) * 1)
.style('font-size', '10px')
.style('font-weight', 'bold')
.attr('opacity', 0)
.transition()
.duration(2000)
.attr('opacity', 1)
.text('the y axis scale is update');

function update_age(data) {

svg_fg_4
.selectAll("#age_stack_label_1")
.remove();

svg_fg_4
.selectAll("#age_stack_label_2")
.remove();

svg_fg_4
.selectAll("rect")
.remove();

svg_fg_4
.append("text")
.attr("text-anchor", "start")
.attr('id', 'age_stack_label_1')
.attr("y", 70)
.attr("x", (width / 100) * 10)
.style('font-size', '12px')
.attr('opacity', 0)
.transition()
.duration(2000)
.attr('opacity', 1)
.text('Click on one of the stacked bars');

svg_fg_4
.append("text")
.attr('id', 'age_stack_label_2')
.attr("text-anchor", "start")
.attr("y", 85)
.attr("x", (width / 100) * 12)
.style('font-size', '12px')
.attr('opacity', 0)
.transition()
.duration(2000)
.attr('opacity', 1)
.text('to show the condition group on its own.');

var selected_stack = function(d) {
var sub_cause_groupName = d3.select(this.parentNode).datum().key;
var subgroupValue = d.data[sub_cause_groupName];

select_stack_data = stackedData.filter(function(d){
   return d.key === sub_cause_groupName});

values_selected = json_max.filter(function(d){
   return d.Cause === sub_cause_groupName &
          d.Measure === measure_name[0]});

y_fg_4
.domain([0, values_selected[0].Estimate_max]);

// This adds a transition effect on the change between datasets (i.e. if the yaxis needs to be longer or shorter).
yAxis_fg_4
.transition()
.duration(1000)
.call(d3.axisLeft(y_fg_4));

svg_fg_4
.selectAll("rect")
.transition()
.duration(1000)
.style('opacity', 0)
.remove();

svg_fg_4
.selectAll("#age_stack_label_1")
.remove();

svg_fg_4
.selectAll("#age_stack_label_2")
.remove();

svg_fg_4
.append("text")
.attr("text-anchor", "start")
.attr('id', 'age_stack_label_1')
.attr("y", 70)
.attr("x", (width / 100) * 10)
.style('font-size', '12px')
.attr('opacity', 0)
.transition()
.duration(2000)
.attr('opacity', 1)
.text('Click again on one of the bars');

svg_fg_4
.append("text")
.attr('id', 'age_stack_label_2')
.attr("text-anchor", "start")
.attr("y", 85)
.attr("x", (width / 100) * 12)
.style('font-size', '12px')
.attr('opacity', 0)
.transition()
.duration(2000)
.attr('opacity', 1)
.text('to return to all conditions.');

setTimeout(function(){
svg_fg_4
.append("g")
.selectAll("g")
.data(select_stack_data) // Enter in the stack data = loop key per key = group per group
.enter()
.append("g")
.attr("fill", function(d) { return color_cause_group(d.key); })
.attr("class", function(d, i){ return "myRect" + i }) // Add an id to each subgroup: their name
.selectAll("rect")
.data(function(d) { return d; })// enter a second time = loop subgroup per subgroup to add all rectangles
.enter()
.append("rect")
.attr("x", function(d) {
  return x_fg_4(d.data.Age); })
.attr("y", function(d) {
  return height_fg_4 - (y_fg_4(d[0]) - y_fg_4(d[1])); })
.attr("height", function(d) {
  return y_fg_4(d[0]) - y_fg_4(d[1]); })
.attr("width", x_fg_4.bandwidth())
.style("opacity", 1)
.on("mousemove", showTooltip_age)
.on('mouseout', mouseleave)
.on('click', restore_stacks)
}, 500);
}

var restore_stacks = function(d){
svg_fg_4
.selectAll("rect")
.transition()
.duration(1000)
.style('opacity', 0)
.remove();

svg_fg_4
.selectAll("#age_stack_label_1")
.remove();

svg_fg_4
.selectAll("#age_stack_label_2")
.remove();

svg_fg_4
.append("text")
.attr("text-anchor", "start")
.attr('id', 'age_stack_label_1')
.attr("y", 70)
.attr("x", (width / 100) * 10)
.style('font-size', '12px')
.attr('opacity', 0)
.transition()
.duration(2000)
.attr('opacity', 1)
.text('Click on one of the stacked bars');

svg_fg_4
.append("text")
.attr('id', 'age_stack_label_2')
.attr("text-anchor", "start")
.attr("y", 85)
.attr("x", (width / 100) * 12)
.style('font-size', '12px')
.attr('opacity', 0)
.transition()
.duration(2000)
.attr('opacity', 1)
.text('to show the condition group on its own.');

y_fg_4
  .domain([0, figure_4_y_max]);

// This adds a transition effect on the change between datasets (i.e. if the yaxis needs to be longer or shorter).
yAxis_fg_4
  .transition()
  .duration(1000)
  .call(d3.axisLeft(y_fg_4));

setTimeout(function(){
svg_fg_4
.append("g")
.selectAll("g")
.data(stackedData) // Enter in the stack data = loop key per key = group per group
.enter()
.append("g")
.attr("fill", function(d) { return color_cause_group(d.key); })
.attr("class", function(d, i){ return "myRect" + i }) // Add an id to each subgroup: their name
.selectAll("rect")
.data(function(d) { return d; })// enter a second time = loop subgroup per subgroup to add all rectangles
.enter()
.append("rect")
.attr("x", function(d) {
  return x_fg_4(d.data.Age); })
.attr("y", function(d) {
  return y_fg_4(d[1]); })
.attr("height", function(d) {
  return y_fg_4(d[0]) - y_fg_4(d[1]); })
.attr("width", x_fg_4.bandwidth())
.style("opacity", 0.75)
.on("mousemove", showTooltip_age)
.on('mouseout', mouseleave)
.on('click', selected_stack)

}, 750);
}

var stackedData = d3.stack()
    .keys(cause_categories)
      (data)

var measure_name = d3.map(data, function(d){
    return(d.Measure)})
    .keys();

var figure_4_y_max = [];
switch(measure_name[0]) {
case 'Deaths':
  figure_4_y_max = 2000;
  break;
case 'YLLs (Years of Life Lost)':
 figure_4_y_max = 16000;
  break;
case 'YLDs (Years Lived with Disability)':
 figure_4_y_max = 12000;
 break;
case 'DALYs (Disability-Adjusted Life Years)':
  figure_4_y_max = 26000;
}

y_fg_4
  .domain([0, figure_4_y_max]);

// This adds a transition effect on the change between datasets (i.e. if the yaxis needs to be longer or shorter).
yAxis_fg_4
  .transition()
  .duration(1000)
  .call(d3.axisLeft(y_fg_4));

svg_fg_4
  .append("g")
  .selectAll("g")
  .data(stackedData) // Enter in the stack data = loop key per key = group per group
  .enter()
  .append("g")
  .attr("fill", function(d) { return color_cause_group(d.key); })
  .attr("class", function(d, i){ return "myRect" + i }) // Add an id to each subgroup: their name
  .selectAll("rect")
  .data(function(d) { return d; })// enter a second time = loop subgroup per subgroup to add all rectangles
  .enter()
  .append("rect")
  .attr("x", function(d) {
    return x_fg_4(d.data.Age); })
  .attr("y", function(d) {
    return y_fg_4(d[1]); })
  .attr("height", function(d) {
    return y_fg_4(d[0]) - y_fg_4(d[1]); })
  .attr("width", x_fg_4.bandwidth())
  .style("opacity", 0.75)
  .on("mousemove", showTooltip_age)
  .on('mouseout', mouseleave)
  .on('click', selected_stack)

}

update_age(deaths_age)
