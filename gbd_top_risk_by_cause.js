// set global width and heights to use for our svgs - you can choose not to use these and specify custom values
var width_risks = document.getElementById("content_size").offsetWidth - 20

var causes_for_risk = ["All causes","HIV/AIDS and sexually transmitted infections", "Respiratory infections and tuberculosis", "Enteric infections", "Neglected tropical diseases and malaria", "Other infectious diseases", "Maternal and neonatal disorders", "Nutritional deficiencies", "Neoplasms", "Cardiovascular diseases", "Chronic respiratory diseases", "Digestive diseases", "Neurological disorders", "Mental disorders", "Substance use disorders", "Diabetes and kidney diseases", "Skin and subcutaneous diseases", "Sense organ diseases", "Musculoskeletal disorders", "Other non-communicable diseases", "Transport injuries", "Unintentional injuries", "Self-harm and interpersonal violence"]

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

var risk_categories = ["Air pollution", "Occupational risks", "Other environmental risks", "Unsafe water, sanitation, and handwashing", "Alcohol use", "Childhood maltreatment", "Dietary risks", "Drug use", "Intimate partner violence", "Low physical activity", "Child and maternal malnutrition", "Tobacco", "Unsafe sex", "High systolic blood pressure", "High body-mass index", "High fasting plasma glucose", "High LDL cholesterol", "Impaired kidney function", "Low bone mineral density"]

var color_risk_group = d3.scaleOrdinal()
    .domain(risk_categories)
    .range(["#ff82c2", "#ff5eb0", "#e54597", "#b23575", "#b2ecf3", "#99e6f0", "#80e0ec", "#66d9e8", "#4dd3e5", "#1ac7dd", "#00adc4", "#008798", "#00606d", "#c0b3d4", "#a08dbe", "#8166a9", "#71549e", "#4e3476", "#3a2758"]);

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

var height_top_ten = 350;
var padding = 50;

// append the svg object to the body of the page
var top_ten_risks_svg = d3.select("#top_ten_risks")
.append("svg")
.attr("width", width_risks)
.attr("height", height_top_ten + 60)
.append("g")
.attr("transform", "translate(" + 190 + "," + 0 + ")");

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

if(top_risk_selected[0].Number_of_negative_risks > 10) {

d3.select("#top_risks_title")
.data(top_risk_selected)
.text(function(d){ return 'Top 10 risk factors (level ' + d.Risk_level + ') attributed to ' + label_key(d.measure)  + '; ' + d.Cause.replace('All causes', 'all causes') + '; ' + d.Sex.toLowerCase().replace('both', 'both males and female') + ' ; all ages; West Sussex; 2017' });

}

if(top_risk_selected[0].Number_of_negative_risks < 10) {

d3.select("#top_risks_title")
.data(top_risk_selected)
.text(function(d){ return 'Top ' + top_risk_selected[0].Number_of_negative_risks +' risk factors (level ' + d.Risk_level + ') attributed to ' + label_key(d.measure)  + '; ' + d.Cause.replace('All causes', 'all causes') + '; ' + d.Sex.toLowerCase().replace('both', 'both males and female') + ' ; all ages; West Sussex; 2017' });

}

// Grab the highest number of value
var max_risk_value = d3.max(top_risk_selected, function(d) {
  return +d.Estimate;
  })

var tooltip_risk_factors = d3.select("#top_ten_risks")
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
var showTooltip_risk_factors = function (d) {

tooltip_risk_factors
.style('visibility', 'visible')

tooltip_risk_factors
.html("<h3>" + d.Risk + '</h3><p class = "tooltip_b">The estimated number of ' + label_key(d.measure) + ' among ' + d.Sex.toLowerCase().replace('both', 'both males and female') + 's as a result of ' + d.Risk + ' in West Sussex in 2017 was <font color = "#1e4b7a"><b>' + d.Estimate_label + ' ' + label_key(d.measure) + ' </b></font>per 100,000.</p><p class = "tooltip_b">This is the ' + d.Rank_label + ' known risk factor at this level for this condition.</p>') // The nested .replace within .toLowerCase() replaces the string 'both' (not 'Both') with 'both males and female' and then we add the s and a line break.
.style("opacity", 1)
.style("top", (event.pageY - 10) + "px")
.style("left", (event.pageX + 10) + "px")
  }

var mouseleave_top_risk_factors = function(d) {
tooltip_risk_factors
.style("visibility", "hidden")
}

// Add X axis scale - this is the max value plus 10%
var x_top_ten = d3.scaleLinear()
.domain([0, max_risk_value + (max_risk_value * .1)])
.range([0, width_risks - 240]);

var xAxis_top_risks = top_ten_risks_svg
.append("g")
.attr("transform", "translate(0," + height_top_ten + ")")
.call(d3.axisBottom(x_top_ten).tickSizeOuter(0));

// Y axis scale
var y_top_ten = d3.scaleBand()
.domain(top_risk_selected.map(function(d) { return d.Risk; }))
.range([0, height_top_ten])
.padding([0.2]);

// var yAxis_top_risks = top_ten_risks_svg
// .append("g")
// .attr("class", "myYaxis")
// .call(d3.axisLeft(y_top_ten))

// Add X axis label:
top_ten_risks_svg
.data(top_risk_selected)
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'axis_x_title_tt')
.attr("x", document.getElementById("content_size").offsetWidth /2 - 130)
.attr("y", height_top_ten + 30)
.text(function(d) { return d.measure});

// Y axis label:
// top_ten_risks_svg
// .append("text")
// .attr('id', 'axis_y_title_tt')
// .style('font-size', '12px')
// .style('font-weight', 'bold')
// .attr("text-anchor", "end")
// .attr("transform", "rotate(-90)")
// .attr("y", - 170)
// .attr("x", - (height_top_ten / 2) + 20)
// .text('Risk factor');

top_ten_risks_svg
.data(top_risk_selected)
.append("text")
.attr("text-anchor", "left")
.attr('class', 'remember_overlap_text')
.attr('id', 'number_negative_risks_1')
.attr("x", (width / 100) * 80 + 100)
.attr("y", height_top_ten - 105)
.text(function(d) { return 'There are ' + d.Number_of_negative_risks + ' risks associated with an'});

top_ten_risks_svg
.append("text")
.attr("text-anchor", "left")
.attr('class', 'remember_overlap_text')
.attr('id', 'number_negative_risks_2')
.attr("x", (width / 100) * 80 + 100)
.attr("y", height_top_ten - 92)
.text('increase in burden for this cause.');

top_ten_risks_svg
.append("text")
.attr("text-anchor", "right")
.attr('class', 'remember_overlap_text')
.attr('id', 'number_negative_risks_3')
// .style('font-weight', 'bold')
.style('fill', 'red')
.style('font-size', 10)
.attr("x", width - 75)
.attr("y", height_top_ten - 10)
.text('Remember: these risk factors may overlap in increasing burden.');

// Create the bars element
var bars_fig_top_ten = top_ten_risks_svg
.selectAll("rect")
.data(top_risk_selected)

bars_fig_top_ten
.enter()
.append("rect") // Add a new rect for each new element
.attr("x", 0)
.attr("y", function(d) { return y_top_ten(d.Risk); })
.attr("width", function(d) { return x_top_ten(d.Estimate); })
.attr("height", y_top_ten.bandwidth())
.attr("fill", function(d) { return color_risk_group(d.Risk_colour); })
.on("mousemove", showTooltip_risk_factors)
.on('mouseout', mouseleave_top_risk_factors);

var yAxis_top_risks = top_ten_risks_svg
.append("g")
.attr("class", "myYaxis")
.call(d3.axisLeft(y_top_ten))

update_top_risk = function(){

var topten_attrib_causeOption = d3.select('#selecttopten_attrib_cause_Button').property("value")
var topten_attrib_measureOption = d3.select('#selecttopten_attrib_measure_Button').property("value")
var topten_attrib_sexOption = d3.select('#selecttopten_attrib_sex_Button').property("value")
var topten_attrib_risk_levelOption = d3.select('#selecttopten_attrib_risk_level_Button').property("value")

top_ten_risks_svg
.selectAll("#no_data_warning")
.transition()
.duration(750)
.attr('opacity', 0)
.remove();

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

if(top_risk_selected.length === 0)
  {
top_risk_selected = [{Area: "West Sussex", Sex: topten_attrib_sexOption, Cause: topten_attrib_causeOption, Estimate: 0, Estimate_label: 0, Number_of_negative_risks: 0, Rank: 0, Rank_label: 'None', Risk: 'No risk factors', Risk_level: topten_attrib_risk_levelOption, measure: topten_attrib_measureOption}]
  }

if(top_risk_selected[0].Number_of_negative_risks > 10) {

d3.select("#top_risks_title")
.data(top_risk_selected)
.text(function(d){ return 'Top 10 risk factors (level ' + d.Risk_level + ') attributed to ' + label_key(d.measure)  + '; ' + d.Cause.replace('All causes', 'all causes') + '; ' + d.Sex.toLowerCase().replace('both', 'both males and female') + ' ; all ages; West Sussex; 2017' });

}

if(top_risk_selected[0].Number_of_negative_risks < 10) {

d3.select("#top_risks_title")
.data(top_risk_selected)
.text(function(d){ return 'Top ' + top_risk_selected[0].Number_of_negative_risks +' risk factors (level ' + d.Risk_level + ') attributed to ' + label_key(d.measure)  + '; ' + d.Cause.replace('All causes', 'all causes') + '; ' + d.Sex.toLowerCase().replace('both', 'both males and female') + ' ; all ages; West Sussex; 2017' });

}

top_ten_risks_svg
.selectAll("#axis_x_title_tt")
.transition()
.duration(750)
.attr('opacity', 0)
.remove();

// Add X axis label:
top_ten_risks_svg
.append("text")
.attr("text-anchor", 'middle')
.attr('id', 'axis_x_title_tt')
.attr("x", document.getElementById("content_size").offsetWidth / 2)
.attr("y", height_top_ten + 30)
.text(topten_attrib_measureOption)
.attr('opacity', 0)
.transition()
.duration(750)
.attr('opacity', 1);

top_ten_risks_svg
.selectAll("#number_negative_risks_1")
.transition()
.duration(750)
.attr('opacity', 0)
.remove();

top_ten_risks_svg
.selectAll("#number_negative_risks_2")
.transition()
.duration(750)
.attr('opacity', 0)
.remove();

if(top_risk_selected[0].Number_of_negative_risks != 1) {

top_ten_risks_svg
.data(top_risk_selected)
.append("text")
.attr("text-anchor", "left")
.attr('class', 'remember_overlap_text')
.attr('id', 'number_negative_risks_1')
.attr("x", (width / 100) * 80 + 100)
.attr("y", height_top_ten - 105)
.text(function(d) { return 'There are ' + d.Number_of_negative_risks + ' risks associated with an'});

top_ten_risks_svg
.append("text")
.attr("text-anchor", "left")
.attr('class', 'remember_overlap_text')
.attr('id', 'number_negative_risks_2')
.attr("x", (width / 100) * 80 + 100)
.attr("y", height_top_ten - 92)
.text('increase in burden for this cause.');

}

// Grab the highest number of value
var max_risk_value = d3.max(top_risk_selected, function(d) { return +d.Estimate; })

// update X axis - this is the max value plus 10%
x_top_ten
.domain([0, max_risk_value + (max_risk_value * .1)])

y_top_ten
.domain(top_risk_selected.map(function(d) { return d.Risk; })) // update the yaxis based on 'data' - so if you run update on data1, this will look at data1, get any new/unique groups and add them to the list of groups.



var bars_fig_top_ten = top_ten_risks_svg
.selectAll("rect")
.data(top_risk_selected)

bars_fig_top_ten
.enter()
.append("rect")
.merge(bars_fig_top_ten)
.transition()
.duration(1000)
.attr("x", 0)
.attr("y", function(d) { return y_top_ten(d.Risk); })
.attr("width", function(d) {return x_top_ten(d.Estimate); })
.attr("height", y_top_ten.bandwidth() )
.attr("fill", function(d) {return color_risk_group(d.Risk_colour); })

bars_fig_top_ten
.on("mousemove", showTooltip_risk_factors)
.on('mouseout', mouseleave_top_risk_factors);

bars_fig_top_ten
.exit()
.remove()

yAxis_top_risks
.transition()
.duration(1000)
.call(d3.axisLeft(y_top_ten))

xAxis_top_risks
.transition()
.duration(1000)
.call(d3.axisBottom(x_top_ten))

if(top_risk_selected[0].Number_of_negative_risks === 0) {

top_ten_risks_svg
.data(top_risk_selected)
.append("text")
.attr("text-anchor", "left")
.attr('class', 'remember_overlap_text')
.attr('id', 'no_data_warning')
.style('fontsize', 30)
.style('fill', 'red')
.attr("x", 160)
.attr("y", height_top_ten / 2)
.text(function(d) { return 'There are no risks associated with this condition group and measure.'});

}

}



d3.select("#selecttopten_attrib_cause_Button").on("change", function(d) {
update_top_risk(topten_attrib_causeOption)
})
d3.select("#selecttopten_attrib_measure_Button").on("change", function(d) {
update_top_risk(topten_attrib_measureOption)
})
d3.select("#selecttopten_attrib_sex_Button").on("change", function(d) {
update_top_risk(topten_attrib_sexOption)
})
d3.select("#selecttopten_attrib_risk_level_Button").on("change", function(d) {
update_top_risk(topten_attrib_risk_levelOption)
})
