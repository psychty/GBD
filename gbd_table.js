var request = new XMLHttpRequest();
request.open("GET", "./Deaths_cause_area_x_sex_years.json", false);
request.send(null);
var data = JSON.parse(request.responseText); // parse the fetched json data into a variable

data = data.filter(function(d){
	    return d.sex == "Both" & d.year == "2017"})

data = data.sort(function(a, b) {
			return d3.descending(a.Deaths, b.Deaths)})

console.table(data)

// Create a function for tabulating the data
function tabulate(data, columns) {
		var table = d3.select('#top_10_table')
								.append('table')
									// .attr("style", "margin-left: 200px")
									// .style("border", "2px black solid"),
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
				.text(function(d,i) {
					if(i == 3) return d3.format(",.0f")(d.value); // + " items"; // Hurrah d3.format() works!
					else if (i == 4) return d3.format(",.0f")(d.value); // comma separators and round values
					else if (i == 5) return d3.format(",.0f")(d.value);
										 return d.value; });

	  return table;
	}



// Create the table
var topTable =	tabulate(data.slice(0,10), ['sex','age','cause', 'Deaths', 'Incidence', 'Prevalence']); //  choose which fields to tabulate, data.slice(0,10) says give me records 1:10

// Sort the table rows so the highest number of deaths is on top - does not work as slice(0,10) is called first before the sorting.
// topTable.selectAll("tbody tr")
// 				.sort(function(a, b) {
// 			return d3.descending(a.Deaths, b.Deaths)});

// Capitalise each header name. This is quite a tidy little piece of script. You can see it selecting the headers (`selectAll("thead th")`), then the first character in each header (`column.charAt(0)`), changing it to upper-case (`.toUpperCase()`) and adding it back to the rest of the string (`+ column.substr(1)`).
// From http://www.d3noob.org/2013/02/more-d3js-table-madness-sorting.html
topTable.selectAll("thead th")
        .text(function(column) {
                return column.charAt(0).toUpperCase() + column.substr(1);
        });
