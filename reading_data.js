
var injury = ["Transport injuries", "Unintentional injuries", "Self-harm and interpersonal violence"]
var non_communicable = ["Neoplasms", "Cardiovascular diseases","Chronic respiratory diseases", "Digestive diseases", "Neurological disorders", "Mental disorders", "Substance use disorders", "Diabetes and kidney diseases", "Skin and subcutaneous diseases",  "Sense organ diseases", "Musculoskeletal disorders", "Other non-communicable diseases"]
var communicable_neo_nutr = ["HIV/AIDS and sexually transmitted infections", "Respiratory infections and tuberculosis", "Enteric infections", "Neglected tropical diseases and malaria", "Other infectious diseases","Maternal and neonatal disorders", "Nutritional deficiencies"]

// https://www.d3-graph-gallery.com/graph/basic_datamanipulation.html

//  Read Latest_deaths_cause_x.csv, create a variable called 'HIV' which uses the data and filters only elements with the Parent_cause "HIV/AIDS and sexually transmitted infections". Finally, add the HIV array to the console
d3.csv("Latest_deaths_cause_x.csv", function(error, data) {
    if (error) throw error;

var HIV =  data.filter(function(d){
    return d.Parent_cause == "HIV/AIDS and sexually transmitted infections" })
  console.log(HIV)
  });

// Use d3.map to take the data read in by d3.csv and return unique entries of the Parent_cause column
d3.csv("Latest_deaths_cause_x.csv", function(error, data) {
      if (error) throw error;
var allGroups = d3.map(data, function(d){
  return(d.Parent_cause)}).keys()
  console.log(allGroups)
  });

//  Use a filter to return a dataframe where Parent_cause matches a list of Parent_causes
d3.csv("Latest_deaths_cause_x.csv", function(error, data) {
      if (error) throw error;
  var Group =  data.filter(function(d, i){
      return non_communicable.indexOf(d.Parent_cause) >= 0 })
    console.log(Group)
    });

//  Nest the csv file based on Parent_cause
d3.csv("Latest_deaths_cause_x.csv", function(error, data) {
  if (error) throw error;
  var nest = d3.nest()
    .key(function(d){
      return d.Parent_cause;
    })
    .entries(data)
    console.log(nest)
});

//  Nest the csv file based on Parent_cause and use rollup to return the sum of deaths for each parent cause
d3.csv("Latest_deaths_cause_x.csv", function(error, data) {
  if (error) throw error;
  var nest = d3.nest()
    .key(function(d){
      return d.Parent_cause;
    })
    .rollup(function(sum_deaths){
      return d3.sum(sum_deaths, function(d) {return (d.Deaths)});
    })
    .sortKeys(d3.ascending)
    .entries(data)
    console.log(nest)
});

//  Nest the csv file based on Parent_cause, sex and year and use rollup to return the sum of deaths for each grouping variable
d3.csv("Deaths_cause_x_sex_years.csv", function(error, data) {
  if (error) throw error;
  var nest = d3.nest()
    .key(function(d){
      return d.Parent_cause;
    })
    .key(function(d){
      return d.sex;
    })
    // .key(function(d){ // You can add additional .key functions to further nest the data
    //   return d.year;
    // })
    .rollup(function(sum_deaths){
      return d3.sum(sum_deaths, function(d) {return (d.Deaths)});
    })
    .sortKeys(d3.ascending)
    .entries(data)
    console.log(nest)


//  Add the <div id = "fruitDropdown"></div> to the index.html
// Then, in your Javascript file, you’ll need to create the dropdown. Select the id that you assigned to the div element in your HTML file and append a “select” element to it. Then you append the “options” to the select element. In this case, we wanted the dropdown to contain a list of parent causes names. Since our first level keys were the d.Parent_cause variable, assigning the “value” and “text” of our dropdowns to d.key fills them with the names of our parent causes.

var fruitMenu = d3.select("#causeDropdown")

  fruitMenu
  .append("select")
  .selectAll("option")
      .data(nest)
      .enter()
      .append("option")
      .attr("value", function(d){
          return d.key;
      })
      .text(function(d){
          return d.key;
      })
});
// https://amber.rbind.io/2017/05/02/nesting/
