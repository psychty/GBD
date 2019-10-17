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
var sub_age_groupName = d3.select(this.parentNode).datum().key;
var subgroupValue = d.data[sub_age_groupName];




tooltip_age
  .html("<h3>" + sub_age_groupName + '</h3><p>The estimated number of ' + label_key(d.data.Measure) + ' as a result of ' + sub_age_groupName.toLowerCase() + ' in West Sussex in 2017 among both males and females aged ' + d.data.Age + ' was <font color = "#1e4b7a"><b>' + d3.format(",.0f")(subgroupValue) + '</b></font>.</p><p>This is <font color = "#1e4b7a"><b>' + d3.format(",.0%")(subgroupValue/d.data.Total_in_age) + '</b></font> of the total ' + label_key(d.data.Measure) + ' in West Sussex among this age group (<font color = "#1e4b7a"><b>' + d3.format(",.0f")(d.data.Total_in_age) + '</b></font>)</p>')
  .style("opacity", 1)
  .style("top", (event.pageY - 10) + "px")
  .style("left", (event.pageX + 10) + "px")
  .style("visibility", "visible")
  }

var mouseleave = function(d) {
  // d3.selectAll(".myRect").style("opacity",1)
  tooltip_age.style("visibility", "hidden")
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

function update_age(data) {

  svg_fg_4
   .selectAll("rect")
   .remove();

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
 figure_4_y_max = 15500;
  break;
case 'YLDs (Years Lived with Disability)':
 figure_4_y_max = 11000;
 break;
case 'DALYs (Disability-Adjusted Life Years)':
  figure_4_y_max = 25000;
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
  .attr("fill", function(d) {
    return color_cause_group(d.key); })
  .attr("class", function(d, i){ return "myRect" + i }) // Add a class to each subgroup: their name
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
  .style("opacity",0.7)
  .on("mousemove", showTooltip_age)
  .on('mouseout', mouseleave)
  .on('mouseover', function(d){
    var subgroup_key = d3.select(this.parentNode).datum().index

    d3.select(this).attr("stroke","white").attr("stroke-width",1);
    d3.select(this).style("opacity",1);
    d3.selectAll(".myRect").style("opacity", 0.2) // Reduce opacity of all rect to 0.2
    d3.selectAll("myRect" + subgroup_key) // Highlight all rects of this subgroup with opacity 0.8.
      .style("opacity", 1)
        })
  .on('mouseout', function(d){
    d3.select(this).attr("stroke","none").attr("stroke-width",0);
    d3.select(this).style("opacity",0.7);
  })




}

update_age(deaths_age)
