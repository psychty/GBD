// set global width and heights to use for our svgs - you can choose not to use these and specify custom values
// var width = window.innerWidth / 2;
var width = document.getElementById("content_size").offsetWidth;

var height = 500;

// margins
var margin = {
    top: 30,
    right: 30,
    bottom: 180,
    left: 60
};

var sex = ['Male', 'Female', 'Both']

// Now we can use the global width with
var width_fg_deaths = width - margin.left - margin.right;
var height_fg_deaths = 390 - margin.top - margin.bottom;

// Specify a colour palette and order
var cause_categories = ["HIV/AIDS and sexually transmitted infections", "Respiratory infections and tuberculosis", "Enteric infections", "Neglected tropical diseases and malaria", "Other infectious diseases", "Maternal and neonatal disorders", "Nutritional deficiencies", "Neoplasms", "Cardiovascular diseases", "Chronic respiratory diseases", "Digestive diseases", "Neurological disorders", "Mental disorders", "Substance use disorders", "Diabetes and kidney diseases", "Skin and subcutaneous diseases", "Sense organ diseases", "Musculoskeletal disorders", "Other non-communicable diseases", "Transport injuries", "Unintentional injuries", "Self-harm and interpersonal violence"]

var risk_categories = ["Air pollution", "Occupational risks", "Other environmental risks", "Unsafe water, sanitation, and handwashing", "Alcohol use", "Childhood maltreatment", "Dietary risks", "Drug use", "Intimate partner violence", "Low physical activity", "Child and maternal malnutrition", "Tobacco", "Unsafe sex", "High systolic blood pressure", "High body-mass index", "High fasting plasma glucose", "High LDL cholesterol", "Impaired kidney function", "Low bone mineral density"]

var color_cause_group = d3.scaleOrdinal()
    .domain(cause_categories)
    .range(["#F8DDEB", "#F2B9BF", "#EE9187", "#EA695C", "#D84D42", "#AD3730", "#7A1C1C", '#BCD6F7', '#97C4F0', '#67A8E7', '#528CDB', '#376ACB', "#1845A5", '#CFD6F6', '#ADB9ED', '#8B96DD', '#6978D0', "#4E4FB8", "#3E3294", "#B5DCD0", "#76B786", '#477A49']);

var color_risk_group = d3.scaleOrdinal()
    .domain(risk_categories)
    .range(["#ff82c2", "#ff5eb0", "#e54597", "#b23575", "#b2ecf3", "#99e6f0", "#80e0ec", "#66d9e8", "#4dd3e5", "#1ac7dd", "#00adc4", "#008798", "#00606d", "#c0b3d4", "#a08dbe", "#8166a9", "#71549e", "#4e3476", "#3a2758"]);

var color_lv_1_risk_group = d3.scaleOrdinal()
    .domain(['Environmental/occupational risks', 'Behavioral risks', 'Metabolic risks', 'Burden not attributable to GBD risk factors'])
    .range(["#ff4da8", "#01c1da", "#624194", "#DBDBDB"])

var ages = ["Early Neonatal", "Late Neonatal", "Post Neonatal", "1 to 4", "5 to 9", "10 to 14", "15 to 19", "20 to 24", "25 to 29", "30 to 34", "35 to 39", "40 to 44", "45 to 49", "50 to 54", "55 to 59", "60 to 64", "65 to 69", "70 to 74", "75 to 79", "80 to 84", "85 to 89", "90 to 94", "95 plus"]

var measure_categories = ['Deaths', 'YLLs (Years of Life Lost)', 'YLDs (Years Lived with Disability)', 'DALYs (Disability-Adjusted Life Years)']

var label_key = d3.scaleOrdinal()
    .domain(measure_categories)
    .range(['deaths', 'YLLs', 'YLDs', ' DALYs'])

var color_age_group = d3.scaleOrdinal()
    .domain(ages)
    .range(["#ff82a1", "#d0005a", "#903331", "#ffa479", "#ae7300", "#eba100", "#e9c254", "#b99700", "#6dba1c", "#3b5b2c", "#a2d39b", "#00bb53", "#008f69", "#5adbb5", "#00b1b8", "#02b8fe", "#0184e1", "#7d7bff", "#daa3ff", "#713d85", "#c85ae0", "#e0afdd", "#7c3e5f"]);

var color_lv_1_cause_group = d3.scaleOrdinal()
    .domain(['Communicable, maternal, neonatal, and nutritional diseases', 'Non-communicable diseases', 'Injuries'])
    .range(["#C45158", "#75B0C2", "#A8D2A3"]);

// Set up the svg and link to the div with the same identifier on the html page
var svg_fg_deaths = d3.select("#top_10_bars_by_sex_dataviz")
  .append("svg")
  .attr("width", width)
  .attr("height", height - 100)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Bring data in
var request = new XMLHttpRequest();
request.open("GET", "./Number_cause_level_2_2017_west_sussex.json", false);
request.send(null);
var json = JSON.parse(request.responseText); // parse the fetched json data into a variable

// We want to coerce some fields to be integers
json.forEach(function (elem) {
    elem.Year = parseInt(elem.Year);
    elem.Deaths_number = parseInt(elem.Deaths_number); // Cause_id does not need to be an integer but it shows that it is working in console.log
});

deaths_persons_lv2 = json.filter(function (d) { // gets a subset of the json data
    return d.Sex === "Both" &
        +d.Year === 2017
})
    .sort(function (a, b) { // sorts it according to the number of deaths (descending order)
        return d3.descending(a.Deaths_number, b.Deaths_number);
    })
    .slice(0, 10); // just keeps the first 10 rows

deaths_females_lv2 = json.filter(function (d) {
    return d.Sex === "Female" &
        +d.Year === 2017
})
    .sort(function (a, b) {
        return d3.descending(a.Deaths_number, b.Deaths_number);
    })
    .slice(0, 10);

deaths_males_lv2 = json.filter(function (d) {
    return d.Sex === "Male" &
        +d.Year === 2017
})
    .sort(function (a, b) {
        return d3.descending(a.Deaths_number, b.Deaths_number);
    })
    .slice(0, 10);

var x_fg_deaths = d3.scaleBand()
    .range([0, width_fg_deaths])
    .padding(0.2);

var xAxis_fg_deaths = svg_fg_deaths
    .append("g")
    .attr("transform", "translate(0," + height_fg_deaths + ")")

// set the Y axis
var y_fg_deaths = d3.scaleLinear() // our y axis is continuous (linear)
    .range([height_fg_deaths, 0]);

var yAxis_fg_deaths = svg_fg_deaths
    .append("g")
    .attr("class", "myYaxis")

var tooltip_fg_deaths = d3.select("#top_10_bars_by_sex_dataviz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip_bars")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")

// The tooltip function
var showTooltip_fg_deaths = function (d) {

    tooltip_fg_deaths
        .transition()
        .duration(200)

    tooltip_fg_deaths
        .html("<h3>" + d.Cause + '</h3><p class = "tooltip_b">The estimated number of deaths as a result of ' + d.Cause + ' in West Sussex in 2017 among ' + d.Sex.toLowerCase().replace('both', 'both males and female') + 's was <font color = "#1e4b7a"><b>' + d3.format(",.0f")(d.Deaths_number) + '</b></font>.</p><p class = "tooltip_b">This is the ' + d.Death_rank + ' cause of death, accounting for ' + d3.format('.0%')(d.Deaths_proportion) + ' of the total number of deaths in 2017 for this population.</p>') // The nested .replace within .toLowerCase() replaces the string 'both' (not 'Both') with 'both males and female' and then we add the s and a line break.
        .style("opacity", 1)
        .style("top", (event.pageY - 10) + "px")
        .style("left", (event.pageX + 10) + "px")
}

// To get the tooltips working on the first load, we need to create it outside of the button click function.
data = deaths_persons_lv2;

// Y axis label:
svg_fg_deaths
    .append("text")
    .attr('id', 'axis_y_title')
    .attr("text-anchor", "end")
    .style('font-size', '12px')
    .style('font-weight', 'bold')
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 10)
    .attr("x", -margin.top - 60)
    .text('Deaths');

x_fg_deaths
.domain(data.map(function (d) {
  return d.Cause; })) // update the xaxis based on 'data' - so if you run update on data1, this will look at data1, get any new/unique groups and add them to the list of groups.§

xAxis_fg_deaths
.transition()
.duration(1000)
.call(d3.axisBottom(x_fg_deaths))

// Rotate the xAxis labels
xAxis_fg_deaths
.selectAll("text")
.attr("transform", "translate(-10,10)rotate(-45)")
.style("text-anchor", "end")

y_fg_deaths
.domain([0, d3.max(data, function (d) {
return Math.ceil(d.Deaths_number / 500) * 500 // This gets the maximum deaths number rounded up to nearest 500 (ceiling)
  })]); // update the yaxis based on 'data'

// This adds a transition effect on the change between datasets (i.e. if the yaxis needs to be longer or shorter).
yAxis_fg_deaths
.transition()
.duration(1000)
.call(d3.axisLeft(y_fg_deaths));

// Create the bars_df variable
var bars_fg_deaths = svg_fg_deaths.selectAll("rect")
.data(data)

bars_fg_deaths
.enter()
.append("rect") // Add a new rect for each new element
.merge(bars_fg_deaths) // get the already existing elements as well
.transition() // and apply changes to all of them
.duration(1000)
.attr("x", function (d) {
  return x_fg_deaths(d.Cause);
  })
.attr("y", function (d) {
  return y_fg_deaths(d.Deaths_number);
  })
.attr("width", x_fg_deaths.bandwidth())
.attr("height", function (d) {
  return height_fg_deaths - y_fg_deaths(d.Deaths_number);
  })
.style("fill", function (d) {
  return color_cause_group(d.Cause)
  });

// You could add these .on events to the selection above, but because we have a .transition() function, it turns the selection into a transition and it is not possible to add a tooltip to a transition and so we need to use the .notation to add tooltip functions separately.
bars_fg_deaths
.on("mouseover", function () {
  return tooltip_fg_deaths.style("visibility", "visible");
   })
.on("mousemove", showTooltip_fg_deaths)
.on("mouseout", function () {
  return tooltip_fg_deaths.style("visibility", "hidden");
  });

// Finally, if any original bars need to go now these are removed.
bars_fg_deaths
.exit()
.remove()

// A function to create / update the plot for a given variable. This will be run whenever a button is clicked above this figure on the html page.
function update_fg_deaths(e) {

e = e || window.event;
var src = e.target;
var items = document.querySelectorAll('.switch-field-fg-1 button');

    for(var i = 0; i < items.length; i++) {
    items[i].classList.remove('active');
    }

src.classList.toggle('active');
var filter = src.dataset.filter;
var data = this[filter];

x_fg_deaths
  .domain(data.map(function (d) {
  return d.Cause;
  })) // update the xaxis based on 'data' - so if you run update on data1, this will look at data1, get any new/unique groups and add them to the list of groups.§

xAxis_fg_deaths
  .transition()
  .duration(1000)
  .call(d3.axisBottom(x_fg_deaths))

// Rotate the xAxis labels
xAxis_fg_deaths
  .selectAll("text")
  .attr("transform", "translate(-10,10)rotate(-45)")
  .style("text-anchor", "end")

y_fg_deaths
.domain([0, d3.max(data, function (d) {
return Math.ceil(d.Deaths_number / 500) * 500 // This gets the maximum deaths number rounded up to nearest 500 (ceiling)
})]); // update the yaxis based on 'data'

// This adds a transition effect on the change between datasets (i.e. if the yaxis needs to be longer or shorter).
yAxis_fg_deaths
.transition()
.duration(1000)
.call(d3.axisLeft(y_fg_deaths));

// Create the bars_df variable
var bars_fg_deaths = svg_fg_deaths.selectAll("rect")
.data(data)

bars_fg_deaths
.enter()
.append("rect") // Add a new rect for each new element
.merge(bars_fg_deaths) // get the already existing elements as well
.transition() // and apply changes to all of them
.duration(1000)
.attr("x", function (d) {
    return x_fg_deaths(d.Cause);
    })
.attr("y", function (d) {
    return y_fg_deaths(d.Deaths_number);
    })
.attr("width", x_fg_deaths.bandwidth())
.attr("height", function (d) {
    return height_fg_deaths - y_fg_deaths(d.Deaths_number);
    })
.style("fill", function (d) {
    return color_cause_group(d.Cause)
    });

// You could add these .on events to the selection above, but because we have a .transition() function, it turns the selection into a transition and it is not possible to add a tooltip to a transition and so we need to use the .notation to add tooltip functions separately.
bars_fg_deaths
.on("mouseover", function () {
  return tooltip_fg_deaths.style("visibility", "visible");
   })
.on("mousemove", showTooltip_fg_deaths)
.on("mouseout", function () {
  return tooltip_fg_deaths.style("visibility", "hidden");
  });

// Finally, if any original bars need to go now these are removed.
bars_fg_deaths
.exit()
.remove()
}

var button = document.querySelector('.switch-field-fg-1 button');
button.click();

///////////////////
// Cause summary //
///////////////////

// Bring data in
var request = new XMLHttpRequest();
request.open("GET", "./level_1_2017_west_sussex_summary.json", false);
request.send(null);

var lv_1_summary = JSON.parse(request.responseText);

function cause_group_1_summary() {
    lv_1_summary.forEach(function (item, index) {
        var list = document.createElement("li");
        list.innerHTML = item.Cause;
        list.className = 'cause_list';
        list.style.borderColor = color_lv_1_cause_group(index);
        var tt = document.createElement('div');
        tt.className = 'side_tt';
        tt.style.borderColor = color_lv_1_cause_group(index);
        var tt_h3_1 = document.createElement('h3');
        tt_h3_1.innerHTML = item.Cause;
        var tt_p1 = document.createElement('p');
        tt_p1.innerHTML = item.deaths_label;
        tt_p1.className = 'side';
        var tt_p2 = document.createElement('p');
        tt_p2.innerHTML = item.yll_label;
        tt_p2.className = 'side';
        var tt_p3 = document.createElement('p');
        tt_p3.innerHTML = item.yld_label;
        tt_p3.className = 'side';
        var tt_p4 = document.createElement('p');
        tt_p4.innerHTML = item.daly_label;
        tt_p4.className = 'side';

        tt.appendChild(tt_h3_1);
        tt.appendChild(tt_p1);
        tt.appendChild(tt_p2);
        tt.appendChild(tt_p3);
        tt.appendChild(tt_p4);
        list.appendChild(tt);
        var div = document.getElementById("level_1_cause_summary");
        div.appendChild(list);
    })
}

cause_group_1_summary();

var request = new XMLHttpRequest();
request.open("GET", "./level_2_2017_west_sussex_summary.json", false);
request.send(null);

var lv_2_summary = JSON.parse(request.responseText);

function cause_group_2_summary() {
    lv_2_summary.forEach(function (item, index) {
        var list = document.createElement("li");
        list.innerHTML = item.Cause;
        list.className = 'cause_list';
        list.style.borderColor = color_cause_group(index);

        var tt_lv2 = document.createElement('div');
        tt_lv2.className = 'side_tt';
        tt_lv2.style.borderColor = color_cause_group(index);
        var tt_lv2_h3_1 = document.createElement('h3');
        tt_lv2_h3_1.innerHTML = item.Cause;

        var tt_lv2_p1 = document.createElement('p');
        tt_lv2_p1.innerHTML = item.Description;
        tt_lv2_p1.className = 'side';
        var tt_lv2_p2 = document.createElement('p');
        tt_lv2_p2.innerHTML = item.deaths_label;
        tt_lv2_p2.className = 'side';
        var tt_lv2_p3 = document.createElement('p');
        tt_lv2_p3.innerHTML = item.yll_label;
        tt_lv2_p3.className = 'side';
        var tt_lv2_p4 = document.createElement('p');
        tt_lv2_p4.innerHTML = item.yld_label;
        tt_lv2_p4.className = 'side';
        var tt_lv2_p5 = document.createElement('p');
        tt_lv2_p5.innerHTML = item.daly_label;
        tt_lv2_p5.className = 'side';

        tt_lv2.appendChild(tt_lv2_h3_1);
        tt_lv2.appendChild(tt_lv2_p1);
        tt_lv2.appendChild(tt_lv2_p2);
        tt_lv2.appendChild(tt_lv2_p3);
        tt_lv2.appendChild(tt_lv2_p4);
        tt_lv2.appendChild(tt_lv2_p5);
        list.appendChild(tt_lv2);
        var div = document.getElementById("level_2_cause_summary");
        div.appendChild(list);
    })
}

cause_group_2_summary();

///////////////////
// Top ten table //
///////////////////

var request = new XMLHttpRequest();
request.open("GET", "./Top_10_YLL_YLD_DALY_2017_west_sussex.json", false);
request.send(null);
var json = JSON.parse(request.responseText); // parse the fetched json data into a variable

// Take the cause of death array (data) and filter it as below
top_10_data_persons = json.filter(function (d) {
    return d.Sex === "Both"
})

// Create a function for tabulating the data
function tabulate_top10(data, columns) {
    var table = d3.select('#top_10_table')
        .append('table')
    var thead = table
        .append('thead')
    var tbody = table
        .append('tbody');

// append the header row
thead
.append('tr')
.selectAll('th')
.data(columns).enter()
.append('th')
.text(function (column) {
      return column;
      });

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
        .text(function (d) {
            return d.value
        })
    return table;
}

var topTable = tabulate_top10(top_10_data_persons, ['Deaths', 'YLLs (Years of Life Lost)', 'YLDs (Years Lived with Disability)', 'DALYs (Disability-Adjusted Life Years)']);

////////////////////////////////////
// Dynamic string of total deaths //
////////////////////////////////////

var request = new XMLHttpRequest();
request.open("GET", "./Total_deaths_yll_2017_west_sussex.json", false);
request.send(null);
var total_data = JSON.parse(request.responseText); // parse the fetched json data into a variable

// Select the div id total_death_string (this is where you want the result of this to be displayed in the html page)
d3.select("#total_death_string")
    .data(total_data) // The array
    .filter(function (d) {
        return d.Sex == "Both"
    }) // We can filter just persons
    .text(function (d) {
        return "What caused the " + d3.format(",.0f")(d.Deaths) + " deaths in West Sussex in 2017?"
    }); // Concatenate a string
