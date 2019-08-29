// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 20, left: 50},
    width = 900 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_lifecourse_condition_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

var request = new XMLHttpRequest();
    request.open("GET", "./Numbers_lifecourse_persons_level_2_2017_west_sussex.json", false);
    request.send(null);
var age_json = JSON.parse(request.responseText); // parse the fetched json data into a variable

var request = new XMLHttpRequest()
    request.open("GET", "./Numbers_lifecourse_persons_level_2_2017_west_sussex_max_value.json", false);
    request.send(null);

var max_age_json = JSON.parse(request.responseText); // parse the fetched json data into a variable

deaths_age = age_json.filter(function(d){
	    return d.Measure === 'Deaths'});

yll_age = age_json.filter(function(d){
      return d.Measure === 'YLLs (Years of Life Lost)'});

yld_age = age_json.filter(function(d){
      return d.Measure === 'YLDs (Years Lived with Disability)'});

daly_age = age_json.filter(function(d){
      return d.Measure === 'DALYs (Disability-Adjusted Life Years)'});

var cause_categories = ["HIV/AIDS and sexually transmitted infections", "Respiratory infections and tuberculosis", "Enteric infections", "Neglected tropical diseases and malaria", "Other infectious diseases", "Maternal and neonatal disorders", "Nutritional deficiencies", "Neoplasms", "Cardiovascular diseases", "Chronic respiratory diseases", "Digestive diseases", "Neurological disorders", "Mental disorders", "Substance use disorders", "Diabetes and kidney diseases", "Skin and subcutaneous diseases", "Sense organ diseases", "Musculoskeletal disorders", "Other non-communicable diseases", "Transport injuries", "Unintentional injuries", "Self-harm and interpersonal violence"]

var color_cause_group = d3.scaleOrdinal()
  .domain(cause_categories)
  .range(["#F8DDEB", "#F2B9BF", "#EE9187", "#EA695C", "#D84D42", "#AD3730", "#7A1C1C", '#BCD6F7','#97C4F0','#67A8E7','#528CDB','#376ACB',"#1845A5", '#CFD6F6','#ADB9ED','#8B96DD','#6978D0', "#4E4FB8", "#3E3294", "#B5DCD0", "#76B786", '#477A49']);

var groups = d3.map(age_json, function(d){
  return(d.Age)})
  .keys();


// Add X axis
var x = d3.scaleBand()
      .domain(groups)
      .range([0, width])
      .padding([0.2])
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSizeOuter(0));


// Add Y axis
var y = d3.scaleLinear()
    .domain([0, 2000])
    .range([ height, 0 ]);
  svg.append("g")
    .call(d3.axisLeft(y));

var yAxis = svg.append("g")
    .attr("class", "myYaxis")

var tooltip_age = d3.select("#my_lifecourse_condition_dataviz")
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

  var showTooltip_age = function(d) {
    tooltip_age
      .transition()
      .duration(200);

  var subgroupName = d3.select(this.parentNode).datum().key;
  var subgroupValue = d.data[subgroupName];
  tooltip_age
    .html("<h3>" + subgroupName + '</h3><p>The estimated number of ' + d.Measure + ' as a result of ' + subgroupName + ' in West Sussex in 2017 among both males and females was <font color = "#1e4b7a"><b>' + d3.format(",.0f")(subgroupValue) + '</b></font>.</p>')
    .style("opacity", 1)
    .style("top", (event.pageY - 10) + "px")
    .style("left", (event.pageX + 10) + "px")
    }

function update_age(data) {

  var stackedData = d3.stack()
        .keys(cause_categories)
        (data)

var measure_name = d3.map(data, function(d){
    return(d.Measure)})
    .keys();

// possible bug
// y
//   .domain([0, function(d) {
//     if(measure_name === 'Deaths') return 2000;
//     else if (measure_name === 'YLLs (Years of Life Lost)') return 15500;
//     else if (measure_name === 'YLDs (Years Lived with Disability)') return 11000;
//                return 25000; }]);

// This adds a transition effect on the change between datasets (i.e. if the yaxis needs to be longer or shorter).
yAxis
      .transition()
      .duration(1000)
      .call(d3.axisLeft(y));


var age_bars_df = svg.append("g")
  .selectAll("g")
  .data(stackedData) // Enter in the stack data = loop key per key = group per group
  .enter()
  .append("g")
  .attr("fill", function(d) {
    return color_cause_group(d.key); })
  .selectAll("rect")
  .data(function(d) { return d; })// enter a second time = loop subgroup per subgroup to add all rectangles
  .enter()
  .append("rect")
  .attr("x", function(d) {
    return x(d.data.Age); })
  .attr("y", function(d) {
    return y(d[1]); })
  .attr("height", function(d) {
    return y(d[0]) - y(d[1]); })
  .attr("width", x.bandwidth())
  .on("mouseover", function() {
  return tooltip_age.style("visibility", "visible");
  })
  .on("mousemove", showTooltip_age)
  .on("mouseout", function() {
  return tooltip_age.style("visibility", "hidden");
  })

  age_bars_df
    .exit()
    .remove()
}

update_age(deaths_age)
