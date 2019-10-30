
// set global width and heights to use for our svgs - you can choose not to use these and specify custom values
var width_guage = document.getElementById("content_size").offsetWidth / 4 - 5
var height_guage = width_guage;

var twoPi = 2 * Math.PI

var attributed = 0
var total = 1


// Bring data in
var request = new XMLHttpRequest();
request.open("GET", 'level_2_risk_explained_burden_2017_west_sussex.json', false);
request.send(null);

var explained_burden = JSON.parse(request.responseText);

explained_burden = explained_burden.filter(function (d) { // gets a subset of the json data
   return d.Sex === "Both" &
         +d.Year === 2017 &
          d.Risk === 'Burden attributable to GBD risk factors'
})


// We need to create a dropdown button for the user to choose which area to be displayed on the figure.
d3.select("#selectCondition_attribButton")
.selectAll('myOptions')
.data(["All causes","HIV/AIDS and sexually transmitted infections", "Respiratory infections and tuberculosis", "Enteric infections", "Neglected tropical diseases and malaria", "Other infectious diseases", "Maternal and neonatal disorders", "Nutritional deficiencies", "Neoplasms", "Cardiovascular diseases", "Chronic respiratory diseases", "Digestive diseases", "Neurological disorders", "Mental disorders", "Substance use disorders", "Diabetes and kidney diseases", "Skin and subcutaneous diseases", "Sense organ diseases", "Musculoskeletal disorders", "Other non-communicable diseases", "Transport injuries", "Unintentional injuries", "Self-harm and interpersonal violence"])
.enter()
.append('option')
.text(function (d) {
  return d; }) // text to appear in the menu - this does not have to be as it is in the data (you can concatenate other values).
.attr("value", function (d) {
  return d; }) // corresponding value returned by the button

var selectedCondition_attribOption = d3.select('#selectCondition_attribButton').property("value")

// Select the div id total_death_string (this is where you want the result of this to be displayed in the html page)
d3.select("#selected_condition_attrib_title")
  .data(data)
  .text(function(d){ return "Burden attributed to risk factors associated with " + d3.select('#selectCondition_attribButton').property("value").replace('All causes', 'all causes of ill health') + '; both males and females; all ages; West Sussex; 2017' });

deaths_attributed = explained_burden.filter(function(d) {
  return  d.Measure === 'Deaths'&
  d.Cause === selectedCondition_attribOption
})

yll_attributed = explained_burden.filter(function(d) {
  return  d.Measure === 'YLLs'&
  d.Cause === selectedCondition_attribOption
})

yld_attributed = explained_burden.filter(function(d) {
  return  d.Measure === 'YLDs'&
  d.Cause === selectedCondition_attribOption
})

daly_attributed = explained_burden.filter(function(d) {
  return  d.Measure === 'DALYs'&
  d.Cause === selectedCondition_attribOption
})

attributed_deaths = deaths_attributed[0].Proportion;

var svg_attributed_deaths = d3.select("#fillgauge1")
.append("svg")
.attr("width", width_guage)
.attr("height", height_guage)
.append("g")
.attr("transform", "translate(" + width_guage / 2 + "," + height_guage / 2 + ")");

var meter_deaths = svg_attributed_deaths.append("g")
.attr("class", "percentage_guage");

var arc_deaths = d3.arc()
    .startAngle(0)
    .innerRadius(55)
    .outerRadius(75);

meter_deaths
.append("path")
.attr("class", "background")
.attr("d", arc_deaths.endAngle(twoPi));

var foreground_deaths = meter_deaths
.append("path")
.attr("class", "foreground");

var percentAttributed_deaths = meter_deaths
.append("text")
.attr("text-anchor", "middle")
.attr("class", "percent-attributed")
.attr("dy", "0em");

meter_deaths
.append("text")
.attr("text-anchor", "middle")
.attr("class", "description")
.attr("dy", "1.5em")
.text("deaths attributed");

meter_deaths
.append("text")
.attr("text-anchor", "middle")
.attr("class", "description")
.attr("dy", "2.5em")
.text("to risk factors");

var i_deaths = d3.interpolate(attributed, attributed_deaths / total);

meter_deaths
.transition()
.duration(5000)
.tween("attributed", function() {
  return function(t) {
    attributed = i_deaths(t);
    foreground_deaths.attr("d", arc_deaths.endAngle(twoPi * attributed));
    percentAttributed_deaths.text(d3.format(".0%")(attributed));
  };
});

var attributed_yll = yll_attributed[0].Proportion

var svg_attributed_yll = d3.select("#fillgauge2")
.append("svg")
.attr("width", width_guage)
.attr("height", height_guage)
.append("g")
.attr("transform", "translate(" + width_guage / 2 + "," + height_guage / 2 + ")");

var meter_yll = svg_attributed_yll.append("g")
.attr("class", "percentage_guage");

var arc_yll = d3.arc()
    .startAngle(0)
    .innerRadius(55)
    .outerRadius(75);

meter_yll
.append("path")
.attr("class", "background")
.attr("d", arc_yll.endAngle(twoPi));

var foreground_yll = meter_yll
.append("path")
.attr("class", "foreground");

var percentAttributed_yll = meter_yll
.append("text")
.attr("text-anchor", "middle")
.attr("class", "percent-attributed")
.attr("dy", "0em");

meter_yll
.append("text")
.attr("text-anchor", "middle")
.attr("class", "description")
.attr("dy", "1.5em")
.text("YLLs attributed");

meter_yll
.append("text")
.attr("text-anchor", "middle")
.attr("class", "description")
.attr("dy", "2.5em")
.text("to risk factors");

var i_yll = d3.interpolate(attributed, attributed_yll / total);

meter_yll
.transition()
.duration(5000)
.tween("attributed", function() {
  return function(t) {
    attributed = i_yll(t);
    foreground_yll.attr("d", arc_yll.endAngle(twoPi * attributed));
    percentAttributed_yll.text(d3.format(".0%")(attributed));
  };
});

var attributed_yld = yld_attributed[0].Proportion

var svg_attributed_yld = d3.select("#fillgauge3")
.append("svg")
.attr("width", width_guage)
.attr("height", height_guage)
.append("g")
.attr("transform", "translate(" + width_guage / 2 + "," + height_guage / 2 + ")");

var meter_yld = svg_attributed_yld.append("g")
.attr("class", "percentage_guage");

var arc_yld = d3.arc()
    .startAngle(0)
    .innerRadius(55)
    .outerRadius(75);

meter_yld
.append("path")
.attr("class", "background")
.attr("d", arc_yld.endAngle(twoPi));

var foreground_yld = meter_yld
.append("path")
.attr("class", "foreground");

var percentAttributed_yld = meter_yld
.append("text")
.attr("text-anchor", "middle")
.attr("class", "percent-attributed")
.attr("dy", "0em");

meter_yld
.append("text")
.attr("text-anchor", "middle")
.attr("class", "description")
.attr("dy", "1.5em")
.text("YLDs attributed");

meter_yld
.append("text")
.attr("text-anchor", "middle")
.attr("class", "description")
.attr("dy", "2.5em")
.text("to risk factors");

var i_yld = d3.interpolate(attributed, attributed_yld / total);

meter_yld
.transition()
.duration(5000)
.tween("attributed", function() {
  return function(t) {
    attributed = i_yld(t);
    foreground_yld.attr("d", arc_yld.endAngle(twoPi * attributed));
    percentAttributed_yld.text(d3.format(".0%")(attributed));
  };
});

var attributed_daly = daly_attributed[0].Proportion

var svg_attributed_daly = d3.select("#fillgauge4")
.append("svg")
.attr("width", width_guage)
.attr("height", height_guage)
.append("g")
.attr("transform", "translate(" + width_guage / 2 + "," + height_guage / 2 + ")");

var meter_daly = svg_attributed_daly.append("g")
.attr("class", "percentage_guage");

var arc_daly = d3.arc()
.startAngle(0)
.innerRadius(55)
.outerRadius(75);

meter_daly
.append("path")
.attr("class", "background")
.attr("d", arc_daly.endAngle(twoPi));

var foreground_daly = meter_daly
.append("path")
.attr("class", "foreground");

var percentAttributed_daly = meter_daly
.append("text")
.attr("text-anchor", "middle")
.attr("class", "percent-attributed")
.attr("dy", "0em");

meter_daly
.append("text")
.attr("text-anchor", "middle")
.attr("class", "description")
.attr("dy", "1.5em")
.text("DALYs attributed");

meter_daly
.append("text")
.attr("text-anchor", "middle")
.attr("class", "description")
.attr("dy", "2.5em")
.text("to risk factors");

var i_daly = d3.interpolate(attributed, attributed_daly / total);

meter_daly
.transition()
.duration(5000)
.tween("attributed", function() {
  return function(t) {
    attributed = i_daly(t);
    foreground_daly.attr("d", arc_daly.endAngle(twoPi * attributed));
    percentAttributed_daly.text(d3.format(".0%")(attributed));
  };
});

// Initialize the plot with the first dataset

function update_attributable_risk(selectedCondition_attribOption) {

attributed_deaths = deaths_attributed[0].Proportion;
var old_attributed_deaths = attributed_deaths

attributed_yll = yll_attributed[0].Proportion;
var old_attributed_yll = attributed_yll

attributed_yld = yld_attributed[0].Proportion;
var old_attributed_yld = attributed_yld

attributed_daly = daly_attributed[0].Proportion;
var old_attributed_daly = attributed_daly

var selectedCondition_attribOption = d3.select('#selectCondition_attribButton').property("value")

// Select the div id total_death_string (this is where you want the result of this to be displayed in the html page)
d3.select("#selected_condition_attrib_title")
  .data(data)
  .text(function(d){ return "Burden attributed to risk factors associated with " + d3.select('#selectCondition_attribButton').property("value").replace('All causes', 'all causes of ill health') + '; both males and females; all ages; West Sussex; 2017' });

deaths_attributed = explained_burden.filter(function(d) {
  return  d.Measure === 'Deaths'&
  d.Cause === selectedCondition_attribOption
})

var attributed_deaths = deaths_attributed[0].Proportion
var i_deaths = d3.interpolate(old_attributed_deaths, attributed_deaths / total);

meter_deaths
.transition()
.duration(3000)
.tween("attributed", function() {
  return function(t) {
    attributed = i_deaths(t);
    foreground_deaths.attr("d", arc_deaths.endAngle(twoPi * attributed));
    percentAttributed_deaths.text(d3.format(".0%")(attributed));
  };
});

yll_attributed = explained_burden.filter(function(d) {
  return  d.Measure === 'YLLs'&
  d.Cause === selectedCondition_attribOption
})

var attributed_yll = yll_attributed[0].Proportion
var i_yll = d3.interpolate(old_attributed_yll, attributed_yll / total);

meter_yll
.transition()
.duration(3000)
.tween("attributed", function() {
  return function(t) {
    attributed = i_yll(t);
    foreground_yll.attr("d", arc_yll.endAngle(twoPi * attributed));
    percentAttributed_yll.text(d3.format(".0%")(attributed));
  };
});

yld_attributed = explained_burden.filter(function(d) {
  return  d.Measure === 'YLDs'&
  d.Cause === selectedCondition_attribOption
})

var attributed_yld = yld_attributed[0].Proportion
var i_yld = d3.interpolate(old_attributed_yld, attributed_yld / total);

meter_yld
.transition()
.duration(3000)
.tween("attributed", function() {
  return function(t) {
    attributed = i_yld(t);
    foreground_yld.attr("d", arc_yld.endAngle(twoPi * attributed));
    percentAttributed_yld.text(d3.format(".0%")(attributed));
  };
});

daly_attributed = explained_burden.filter(function(d) {
  return  d.Measure === 'DALYs'&
  d.Cause === selectedCondition_attribOption
})

var attributed_daly = daly_attributed[0].Proportion
var i_daly = d3.interpolate(old_attributed_daly, attributed_daly / total);

meter_daly
.transition()
.duration(3000)
.tween("attributed", function() {
  return function(t) {
    attributed = i_daly(t);
    foreground_daly.attr("d", arc_daly.endAngle(twoPi * attributed));
    percentAttributed_daly.text(d3.format(".0%")(attributed));
  };
});

}

d3.select("#selectCondition_attribButton").on("change", function(d) {
var selectedCondition_attribOption = d3.select('#selectCondition_attribButton').property("value")
update_attributable_risk(selectedCondition_attribOption)
})
