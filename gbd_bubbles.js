
// var injury = ["Transport injuries", "Unintentional injuries", "Self-harm and interpersonal violence"]
// var non_communicable = ["Neoplasms", "Cardiovascular diseases","Chronic respiratory diseases", "Digestive diseases", "Neurological disorders", "Mental disorders", "Substance use disorders", "Diabetes and kidney diseases", "Skin and subcutaneous diseases",  "Sense organ diseases", "Musculoskeletal disorders", "Other non-communicable diseases"]
// var communicable_neo_nutr = ["HIV/AIDS and sexually transmitted infections", "Respiratory infections and tuberculosis", "Enteric infections", "Neglected tropical diseases and malaria", "Other infectious diseases","Maternal and neonatal disorders", "Nutritional deficiencies"]

// https://www.d3-graph-gallery.com/graph/basic_datamanipulation.html

var year_x = 2017;
var sex_x = "Male";

var width = 600;
var height = 500;

var parent_cause_categories = ["HIV/AIDS and sexually transmitted infections", "Respiratory infections and tuberculosis","Enteric infections","Neglected tropical diseases and malaria", "Other infectious diseases","Maternal and neonatal disorders","Nutritional deficiencies","Neoplasms","Sense organ diseases","Musculoskeletal disorders", "Other non-communicable diseases","Cardiovascular diseases", "Chronic respiratory diseases","Digestive diseases","Neurological disorders","Mental disorders","Substance use disorders","Diabetes and kidney diseases", "Skin and subcutaneous diseases","Transport injuries","Unintentional injuries","Self-harm and interpersonal violence"]

console.log(parent_cause_categories)

// Color palette for continents?
var color_p_cause = d3.scaleOrdinal()
  .domain(parent_cause_categories)
  .range(["#8eb145","#a25dce","#52bb55","#c94eb1","#c4aa35","#616bdb","#e28637","#46aed7","#d54637","#50b696","#d44886","#4d7f3e","#cd415f","#8196de","#a9572d","#6563a9","#cca467","#9a4c7b","#826f2c","#d889c3","#cd726e"]);

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width)
    .attr("height", height)

// Create functions to show, move, and hide the tooltip
var tooltip = d3.select("#my_dataviz")
          .append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("z-index", "10")
          .style("visibility", "hidden");

// Read and use data
d3.csv("Deaths_cause_x_sex_years.csv", function(data) {


data = data.filter(function(d){ // Add any filters
    return d.sex === sex_x &
    +d.year === year_x}) // Unfortunately, it seems that if your filter removes a row and there are no other parent causes the color_p_cause function changes the color returned (although it should do the same for the legend). This will be problematic if switching using filters.

console.log(data)

// Grab the lowest number of deaths
var min_deaths = d3.min(data, function(d){
  return +d.Deaths;})

// Grab the highest number of deaths
var max_deaths = d3.max(data, function(d){
  return +d.Deaths;})

// Size scale for countries
var size = d3.scaleLinear()
    .domain([0, max_deaths])
    .range([1,65])  // circle will be between 1 and 65 px wide

// This creates the function for what to do when someone moves the mouse over a circle (e.g. move the tooltip in relation to the mouse cursor).
var mousemove = function(d) {
    tooltip
    .html("<p>In " + d.location + " in " + d.year +", there were <strong>" + d3.format(",.0f")(d.Deaths) + "</strong> deaths caused by " + d.cause + ".</p><p>This is part of the <strong>" + d.Parent_cause + "</strong> disease group.</p>")
    .style("top", (event.pageY-10)+"px")
    .style("left",(event.pageX+10)+"px")
      }

// parent_cause_categories = create_parent_cause_categories(data);



// Initialize the circle
var node = svg.append("g")
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("r", function(d){ return size(d.Deaths)})
    .attr("cx", width / 2)
    .attr("cy", 300)
    .style("fill", function(d){ return color_p_cause(d.Parent_cause)})
    .style("fill-opacity", 1)
    .on("mouseover", function(){return tooltip.style("visibility", "visible");})
    .on("mousemove", mousemove)
    .on("mouseout", function(){return tooltip.style("visibility", "hidden");}) // I think this function ammends the visibility of the tooltip object to hidden
    .call(d3.drag() // call specific function when circle is dragged
         .on("start", dragstarted)
         .on("drag", dragged)
         .on("end", dragended));



  // Features of the forces applied to the nodes:
  var simulation = d3.forceSimulation()
    .force("center", d3.forceCenter().x(width / 2).y(300)) // Attraction to the middle of the svg area and 400 px down
    .force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted one each other of value is > 0
    .force("collide", d3.forceCollide().strength(.2).radius(function(d){ return (size(d.Deaths)+3) }).iterations(1)) // Force that avoids circle overlapping

      // Apply these forces to the nodes and update their positions.
      // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
      simulation
          .nodes(data)
          .on("tick", function(d){
            node
                .attr("cx", function(d){ return d.x; })
                .attr("cy", function(d){ return d.y; })
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
  var valuesToShow = [10,max_deaths/4,max_deaths/2, max_deaths]
  var xLabel = 180
  var xCircle = 100
  var yCircle = 160

  var svg_size_key = d3.select("#chart_legend")
      .append("svg")
      .attr("width", 350)
      .attr("height", 200)

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
        function(d) { return size(d)
        })
      .style("fill", "none")
      .attr("stroke", "black")

// Add svg_size_key: segments
      svg_size_key
      .selectAll("legend")
      .data(valuesToShow)
      .enter()
      .append("line")
      .attr('x1', function(d){ return xCircle + size(d) } )
      .attr('x2', xLabel)
      .attr('y1', function(d){ return yCircle - size(d) } )
      .attr('y2', function(d){ return yCircle - size(d) } )
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
      .text( function(d) {
        return d3.format(",.0f")(d) + " deaths"
        })
      .attr("font-size", 11)
      .attr('alignment-baseline', 'top')

// Loop through array to get distinct chapter names
function create_parent_cause_categories (data){
  var cats = []; // Create a variable called cats - this will hold our menu
            data.forEach(function(d){ // For every datapoint
            if(cats.indexOf(d.Parent_cause) === -1) // This says look at the parent causes currently in the array (at the start there are none). If the current value you are looking at in the data does not appear in the array (signified by === -1) then move to push the value
              {
              cats.push(d.Parent_cause) // push says add the value to the array
                      }
                    })
                    return cats; // Once all datapoints have been examined, the result returned should be an array containing all the unique values of BNF_chapter in the data
                }
// console.log(parent_cause_categories)


})
// This function builds a menu by creating a button for every value in the cause_categories array.
function buildMenu(){
  parent_cause_categories.forEach(function(item, index){ // The index is the position of the loop, which can be used later for the border colour
    var button = document.createElement("button");
    button.innerHTML = item;
    button.className = 'filterButton';
    button.style.borderColor = color_p_cause(index);

    var div = document.getElementById("parent_cause_categories");
    div.appendChild(button); // This appends the button to the div

// This says listen for which value is clicked, for whatever is clicked, the following actions should take place.
    button.addEventListener('click', function(e){
      selected_cause = e.target.innerHTML;

        })
        })
                    }
