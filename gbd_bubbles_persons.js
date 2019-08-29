var width = window.innerWidth / 100 * 55;
var height = 500;

// var year_x = 2017;
// var sex_x = "Both";

var cause_categories = ["HIV/AIDS and sexually transmitted infections", "Respiratory infections and tuberculosis", "Enteric infections", "Neglected tropical diseases and malaria", "Other infectious diseases", "Maternal and neonatal disorders", "Nutritional deficiencies", "Neoplasms", "Cardiovascular diseases", "Chronic respiratory diseases", "Digestive diseases", "Neurological disorders", "Mental disorders", "Substance use disorders", "Diabetes and kidney diseases", "Skin and subcutaneous diseases", "Sense organ diseases", "Musculoskeletal disorders", "Other non-communicable diseases", "Transport injuries", "Unintentional injuries", "Self-harm and interpersonal violence"]

var color_cause_group = d3.scaleOrdinal()
  .domain(cause_categories)
  .range(["#F8DDEB", "#F2B9BF", "#EE9187", "#EA695C", "#D84D42", "#AD3730", "#7A1C1C", '#BCD6F7','#97C4F0','#67A8E7','#528CDB','#376ACB',"#1845A5", '#CFD6F6','#ADB9ED','#8B96DD','#6978D0', "#4E4FB8", "#3E3294", "#B5DCD0", "#76B786", '#477A49']);

// var cause_categories = ["Cardiovascular diseases", "Chronic respiratory diseases", "Diabetes and kidney diseases", "Digestive diseases", "Enteric infections", "HIV/AIDS and sexually transmitted infections", "Maternal and neonatal disorders", "Mental disorders", "Musculoskeletal disorders", "Neglected tropical diseases and malaria", "Neoplasms", "Neurological disorders", "Nutritional deficiencies", "Other infectious diseases", "Other non-communicable diseases", "Respiratory infections and tuberculosis", "Self-harm and interpersonal violence", "Sense organ diseases", "Skin and subcutaneous diseases", "Substance use disorders", "Transport injuries", "Unintentional injuries"]
//
// var color_cause_group = d3.scaleOrdinal()
//   .domain(cause_categories)
//   .range(["#e48874", "#50bd54", "#a35cce", "#7eb233", "#d24aa4", "#5bc187", "#dd4973", "#3c803b", "#656ec9", "#bcb034", "#994e8b", "#8eac5b", "#d48ecb", "#6c6e26", "#5e97d1", "#db9037", "#45c7c8", "#ce4933", "#3d9275", "#a74b5b", "#bba360", "#9b5e2c"]);


// Overall deaths data for summary at the top
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

// I think I probably will need to grab the bubble size key and update that too when switch-two is changed as the scale is updated (people might think size of deaths bubble is the same as yll when its like 5x as big)
// Legend key size
// var valuesToShow = [10, max_deaths / 4, max_deaths / 2, max_deaths]
// var xLabel = 180
// var xCircle = 100
// var yCircle = 160
//
// var svg_size_key = d3.select("#chart_legend")
//   .append("svg")
//   .attr("width", 350)
//   .attr("height", 350)
//
// svg_size_key
//   .selectAll("legend")
//   .data(valuesToShow)
//   .enter()
//   .append("circle")
//   .attr("cx", xCircle)
//   .attr("cy", function(d) {
//     return yCircle - size(d)
//   })
//   .attr("r",
//     function(d) {
//       return size(d)
//     })
//   .style("fill", "none")
//   .attr("stroke", "black")
//
// // Add svg_size_key: segments
// svg_size_key
//   .selectAll("legend")
//   .data(valuesToShow)
//   .enter()
//   .append("line")
//   .attr('x1', function(d) {
//     return xCircle + size(d)
//   })
//   .attr('x2', xLabel)
//   .attr('y1', function(d) {
//     return yCircle - size(d)
//   })
//   .attr('y2', function(d) {
//     return yCircle - size(d)
//   })
//   .attr('stroke', 'black')
//   .style('stroke-dasharray', ('2,2'))
//
// // Add svg_size_key: labels
// svg_size_key
//   .selectAll("legend")
//   .data(valuesToShow)
//   .enter()
//   .append("text")
//   .attr('x', xLabel)
//   .attr('y', function(d) {
//     return yCircle - size(d)
//   })
//   .text(function(d) {
//     return d3.format(",.0f")(d) + " deaths"
//   })
//   .attr("font-size", 11)
//   .attr('alignment-baseline', 'top')

// create the ajax request to grab the source JSON data
var request = new XMLHttpRequest();
request.open("GET", "./Number_bubbles_df_level_3_2017_west_sussex.json", false);
request.send(null);
var data_df = JSON.parse(request.responseText); // parse the fetched json data into a variable

deaths_persons = data_df.filter(function(d){
	    return d.Sex === "Both" &
	      +d.Year === 2017 &
        d.Measure === 'Deaths'});

yll_persons = data_df.filter(function(d){
      return d.Sex === "Both" &
        +d.Year === 2017 &
         d.Measure === 'YLLs (Years of Life Lost)'});

yld_persons = data_df.filter(function(d){
	    return d.Sex === "Both" &
	      +d.Year === 2017 &
         d.Measure === 'YLDs (Years Lived with Disability)'});

daly_persons = data_df.filter(function(d){
	    return d.Sex === "Both" &
	      +d.Year === 2017 &
         d.Measure === 'DALYs (Disability-Adjusted Life Years)'});

// append the svg object to the body of the page
var svg = d3.select("#my_deaths_bubble_dataviz")
  .append("svg")
  .attr("width", width)
  .attr("height", height)

// Create functions to show, move, and hide the tooltip
var tooltip = d3.select("#my_deaths_bubble_dataviz")
  .append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden");

  // This creates the function for what to do when someone moves the mouse over a circle (e.g. move the tooltip in relation to the mouse cursor).
  var mousemove = function(d) {
    tooltip
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
  var node = svg.append("g")
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
      return tooltip.style("visibility", "visible");
    })
    .on("mousemove", mousemove)
    .on("mouseout", function() {
      return tooltip.style("visibility", "hidden");
    }) // I think this function ammends the visibility of the tooltip object to hidden
    .call(d3.drag() // call specific function when circle is dragged
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

    // node
    //   .exit()
    //   .remove();

  // Features of the forces applied to the nodes:
  var simulation = d3.forceSimulation()
    // .force("x", d3.forceX().strength(0.5).x( 200))
    // .force("y", d3.forceY().strength(0.1).y( function(d){ return y(d.Parent_cause) } ))
    .force("center", d3.forceCenter().x(width / 2).y(height/2)) // Attraction to the middle of the svg area and 150 px down
    .force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted one each other of value is > 0
    .force("collide", d3.forceCollide().strength(.2).radius(function(d) {
      return (size(d.Value) + 3)
    }).iterations(1)) // Force that avoids circle overlapping

  // Apply these forces to the nodes and update their positions.
  // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
  simulation
    .nodes(data)
    .on("tick", function(d) {
      node
        .attr("cx", function(d) {
          return d.x;
        })
        .attr("cy", function(d) {
          return d.y;
        })
    });

  // What happens when a circle is dragged?
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(.03).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(.03);
    d.fx = null;
    d.fy = null;
   }


  }

// Initialize the plot with the first dataset
update_bubbles(deaths_persons)
