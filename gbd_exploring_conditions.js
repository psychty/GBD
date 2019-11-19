var cause_categories = ["HIV/AIDS and sexually transmitted infections", "Respiratory infections and tuberculosis", "Enteric infections", "Neglected tropical diseases and malaria", "Other infectious diseases", "Maternal and neonatal disorders", "Nutritional deficiencies", "Neoplasms", "Cardiovascular diseases", "Chronic respiratory diseases", "Digestive diseases", "Neurological disorders", "Mental disorders", "Substance use disorders", "Diabetes and kidney diseases", "Skin and subcutaneous diseases", "Sense organ diseases", "Musculoskeletal disorders", "Other non-communicable diseases", "Transport injuries", "Unintentional injuries", "Self-harm and interpersonal violence"]

var measure_categories = ['Deaths', 'YLLs (Years of Life Lost)', 'YLDs (Years Lived with Disability)', 'DALYs (Disability-Adjusted Life Years)']

// We need to create a dropdown button for the user to choose which area to be displayed on the figure.
d3.select("#selectExplore_CauseButton")
  .selectAll('myOptions')
 	.data(cause_categories)
  .enter()
	.append('option')
  .text(function (d) {
    return d; }) // text to appear in the menu - this does not have to be as it is in the data (you can concatenate other values).
  .attr("value", function (d) {
    return d; }) // corresponding value returned by the button

// We need to create a dropdown button for the user to choose which area to be displayed on the figure.
d3.select("#selectExplore_MeasureButton")
  .selectAll('myOptions')
	.data(measure_categories)
  .enter()
	.append('option')
  .text(function (d) {
    return d; }) // text to appear in the menu - this does not have to be as it is in the data (you can concatenate other values).
  .attr("value", function (d) {
    return d; }) // corresponding value returned by the button

// We need to create a dropdown button for the user to choose which area to be displayed on the figure.
d3.select("#selectExplore_SexButton")
  .selectAll('myOptions')
 	.data(['Both','Male','Female'])
  .enter()
	.append('option')
  .text(function (d) {
    return d; }) // text to appear in the menu - this does not have to be as it is in the data (you can concatenate other values).
  .attr("value", function (d) {
    return d; }) // corresponding value returned by the button

var columns = ['Cause', 'Number (all ages) 2017', 'Age-standardised rate per 100,000 2017','Proportion (based on number) 2017', 'Number (all ages) 2012', 'Percentage change 2012 - 2017 (based on number)']

// create the ajax request to grab the source JSON data
var request = new XMLHttpRequest();
request.open("GET", "./Level_3_condition_focus_2017_west_sussex.json", false);
request.send(null);
var json = JSON.parse(request.responseText); // parse the fetched json data into a variable

// Make the first table, then the update_table() function uses the new data array
data = json.filter(function(d){
  return d.Sex === 'Both' &
         d.measure === measure_categories[0] &
         d['Cause group'] === cause_categories[0]
})

// Make the table
var table = d3.select("#condition_group_table").append("table");
var thead = table.append("thead");
var tbody = table.append("tbody");

// Make the headings of the table (these do not need to be updated)
thead.append("tr")
 .selectAll("th")
 .data(columns)
 .enter()
 .append("th")
 .text(function(column) {
   return column; });

// Update the table
function update_table(selectedCauseOption) {

// grab the values from the select elements
var selectedCauseOption = d3.select('#selectExplore_CauseButton').property("value")
var selectedSexOption = d3.select('#selectExplore_SexButton').property("value")
var selectedMeasureOption = d3.select('#selectExplore_MeasureButton').property("value")

// filter the data
var data = json.filter(function(d){
  return d.Sex === selectedSexOption &
         d.measure === selectedMeasureOption &
         d['Cause group'] === selectedCauseOption
})

table
.selectAll("#exploring_conditions_rows")
.remove();

var rows = table.selectAll("tbody tr")
  .data(data, function (d) {
    return d.Cause;})
    ;

rows
 .enter()
 .append('tr')
 .attr('id', 'exploring_conditions_rows')
 .selectAll("td")
 .data(function (d) {return [d['Cause'], d['Number (all ages) 2017'], d['Age-standardised rate per 100,000 2017'], d['Proportion (based on number) 2017'], d['Number (all ages) 2012'], d['Percentage change 2012 - 2017 (based on number)']];})
 .enter()
 .append("td")
 .text(function(d) { return d; });

}

d3.select("#selectExplore_CauseButton").on("change", function(d) {
var selectedCauseOption = d3.select('#selectExplore_CauseButton').property("value")
var selectedSexOption = d3.select('#selectExplore_SexButton').property("value")
var selectedMeasureOption = d3.select('#selectExplore_MeasureButton').property("value")
// var selectedRefOption = d3.select("#selectReferenceAreaButton").property('value')
      update_table(selectedCauseOption)
})

d3.select("#selectExplore_SexButton").on("change", function(d) {
var selectedCauseOption = d3.select('#selectExplore_CauseButton').property("value")
var selectedSexOption = d3.select('#selectExplore_SexButton').property("value")
var selectedMeasureOption = d3.select('#selectExplore_MeasureButton').property("value")
// var selectedRefOption = d3.select("#selectReferenceAreaButton").property('value')
      update_table(selectedCauseOption)
})

d3.select("#selectExplore_MeasureButton").on("change", function(d) {
var selectedCauseOption = d3.select('#selectExplore_CauseButton').property("value")
var selectedSexOption = d3.select('#selectExplore_SexButton').property("value")
var selectedMeasureOption = d3.select('#selectExplore_MeasureButton').property("value")
// var selectedRefOption = d3.select("#selectReferenceAreaButton").property('value')
      update_table(selectedCauseOption)
})

update_table(cause_categories[0])
