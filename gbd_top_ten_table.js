// Create a function for tabulating the data
function tabulate_top10(top_10_data, columns) {
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
					if(i == 2) return d3.format(",.0f")(d.value); // + " items"; // Hurrah d3.format() works!
					else if (i == 4) return d3.format(",.0f")(d.value); // comma separators and round values
					else if (i == 6) return d3.format(",.0f")(d.value);
					else if (i == 8) return d3.format(",.0f")(d.value);
													 return d.value; });
	  return table;
	}

// Cause of death data
// create the ajax request to grab the source JSON data
var request = new XMLHttpRequest();
request.open("GET", "./Top_10_YLL_YLD_DALY_2017_west_sussex.json", false);
request.send(null);
var top_10_data = JSON.parse(request.responseText); // parse the fetched json data into a variable

// Take the cause of death array (data) and filter it as below
top_10_data = top_10_data.filter(function(d){
	    return d.Sex === "Both"})

var topTable =	tabulate_top10(top_10_data, ['Rank', 'Cause of death', 'Deaths','Cause of years of life lost', 'YLLs (Years of Life Lost)','Cause of years lived with disability','YLDs (Years Lived with Disability)','Cause of disability adjusted life years lost','DALYs (Disability-Adjusted Life Years)']);
