

function tabulate(data, columns, id) {
    var table = d3.select(id).append("table"),
        thead = table.append("thead"),
        tbody = table.append("tbody");

// append the header row
    thead.append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
        .text(function(column) { return column; });

// create a row for each object in the data
    var rows = tbody.selectAll("tr")
        .data(data)
        .enter()
        .append("tr");

// create a cell in each row for each column At this point, the rows have data associated so the data function accesses it.
    var cells = rows.selectAll("td")
        .data(function(row) {  // this way guarantees only values for the columns provided are used.
            return columns.map(function(column) { // return a new object with a value set to the row's column value.
                return {value: row[column]};
            });
        })
        .enter()
        .append("td")
        .text(function(d) {
          return d.value; });
    return table;
}

d3.csv("Latest_deaths_cause_x.csv", function(error, myData) {
    if (error) {
        console.log("Had an error loading file.");
    }

myData =  myData.filter(function(d){
        return d.Parent_cause === "Neoplasms" })

  // We'll be using simpler data as values, not objects.
var myArray = []; // Create an empty array
  myData.forEach(function(d, i){ // Add a new array with the values of each:
        myArray.push([d.Parent_cause, d.cause, d.cause_outline, d.Deaths]);
    });

//sort data by items
myArray.sort(function (a, b) {
    return b[3]-a[3]; // a - b is ascending, b - a is descending [x] x is the column position
});
var myArray = myArray.slice(0, 5); // remember arrays start at 0

// You could also have made the new array with a map function using colors and fonts from the UNICEF Style Guide
var table = d3.select("#top_table").append("table");
var header = table.append("thead").append("tr");

header
    .selectAll("th")
    .data(["Parent cause", "Cause", "Cause code", "Number of deaths"])
    .enter()
    .append("th")
    .text(function(d) {
      return d; });

var tablebody = table.append("tbody");
    rows = tablebody
    .selectAll("tr")
    .data(myArray)
    .enter()
    .append("tr");

// We built the rows using the nested array - now each row has its own array.
cells = rows.selectAll("td")
  // each row has data associated; we get it and enter it for the cells.
    .data(function(d,i) {
      // console.log(d,i);
    return d; })
    .enter()
    .append("td")
    .text(function(d,i) {
      if(i == 3) return d3.format(",")(d); // + " items"; // Hurrah d3.format() works!
                 return d; });
});
