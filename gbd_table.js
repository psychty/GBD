// Create a function for tabulating the data
function tabulate(top_10_data, columns) {
		var table = d3.select('#top_10_table')
								.append('table')
		var thead = table.append('thead')
		var	tbody = table.append('tbody');

// append the header row
		thead.append('tr')
		  .selectAll('th')
		  .data(columns).enter()
		  .append('th')
		    .text(function (column) { return column; });

// create a row for each object in the data
		var rows = tbody.selectAll('tr')
		  .data(top_10_data)
		  .enter()
		  .append('tr');

// create a cell in each row for each column
		var cells = rows.selectAll('td')
		  .data(function (row) {
		    return columns.map(function (column) {
		      return {column: column, value: row[column]};
		    });
		  })
		  .enter()
		  .append('td')
				.text(function(d,i) {
					if(i == 1) return d3.format(",.0f")(d.value); // + " items"; // Hurrah d3.format() works!
					// else if (i == 2) return d3.format(",.0f")(d.value); // comma separators and round values
					// else if (i == 3) return d3.format(",.0f")(d.value);
					// else if (i == 4) return d3.format(",.0f")(d.value);
										 return d.value; });
	  return table;
	}

// Overall deaths data
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
	return "What caused the " + d3.format(",.0f")(d.Deaths) + " deaths in West Sussex in 2017" }); // Concatenate a string

// Cause of death data
request.open("GET", "./Number_proportion_cause_death_2017_west_sussex.json", false);
request.send(null);
var data = JSON.parse(request.responseText); // parse the fetched json data into a variable

// Take the cause of death array (data) and filter it as below
top_10_data = data.filter(function(d){
	    return d.Sex === "Both" &
			+d.Year === 2017 & // denotes that Year is a number
			d.metric === "Number" &
			d.Cause !== "All causes"
			& d.Level === '3'})

// Sort top_10_data
top_10_data = top_10_data.sort(function(a, b) {
			return d3.descending(a['Deaths in 2017'], b['Deaths in 2017'])})

// Create the table
var topTable =	tabulate(top_10_data.slice(0,10), ['Cause', 'Deaths in 2017', 'Cause group']); //  choose which fields to tabulate, data.slice(0,10) says give me records 1:10

// Capitalise each header name. This is quite a tidy little piece of script. You can see it selecting the headers (`selectAll("thead th")`), then the first character in each header (`column.charAt(0)`), changing it to upper-case (`.toUpperCase()`) and adding it back to the rest of the string (`+ column.substr(1)`).
// From http://www.d3noob.org/2013/02/more-d3js-table-madness-sorting.html
// topTable.selectAll("thead th")
//         .text(function(column) {
//                 return column.charAt(0).toUpperCase() + column.substr(1);
//         });

// Cause of death level 2 data with ranks
request.open("GET", "./Number_cause_level_2_2017_west_sussex.json", false);
request.send(null);
var level_2_data = JSON.parse(request.responseText); // parse the fetched json data into a variable

console.table(level_2_data);
