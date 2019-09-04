
// set global width and heights to use for our svgs - you can choose not to use these and specify custom values
var width = window.innerWidth / 100 * 55;
var height = 500;

// margins
var margin = {top: 30,
              right: 30,
              bottom: 150,
              left: 60};

// Now we can use the global width with
var width_fg_1 = width - margin.left - margin.right;
var height_fg_1 = 400 - margin.top - margin.bottom;

// Specify a colour palette and order
var cause_categories = ["HIV/AIDS and sexually transmitted infections", "Respiratory infections and tuberculosis", "Enteric infections", "Neglected tropical diseases and malaria", "Other infectious diseases", "Maternal and neonatal disorders", "Nutritional deficiencies", "Neoplasms", "Cardiovascular diseases", "Chronic respiratory diseases", "Digestive diseases", "Neurological disorders", "Mental disorders", "Substance use disorders", "Diabetes and kidney diseases", "Skin and subcutaneous diseases", "Sense organ diseases", "Musculoskeletal disorders", "Other non-communicable diseases", "Transport injuries", "Unintentional injuries", "Self-harm and interpersonal violence"]

var color_cause_group = d3.scaleOrdinal()
  .domain(cause_categories)
  .range(["#F8DDEB", "#F2B9BF", "#EE9187", "#EA695C", "#D84D42", "#AD3730", "#7A1C1C", '#BCD6F7','#97C4F0','#67A8E7','#528CDB','#376ACB',"#1845A5", '#CFD6F6','#ADB9ED','#8B96DD','#6978D0', "#4E4FB8", "#3E3294", "#B5DCD0", "#76B786", '#477A49']);

var ages = ["Early Neonatal","Late Neonatal","Post Neonatal","1 to 4","5 to 9","10 to 14","15 to 19","20 to 24","25 to 29","30 to 34","35 to 39","40 to 44","45 to 49","50 to 54","55 to 59","60 to 64","65 to 69","70 to 74","75 to 79","80 to 84","85 to 89","90 to 94","95 plus"]

var color_age_group = d3.scaleOrdinal()
  .domain(ages)
  .range(["#ff82a1","#d0005a","#903331","#ffa479","#ae7300","#eba100","#e9c254","#b99700","#6dba1c","#3b5b2c","#a2d39b","#00bb53","#008f69","#5adbb5","#00b1b8","#02b8fe","#0184e1","#7d7bff","#daa3ff","#713d85","#c85ae0","#e0afdd","#7c3e5f"]);

var color_lv_1_cause_group = d3.scaleOrdinal()
  .domain(['Communicable, maternal, neonatal, and nutritional diseases', 'Non-communicable diseases', 'Injuries'])
  .range(["#C45158", "#75B0C2", "#A8D2A3"]);

// Bring data in
var request = new XMLHttpRequest();
  request.open("GET", "./Number_cause_level_2_2017_west_sussex.json", false);
  request.send(null);
var json = JSON.parse(request.responseText); // parse the fetched json data into a variable

// We want to coerce some fields to be integers
json.forEach(function(elem){
		elem.Year = parseInt(elem.Year);
    elem.Deaths_number = parseInt(elem.Deaths_number); // Cause_id does not need to be an integer but it shows that it is working in console.log
			});

deaths_persons_lv2 = json.filter(function(d){ // gets a subset of the json data
	    return d.Sex === "Both" &
	      +d.Year === 2017})
        .sort(function(a, b) { // sorts it according to the number of deaths (descending order)
          return d3.descending(a.Deaths_number, b.Deaths_number);
        })
        .slice(0,10); // just keeps the first 10 rows

deaths_females_lv2 = json.filter(function(d){
	    return d.Sex === "Female" &
	      +d.Year === 2017})
        .sort(function(a, b) {
          return d3.descending(a.Deaths_number, b.Deaths_number);
        })
        .slice(0,10);

deaths_males_lv2 = json.filter(function(d){
	    return d.Sex === "Male" &
	      +d.Year === 2017})
        .sort(function(a, b) {
          return d3.descending(a.Deaths_number, b.Deaths_number);
        })
        .slice(0,10);

// Set up the svg and link to the div with the same identifier on the html page
var svg_fg_1 = d3.select("#top_10_bars_by_sex_dataviz")
  .append("svg")
  .attr("width", width) // Although we have widths specified for fg_1, we want the svg to be the global size
  .attr("height", height - 100) // Although we have widths specified for fg_1, we want the svg to be the global size
  .append("g") // the SVG <g> element is used to group SVG shapes together. Once grouped you can transform the whole group of shapes as if it was a single shape.
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); // http://tutorials.jenkov.com/svg/svg-transformation.html

// set the X axis across the svg
var x_fg_1 = d3.scaleBand() // our x axis is categorical or banded
  .range([ 0, width_fg_1])
  .padding(0.2);

var xAxis_fg_1 = svg_fg_1
  .append("g")
  .attr("transform", "translate(0," + height_fg_1 + ")")

// set the Y axis
var y_fg_1 = d3.scaleLinear() // our y axis is continuous (linear)
  .range([height_fg_1, 0]);

var yAxis_fg_1 = svg_fg_1
  .append("g")
  .attr("class", "myYaxis")

var tooltip_fg_1 = d3.select("#top_10_bars_by_sex_dataviz")
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
var showTooltip_fg_1 = function(d) {
  tooltip_fg_1
  .transition()
  .duration(200)

  tooltip_fg_1
  .style("opacity", 1)
  .html("<h3>" + d.Cause + '</h3><p>The estimated number of deaths as a result of ' + d.Cause + ' in West Sussex in 2017 among ' + d.Sex.toLowerCase().replace('both', 'both males and female') + 's was <font color = "#1e4b7a"><b>' + d3.format(",.0f")(d.Deaths_number) + '</b></font>.</p><p>This is the ' + d.Death_rank + 'th/nd/rd/st highest cause of death, accounting for ' + d3.format('.0%')(d.Deaths_proportion) + ' of the total number of deaths in 2017 for this population.</p>') // The nested .replace within .toLowerCase() replaces the string 'both' (not 'Both') with 'both males and female' and then we add the s and a line break.
  .style("top", (event.pageY - 10) + "px")
  .style("left", (event.pageX + 10) + "px")
  }

// Add X axis label:
svg_fg_1
  .append("text")
  .attr("text-anchor", "end")
  .attr("x", width_fg_1/2)
  .attr("y", height_fg_1 + margin.top + 70)
  .text("Cause");

// Y axis label:
svg_fg_1
  .append("text")
  .attr('id', 'axis_y_title')
  .attr("text-anchor", "end")
  .attr("transform", "rotate(-90)")
  .attr("y", - margin.left + 20)
  .attr("x", - margin.top - 60)
  .text('Deaths');

// A function to create / update the plot for a given variable. This will be run whenever a button is clicked above this figure on the html page.
function update_fg_1(data) {

x_fg_1
  .domain(data.map(function(d) {
    return d.Cause;
    })) // update the xaxis based on 'data' - so if you run update on data1, this will look at data1, get any new/unique groups and add them to the list of groups.§

// This adds a transition effect on the change between datasets (i.e. if the things change place on the axis).
xAxis_fg_1
  .transition()
  .duration(1000)
  .call(d3.axisBottom(x_fg_1))

// Rotate the xAxis labels
xAxis_fg_1
  .selectAll("text")
  .attr("transform", "translate(-10,10)rotate(-45)")
  .style("text-anchor", "end")

y_fg_1
  .domain([0, d3.max(data, function(d) {
  return Math.ceil(d.Deaths_number / 500) * 500 // This gets the maximum deaths number rounded up to nearest 500 (ceiling)
  })]); // update the yaxis based on 'data'

// This adds a transition effect on the change between datasets (i.e. if the yaxis needs to be longer or shorter).
yAxis_fg_1
  .transition()
  .duration(1000)
  .call(d3.axisLeft(y_fg_1));

// Create the bars_df variable
var bars_fig_1 = svg_fg_1.selectAll("rect")
  .data(data)

bars_fig_1
  .enter()
  .append("rect") // Add a new rect for each new element
  .merge(bars_fig_1) // get the already existing elements as well
  .transition() // and apply changes to all of them
  .duration(1000)
  .attr("x", function(d) {
      return x_fg_1(d.Cause); })
  .attr("y", function(d) {
      return y_fg_1(d.Deaths_number); })
  .attr("width", x_fg_1.bandwidth())
  .attr("height", function(d) {
      return height_fg_1 - y_fg_1(d.Deaths_number); })
  .style("fill", function(d) {
      return color_cause_group(d.Cause)});

// You could add these .on events to the selection above, but because we have a .transition() function, it turns the selection into a transition and it is not possible to add a tooltip to a transition and so we need to use the .notation to add tooltip functions separately.
bars_fig_1
  .on("mouseover", function() {
      return tooltip_fg_1.style("visibility", "visible");
      })
  .on("mousemove", showTooltip_fg_1)
  .on("mouseout", function() {
      return tooltip_fg_1.style("visibility", "hidden");
      });

// Finally, if any original bars need to go now these are removed.
bars_fig_1
  .exit()
  .remove()
  }

// Initialize the plot with the first dataset
update_fg_1(deaths_persons_lv2)
update_fg_1(deaths_persons_lv2)

// Bring data in
var request = new XMLHttpRequest();
    request.open("GET", "./level_1_2017_west_sussex_summary.json", false);
    request.send(null);

var lv_1_summary = JSON.parse(request.responseText);

function cause_group_1_summary() {
      lv_1_summary.forEach(function(item, index) {
        var list = document.createElement("li");
        list.innerHTML = item.Cause;
        list.className = 'cause_list';
        list.style.borderColor = color_lv_1_cause_group(index);
        var div = document.getElementById("level_1_cause_summary");
        div.appendChild(list);
      })
    }
cause_group_1_summary();

// Bring data in
var request = new XMLHttpRequest();
    request.open("GET", "./level_2_2017_west_sussex_summary.json", false);
    request.send(null);

var lv_2_summary = JSON.parse(request.responseText);

function cause_group_2_summary() {
      lv_2_summary.forEach(function(item, index) {
        var list = document.createElement("li");
        list.innerHTML = item.Cause;
        list.className = 'cause_list';
        list.style.borderColor = color_cause_group(index);
        var div = document.getElementById("level_2_cause_summary");
        div.appendChild(list);
      })
    }
cause_group_2_summary();

// Top ten table
var request = new XMLHttpRequest();
request.open("GET", "./Top_10_YLL_YLD_DALY_2017_west_sussex.json", false);
request.send(null);
var json = JSON.parse(request.responseText); // parse the fetched json data into a variable

// Take the cause of death array (data) and filter it as below
top_10_data_persons = json.filter(function(d){
	    return d.Sex === "Both"})

// Create a function for tabulating the data
function tabulate_top10(data, columns) {

var table = d3.select('#top_10_table')
	.append('table')
var thead = table
  .append('thead')
var	tbody = table
  .append('tbody');

// append the header row
thead
  .append('tr')
	.selectAll('th')
	.data(columns).enter()
	.append('th')
	.text(function (column) { return column; });

// create a row for each object in the data
var rows = tbody.selectAll('tr')
  .data(data)
  .enter()
  .append('tr');

// create a cell in each row for each column
var cells = rows.selectAll('td')
  .data(function(row) {
    return columns.map(function (column) {
		 return {column: column, value: row[column]};
	    });
	  })
	.enter()
  .append('td')
	.text(function(d,i) {
		if(i == 2) return d3.format(",.0f")(d.value); // + " items"; // Hurrah d3.format() works!
			else if (i == 4) return d3.format(",.0f")(d.value); // comma separators and round values
				else if (i == 6) return d3.format(",.0f")(d.value);
					else if (i == 8) return d3.format(",.0f")(d.value);
		 return d.value; });
	  return table;
}

var topTable =	tabulate_top10(top_10_data_persons, ['Rank', 'Cause of death', 'Deaths','Cause of years of life lost', 'YLLs (Years of Life Lost)','Cause of years lived with disability','YLDs (Years Lived with Disability)','Cause of disability adjusted life years lost','DALYs (Disability-Adjusted Life Years)']);

// Dynamic string of total deaths
var request = new XMLHttpRequest();
request.open("GET", "./Total_deaths_yll_2017_west_sussex.json", false);
request.send(null);
var total_data = JSON.parse(request.responseText); // parse the fetched json data into a variable

// Select the div id total_death_string (this is where you want the result of this to be displayed in the html page)
d3.select("#total_death_string")
	.data(total_data) // The array
	.filter(function(d){
			return d.Sex == "Both" }) // We can filter just persons
	.text(function(d){
	return "What caused the " + d3.format(",.0f")(d.Deaths) + " deaths in West Sussex in 2017?" }); // Concatenate a string
// TODO: we could make this title dynamic based on which 'switch-one' button is checked on the bar chart?

// Level 3 bubbles (persons)
var request = new XMLHttpRequest();
request.open("GET", "./Number_bubbles_df_level_3_2017_west_sussex.json", false);
request.send(null);
var json = JSON.parse(request.responseText); // parse the fetched json data into a variable

deaths_persons_lv3 = json.filter(function(d){
	    return d.Sex === "Both" &
	      +d.Year === 2017 &
        d.Measure === 'Deaths'});

yll_persons_lv3 = json.filter(function(d){
      return d.Sex === "Both" &
        +d.Year === 2017 &
         d.Measure === 'YLLs (Years of Life Lost)'});

yld_persons_lv3 = json.filter(function(d){
	    return d.Sex === "Both" &
	      +d.Year === 2017 &
         d.Measure === 'YLDs (Years Lived with Disability)'});

daly_persons_lv3 = json.filter(function(d){
	    return d.Sex === "Both" &
	      +d.Year === 2017 &
         d.Measure === 'DALYs (Disability-Adjusted Life Years)'});

// append the svg object to the body of the page
var svg_fg_2 = d3.select("#my_deaths_bubble_dataviz")
  .append("svg")
  .attr("width", width)
  .attr("height", height)

// Create functions to show, move, and hide the tooltip
var tooltip_fg_2 = d3.select("#my_deaths_bubble_dataviz")
  .append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden");

// This creates the function for what to do when someone moves the mouse over a circle (e.g. move the tooltip in relation to the mouse cursor).
var showTooltip_fg_2 = function(d) {
tooltip_fg_2
  .html("<p>In West Sussex, in " + d.Year + ", there were <strong>" + d3.format(",.0f")(d.Value) + "</strong> " + d.Measure + " caused by " + d.Cause + ".</p><p>This is part of the <strong>" + d['Cause group'] + "</strong> disease group.</p>")
  .style("top", (event.pageY - 10) + "px")
  .style("left", (event.pageX + 10) + "px")
  }

function update_bubbles(data) {

data = data.sort(function(a, b) {
  return d3.descending(a['Cause group'], b['Cause group']);
  });

// Grab the lowest number of deaths
var min_deaths = d3.min(data, function(d) {
  return +d.Value;
  })

// Grab the highest number of deaths
var max_deaths = d3.max(data, function(d) {
  return +d.Value;
  })

// Size scale for bubbles
var size = d3.scaleLinear()
  .domain([0, max_deaths])
  .range([1, 85]) // circle will always be between 1 and 85 px wide

// Initialize the circle
var node = svg_fg_2.append("g")
  .selectAll("circle")
  .data(data)
  .enter()
  .append("circle")
  .attr("class", "node")
  .attr("r", function(d) {
      return size(d.Value)
      })
  .attr("cx", width / 2)
  .attr("cy", height / 2)
  .style("fill", function(d) {
      return color_cause_group(d['Cause group'])
      })
  .style("fill-opacity", 1)
  .on("mouseover", function() {
      return tooltip_fg_2.style("visibility", "visible");
    })
  .on("mousemove", showTooltip_fg_2)
  .on("mouseout", function() {
      return tooltip_fg_2.style("visibility", "hidden");
    })
  .call(d3.drag()
  .on("start", dragstarted)
  .on("drag", dragged)
  .on("end", dragended));

// TODO: remove old values when updating
// node
//   .exit()
//   .remove();

// Features of the forces applied to the nodes:
var simulation = d3.forceSimulation()
  .force("center", d3.forceCenter().x(width / 2).y(height/2)) // Attraction to the middle of the svg area and 150 px down
  .force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted one each other of value is > 0
  .force("collide", d3.forceCollide().strength(.2).radius(function(d) {
      return (size(d.Value) + 3)})
      .iterations(1)) // Force that avoids circle overlapping

  // Apply these forces to the nodes and update their positions.
  // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
simulation
.nodes(data)
.on("tick", function(d) { node
.attr("cx", function(d) {
    return d.x; })
.attr("cy", function(d) {
    return d.y; })
  });

// What happens when a circle is dragged?
function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(.03).restart(); d.fx = d.x;
    d.fy = d.y;
  }

function dragged(d) {
    d.fx = d3.event.x;
     d.fy = d3.event.y;
  }

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(.03); d.fx = null;
    d.fy = null;
   }

}

// Initialize the plot with the first dataset
update_bubbles(deaths_persons_lv3)

// Bubbles by sex will be added as figure 3

// By age level 2 conditions figure 4
var request = new XMLHttpRequest();
    request.open("GET", "./Numbers_lifecourse_persons_level_2_2017_west_sussex.json", false);
    request.send(null);
var json = JSON.parse(request.responseText); // parse the fetched json data into a variable

groups = d3.map(json, function(d){
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

// Now we can use the global width with
var width_fg_4 = width - margin.left - margin.right;
var height_fg_4 = 400 - margin.top - margin.bottom;

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

// append the svg object to the body of the page
var svg_fg_4 = d3.select("#my_lifecourse_condition_dataviz")
 .append("svg")
 .attr("width", width)
 .attr("height", height_fg_4 +100)
 .append("g")
 .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Add X axis
var x_fg_4 = d3.scaleBand()
  .domain(groups)
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
 .attr("y", height_fg_4 + margin.top + 30)
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

// TODO:  This is currently the max value, for DALYs, if we want the y axis to update based on the measure we need to figure out how do do it.

// // Add Y axis
var y_fg_4 = d3.scaleLinear()
  .domain([0, 25000])
  .range([height_fg_4, 0 ]);

svg_fg_4
  .append("g")
  .call(d3.axisLeft(y_fg_4));

var yAxis_fg_4 = svg_fg_4.append("g")
  .attr("class", "myYaxis")

function update_age(data) {

var stackedData = d3.stack()
  .keys(cause_categories)
    (data)

var measure_name = d3.map(data, function(d){
  return(d.Measure)})
  .keys();

// This adds a transition effect on the change between datasets (i.e. if the yaxis needs to be longer or shorter).
yAxis_fg_4
  .transition()
  .duration(1000)
  .call(d3.axisLeft(y_fg_4));

var age_bars_df = svg_fg_4.append("g")
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
    return x_fg_4(d.data.Age); })
  .attr("y", function(d) {
    return y_fg_4(d[1]); })
  .attr("height", function(d) {
    return y_fg_4(d[0]) - y_fg_4(d[1]); })
  .attr("width", x_fg_4.bandwidth())
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


// age by conditions
var request = new XMLHttpRequest();
    request.open("GET", "./Numbers_lifecourse_persons_by_condition_level_2_2017_west_sussex.json", false);
    request.send(null);
var json = JSON.parse(request.responseText); // parse the fetched json data into a variable

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

// Now we can use the global width with
var width_fg_5 = width_fg_4
var height_fg_5 = height_fg_4

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

tooltip_condition_age
 .html("<h3>" + subgroupName + '</h3><p>The estimated number of ' + d.data.Measure + ' as a result of ' + d.data.Cause  + ' among those aged ' + subgroupName + ' in West Sussex in 2017 was <font color = "#1e4b7a"><b>' + d3.format(",.0f")(subgroupValue) + '</b></font>.</p>')
 .style("opacity", 1)
 .style("top", (event.pageY - 10) + "px")
 .style("left", (event.pageX + 10) + "px")
}

// append the svg object to the body of the page
var svg_fg_5 = d3.select("#my_condition_lifecourse_dataviz")
 .append("svg")
 .attr("width", width)
 .attr("height", height_fg_5 +100)
 .append("g")
 .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Add X axis
var x_fg_5 = d3.scaleBand()
 .domain(conditions)
 .range([0, width_fg_5])
 .padding([0.2])

svg_fg_5
 .append("g")
 .attr("transform", "translate(0," + height_fg_5 + ")")
 .call(d3.axisBottom(x_fg_5).tickSizeOuter(0));

svg_fg_5
 .selectAll("text")
 .attr("transform", "translate(-10,10)rotate(-45)")
 .style("text-anchor", "end")

// Add X axis label:
svg_fg_5
 .append("text")
 .attr("text-anchor", "end")
 .attr("x", width/2)
 .attr("y", height_fg_5 + margin.top + 30)
 .text("Condition");

// Y axis label:
svg_fg_5
 .append("text")
 .attr('id', 'axis_y_title')
 .attr("text-anchor", "end")
 .attr("transform", "rotate(-90)")
 .attr("y", - margin.left + 10)
 .attr("x", - margin.top - 60)
 .text('Number');

// TODO:  This is currently the max value, for DALYs, if we want the y axis to update based on the measure we need to figure out how do do it.

// // Add Y axis
var y_fg_5 = d3.scaleLinear()
    .domain([0, 50000])
    .range([height_fg_5, 0 ]);

  svg_fg_5
    .append("g")
    .call(d3.axisLeft(y_fg_5));

var yAxis_fg_5 = svg_fg_5
  .append("g")
  .attr("class", "myYaxis")

  function update_condition(data) {

  var stackedData = d3.stack()
    .keys(ages)
      (data)

  var measure_name = d3.map(data, function(d){
    return(d.Measure)})
    .keys();

  // This adds a transition effect on the change between datasets (i.e. if the yaxis needs to be longer or shorter).
  yAxis_fg_5
    .transition()
    .duration(1000)
    .call(d3.axisLeft(y_fg_5));

  var condition_bars_df = svg_fg_5.append("g")
    .selectAll("g")
    .data(stackedData) // Enter in the stack data = loop key per key = group per group
    .enter()
    .append("g")
    .attr("fill", function(d) {
      return color_age_group(d.key); })
    .selectAll("rect")
    .data(function(d) { return d; })// enter a second time = loop subgroup per subgroup to add all rectangles
    .enter()
    .append("rect")
    .attr("x", function(d) {
      return x_fg_5(d.data.Cause); })
    .attr("y", function(d) {
      return y_fg_5(d[1]); })
    .attr("height", function(d) {
      return y_fg_5(d[0]) - y_fg_5(d[1]); })
    .attr("width", x_fg_5.bandwidth())
    .on("mouseover", function() {
    return tooltip_condition_age.style("visibility", "visible");
    })
    .on("mousemove", showTooltip_condition_age)
    .on("mouseout", function() {
    return tooltip_condition_age.style("visibility", "hidden");
    })

    condition_bars_df
      .exit()
      .remove()
  }

  update_condition(deaths_condition)


// possible bug
// y_fg_5
//   .domain([0, function(d) {
//     if(measure_name === 'Deaths') return 3000;
//     else if (measure_name === 'YLLs (Years of Life Lost)') return 45000;
//     else if (measure_name === 'YLDs (Years Lived with Disability)') return 29000;
//                return 48500; }])
//    .range([height_fg_4, 0 ]);

// Line chart
var height_fg_6 = 300;

// append the svg object to the body of the page
var svg_fg_6 = d3.select("#my_line_dataviz")
  .append("svg")
    .attr("width", width)
    .attr("height", height_fg_6 + margin.top + 100)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Bring data in for figure 6
var request = new XMLHttpRequest();
    request.open("GET", "./Rate_totals_1990_2017_all_areas.json", false);
    request.send(null);
var json = JSON.parse(request.responseText); // parse the fetched json data into a variable

// TODO: Can you nest a switch so that we can choose the areas as well as the measure (Deaths, yll, yld. daly)

deaths_se_eng = json.filter(function(d){ // gets a subset of the json data which contains South East England and England data - we will plot these values so that they are always on the line graph
    return d.measure === 'Deaths' & d.Area === 'South East England' ||
           d.measure === 'Deaths' & d.Area === 'England'})
          .sort(function(a, b) {
                return d3.ascending(a.Year, b.Year);
          });

deaths_all_cause = json.filter(function(d){ // gets a subset of the json data - This time it excludes SE and England values
    return d.measure === 'Deaths' &
           d.Area != 'South East England' &
           d.Area != 'England'})
          .sort(function(a, b) {
                return d3.ascending(a.Year, b.Year);
          });

// List of areas in the data set (which we sort by our neighbour rank order first)
var areas = d3.map(deaths_all_cause.sort(function(a,b){
  return d3.ascending(a.Neighbour_rank, b.Neighbour_rank)}), function(d){
  return(d.Area)})
  .keys()

// List of areas in the data set (which we sort by our neighbour rank order first)
var reference_areas = d3.map(deaths_se_eng.sort(function(a,b){
  return d3.ascending(a.Neighbour_rank, b.Neighbour_rank)}), function(d){
  return(d.Area)})
  .keys()

// List of years in the dataset
var years_fg_6 = d3.map(deaths_all_cause, function(d){
    return(d.Year)})
    .keys()

// We need to create a dropdown button for the user to choose which area to be displayed on the figure.
d3.select("#selectAreaButton")
  .selectAll('myOptions')
 	.data(areas)
  .enter()
	.append('option')
  .text(function (d) {
    return d; }) // text to appear in the menu - this does not have to be as it is in the data (you can concatenate other values).
  .attr("value", function (d) {
    return d; }) // corresponding value returned by the button

// We need to create a dropdown button for the user to choose which area to be displayed on the figure.
d3.select("#selectReferenceAreaButton")
  .selectAll('myOptions')
 	.data(reference_areas)
  .enter()
  .append('option')
  .text(function (d) {
    return d; }) // text to appear in the menu - this does not have to be as it is in the data (you can concatenate other values).
  .attr("value", function (d) {
    return d; }) // corresponding value returned by the button

// A color scale, this is useful because it will respond to the number of elements in the array rather than needing to be hardcoded (although we will mostly know how many elements will be involved and may want to specify particular colours.)
var myColor = d3.scaleOrdinal()
  .domain(areas)
  .range(d3.schemePaired);

// Add X axis
var x = d3.scaleLinear()
  .domain(d3.extent(deaths_all_cause, function(d){
    return d.Year; }))
  .range([0, width - margin.left - 50]);

svg_fg_6
  .append("g")
  .attr("transform", "translate(0," + height_fg_6 + ")")
  .call(d3.axisBottom(x).ticks(years_fg_6.length, '0f')); // the .length gives one tick for every item (every year in the dataset) and the '0f' removes the comma separator from the year

// Add Y axis
var y = d3.scaleLinear()
  .domain([0, d3.max(deaths_all_cause, function(d) { return +d.Estimate; })]) // Add the ceiling
  .range([ height_fg_6, 0 ]);

svg_fg_6
  .append("g")
  .call(d3.axisLeft(y));

// Add X axis label:
svg_fg_6
  .append("text")
  .attr("text-anchor", "end")
  .attr("x", width/2)
  .attr("y", height_fg_6 + margin.top + 10)
  .text("Year");

// Y axis label:
svg_fg_6
  .append("text")
  .attr('id', 'axis_y_title')
  .attr("text-anchor", "end")
  .attr("transform", "rotate(-90)")
  .attr("y", - margin.left + 20)
  .attr("x", - margin.top - 60)
  .text('Deaths per 100,000');

var line = svg_fg_6
  .append('g')
  .append("path")
  .datum(deaths_all_cause.filter(function(d){
    return d.Area === areas[0]})) // Initialize line with first value from 'allGroup'
  .attr("d", d3.line()
  .x(function(d) { return x(d.Year) })
  .y(function(d) { return  y(+d.Estimate) }))
  .attr("stroke", function(d){ return myColor("valueA") })
  .style("stroke-width", 2)
  .style("fill", "none")

var line_ref = svg_fg_6
  .append('g')
  .append("path")
  .datum(deaths_se_eng.filter(function(d){
    return d.Area === reference_areas[0]}))
  .attr("d", d3.line()
  .x(function(d) { return x(d.Year) })
  .y(function(d) { return  y(+d.Estimate) }))
  .attr("stroke", '#000000')
  .style("stroke-width", 2)
  .style("fill", "none")

// Add a circle following the pointer
var focus_fg_6 = svg_fg_6
 .append("g")
 .style("display", "none");

// This function grabs the Year closest to the left hand side of the mouse pointer
var bisectYear = d3.bisector(function(d) {
  return d.Year; }).left;

// append the circle at the intersection
focus_fg_6
 .append("circle")
 .attr("class", "y")
 .style("fill", "lightblue")
 .style("stroke", "blue")
 .attr("r", 4);

// append the x line
focus_fg_6
 .append("line")
 .attr("class", "x")
 .style("stroke", "blue")
 .style("stroke-dasharray", "3,3")
 .style("opacity", 0.5)
 .attr("y1", 0)
 .attr("y2", height);

 // place the value at the intersection
 focus_fg_6
 .append("text")
 .attr("class", "y1")
 .style("opacity", 1)
 .attr("dx", 8)
 .attr("dy", "-.3em");

// This is a function to update the chart with new data (it filters the larger dataset)
function update_fg_6(selectedGroup) {

var dataFilter = deaths_all_cause.filter(function(d){
  return d.Area === selectedGroup})

var selectedRefOption = d3.select("#selectReferenceAreaButton").property('value')
var ref_data = deaths_se_eng.filter(function(d){
  return d.Area === selectedRefOption})

// We can add a circle to follow the mousepointer when someone hovers over the figure.
svg_fg_6
 .append("rect")
 .attr("width", width)
 .attr("height", height_fg_6)
 .style("fill", "none")
 .style("pointer-events", "all")
 .on("mouseover", function() {
   focus_fg_6.style("display", null); })
 .on("mouseout", function() {
   focus_fg_6.style("display", "none"); })
 .on("mousemove", mousemove);

function mousemove() {
var x0 = x.invert(d3.mouse(this)[0]),
  i = bisectYear(dataFilter, x0, 1),
  d0 = dataFilter[i - 1],
  d1 = dataFilter[i],
  d = x0 - d0.Year > d1.Year - x0 ? d1 : d0;

focus_fg_6
 .select("circle.y")
 .attr("transform",
  "translate(" + x(d.Year) + "," + y(d.Estimate) + ")")

focus_fg_6
 .select(".x")
 .attr("transform",
"translate(" + x(d.Year) + "," + y(d.Estimate) + ")")
 .attr("y2", height_fg_6 - y(d.Estimate))

// Maybe better to utilise a tooltip function to build a html tooltip
focus_fg_6
 .select("text.y1")
 // .html('<h3>' + d.Area + '</h3><p>Deaths in ' + d.Year + ' = ' + d3.format('.0f')(d.Estimate) +'</p>')
 .attr("transform",
           "translate(" + x(d.Year) + "," +
                          y(d.Estimate - 100) + ")")
 .text('Deaths: ' + d3.format('.0f')(d.Estimate));
}

line
  .datum(dataFilter)
  .transition()
  .duration(1000)
  .attr("d", d3.line()
  .x(function(d) { return x(d.Year) })
  .y(function(d) { return y(+d.Estimate) })
    )
  .attr("stroke", function(d){
    return myColor(selectedGroup) })

  line_ref
    .datum(ref_data)
    .transition()
    .duration(1000)
    .attr("d", d3.line()
    .x(function(d) { return x(d.Year) })
    .y(function(d) { return y(+d.Estimate) })
      )
    .attr("stroke", '#000000')
    }

// This says run the update_fg_6 function when there is a change on the 'selectAreaButton' div based on whatever the new value selected is.
d3.select("#selectAreaButton").on("change", function(d) {
var selectedOption = d3.select('#selectAreaButton').property("value")
var selectedRefOption = d3.select("#selectReferenceAreaButton").property('value')
      update_fg_6(selectedOption)
})

// This says run the same update_fg_6 function when there is a change on the 'selectReferenceAreaButton' div based on whatever the new value selected is.
d3.select("#selectReferenceAreaButton").on("change", function(d) {
var selectedOption = d3.select('#selectAreaButton').property("value")
var selectedRefOption = d3.select("#selectReferenceAreaButton").property('value')
    update_fg_6(selectedOption)
})

update_fg_6(areas[0])

// bar chart west sussex compared to SE and England.

// Look at the three conditions, maybe introduce risk factors too...