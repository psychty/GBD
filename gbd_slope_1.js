var rawGBD_male = [];
var rawGBD_female = [];

var sex_x = "Male";

var sex_dropdown = ["Male", "Female"],
  j = 0; // Create the drop down data, with 0 (Male) as the default. I think 0 is the default

  // Initialize the sex filter button
  var dropdownButton_sex = d3.select("#sexdropdownbutton")
    .append('select') // add a select input
    .attr("id", "select_sex") // Give the filter an id

  labels = dropdownButton_sex.selectAll("label")
    .data(sex_dropdown)
    .enter()
    .append("option")
    .text(function(d) {
      return d;
    })
    .attr("value", function(d, i) {
      return d;
    });

d3.csv("./Deaths_cause_x_sex_years.csv",function(error, data) {
if (error) {
	} else {

        	rawGBD_male = data.filter(function(d) { // Add any filters
            return d.sex === "Male" &
              +d.year === 2017
          })

          rawGBD_male = rawGBD_male.sort(function(a, b) {
            return d3.ascending(a.Parent_cause, b.Parent_cause);
          });

          rawGBD_female = data.filter(function(d) { // Add any filters
              return d.sex === "Female" &
                +d.year === 2017
            })

          rawGBD_female = rawGBD_female.sort(function(a, b) {
            return d3.ascending(a.Parent_cause, b.Parent_cause);
          });
        }
});

setTimeout(function(){ // We need to let the data load first and then run the code below

d3.select("#selected-dropdown").text("This figure is currently showing deaths for " + sex_x.toLowerCase() + "s in West Sussex in " + year_x);

d3.select("select")
  .on("change", function(d) {
    var sex_x = d3.select("#select_sex").node().value;
    d3.select("#selected-dropdown").text("This figure is currently showing deaths for " + sex_x.toLowerCase() + "s in West Sussex in " + year_x);

    if(sex_x == "Male"){
    rawGBD_chosen = rawGBD_male}
    else{
    rawGBD_chosen = rawGBD_female
        }
    console.log(sex_x);
    console.log(rawGBD_chosen);
      })

},200);

// https://www.d3-graph-gallery.com/graph/parallel_basic.html

// https://github.com/benfred/venn.js
