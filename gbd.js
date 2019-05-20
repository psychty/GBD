
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


// https://amber.rbind.io/2017/05/02/nesting/
