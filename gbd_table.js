// var data = [
//   { "date" : "2013-01-01", "close" : 45 },
//   { "date" : "2013-02-01", "close" : 50 },
// 	{ "date" : "2013-03-01", "close" : 55 },
// 	{ "date" : "2013-04-01", "close" : 50 },
// 	{ "date" : "2013-05-01", "close" : 45 },
// 	{ "date" : "2013-06-01", "close" : 50 },
// 	{ "date" : "2013-07-01", "close" : 50 },
// 	{ "date" : "2013-08-01", "close" : 55 }
// ]

var request = new XMLHttpRequest();
request.open("GET", "./Deaths_cause_area_x_sex_years.json", false);
request.send(null);

var data = JSON.parse(request.responseText); // parse the fetched json data into a variable

console.table(data[1]);

// Create a function for tabulating the data
function tabulate(data, columns) {
		var table = d3.select('#top_10_table').append('table')
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
		  .data(data)
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
		    .text(function (d) { return d.value; });

	  return table;
	}

	// render the table(s)
	tabulate(data.slice(0, 10), ['location', 'sex', 'cause', 'Deaths']); //  choose which fields to tabulate, data.slice(0,10) says give me records 1:10
