
// set global width and heights to use for our svgs - you can choose not to use these and specify custom values
var width_guage = document.getElementById("content_size").offsetWidth / 4 - 5
var height_guage = width_guage;

var twoPi = 2 * Math.PI

var attributed = 0
var total = 1

var causes_for_risk = ["All causes","HIV/AIDS and sexually transmitted infections", "Respiratory infections and tuberculosis", "Enteric infections", "Neglected tropical diseases and malaria", "Other infectious diseases", "Maternal and neonatal disorders", "Nutritional deficiencies", "Neoplasms", "Cardiovascular diseases", "Chronic respiratory diseases", "Digestive diseases", "Neurological disorders", "Mental disorders", "Substance use disorders", "Diabetes and kidney diseases", "Skin and subcutaneous diseases", "Sense organ diseases", "Musculoskeletal disorders", "Other non-communicable diseases", "Transport injuries", "Unintentional injuries", "Self-harm and interpersonal violence"]

var color_cause_for_risk = d3.scaleOrdinal()
  .domain(causes_for_risk)
  .range(["#191947","#F8DDEB", "#F2B9BF", "#EE9187", "#EA695C", "#D84D42", "#AD3730", "#7A1C1C", '#BCD6F7','#97C4F0','#67A8E7','#528CDB','#376ACB',"#1845A5", '#CFD6F6','#ADB9ED','#8B96DD','#6978D0', "#4E4FB8", "#3E3294", "#B5DCD0", "#76B786", '#477A49']);

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
.data(causes_for_risk)
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

number_deaths = deaths_attributed[0].Number
attributed_deaths = deaths_attributed[0].Proportion;
total_deaths = deaths_attributed[0].Total_burden;

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
.attr('id', 'attributed_deaths_perc')
.attr("text-anchor", "middle")
.attr("class", "percent-attributed")
.attr("dy", "-0.25em");

meter_deaths
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'deaths_label_1')
.attr("class", "description")
.attr("dy", "0.5em")
.text(d3.format(',.0f')(number_deaths) + ' / ' + d3.format(',.0f')(total_deaths));

meter_deaths
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'deaths_label_2')
.attr("class", "description")
.attr("dy", "1.5em")
.text("deaths attributed");

meter_deaths
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'deaths_label_3')
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
    foreground_deaths
    .attr("d", arc_deaths.endAngle(twoPi * attributed))
    .attr("fill", function(d) { return color_cause_for_risk(selectedCondition_attribOption); });
    percentAttributed_deaths.text(d3.format(".0%")(attributed));
  };
});

var attributed_yll = yll_attributed[0].Proportion
var number_yll = yll_attributed[0].Number
var total_yll = yll_attributed[0].Total_burden;

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
.attr('id', 'attributed_yll_perc')
.attr("class", "percent-attributed")
.attr("dy", "-0.25em");

meter_yll
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'yll_label_1')
.attr("class", "description")
.attr("dy", "0.5em")
.text(d3.format(',.0f')(number_yll) + ' / ' + d3.format(',.0f')(total_yll));

meter_yll
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'yll_label_2')
.attr("class", "description")
.attr("dy", "1.5em")
.text("YLLs attributed");

meter_yll
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'yll_label_3')
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
    foreground_yll
    .attr("d", arc_yll.endAngle(twoPi * attributed))
    .attr("fill", function(d) { return color_cause_for_risk(selectedCondition_attribOption); });
    percentAttributed_yll.text(d3.format(".0%")(attributed));
  };
});

var number_yld = yld_attributed[0].Number
var attributed_yld = yld_attributed[0].Proportion
var total_yld = yld_attributed[0].Total_burden

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
.attr('id', 'attributed_yld_perc')
.attr("class", "percent-attributed")
.attr("dy", "-0.25em");

meter_yld
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'yld_label_1')
.attr("class", "description")
.attr("dy", "0.5em")
.text(d3.format(',.0f')(number_yld) + ' / ' + d3.format(',.0f')(total_yld));

meter_yld
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'yld_label_2')
.attr("class", "description")
.attr("dy", "1.5em")
.text("YLDs attributed");

meter_yld
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'yld_label_3')
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
    foreground_yld
    .attr("d", arc_yld.endAngle(twoPi * attributed))
    .attr("fill", function(d) { return color_cause_for_risk(selectedCondition_attribOption); });
    percentAttributed_yld.text(d3.format(".0%")(attributed));
  };
});

var number_daly = daly_attributed[0].Number
var attributed_daly = daly_attributed[0].Proportion
var total_daly = daly_attributed[0].Total_burden

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
.attr('id', 'attributed_daly_perc')
.attr("class", "percent-attributed")
.attr("dy", "-0.25em");

meter_daly
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'daly_label_1')
.attr("class", "description")
.attr("dy", "0.5em")
.text(d3.format(',.0f')(number_daly) + ' / ' + d3.format(',.0f')(total_daly));

meter_daly
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'daly_label_2')
.attr("class", "description")
.attr("dy", "1.5em")
.text("DALYs attributed");

meter_daly
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'daly_label_3')
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
    foreground_daly
    .attr("d", arc_daly.endAngle(twoPi * attributed))
    .attr("fill", function(d) { return color_cause_for_risk(selectedCondition_attribOption); });
    percentAttributed_daly.text(d3.format(".0%")(attributed));
  };
});

// Initialize the plot with the first dataset

function update_attributable_risk(selectedCondition_attribOption) {

attributed_deaths = deaths_attributed[0].Proportion;
var old_attributed_deaths = attributed_deaths

if(old_attributed_deaths === undefined){
  old_attributed_deaths = .001
}

total_deaths = deaths_attributed[0].Total_burden
var old_total_deaths = total_deaths

attributed_yll = yll_attributed[0].Proportion;
var old_attributed_yll = attributed_yll

if(old_attributed_yll === undefined){
  old_attributed_yll = .001
}

total_yll = yll_attributed[0].Total_burden
var old_total_yll = total_yll

attributed_yld = yld_attributed[0].Proportion;
var old_attributed_yld = attributed_yld

if(old_attributed_yld === undefined){
  old_attributed_yld = .001
}

total_yld = yld_attributed[0].Total_burden
var old_total_yld = total_yld

attributed_daly = daly_attributed[0].Proportion;
var old_attributed_daly = attributed_daly

if(old_attributed_daly === undefined){
  old_attributed_daly = .001
}

total_daly = daly_attributed[0].Total_burden
var old_total_daly = total_daly

var selectedCondition_attribOption = d3.select('#selectCondition_attribButton').property("value")

// Select the div id total_death_string (this is where you want the result of this to be displayed in the html page)
d3.select("#selected_condition_attrib_title")
  .data(data)
  .text(function(d){ return "Burden attributed to risk factors associated with " + d3.select('#selectCondition_attribButton').property("value").replace('All causes', 'all causes of ill health') + '; both males and females; all ages; West Sussex; 2017' });

deaths_attributed = explained_burden.filter(function(d) {
  return  d.Measure === 'Deaths'&
  d.Cause === selectedCondition_attribOption
})

var number_deaths = deaths_attributed[0].Number
var attributed_deaths = deaths_attributed[0].Proportion
var total_deaths = deaths_attributed[0].Total_burden
var i_deaths = d3.interpolate(old_attributed_deaths, attributed_deaths / total);

meter_deaths
.selectAll("#deaths_label_1")
.remove();

meter_deaths
.selectAll("#deaths_label_2")
.remove();

meter_deaths
.selectAll("#deaths_label_3")
.remove();

meter_deaths
.selectAll('#deaths_label_4')

if(total_deaths === 0) {
meter_deaths
.selectAll('#attributed_deaths_perc')
.style('opacity', 0);
}

if(total_deaths !== 0){
meter_deaths
.selectAll('#attributed_deaths_perc')
.transition()
.duration(750)
.style('opacity', 1);
}

foreground_deaths
.transition()
.duration(1500)
.attr("fill", function(d) { return color_cause_for_risk(selectedCondition_attribOption); });

meter_deaths
.transition()
.duration(3000)
.tween("attributed", function() {
  return function(t) {
    attributed = i_deaths(t);
    foreground_deaths
    .attr("d", arc_deaths.endAngle(twoPi * attributed));
    percentAttributed_deaths.text(d3.format(".0%")(attributed));
  };
});

if (total_deaths !== 0) {

meter_deaths
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'deaths_label_1')
.attr("class", "description")
.attr("dy", "0.5em")
.text(d3.format(',.0f')(number_deaths) + ' / ' + d3.format(',.0f')(total_deaths));

meter_deaths
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'deaths_label_2')
.attr("class", "description")
.attr("dy", "1.5em")
.text("deaths attributed");

meter_deaths
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'deaths_label_3')
.attr("class", "description")
.attr("dy", "2.5em")
.text("to risk factors");
}

if (total_deaths === 0) {

meter_deaths
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'deaths_label_1')
.attr("class", "description_none")
.attr("dy", "-1em")
.text("There were no");

meter_deaths
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'deaths_label_2')
.attr("class", "description_none")
.attr("dy", "0em")
.text("deaths for this");

meter_deaths
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'deaths_label_3')
.attr("class", "description_none")
.attr("dy", "1em")
.text("condition group");
}

yll_attributed = explained_burden.filter(function(d) {
  return  d.Measure === 'YLLs'&
  d.Cause === selectedCondition_attribOption
})

var number_yll = yll_attributed[0].Number
var attributed_yll = yll_attributed[0].Proportion
var total_yll = yll_attributed[0].Total_burden
var i_yll = d3.interpolate(old_attributed_yll, attributed_yll / total);

meter_yll
.selectAll("#yll_label_1")
.remove();

meter_yll
.selectAll("#yll_label_2")
.remove();

meter_yll
.selectAll("#yll_label_3")
.remove();

if(total_yll === 0) {
meter_yll
.selectAll('#attributed_yll_perc')
.style('opacity', 0);
}

if(total_yll !== 0){
meter_yll
.selectAll('#attributed_yll_perc')
.transition()
.duration(750)
.style('opacity', 1);
}

foreground_yll
.transition()
.duration(1500)
.attr("fill", function(d) { return color_cause_for_risk(selectedCondition_attribOption); });

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

if (total_yll !== 0) {
meter_yll
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'yll_label_1')
.attr("class", "description")
.attr("dy", "0.5em")
.text(d3.format(',.0f')(number_yll) + ' / ' + d3.format(',.0f')(total_yll));

meter_yll
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'yll_label_1')
.attr("class", "description")
.attr("dy", "1.5em")
.text("YLLs attributed");

meter_yll
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'yll_label_2')
.attr("class", "description")
.attr("dy", "2.5em")
.text("to risk factors");
}

if (total_yll === 0) {

meter_yll
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'yll_label_1')
.attr("class", "description_none")
.attr("dy", "-1em")
.text("There were no");

meter_yll
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'yll_label_2')
.attr("class", "description_none")
.attr("dy", "0em")
.text("YLLs for this");

meter_yll
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'yll_label_2')
.attr("class", "description_none")
.attr("dy", "1em")
.text("condition group");
}

yld_attributed = explained_burden.filter(function(d) {
  return  d.Measure === 'YLDs'&
  d.Cause === selectedCondition_attribOption
})

var number_yld = yld_attributed[0].Number
var attributed_yld = yld_attributed[0].Proportion
var total_yld = yld_attributed[0].Total_burden
var i_yld = d3.interpolate(old_attributed_yld, attributed_yld / total);

meter_yld
.selectAll("#yld_label_1")
.remove();

meter_yld
.selectAll("#yld_label_2")
.remove();

meter_yld
.selectAll("#yld_label_3")
.remove();

if(total_yld === 0) {
meter_yld
.selectAll('#attributed_yld_perc')
.style('opacity', 0);
}

if(total_yld !== 0){
meter_yld
.selectAll('#attributed_yld_perc')
.transition()
.duration(750)
.style('opacity', 1);
}

foreground_yld
.transition()
.duration(1500)
.attr("fill", function(d) { return color_cause_for_risk(selectedCondition_attribOption); });

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

if (total_yld !== 0) {

meter_yld
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'yld_label_1')
.attr("class", "description")
.attr("dy", "0.5em")
.text(d3.format(',.0f')(number_yld) + ' / ' + d3.format(',.0f')(total_yld));

meter_yld
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'yld_label_2')
.attr("class", "description")
.attr("dy", "1.5em")
.text("YLDs attributed");

meter_yld
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'yld_label_3')
.attr("class", "description")
.attr("dy", "2.5em")
.text("to risk factors");
}

if (total_yld === 0) {

meter_yld
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'yld_label_1')
.attr("class", "description_none")
.attr("dy", "-1em")
.text("There were no");

meter_yld
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'yld_label_2')
.attr("class", "description_none")
.attr("dy", "0em")
.text("YLDs for this");

meter_yld
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'yld_label_2')
.attr("class", "description_none")
.attr("dy", "1em")
.text("condition group");
}

daly_attributed = explained_burden.filter(function(d) {
  return  d.Measure === 'DALYs'&
  d.Cause === selectedCondition_attribOption
})

number_daly = daly_attributed[0].Number
var attributed_daly = daly_attributed[0].Proportion
var total_daly = daly_attributed[0].Total_burden
var i_daly = d3.interpolate(old_attributed_daly, attributed_daly / total);

meter_daly
.selectAll("#daly_label_1")
.remove();

meter_daly
.selectAll("#daly_label_2")
.remove();

meter_daly
.selectAll("#daly_label_3")
.remove();

if(total_daly === 0) {
meter_daly
.selectAll('#attributed_daly_perc')
.style('opacity', 0);
}

if(total_daly !== 0){
meter_daly
.selectAll('#attributed_daly_perc')
.transition()
.duration(750)
.style('opacity', 1);
}

foreground_daly
.transition()
.duration(1500)
.attr("fill", function(d) { return color_cause_for_risk(selectedCondition_attribOption); });

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


if (total_daly !== 0) {

meter_daly
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'daly_label_1')
.attr("class", "description")
.attr("dy", "0.5em")
.text(d3.format(',.0f')(number_daly) + ' / ' + d3.format(',.0f')(total_daly));

meter_daly
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'daly_label_2')
.attr("class", "description")
.attr("dy", "1.5em")
.text("DALYs attributed");

meter_daly
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'daly_label_3')
.attr("class", "description")
.attr("dy", "2.5em")
.text("to risk factors");
}

if (total_daly === 0) {

meter_daly
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'daly_label_1')
.attr("class", "description_none")
.attr("dy", "-1em")
.text("There were no");

meter_daly
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'daly_label_2')
.attr("class", "description_none")
.attr("dy", "0em")
.text("DALYs for this");

meter_daly
.append("text")
.attr("text-anchor", "middle")
.attr('id', 'daly_label_2')
.attr("class", "description_none")
.attr("dy", "1em")
.text("condition group");
}


}

d3.select("#selectCondition_attribButton").on("change", function(d) {
var selectedCondition_attribOption = d3.select('#selectCondition_attribButton').property("value")
update_attributable_risk(selectedCondition_attribOption)
})
