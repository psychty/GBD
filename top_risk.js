// set global width and heights to use for our svgs - you can choose not to use these and specify custom values
var width = document.getElementById("content_size").offsetWidth

// Specify a colour palette and order
var cause_categories = ["HIV/AIDS and sexually transmitted infections", "Respiratory infections and tuberculosis", "Enteric infections", "Neglected tropical diseases and malaria", "Other infectious diseases", "Maternal and neonatal disorders", "Nutritional deficiencies", "Neoplasms", "Cardiovascular diseases", "Chronic respiratory diseases", "Digestive diseases", "Neurological disorders", "Mental disorders", "Substance use disorders", "Diabetes and kidney diseases", "Skin and subcutaneous diseases", "Sense organ diseases", "Musculoskeletal disorders", "Other non-communicable diseases", "Transport injuries", "Unintentional injuries", "Self-harm and interpersonal violence"]

var color_cause_group = d3.scaleOrdinal()
.domain(cause_categories)
.range(["#F8DDEB", "#F2B9BF", "#EE9187", "#EA695C", "#D84D42", "#AD3730", "#7A1C1C", '#BCD6F7','#97C4F0','#67A8E7','#528CDB','#376ACB',"#1845A5", '#CFD6F6','#ADB9ED','#8B96DD','#6978D0', "#4E4FB8", "#3E3294", "#B5DCD0", "#76B786", '#477A49']);

var measure_categories = ['Deaths', 'YLLs (Years of Life Lost)', 'YLDs (Years Lived with Disability)', 'DALYs (Disability-Adjusted Life Years)']

var label_key = d3.scaleOrdinal()
.domain(measure_categories)
.range(['deaths', 'YLLs', 'YLDs',' DALYs'])

var risk_key = d3.scaleOrdinal()
.domain(['Environment/Occupational risks','Behavioral risks','Metabolic risks','Burden not attributable to GBD risk factors','Behavioral & Environmental','Environmental & Metabolic','Behavioral & Environmental & Metabolic','Behavioral & Metabolic'])
.range(['were attributable to environmental/occupational risks','were attributable to behavioral risks','were attributable to metabolic risks','were not attributable to GBD risk factors','were attributable to behavioral and environmental risks','were attributable to environmental and metabolic risks','were attributable to behavioral, environmental and metabolic risk','were attributable to behavioral and metabolic risks'])

var color_lv_1_risk_group = d3.scaleOrdinal()
.domain(['Environmental/occupational risks', 'Behavioral risks', 'Metabolic risks', 'Burden not attributable to GBD risk factors'])
.range(["#ff4da8","#01c1da","#624194","#625b62"])

//////////////////////////
// Top ten risk factors //
//////////////////////////

// We need to create a dropdown button for the user to choose which area to be displayed on the figure.
d3.select("#selecttopten_attrib_cause_Button")
.selectAll('myOptions')
.data(causes_for_risk)
.enter()
.append('option')
.text(function (d) {
  return d; }) // text to appear in the menu - this does not have to be as it is in the data (you can concatenate other values).
.attr("value", function (d) {
  return d; }) // corresponding value returned by the button

var topten_attrib_causeOption = d3.select('#selecttopten_attrib_cause_Button').property("value")

// We need to create a dropdown button for the user to choose which area to be displayed on the figure.
d3.select("#selecttopten_attrib_measure_Button")
.selectAll('myOptions')
.data(measure_categories)
.enter()
.append('option')
.text(function (d) {
  return d; }) // text to appear in the menu - this does not have to be as it is in the data (you can concatenate other values).
.attr("value", function (d) {
  return d; }) // corresponding value returned by the button

var topten_attrib_measureOption = d3.select('#selecttopten_attrib_measure_Button').property("value")

d3.select("#selecttopten_attrib_sex_Button")
.selectAll('myOptions')
.data(['Both', 'Male', 'Female'])
.enter()
.append('option')
.text(function (d) {
  return d; }) // text to appear in the menu - this does not have to be as it is in the data (you can concatenate other values).
.attr("value", function (d) {
  return d; }) // corresponding value returned by the button

var topten_attrib_sexOption = d3.select('#selecttopten_attrib_sex_Button').property("value")

d3.select("#selecttopten_attrib_risk_level_Button")
.selectAll('myOptions')
.data([2,3])
.enter()
.append('option')
.text(function (d) {
  return d; }) // text to appear in the menu - this does not have to be as it is in the data (you can concatenate other values).
.attr("value", function (d) {
  return d; }) // corresponding value returned by the button

var topten_attrib_risk_levelOption = d3.select('#selecttopten_attrib_risk_level_Button').property("value")

var height_top_ten = 500;
var padding = 30;

var request = new XMLHttpRequest();
request.open("GET", 'Risks_causes_NN_2017.json', false);
request.send(null);

var top_risks = JSON.parse(request.responseText);

top_risk_selected = top_risks.filter(function (d) { // gets a subset of the json data
            return d.Area === 'West Sussex' &
            d.Sex === topten_attrib_sexOption &
            d.Risk_level == topten_attrib_risk_levelOption &
            d.measure === topten_attrib_measureOption &
            d.Cause === topten_attrib_causeOption
  })
  .sort(function (a, b) { // sorts it according to the number of deaths (descending order)
      return d3.ascending(a.Rank, b.Rank);
  })
  .slice(0, 10); // just keeps the first 10 rows

console.log(top_risk_selected)

// append the svg object to the body of the page
var top_ten_risks_svg = d3.select("#top_ten_risks")
.append("svg")
.attr("width", width)
.attr("height", height_top_ten)
.append("g");


// update max each time

// Add X axis
var x = d3.scaleLinear()
.domain([0, 100])
.range([ 0, width]);

top_ten_risks_svg
.append("g")
.attr("transform", "translate(0," + height_top_ten + ")")
.call(d3.axisBottom(x))
.selectAll("text")
.attr("transform", "translate(-10,0)rotate(-45)")
.style("text-anchor", "end");

top_r = top_risk_selected.map(function(d) {
  return d.Risk; })

// Y axis
var y = d3.scaleBand()
.domain(top_r)
.range([0, height_top_ten])
.padding(.2);

// add labels
// How much of the overall deaths/ylls do the top ten risks account for

top_ten_risks_svg
.append("g")
.call(d3.axisLeft(y))

  //Bars
top_ten_risks_svg
.selectAll("myRect")
.data(top_risk_selected)
.enter()
.append("rect")
.attr("x", x(0) )
.attr("y", function(d) { return y(d.Risk); })
.attr("width", function(d) { return x(d.Estimate); })
.attr("height", y.bandwidth() )
.attr("fill", "#69b3a2")

update_top_risk = function(){

var topten_attrib_causeOption = d3.select('#selecttopten_attrib_cause_Button').property("value")
var topten_attrib_measureOption = d3.select('#selecttopten_attrib_measure_Button').property("value")
var topten_attrib_sexOption = d3.select('#selecttopten_attrib_sex_Button').property("value")
var topten_attrib_risk_levelOption = d3.select('#selecttopten_attrib_risk_level_Button').property("value")

top_risk_selected = top_risks.filter(function (d) { // gets a subset of the json data
        return d.Area === 'West Sussex' &
        d.Sex === topten_attrib_sexOption &
        d.Risk_level == topten_attrib_risk_levelOption &
        d.measure === topten_attrib_measureOption &
        d.Cause === topten_attrib_causeOption
  })
  .sort(function (a, b) { // sorts it according to the number of deaths (descending order)
        return d3.ascending(a.Rank, b.Rank);
  })
  .slice(0, 10); // just keeps the first 10 rows

console.log(top_risk_selected)
}

d3.select("#selecttopten_attrib_cause_Button").on("change", function(d) {
var topten_attrib_causeOption = d3.select('#selecttopten_attrib_cause_Button').property("value")
var topten_attrib_measureOption = d3.select('#selecttopten_attrib_measure_Button').property("value")
var topten_attrib_sexOption = d3.select('#selecttopten_attrib_sex_Button').property("value")
var topten_attrib_risk_levelOption = d3.select('#selecttopten_attrib_risk_level_Button').property("value")
update_top_risk(topten_attrib_causeOption)
})
d3.select("#selecttopten_attrib_measure_Button").on("change", function(d) {
var topten_attrib_causeOption = d3.select('#selecttopten_attrib_cause_Button').property("value")
var topten_attrib_measureOption = d3.select('#selecttopten_attrib_measure_Button').property("value")
var topten_attrib_sexOption = d3.select('#selecttopten_attrib_sex_Button').property("value")
var topten_attrib_risk_levelOption = d3.select('#selecttopten_attrib_risk_level_Button').property("value")
update_top_risk(topten_attrib_measureOption)
})
d3.select("#selecttopten_attrib_sex_Button").on("change", function(d) {
var topten_attrib_causeOption = d3.select('#selecttopten_attrib_cause_Button').property("value")
var topten_attrib_measureOption = d3.select('#selecttopten_attrib_measure_Button').property("value")
var topten_attrib_sexOption = d3.select('#selecttopten_attrib_sex_Button').property("value")
var topten_attrib_risk_levelOption = d3.select('#selecttopten_attrib_risk_level_Button').property("value")
update_top_risk(topten_attrib_sexOption)
})
d3.select("#selecttopten_attrib_risk_level_Button").on("change", function(d) {
var topten_attrib_causeOption = d3.select('#selecttopten_attrib_cause_Button').property("value")
var topten_attrib_measureOption = d3.select('#selecttopten_attrib_measure_Button').property("value")
var topten_attrib_sexOption = d3.select('#selecttopten_attrib_sex_Button').property("value")
var topten_attrib_risk_levelOption = d3.select('#selecttopten_attrib_risk_level_Button').property("value")
update_top_risk(topten_attrib_risk_levelOption)
})
