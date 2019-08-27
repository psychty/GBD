var width = window.innerWidth / 100 * 55;
var height = 500;

// var year_x = 2017;
// var sex_x = "Both";

var parent_cause_categories = ["Cardiovascular diseases", "Chronic respiratory diseases", "Diabetes and kidney diseases", "Digestive diseases", "Enteric infections", "HIV/AIDS and sexually transmitted infections", "Maternal and neonatal disorders", "Mental disorders", "Musculoskeletal disorders", "Neglected tropical diseases and malaria", "Neoplasms", "Neurological disorders", "Nutritional deficiencies", "Other infectious diseases", "Other non-communicable diseases", "Respiratory infections and tuberculosis", "Self-harm and interpersonal violence", "Sense organ diseases", "Skin and subcutaneous diseases", "Substance use disorders", "Transport injuries", "Unintentional injuries"]

var color_p_cause = d3.scaleOrdinal()
  .domain(parent_cause_categories)
  .range(["#e48874", "#50bd54", "#a35cce", "#7eb233", "#d24aa4", "#5bc187", "#dd4973", "#3c803b", "#656ec9", "#bcb034", "#994e8b", "#8eac5b", "#d48ecb", "#6c6e26", "#5e97d1", "#db9037", "#45c7c8", "#ce4933", "#3d9275", "#a74b5b", "#bba360", "#9b5e2c"]);

// Overall deaths data for summary at the top
var request = new XMLHttpRequest();
request.open("GET", "./Deaths_YLL_2017_west_sussex.json", false);
request.send(null);
var total_data = JSON.parse(request.responseText); // parse the fetched json data into a variable

// Select the div id total_death_string (this is where you want the result of this to be displayed in the html page)
d3.select("#total_death_string")
	.data(total_data) // The array
	.filter(function(d){
			return d.Sex == "Both" }) // We can filter just persons
	.text(function(d){
	return "What caused the " + d3.format(",.0f")(d.Deaths) + " deaths in West Sussex in 2017?" }); // Concatenate a string

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

// console.log(deaths_persons);
// console.log(yll_persons);
// console.log(yld_persons);
// console.log(daly_persons);

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
      .html("<p>In West Sussex, in " + d.Year + ", there were <strong>" + d3.format(",.0f")(d.Value) + "</strong> deaths caused by " + d.Cause + ".</p><p>This is part of the <strong>" + d['Cause group'] + "</strong> disease group.</p>")
      .style("top", (event.pageY - 10) + "px")
      .style("left", (event.pageX + 10) + "px")
  }

// Read and use data
function update_bubbles(data) {

data = data.sort(function(a, b) {
    return d3.ascending(a['Cause group'], b['Cause group']);
  });

  // Grab the lowest number of deaths
  var min_deaths = d3.min(data, function(d) {
    return +d.Value;
  })

  // Grab the highest number of deaths
  var max_deaths = d3.max(data, function(d) {
    return +d.Value;
  })

  // Size scale for countries
  var size = d3.scaleLinear()
    .domain([0, max_deaths])
    .range([1, 80]) // circle will be between 1 and 85 px wide

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
      return color_p_cause(d['Cause group'])
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

  // Legend key size
  var valuesToShow = [10, max_deaths / 4, max_deaths / 2, max_deaths]
  var xLabel = 180
  var xCircle = 100
  var yCircle = 160

  var svg_size_key = d3.select("#chart_legend")
    .append("svg")
    .attr("width", 350)
    .attr("height", 350)

  svg_size_key
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("circle")
    .attr("cx", xCircle)
    .attr("cy", function(d) {
      return yCircle - size(d)
    })
    .attr("r",
      function(d) {
        return size(d)
      })
    .style("fill", "none")
    .attr("stroke", "black")

  // Add svg_size_key: segments
  svg_size_key
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("line")
    .attr('x1', function(d) {
      return xCircle + size(d)
    })
    .attr('x2', xLabel)
    .attr('y1', function(d) {
      return yCircle - size(d)
    })
    .attr('y2', function(d) {
      return yCircle - size(d)
    })
    .attr('stroke', 'black')
    .style('stroke-dasharray', ('2,2'))

  // Add svg_size_key: labels
  svg_size_key
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("text")
    .attr('x', xLabel)
    .attr('y', function(d) {
      return yCircle - size(d)
    })
    .text(function(d) {
      return d3.format(",.0f")(d) + " deaths"
    })
    .attr("font-size", 11)
    .attr('alignment-baseline', 'top')

// Loop through array to get distinct cause group names
  function create_parent_cause_categories(data) {
    var cats = []; // Create a variable called cats - this will hold our menu
    data.forEach(function(d) { // For every datapoint
      if (cats.indexOf(d['Cause group']) === -1) // This says look at the parent causes currently in the array (at the start there are none). If the current value you are looking at in the data does not appear in the array (signified by === -1) then move to push the value
      {
        cats.push(d['Cause group']) // push says add the value to the array
      }
    })
    return cats; // Once all datapoints have been examined, the result returned should be an array containing all the unique values of BNF_chapter in the data
  }
  var cats_available = create_parent_cause_categories(data)
  function buildMenu() {
    cats_available.forEach(function(item, index) { // The index is the position of the loop, which can be used later for the border colour
      var button = document.createElement("button");
      button.innerHTML = item;
      button.className = 'filterButton';
      button.style.borderColor = color_p_cause(index);

      var div = document.getElementById("cause_categories");
      div.appendChild(button); // This appends the button to the div

      // This says listen for which value is clicked, for whatever is clicked, the following actions should take place.
      button.addEventListener('click', function(e) {
        selected_chapter = e.target.innerHTML;
        console.log(selected_chapter)
      })
    })
  }
  buildMenu();
}

// Initialize the plot with the first dataset
update_bubbles(deaths_persons)
update_bubbles(deaths_persons)
