
var injury = ["Transport injuries", "Unintentional injuries", "Self-harm and interpersonal violence"]
var non_communicable = ["Neoplasms", "Cardiovascular diseases","Chronic respiratory diseases", "Digestive diseases", "Neurological disorders", "Mental disorders", "Substance use disorders", "Diabetes and kidney diseases", "Skin and subcutaneous diseases",  "Sense organ diseases", "Musculoskeletal disorders", "Other non-communicable diseases"]
var communicable_neo_nutr = ["HIV/AIDS and sexually transmitted infections", "Respiratory infections and tuberculosis", "Enteric infections", "Neglected tropical diseases and malaria", "Other infectious diseases","Maternal and neonatal disorders", "Nutritional deficiencies"]

// https://www.d3-graph-gallery.com/graph/basic_datamanipulation.html

var year_x = 2017;
var sex_x = "Female";

var width = 800;
var height = 1000;

// Color palette for continents?
var color = d3.scaleOrdinal()
  .domain(["Cardiovascular Diseases", "Neoplasms","Respiratory Infections And Tuberculosis","Chronic Respiratory Diseases","Digestive Diseases", "Self-harm And Interpersonal Violence","Maternal And Neonatal Disorders","Transport Injuries","Other Non-communicable Diseases","Substance Use Disorders","Unintentional Injuries","Diabetes And Kidney Diseases","Neurological Disorders","Musculoskeletal Disorders","Enteric Infections","Other Infectious Diseases","Hiv/aids And Sexually Transmitted Infections","Skin And Subcutaneous Diseases","Nutritional Deficiencies", "Mental Disorders","Neglected Tropical Diseases And Malaria"])
  .range(["#8eb145","#a25dce","#52bb55","#c94eb1","#c4aa35","#616bdb","#e28637","#46aed7","#d54637","#50b696","#d44886","#4d7f3e","#cd415f","#8196de","#a9572d","#6563a9","#cca467","#9a4c7b","#826f2c","#d889c3","#cd726e"]);

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width)
    .attr("height", height)

// create a tooltip
var Tooltip = d3.select("#my_dataviz")
  .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")

// Read data
d3.csv("Deaths_cause_x_sex_years.csv", function(data) {

data = data.filter(function(d){ // Add any filters
    return d.sex === sex_x &
    +d.year === year_x})

var min_deaths = d3.min(data, function(d){
  return +d.Deaths;})

var max_deaths = d3.max(data, function(d){
  return +d.Deaths;})

// Size scale for countries
var size = d3.scaleLinear()
    .domain([min_deaths, max_deaths])
    .range([5,75])  // circle will be between 7 and 55 px wide



      // Three function that change the tooltip when user hover / move / leave a cell
      var mouseover = function(d) {
        Tooltip
          .style("opacity", 1)
      }
      var mousemove = function(d) {
        Tooltip
          .html('<u>' + d.cause + '</u>' + "<br>" + d.Deaths + " deaths")
          .style("left", (d3.mouse(this)[0]+20) + "px")
          .style("top", (d3.mouse(this)[1]) + "px")
      }
      var mouseleave = function(d) {
        Tooltip
          .style("opacity", 0)
      }

      // Initialize the circle: all located at the center of the svg area
      var node = svg.append("g")
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
          .attr("class", "node")
          .attr("r", function(d){ return size(d.Deaths)})
          .attr("cx", width / 2)
          .attr("cy", height / 2)
          .style("fill", function(d){ return color(d.Parent_cause)})
          .style("fill-opacity", 0.8)
          .attr("stroke", "black")
          .style("stroke-width", 1)
          .on("mouseover", mouseover) // What to do when hovered
          .on("mousemove", mousemove)
          .on("mouseleave", mouseleave)
          .call(d3.drag() // call specific function when circle is dragged
               .on("start", dragstarted)
               .on("drag", dragged)
               .on("end", dragended));

      // Features of the forces applied to the nodes:
      var simulation = d3.forceSimulation()
          .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
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

    })
