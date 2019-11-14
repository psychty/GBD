// Specify a colour palette and order
var cause_categories = ["HIV/AIDS and sexually transmitted infections", "Respiratory infections and tuberculosis", "Enteric infections", "Neglected tropical diseases and malaria", "Other infectious diseases", "Maternal and neonatal disorders", "Nutritional deficiencies", "Neoplasms", "Cardiovascular diseases", "Chronic respiratory diseases", "Digestive diseases", "Neurological disorders", "Mental disorders", "Substance use disorders", "Diabetes and kidney diseases", "Skin and subcutaneous diseases", "Sense organ diseases", "Musculoskeletal disorders", "Other non-communicable diseases", "Transport injuries", "Unintentional injuries", "Self-harm and interpersonal violence"]

var color_cause_group = d3.scaleOrdinal()
  .domain(cause_categories)
  .range(["#F8DDEB", "#F2B9BF", "#EE9187", "#EA695C", "#D84D42", "#AD3730", "#7A1C1C", '#BCD6F7','#97C4F0','#67A8E7','#528CDB','#376ACB',"#1845A5", '#CFD6F6','#ADB9ED','#8B96DD','#6978D0', "#4E4FB8", "#3E3294", "#B5DCD0", "#76B786", '#477A49']);

var measure_categories = ['Deaths', 'YLLs (Years of Life Lost)', 'YLDs (Years Lived with Disability)', 'DALYs (Disability-Adjusted Life Years)']

var ages = ["Early Neonatal", "Late Neonatal", "Post Neonatal", "1 to 4", "5 to 9", "10 to 14", "15 to 19", "20 to 24", "25 to 29", "30 to 34", "35 to 39", "40 to 44", "45 to 49", "50 to 54", "55 to 59", "60 to 64", "65 to 69", "70 to 74", "75 to 79", "80 to 84", "85 to 89", "90 to 94", "95 plus"]

var color_age_group = d3.scaleOrdinal()
    .domain(ages)
    .range(["#ff82a1", "#d0005a", "#903331", "#ffa479", "#ae7300", "#eba100", "#e9c254", "#b99700", "#6dba1c", "#3b5b2c", "#a2d39b", "#00bb53", "#008f69", "#5adbb5", "#00b1b8", "#02b8fe", "#0184e1", "#7d7bff", "#daa3ff", "#713d85", "#c85ae0", "#e0afdd", "#7c3e5f"]);

var label_key = d3.scaleOrdinal()
    .domain(measure_categories)
    .range(['deaths', 'YLLs', 'YLDs',' DALYs'])

// margins
var margin = {top: 30,
              right: 30,
              bottom: 180,
              left: 60};

// Now we can use the global width with
var width_ages = document.getElementById("content_size").offsetWidth;
var height_ages = 400 - margin.top - margin.bottom;


/////////////////
// Age summary //
/////////////////

function age_key_summary() {
    ages.forEach(function (item, index) {
        var list = document.createElement("li");
        list.innerHTML = item;
        list.className = 'cause_list';
        list.style.width = '220px';
        list.style.borderColor = color_age_group(index);
        var div = document.getElementById("age_summary");
        div.appendChild(list);
    })
}

age_key_summary();

// append the svg object to the body of the page before data is loaded
var svg_fg_age_stack_1 = d3.select("#my_lifecourse_condition_dataviz")
.append("svg")
.attr("width", width_ages)
.attr("height", height_ages + 100)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
  .html("<h3>" + sub_cause_groupName + '</h3><p>The estimated number of ' + label_key(d.data.Measure) + ' as a result of ' + sub_cause_groupName.toLowerCase() + ' in West Sussex in 2017 among both males and females aged ' + d.data.Age + ' was <font color = "#1e4b7a"><b>' + d3.format(",.0f")(subgroupValue) + '</b></font>.</p><p>This is <font color = "#1e4b7a"><b>' + d3.format(",.0%")(subgroupValue/d.data.Total_in_age) + '</b></font> of the total ' + label_key(d.data.Measure) + ' in West Sussex among those aged '+ d.data.Age +' (<font color = "#1e4b7a"><b>' + d3.format(",.0f")(d.data.Total_in_age) + '</b></font>)</p>')
  .style("opacity", 1)
  .style("top", (event.pageY - 10) + "px")
  .style("left", (event.pageX + 10) + "px")
  .style("visibility", "visible")

d3.selectAll(".myRect" + subgroup_key)
  .style("opacity", 1)
  .attr("stroke","#000")
  .attr("stroke-width",2)
  }

var mouseleave_stack_1 = function(d) {
var subgroup_key = d3.select(this.parentNode).datum().index
tooltip_age.style("visibility", "hidden")
d3.selectAll(".myRect" + subgroup_key)
  .attr("stroke","none")
  .attr("stroke-width",0)
  .style("opacity", 1)
}

// Add X axis
var x_fg_4 = d3.scaleBand()
.domain(age_groups)
// .range([0, width_ages])
.range([0, width_ages - margin.left - 25])
.padding([0.2])

svg_fg_age_stack_1
.append("g")
.attr("transform", "translate(0," + height_ages + ")")
.call(d3.axisBottom(x_fg_4).tickSizeOuter(0));

svg_fg_age_stack_1
.selectAll("text")
.attr("transform", "translate(-10,10)rotate(-45)")
.style("text-anchor", "end")

// Add X axis label:
// svg_fg_age_stack_1
// .append("text")
// .attr("text-anchor", "end")
// .attr("x", width_ages/2)
// .attr("y", height_ages + margin.top + 35)
// .text("Age group");

// Y axis label:
svg_fg_age_stack_1
.append("text")
.attr('id', 'axis_y_title')
.attr("text-anchor", "end")
.style('font-size', '12px')
.style('font-weight', 'bold')
.attr("transform", "rotate(-90)")
.attr("y", - margin.left + 10)
.attr("x", - margin.top - 40)
.text('Number');

 // // Add Y axis
var y_fg_4 = d3.scaleLinear()
.domain([0, 2000])
.range([height_ages, 0 ]);

var yAxis_fg_4 = svg_fg_age_stack_1.append("g")
.attr("class", "myYaxis")

svg_fg_age_stack_1
.append("text")
.attr("text-anchor", "start")
.attr("y", 5)
.attr("x", (width_ages / 100) * 1)
.style('font-size', '10px')
.attr('opacity', 0)
.transition()
.duration(2000)
.attr('opacity', 1)
.text('Note that as the data changes,');

svg_fg_age_stack_1
.append("text")
.attr("text-anchor", "start")
.attr("y", 15)
.attr("x", (width_ages / 100) * 1)
.style('font-size', '10px')
.attr('opacity', 0)
.transition()
.duration(2000)
.attr('opacity', 1)
.text('the y axis scale is updated');

function update_age(e) {

e = e || window.event;

var src = e.target;
var items = document.querySelectorAll('.switch-field-fg-age button');
   items.forEach(function(item) {
   item.classList.remove('active');
 })

src.classList.toggle('active');
var filter = src.dataset.filter;
var data = this[filter];

svg_fg_age_stack_1
.selectAll("#age_stack_label_1")
.remove();

svg_fg_age_stack_1
.selectAll("#age_stack_label_2")
.remove();

svg_fg_age_stack_1
.selectAll("rect")
.remove();

svg_fg_age_stack_1
.append("text")
.attr("text-anchor", "start")
.attr('id', 'age_stack_label_1')
.attr("y", 70)
.attr("x", (width_ages / 100) * 10)
.style('font-size', '12px')
.attr('opacity', 0)
.transition()
.duration(2000)
.attr('opacity', 1)
.text('Click on one of the stacked bars');

svg_fg_age_stack_1
.append("text")
.attr('id', 'age_stack_label_2')
.attr("text-anchor", "start")
.attr("y", 85)
.attr("x", (width_ages / 100) * 10)
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

svg_fg_age_stack_1
.selectAll("rect")
.transition()
.duration(1000)
.style('opacity', 0)
.remove();

svg_fg_age_stack_1
.selectAll("#age_stack_label_1")
.remove();

svg_fg_age_stack_1
.selectAll("#age_stack_label_2")
.remove();

svg_fg_age_stack_1
.selectAll("#age_stack_label_3")
.remove();

svg_fg_age_stack_1
.append("text")
.attr("text-anchor", "start")
.attr('id', 'age_stack_label_1')
.attr("y", 70)
.attr("x", (width_ages / 100) * 10)
.style('font-size', '12px')
.attr('opacity', 0)
.transition()
.duration(2000)
.attr('opacity', 1)
.text('Click again on one of the bars');

svg_fg_age_stack_1
.append("text")
.attr('id', 'age_stack_label_2')
.attr("text-anchor", "start")
.attr("y", 85)
.attr("x", (width_ages / 100) * 10)
.style('font-size', '12px')
.attr('opacity', 0)
.transition()
.duration(2000)
.attr('opacity', 1)
.text('to return to all conditions.');

svg_fg_age_stack_1
.append("text")
.attr("text-anchor", "start")
.attr('id', 'age_stack_label_1')
.attr("y", 50)
.attr("x", (width_ages / 100) * 10)
.style('font-weight', 'bold')
.attr('opacity', 0)
.transition()
.duration(2000)
.attr('opacity', 1)
.text(sub_cause_groupName);

setTimeout(function(){
svg_fg_age_stack_1
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
  return height_ages - (y_fg_4(d[0]) - y_fg_4(d[1])); })
.attr("height", function(d) {
  return y_fg_4(d[0]) - y_fg_4(d[1]); })
.attr("width", x_fg_4.bandwidth())
.style("opacity", 1)
.on("mousemove", showTooltip_age)
.on('mouseout', mouseleave_stack_1)
.on('click', restore_stacks)
}, 500);
}

var restore_stacks = function(d){
svg_fg_age_stack_1
.selectAll("rect")
.transition()
.duration(1000)
.style('opacity', 0)
.remove();

svg_fg_age_stack_1
.selectAll("#age_stack_label_1")
.remove();

svg_fg_age_stack_1
.selectAll("#age_stack_label_2")
.remove();

svg_fg_age_stack_1
.append("text")
.attr("text-anchor", "start")
.attr('id', 'age_stack_label_1')
.attr("y", 70)
.attr("x", (width_ages / 100) * 10)
.style('font-size', '12px')
.attr('opacity', 0)
.transition()
.duration(2000)
.attr('opacity', 1)
.text('Click on one of the stacked bars');

svg_fg_age_stack_1
.append("text")
.attr('id', 'age_stack_label_2')
.attr("text-anchor", "start")
.attr("y", 85)
.attr("x", (width_ages / 100) * 10)
.style('font-size', '12px')
.attr('opacity', 0)
.transition()
.duration(2000)
.attr('opacity', 1)
.text('to show the condition group on its own.');

y_fg_4
.domain([0, figure_4_y_max]);

yAxis_fg_4
.transition()
.duration(1000)
.call(d3.axisLeft(y_fg_4));

setTimeout(function(){
svg_fg_age_stack_1
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
.style("opacity", 1)
.on("mousemove", showTooltip_age)
.on('mouseout', mouseleave_stack_1)
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

svg_fg_age_stack_1
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
  .style("opacity", 1)
  .on("mousemove", showTooltip_age)
  .on('mouseout', mouseleave_stack_1)
  .on('click', selected_stack)

}

var button = document.querySelector('.switch-field-fg-age button');
button.click();


/////////////////////////////////
// x = age stacks = conditions //
/////////////////////////////////

// append the svg object to the body of the page
var svg_fg_age_stack_2 = d3.select("#my_condition_lifecourse_dataviz")
 .append("svg")
 .attr("width", width_ages)
 .attr("height", height_ages + 250)
 .append("g")
 .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var request = new XMLHttpRequest();
    request.open("GET", "./Numbers_lifecourse_persons_by_condition_level_2_2017_west_sussex.json", false);
    request.send(null);
var json = JSON.parse(request.responseText); // parse the fetched json data into a variable

// By age level 2 conditions figure 4
var request = new XMLHttpRequest();
    request.open("GET", "./Numbers_lifecourse_persons_conditions_level_2_2017_west_sussex_stack_value_max.json", false);
    request.send(null);
var json_age_max = JSON.parse(request.responseText); // parse the fetched json data into a variable

conditions = d3.map(json, function(d){
  return(d.Cause)})
  .keys();

deaths_condition = json.filter(function(d){
  return d.Measure === 'Deaths'});
yll_condition = json.filter(function(d){
  return d.Measure === 'YLLs (Years of Life Lost)'});
yld_condition = json.filter(function(d){
  return d.Measure === 'YLDs (Years Lived with Disability)'});
daly_condition = json.filter(function(d){
  return d.Measure === 'DALYs (Disability-Adjusted Life Years)'});

var tooltip_condition_age = d3.select("#my_condition_lifecourse_dataviz")
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

var showTooltip_condition_age = function(d) {
  tooltip_condition_age
    .transition()
    .duration(200);

var subgroupName = d3.select(this.parentNode).datum().key;
var subgroupValue = d.data[subgroupName];
var subgroup_age_key = d3.select(this.parentNode).datum().index

tooltip_condition_age
.html("<h3>" + subgroupName + '</h3><h5>' + d.data.Cause + '</h5><p>The estimated number of ' + label_key(d.data.Measure) + ' as a result of ' + d.data.Cause  + ' among those aged ' + subgroupName + ' in West Sussex in 2017 was <font color = "#1e4b7a"><b>' + d3.format(",.0f")(subgroupValue) + '</b></font>.</p><p>This is <font color = "#1e4b7a"><b>' + d3.format(",.0%")(subgroupValue/d.data.Total_in_condition) + '</b></font> of the total ' + label_key(d.data.Measure) + ' in West Sussex from this cause (<font color = "#1e4b7a"><b>' + d3.format(",.0f")(d.data.Total_in_condition) + '</b></font>)</p>')
.style("opacity", 1)
.style("top", (event.pageY - 10) + "px")
.style("left", (event.pageX + 10) + "px")
.style("visibility", "visible")

 d3.selectAll(".myRect_age_" + subgroup_age_key)
   .style("opacity", 1)
   .attr("stroke","#000")
   .attr("stroke-width",2)
}

var mouseleave_stack_2 = function(d) {
var subgroup_age_key = d3.select(this.parentNode).datum().index
tooltip_condition_age.style("visibility", "hidden")
d3.selectAll(".myRect_age_" + subgroup_age_key)
  .attr("stroke","none")
  .attr("stroke-width",0)
  .style("opacity", 1)
}


// Add X axis
var x_fg_5 = d3.scaleBand()
 .domain(conditions)
 .range([0, width_ages - margin.left - 25])
 .padding([0.2])

svg_fg_age_stack_2
 .append("g")
 .attr("transform", "translate(0," + height_ages + ")")
 .call(d3.axisBottom(x_fg_5).tickSizeOuter(0));

svg_fg_age_stack_2
 .selectAll("text")
 .attr("transform", "translate(-10,10)rotate(-90)")
 .style("text-anchor", "end")

// Add X axis label:
svg_fg_age_stack_2
 .append("text")
 .attr("text-anchor", "end")
 .attr("x", width_ages/2)
 .attr("y", height_ages + margin.top + 150)
 .text("Condition");

// Y axis label:
svg_fg_age_stack_2
 .append("text")
 .attr('id', 'axis_y_title')
 .attr("text-anchor", "end")
 .attr("transform", "rotate(-90)")
 .attr("y", - margin.left + 10)
 .attr("x", - margin.top - 60)
 .text('Number');

// // Add Y axis
var y_fg_5 = d3.scaleLinear()
    .domain([0, 3000])
    .range([height_ages, 0 ]);

var yAxis_fg_5 = svg_fg_age_stack_2
  .append("g")
  .attr("class", "myYaxis")

svg_fg_age_stack_2
.append("text")
.attr("text-anchor", "start")
.attr("y", 5)
.attr("x", (width_ages / 100) * 1)
.style('font-size', '10px')
.attr('opacity', 0)
.transition()
.duration(2000)
.attr('opacity', 1)
.text('Note that as the data changes,');

svg_fg_age_stack_2
.append("text")
.attr("text-anchor", "start")
.attr("y", 15)
.attr("x", (width_ages / 100) * 1)
.style('font-size', '10px')
.attr('opacity', 0)
.transition()
.duration(2000)
.attr('opacity', 1)
.text('the y axis scale is updated');

function update_condition(e) {

svg_fg_age_stack_2
.selectAll("rect")
.remove();

svg_fg_age_stack_2
.selectAll("#age_stack_label_1")
.remove();

svg_fg_age_stack_2
.selectAll("#age_stack_label_2")
.remove();

svg_fg_age_stack_2
.selectAll("rect")
.remove();

e = e || window.event;

var src = e.target;
var items = document.querySelectorAll('.switch-field-fg-age_2 button');
  items.forEach(function(item) {
  item.classList.remove('active');
    })

src.classList.toggle('active');
var filter = src.dataset.filter;
var data = this[filter];

var measure_name_fg_5 = d3.map(data, function(d){
  return(d.Measure)})
  .keys();

   svg_fg_age_stack_2
   .append("text")
   .attr("text-anchor", "start")
   .attr('id', 'age_stack_label_1')
   .attr("y", function(d) {
     if (measure_name_fg_5[0] === 'DALYs (Disability-Adjusted Life Years)') {
       return 60 }
       else {
       return 70 }
             })
   .attr("x", function(d) {
     if (measure_name_fg_5[0] === 'YLDs (Years Lived with Disability)') {
       return (width_ages / 100) * 10 }
       else {
       return (width_ages / 100) * 50 }
             })
   .style('font-size', '12px')
   .attr('opacity', 0)
   .transition()
   .duration(2000)
   .attr('opacity', 1)
   .text('Click on one of the stacked bars');

   svg_fg_age_stack_2
   .append("text")
   .attr('id', 'age_stack_label_2')
   .attr("text-anchor", "start")
   .attr("y", function(d) {
     if (measure_name_fg_5[0] === 'DALYs (Disability-Adjusted Life Years)') {
       return 75 }
       else {
       return 85 }
             })
   .attr("x", function(d) {
     if (measure_name_fg_5[0] === 'YLDs (Years Lived with Disability)') {
       return (width_ages / 100) * 10 }
       else {
       return (width_ages / 100) * 50 }
             })
   .style('font-size', '12px')
   .attr('opacity', 0)
   .transition()
   .duration(2000)
   .attr('opacity', 1)
   .text('to show the age group on its own.');

var selected_age_stack = function(d) {
var sub_age_groupName = d3.select(this.parentNode).datum().key;
var sub_age_groupValue = d.data[sub_age_groupName];

select_age_stack_data = stackedData.filter(function(d){
return d.key === sub_age_groupName});

var measure_name_fg_5 = d3.map(data, function(d){
   return(d.Measure)})
   .keys();

age_values_selected = json_age_max.filter(function(d){
      return d.Age === sub_age_groupName &
             d.Measure === measure_name_fg_5[0]});

var measure_name_fg_5 = d3.map(data, function(d){
   return(d.Measure)})
   .keys();

y_fg_5
.domain([0, age_values_selected[0].Estimate_max]);

// This adds a transition effect on the change between datasets (i.e. if the yaxis needs to be longer or shorter).
yAxis_fg_5
.transition()
.duration(1000)
.call(d3.axisLeft(y_fg_5));

svg_fg_age_stack_2
.selectAll("rect")
.transition()
.duration(1000)
.style('opacity', 0)
.remove();

svg_fg_age_stack_2
.selectAll("#age_stack_label_1")
.remove();

svg_fg_age_stack_2
.selectAll("#age_stack_label_2")
.remove();

svg_fg_age_stack_2
.selectAll("#age_stack_label_3")
.remove();

svg_fg_age_stack_2
.append("text")
.attr("text-anchor", "start")
.attr('id', 'age_stack_label_1')
.attr('y', 70)
.attr("x", function(d) {
 if (measure_name_fg_5[0] === 'YLDs (Years Lived with Disability)') {
   return (width_ages / 100) * 10 }
   else {
   return (width_ages / 100) * 50 }
   })
.style('font-size', '12px')
.attr('opacity', 0)
.transition()
.duration(2000)
.attr('opacity', 1)
.text('Click again on one of the bars');

svg_fg_age_stack_2
.append("text")
.attr('id', 'age_stack_label_2')
.attr("text-anchor", "start")
.attr("y", 85)
.attr("x", function(d) {
 if (measure_name_fg_5[0] === 'YLDs (Years Lived with Disability)') {
 return (width_ages / 100) * 10 }
 else {
 return (width_ages / 100) * 50 }
 })
.style('font-size', '12px')
.attr('opacity', 0)
.transition()
.duration(2000)
.attr('opacity', 1)
.text('to return to all age groups.');

svg_fg_age_stack_2
.append("text")
.attr("text-anchor", "start")
.attr('id', 'age_stack_label_1')
.attr("y", 50)
.attr("x", (width_ages / 100) * 10)
.style('font-weight', 'bold')
.attr('opacity', 0)
.transition()
.duration(2000)
.attr('opacity', 1)
.text(sub_age_groupName);

 setTimeout(function(){
 svg_fg_age_stack_2
 .append("g")
 .selectAll("g")
 .data(select_age_stack_data) // Enter in the stack data = loop key per key = group per group
 .enter()
 .append("g")
 .attr("fill", function(d) { return color_age_group(d.key); })
 .attr("class", function(d, i){ return "myRect_age_" + i }) // Add an id to each subgroup: their name
 .selectAll("rect")
 .data(function(d) { return d; })// enter a second time = loop subgroup per subgroup to add all rectangles
 .enter()
 .append("rect")
 .attr("x", function(d) {
return x_fg_5(d.data.Cause); })
 .attr("y", function(d) {
     return height_ages - (y_fg_5(d[0]) - y_fg_5(d[1])); })
 .attr("height", function(d) {
 return y_fg_5(d[0]) - y_fg_5(d[1]); })
.attr("width", x_fg_5.bandwidth())
.style("opacity", 1)
.on("mousemove", showTooltip_condition_age)
.on('mouseout', mouseleave_stack_2)
.on('click', restore_age_stacks)
 }, 500);
 }

var restore_age_stacks = function(d){
svg_fg_age_stack_2
.selectAll("rect")
.transition()
.duration(1000)
.style('opacity', 0)
.remove();

svg_fg_age_stack_2
.selectAll("#age_stack_label_1")
.remove();

svg_fg_age_stack_2
.selectAll("#age_stack_label_2")
.remove();

svg_fg_age_stack_2
.append("text")
.attr("text-anchor", "start")
.attr('id', 'age_stack_label_1')
.attr("y", function(d) {
 if (measure_name_fg_5[0] === 'DALYs (Disability-Adjusted Life Years)') {
     return 60 }
     else {
     return 70 }
     })
.attr("x", function(d) {
 if (measure_name_fg_5[0] === 'YLDs (Years Lived with Disability)') {
     return (width_ages / 100) * 10 }
     else {
     return (width_ages / 100) * 50 }
     })
.style('font-size', '12px')
.attr('opacity', 0)
.transition()
.duration(2000)
.attr('opacity', 1)
.text('Click on one of the stacked bars');

svg_fg_age_stack_2
.append("text")
.attr('id', 'age_stack_label_2')
.attr("text-anchor", "start")
.attr("y", function(d) {
 if (measure_name_fg_5[0] === 'DALYs (Disability-Adjusted Life Years)') {
   return 75 }
   else {
   return 85 }
   })
.attr("x", function(d) {
 if (measure_name_fg_5[0] === 'YLDs (Years Lived with Disability)') {
   return (width_ages / 100) * 10 }
   else {
   return (width_ages / 100) * 50 }
   })
.style('font-size', '12px')
.attr('opacity', 0)
.transition()
.duration(2000)
.attr('opacity', 1)
.text('to show the age group on its own.');

y_fg_5
.domain([0, figure_5_y_max]);

yAxis_fg_5
.transition()
.duration(1000)
.call(d3.axisLeft(y_fg_5));

setTimeout(function(){
svg_fg_age_stack_2
.append("g")
.selectAll("g")
.data(stackedData) // Enter in the stack data = loop key per key = group per group
.enter()
.append("g")
.attr("fill", function(d) { return color_age_group(d.key); })
.attr("class", function(d, i){ return "myRect_age_" + i })
.selectAll("rect")
.data(function(d) { return d; })
.enter()
.append("rect")
.attr("x", function(d) {
  return x_fg_5(d.data.Cause); })
.attr("y", function(d) {
 return y_fg_5(d[1]); })
.attr("height", function(d) {
 return y_fg_5(d[0]) - y_fg_5(d[1]); })
.attr("width", x_fg_5.bandwidth())
.style("opacity", 1)
.on("mousemove", showTooltip_condition_age)
.on('mouseout', mouseleave_stack_2)
.on('click', selected_age_stack)

}, 750);
}

var stackedData = d3.stack()
    .keys(ages)
    (data)

var figure_5_y_max = [];
switch(measure_name_fg_5[0]) {
case 'Deaths':
  figure_5_y_max = 3000;
  break;
case 'YLLs (Years of Life Lost)':
 figure_5_y_max = 45000;
 break;
case 'YLDs (Years Lived with Disability)':
 figure_5_y_max = 30000;
 break;
case 'DALYs (Disability-Adjusted Life Years)':
 figure_5_y_max = 50000;
 }

y_fg_5
.domain([0, figure_5_y_max]);

yAxis_fg_5
.transition()
.duration(1000)
.call(d3.axisLeft(y_fg_5));

var condition_bars_df = svg_fg_age_stack_2.append("g")
.selectAll("g")
.data(stackedData) // Enter in the stack data = loop key per key = group per group
.enter()
.append("g")
.attr("fill", function(d) { return color_age_group(d.key); })
.attr("class", function(d, i){ return "myRect_age_" + i })
.selectAll("rect")
.data(function(d) { return d; })
.enter()
.append("rect")
.attr("x", function(d) {
 return x_fg_5(d.data.Cause); })
.attr("y", function(d) {
 return y_fg_5(d[1]); })
.attr("height", function(d) {
 return y_fg_5(d[0]) - y_fg_5(d[1]); })
.attr("width", x_fg_5.bandwidth())
.on("mousemove", showTooltip_condition_age)
.on('mouseout', mouseleave_stack_2)
.on('click', selected_age_stack)

condition_bars_df
 .exit()
 .remove()
}


// update_condition(deaths_condition)


// age by conditions proportion
//
// // append the svg object to the body of the page
// var svg_fg_5_prop = d3.select("#my_condition_lifecourse_proportion_dataviz")
//  .append("svg")
//  .attr("width", width_ages)
//  .attr("height", height_ages + 250)
//  .append("g")
//  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//
//
// // This is the proportion of a conditions burden by the age of people. If the condition is estimated to cause 100 deaths, how many of those deaths are among people of a certain age. It shows us that certain diseases impact people of particular ages disproportionately.
// var request = new XMLHttpRequest();
//     request.open("GET", "./Proportion_lifecourse_persons_by_condition_level_2_2017_west_sussex.json", false);
//     request.send(null);
// var json = JSON.parse(request.responseText); // parse the fetched json data into a variable
//
// deaths_condition_proportion = json.filter(function(d){
//   return d.Measure === 'Deaths'});
// yll_condition_proportion = json.filter(function(d){
//   return d.Measure === 'YLLs (Years of Life Lost)'});
// yld_condition_proportion = json.filter(function(d){
//   return d.Measure === 'YLDs (Years Lived with Disability)'});
// daly_condition_proportion = json.filter(function(d){
//   return d.Measure === 'DALYs (Disability-Adjusted Life Years)'});
//
//
// var tooltip_condition_age_prop = d3.select("#my_condition_lifecourse_proportion_dataviz")
// .append("div")
// .style("opacity", 0)
// .attr("class", "tooltip_bars")
// .style("position", "absolute")
// .style("z-index", "10")
// .style("background-color", "white")
// .style("border", "solid")
// .style("border-width", "1px")
// .style("border-radius", "5px")
// .style("padding", "10px")
//
// var showTooltip_condition_age_prop = function(d) {
// tooltip_condition_age_prop
// .transition()
// .duration(200);
//
// var subgroupName_prop = d3.select(this.parentNode).datum().key;
// var subgroupValue_prop = d.data[subgroupName_prop];
// var subgroup_age_key = d3.select(this.parentNode).datum().index
//
// tooltip_condition_age_prop
//  .html("<h3>" + d.data.Cause + '</h3><p>The estimated proportion of ' + label_key(d.data.Measure) + ' as a result of ' + d.data.Cause  + ' among those aged ' + subgroupName_prop + ' in West Sussex in 2017 was <font color = "#1e4b7a"><b>' + d3.format(",.1%")(subgroupValue_prop) + '</b></font>.</p>')
//  .style("opacity", 1)
//  .style("top", (event.pageY - 10) + "px")
//  .style("left", (event.pageX + 10) + "px")
//
//  d3.selectAll(".myRect_age_" + subgroup_age_key)
//    .style("opacity", 1)
//    .attr("stroke","#000")
//    .attr("stroke-width",2)
// }
//
// var mouseleave_stack_3 = function(d) {
// var subgroup_age_key = d3.select(this.parentNode).datum().index
// tooltip_condition_age_prop.style("visibility", "hidden")
// d3.selectAll(".myRect_age_" + subgroup_age_key)
//   .attr("stroke","none")
//   .attr("stroke-width",0)
//   .style("opacity", 1)
// }
//
// // Add X axis
// var x_fg_5_prop = d3.scaleBand()
//  .domain(conditions)
//  // .range([0, width_ages])
//  .range([0, width_ages - margin.left - 50])
//  .padding([0.2])
//
// svg_fg_5_prop
//  .append("g")
//  .attr("transform", "translate(0," + height_ages + ")")
//  .call(d3.axisBottom(x_fg_5_prop).tickSizeOuter(0));
//
// svg_fg_5_prop
//  .selectAll("text")
//  .attr("transform", "translate(-10,10)rotate(-90)")
//  .style("text-anchor", "end")
//
// // Add X axis label:
// svg_fg_5_prop
//  .append("text")
//  .attr("text-anchor", "end")
//  .attr("x", width_ages/2)
//  .attr("y", height_ages + margin.top + 150)
//  .text("Condition");
//
// // Y axis label:
// svg_fg_5_prop
//  .append("text")
//  .attr('id', 'axis_y_title')
//  .attr("text-anchor", "end")
//  .attr("transform", "rotate(-90)")
//  .attr("y", - margin.left + 10)
//  .attr("x", - margin.top - 60)
//  .text('Proportion');
//
// // Add Y axis
// var y_fg_5_prop = d3.scaleLinear()
//   .domain([0, 100])
//   .range([height_ages, 0 ]);
//
// svg_fg_5_prop
//   .append("g")
//   .call(d3.axisLeft(y_fg_5_prop));
//
// var yAxis_fg_5_prop = svg_fg_5_prop
//   .append("g")
//   .attr("class", "myYaxis")
//
// function update_condition_prop(e) {
//
// svg_fg_5_prop
//  .selectAll("rect")
//  .remove();
//
//  e = e || window.event;
//
//  var src = e.target;
//  var items = document.querySelectorAll('.switch-field-fg-age_2 button');
//    items.forEach(function(item) {
//    item.classList.remove('active');
//      })
//
//  src.classList.toggle('active');
//  var filter = src.dataset.filter;
//  var data = this[filter];
//
// var stackedData = d3.stack()
//   .keys(ages)(data)
//
// var measure_name = d3.map(data, function(d){
//   return(d.Measure)})
//   .keys();
//
// // This adds a transition effect on the change between datasets (i.e. if the yaxis needs to be longer or shorter).
// yAxis_fg_5_prop
//   .transition()
//   .duration(1000)
//   .call(d3.axisLeft(y_fg_5_prop));
//
// var condition_bars_df_prop = svg_fg_5_prop.append("g")
//   .selectAll("g")
//   .data(stackedData) // Enter in the stack data = loop key per key = group per group
//   .enter()
//   .append("g")
//   .attr("fill", function(d) { return color_age_group(d.key); })
//   .attr("class", function(d, i){ return "myRect_age_" + i })
//   .selectAll("rect")
//   .data(function(d) { return d; })// enter a second time = loop subgroup per subgroup to add all rectangles
//   .enter()
//   .append("rect")
//   .attr("x", function(d) {
//     return x_fg_5_prop(d.data.Cause); })
//   .attr("y", function(d) {
//     return y_fg_5_prop(d[1]); })
//   .attr("height", function(d) {
//     return y_fg_5_prop(d[0]) - y_fg_5_prop(d[1]); })
//   .attr("width", x_fg_5.bandwidth())
//   .on("mousemove", showTooltip_condition_age_prop)
//   .on("mouseout", mouseleave_stack_3)
//
// condition_bars_df_prop
//   .exit()
//   .remove()
// }

var button = document.querySelector('.switch-field-fg-age_2 button');
button.click();
