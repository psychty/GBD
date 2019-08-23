// create the ajax request to grab the source JSON data
var request = new XMLHttpRequest();
request.open("GET", "./Number_proportion_cause_death_2017_west_sussex.json", false);
request.send(null);

var json = JSON.parse(request.responseText); // parse the fetched json data into a variable

// We want to coerce some fields to be integers
json.forEach(function(elem){
		elem.Year = parseInt(elem.Year);
    elem.Cause_id = parseInt(elem.Cause_id); // Cause_id does not need to be an integer but it shows that it is working in console.log
			});

json = json.filter(function(d){
	    return d.metric === "Number" &
	      +d.Year === 2017})

var data = []; // 'data' is used as the main store of data that we'll render into D3
var filter_button_options = []; // this is used to build up the sidebar

// These will be our immediate filters on the data variable
var filters = [
    {
        key: 'Sex',
        value: 'Both'
    },
    {
        key: 'Cause group',
        value: 'HIV/AIDS and sexually transmitted infections'
    }
];

// This will prepare 'data' and filter accordingly - it is activated on pageload as well as when a filter item is changed.
function prepare_data() {
     data = filter_data(json, filters);
// console.table(data);

 // Create the table
 selectedTable = tabulate(data, ['Cause', 'Deaths in 2017','Rank in 2017','Deaths in 2007','Change since 2007', 'Rank in 2007']);
 // choose which fields to tabulate, data.slice(0,10) says give me records 1:10

 }

function filter_data(data, filters) {
  let filtered_data = []; // empty container used to return back the filtered results

    filters.forEach((item) => {
        filtered_data = data.filter((i) => {
            return i[item.key] === item.value;
        })
        data = filtered_data;
    });

    return filtered_data;

}

/**
 * This method allows you to hook up to buttons / interface elements to
 * further filter the dataset using the above filter methods.
 *
 * @param key
 * @param value
 */
function toggleFilter(key, value) {

  filters.forEach((item) => {
        if (item.key === key) {
            item.value = value;
        }
    })

    prepare_data();
}

// Create a function for tabulating the data
function tabulate(data, columns) {
		var table = d3.select('#selectedTable')
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
					if(i == 1) return d3.format(",.0f")(d.value); // + " items";
					else if (i == 2) return d3.format(",.0f")(d.value); // comma separators and round values
					else if (i == 3) return d3.format(",.0f")(d.value);
					else if (i == 4) return d3.format(",.0f")(d.value);
										 return d.value; });
	  return table;
	}

/**
 * This method is used by the sidebar builder function to control what filters are available to the user
 */
function prepare_filter_buttons() {

    let options = [
        {
            name: 'Sex',
            key: 'Sex',
            options: [
                'Both', 'Male', 'Female'
            ]
        },
        {
            name: 'Cause group',
            key: 'Cause group',
            options: [
                'HIV/AIDS and sexually transmitted infections', 'Respiratory infections and tuberculosis', 'Enteric infections','Neglected tropical diseases and malaria',  'Other infectious diseases', 'Maternal and neonatal disorders', 'Nutritional deficiencies','Neoplasms', 'Sense organ diseases', 'Musculoskeletal disorders', 'Other non-communicable diseases','Cardiovascular diseases','Chronic respiratory diseases', 'Digestive diseases','Neurological disorders','Mental disorders', 'Substance use disorders','Diabetes and kidney diseases','Skin and subcutaneous diseases', 'Transport injuries', 'Unintentional injuries', 'Self-harm and interpersonal violence'
            ]
        }
                  ]
    filter_button_options = options;

}

/* This method is magical 🧙‍♂️ It takes the array of optional filters from above and loops through them to create dynamically generated select boxes with event listeners attached which then power the filters used on the page */
function build_filter_sidebar() {

    filter_button_options.forEach((item) => {
        let div = document.createElement('div');
        let heading = document.createElement('h2');
        let text = document.createTextNode(item.name);
        heading.appendChild(text);
        div.appendChild(heading);

        var select = document.createElement('select');
        select.setAttribute('name', item.key);
        select.classList.add('filter_button');

        item.options.forEach((option) => {
            let opt = document.createElement('option');
            opt.setAttribute('value', option);
            let text = document.createTextNode(option);
            opt.appendChild(text);
            select.appendChild(opt);
        })
        div.appendChild(select);
        document.getElementById('sidebar').appendChild(div);
    })

// This block below will add a generic input listener to the entire page, because all the select boxes are dynamically created, and browsers are a bit lazy and only take note of the elements on the page when the page is originally loaded. Anything you add after the original pageload needs this sort of lazy event listening to work.
    document.body.addEventListener('input', function (event) {
        // the toggleFilter method is run ONLY if the target item that was changed and has the class 'filter_button'.
        if (event.srcElement.className === 'filter_button') {
            toggleFilter(event.srcElement.name, event.target.value);
            console.table(filters);
            console.table(data)
        }
        ;
    });
}

// run all the setup methods to start processing and filtering data on page load
(() => {
    prepare_data();
    prepare_filter_buttons();
    build_filter_sidebar();
		// console.table(data);
})();
