// set global width and heights to use for our svgs - you can choose not to use these and specify custom values
// var width = window.innerWidth / 2;
var width = document.getElementById("content_size").offsetWidth;

// margins
var margin = {
    top: 30,
    right: 30,
    bottom: 150,
    left: 60
};

///////////////////////////
// Line chart timeseries //
///////////////////////////

var height_fg_standardised_ts = 350;

// append the svg object to the body of the page
var svg_standardised_ts = d3.select("#deaths_over_time_nn_rate_datavis")
    .append("svg")
    .attr("width", width)
    .attr("height", height_fg_standardised_ts + margin.top + 100)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Bring data in for figure 6
var request = new XMLHttpRequest();
request.open("GET", "./Rate_totals_1990_2017_all_areas.json", false);
request.send(null);
var json_ts = JSON.parse(request.responseText); // parse the fetched json data into a variable

// gets a subset of the json data which contains South East England and England data - we will plot these values so that they are always on the line graph
ts_deaths_se_eng = json_ts.filter(function (d) {
    return d.measure === 'Deaths' & d.Area === 'South East England' ||
        d.measure === 'Deaths' & d.Area === 'England'
})
    .sort(function (a, b) {
        return d3.ascending(a.Year, b.Year);
    });

ts_deaths_all_cause = json_ts.filter(function (d) { // gets a subset of the json data - This time it excludes SE and England values
    return d.measure === 'Deaths' &
        d.Area != 'South East England' &
        d.Area != 'England'
})
    .sort(function (a, b) {
        return d3.ascending(a.Year, b.Year);
    });

// List of areas in the data set (which we sort by our neighbour rank order first)
var areas = d3.map(ts_deaths_all_cause.sort(function (a, b) {
    return d3.ascending(a.Neighbour_rank, b.Neighbour_rank)
}), function (d) {
    return (d.Area)
})
    .keys()

// List of areas in the data set (which we sort by our neighbour rank order first)
var reference_areas = d3.map(ts_deaths_se_eng.sort(function (a, b) {
    return d3.ascending(a.Neighbour_rank, b.Neighbour_rank)
}), function (d) {
    return (d.Area)
})
    .keys()

// List of years in the dataset
var years_fg_standardised_ts = d3.map(ts_deaths_all_cause, function (d) {
    return (d.Year)
})
    .keys()

// We need to create a dropdown button for the user to choose which area to be displayed on the figure.
d3.select("#selectAreaButton")
    .selectAll('myOptions')
    .data(areas)
    .enter()
    .append('option')
    .text(function (d) {
        return d;
    }) // text to appear in the menu - this does not have to be as it is in the data (you can concatenate other values).
    .attr("value", function (d) {
        return d;
    }) // corresponding value returned by the button

// We need to create a dropdown button for the user to choose which area to be displayed on the figure.
d3.select("#selectReferenceAreaButton")
    .selectAll('myOptions')
    .data(reference_areas)
    .enter()
    .append('option')
    .text(function (d) {
        return d;
    }) // text to appear in the menu - this does not have to be as it is in the data (you can concatenate other values).
    .attr("value", function (d) {
        return d;
    }) // corresponding value returned by the button

// A color scale, this is useful because it will respond to the number of elements in the array rather than needing to be hardcoded (although we will mostly know how many elements will be involved and may want to specify particular colours.)
var colour_areas = d3.scaleOrdinal()
    .domain(areas)
    .range(d3.schemePaired);

// Add X axis
var x = d3.scaleLinear()
    .domain(d3.extent(ts_deaths_all_cause, function (d) {
        return d.Year;
    }))
    .range([0, width - margin.left - 50]);

svg_standardised_ts
    .append("g")
    .attr("transform", "translate(0," + height_fg_standardised_ts + ")")
    .call(d3.axisBottom(x).ticks(years_fg_standardised_ts.length, '0f')); // the .length gives one tick for every item (every year in the dataset) and the '0f' removes the comma separator from the year

// Rotate the xAxis labels
svg_standardised_ts
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end")

// Add Y axis
var y = d3.scaleLinear()
    .domain([0, d3.max(ts_deaths_all_cause, function (d) {
        return +d.Estimate;
    })]) // Add the ceiling
    .range([height_fg_standardised_ts, 0]);

svg_standardised_ts
    .append("g")
    .call(d3.axisLeft(y));

// Add X axis label:
svg_standardised_ts
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", width / 2)
    .attr("y", height_fg_standardised_ts + margin.top + 10)
    .text("Year");

svg_standardised_ts
    .append("text")
    .attr("x", (width / 100) * 70)
    .attr("y", height_fg_standardised_ts / 100 * 20)
    .attr("text-anchor", "start")
    .style('font-size', '10px')
    .text("The black line indicates");

svg_standardised_ts
    .append("text")
    .attr("x", (width / 100) * 70)
    .attr("y", (height_fg_standardised_ts / 100) * 25)
    .attr("text-anchor", "start")
    .style('font-size', '10px')
    .text("the comparator");

// Y axis label:
svg_standardised_ts
    .append("text")
    .attr('id', 'axis_y_title')
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 20)
    .attr("x", -margin.top - 60)
    .text('Deaths per 100,000');

var selectedOption = d3.select('#selectAreaButton').property("value")
var selectedRefOption = d3.select("#selectReferenceAreaButton").property('value')

var line_CI = svg_standardised_ts
    .append("path")
    .datum(ts_deaths_all_cause.filter(function (d) {
        return d.Area === selectedOption
    })) // Initialize line with first value from 'allGroup'
    .attr("fill", function (d) {
        return colour_areas("valueA")
    })
    .attr("stroke", "#000000")
    .attr("d", d3.area()
        .x(function (d) {
            return x(d.Year)
        })
        .y0(function (d) {
            return y(d.Lower_estimate)
        })
        .y1(function (d) {
            return y(d.Upper_estimate)
        })
    )

var line = svg_standardised_ts
    .append('g')
    .append("path")
    .datum(ts_deaths_all_cause.filter(function (d) {
        return d.Area === selectedOption
    })) // Initialize line with first value from 'allGroup'
    .attr("d", d3.line()
        .x(function (d) {
            return x(d.Year)
        })
        .y(function (d) {
            return y(+d.Estimate)
        }))
    .attr("stroke", function (d) {
        return colour_areas("valueA")
    })
    .style("stroke-width", 2)
    .style("fill", "none")

var line_CI_ref = svg_standardised_ts
    .append("path")
    .datum(ts_deaths_se_eng.filter(function (d) {
        return d.Area === selectedRefOption
    })) // Initialize line with first value from 'allGroup'
    .attr("fill", '#dbdbdb')
    .attr("stroke", "none")
    .attr("d", d3.area()
        .x(function (d) {
            return x(d.Year)
        })
        .y0(function (d) {
            return y(d.Lower_estimate)
        })
        .y1(function (d) {
            return y(d.Upper_estimate)
        })
    )

var line_ref = svg_standardised_ts
    .append('g')
    .append("path")
    .datum(ts_deaths_se_eng.filter(function (d) {
        return d.Area === selectedRefOption
    }))
    .attr("d", d3.line()
        .x(function (d) {
            return x(d.Year)
        })
        .y(function (d) {
            return y(+d.Estimate)
        }))
    .attr("stroke", '#000000')
    .style("stroke-width", 2)
    .style("fill", "none")

// Add a circle following the pointer
var focus_fg_standardised_ts = svg_standardised_ts
.append("g")
.style("display", "none");

// This function grabs the Year closest to the left hand side of the mouse pointer
var bisectYear = d3.bisector(function (d) {
    return d.Year;
}).left;

// append the circle at the intersection
focus_fg_standardised_ts
.append("circle")
.attr("class", "y")
.style("fill", "lightblue")
.style("stroke", "blue")
.attr("r", 4);

// append the x line
focus_fg_standardised_ts
.append("line")
.attr("class", "x")
.style("stroke", "blue")
.style("stroke-dasharray", "3,3")
.style("opacity", 0.5)
.attr("y1", 0)
.attr("y2", height_fg_standardised_ts);

// place the value at the intersection
focus_fg_standardised_ts
.append("text")
.attr("class", "y1")
.style("opacity", 1)
.attr("dx", 8)
.attr("dy", "-.3em");

focus_fg_standardised_ts
.append("text")
.attr("class", "y_area2")
.style("opacity", 1)
.attr("dx", 8)
.attr("dy", "-.3em");

focus_fg_standardised_ts
.append("text")
.attr("class", "y_area")
.style("opacity", 1)
.attr("dx", 8)
.attr("dy", "-.3em");

// This is a function to update the chart with new data (it filters the larger dataset)
function update_fg_standardised_ts(selectedGroup) {

var ts_dataFilter = ts_deaths_all_cause.filter(function (d) {
  return d.Area === selectedGroup
  })

var selectedRefOption = d3.select("#selectReferenceAreaButton").property('value')
var ref_data = ts_deaths_se_eng.filter(function (d) {
    return d.Area === selectedRefOption
    })

// We can add a circle to follow the mousepointer when someone hovers over the figure.
svg_standardised_ts
.append("rect")
.attr("width", width)
.attr("height", height_fg_standardised_ts)
.style("fill", "none")
.style("pointer-events", "all")
.on("mouseover", function () {
    focus_fg_standardised_ts.style("display", null);
    })
.on("mouseout", function () {
    focus_fg_standardised_ts.style("display", "none");
    })
.on("mousemove", mousemove);

function mousemove() {
var x0 = x.invert(d3.mouse(this)[0])
var  i = bisectYear(ts_dataFilter, x0, 1)
var d0 = ts_dataFilter[i - 1]
var d1 = ts_dataFilter[i]
var  d = x0 - d0.Year > d1.Year - x0 ? d1 : d0;

focus_fg_standardised_ts
.select("circle.y")
.attr("transform", "translate(" + x(d.Year) + "," + y(d.Estimate) + ")")

focus_fg_standardised_ts
.select(".x")
.attr("transform", "translate(" + x(d.Year) + "," + y(d.Estimate) + ")")
.attr("y2", height_fg_standardised_ts - y(d.Estimate))

focus_fg_standardised_ts
.select("text.y1")
.attr("transform", "translate(" + x(d.Year) + "," + y(d.Estimate - 100) + ")")
.style('font-size', '11px')
.text('Deaths: ' + d3.format('.0f')(d.Estimate) + ' per 100,000');

focus_fg_standardised_ts
.select("text.y_area")
.attr("transform", "translate(" + x(d.Year) + "," +  y(d.Estimate - 65) + ")")
.style('font-size', '11px')
.text(d.Area);
  }

line_CI
.datum(ts_dataFilter)
.transition()
.duration(1000)
.attr("fill", function (d) {
      return colour_areas(selectedGroup)
      })
.attr("stroke", "none")
.attr('opacity', 0.5)
.attr("d", d3.area()
.x(function (d) {
  return x(d.Year)
  })
.y0(function (d) {
  return y(d.Lower_estimate)
  })
.y1(function (d) {
  return y(d.Upper_estimate)
  })
  )

line
.datum(ts_dataFilter)
.transition()
.duration(1000)
.attr("d", d3.line()
.x(function (d) {
  return x(d.Year)
  })
.y(function (d) {
  return y(+d.Estimate)
  }))
.attr("stroke", function (d) {
  return colour_areas(selectedGroup)
  })

line_CI_ref
.datum(ref_data)
.transition()
.duration(1000)// Initialize line with first value from 'allGroup'
.attr("fill", '#dbdbdb')
.attr("stroke", "none")
.attr("d", d3.area()
    .x(function (d) {
    return x(d.Year)
    })
    .y0(function (d) {
    return y(d.Lower_estimate)
    })
.y1(function (d) {
    return y(d.Upper_estimate)
    }))

line_ref
.datum(ref_data)
.transition()
.duration(1000)
.attr("d", d3.line()
    .x(function (d) {
    return x(d.Year)
    })
    .y(function (d) {
    return y(+d.Estimate)
    }))
.attr("stroke", '#000000')
}

// This says run the update_fg_standardised_ts function when there is a change on the 'selectAreaButton' div based on whatever the new value selected is.
d3.select("#selectAreaButton").on("change", function (d) {
  var selectedOption = d3.select('#selectAreaButton').property("value")
  var selectedRefOption = d3.select("#selectReferenceAreaButton").property('value')
    update_fg_standardised_ts(selectedOption)
})

// This says run the same update_fg_standardised_ts function when there is a change on the 'selectReferenceAreaButton' div based on whatever the new value selected is.
d3.select("#selectReferenceAreaButton").on("change", function (d) {
    var selectedOption = d3.select('#selectAreaButton').property("value")
    var selectedRefOption = d3.select("#selectReferenceAreaButton").property('value')
    update_fg_standardised_ts(selectedOption)
})

update_fg_standardised_ts(areas[0])

/////////////////
// Rate change //
/////////////////

height_rate_change = 500

var request = new XMLHttpRequest();
request.open("GET", "./Rate_change_over_time_level_2_west_sussex.json", false);
request.send(null);
var json = JSON.parse(request.responseText); // parse the fetched json data into a variable

// json = json.sort(function(a, b) {
//   return d3.descending(a.Change_since_2012, b.Change_since_2012);
//   })

deaths_level_2_rank_change = json.filter(function (d) { // gets a subset of the json data
    return d.Area === 'West Sussex' &
        d.Sex === 'Both' &
        d.measure === 'Deaths'
});

yll_level_2_rank_change = json.filter(function (d) { // gets a subset of the json data
    return d.Area === 'West Sussex' &
        d.Sex === 'Both' &
        d.measure === 'YLLs (Years of Life Lost)'
});

yld_level_2_rank_change = json.filter(function (d) { // gets a subset of the json data
    return d.Area === 'West Sussex' &
        d.Sex === 'Both' &
        d.measure === 'YLDs (Years Lived with Disability)'
});

daly_level_2_rank_change = json.filter(function (d) { // gets a subset of the json data
    return d.Area === 'West Sussex' &
        d.Sex === 'Both' &
        d.measure === 'DALYs (Disability-Adjusted Life Years)'
});


var tooltip_rate_change = d3.select("#my_level_2_rate_change_dataviz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip_rate_change")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")

// The tooltip function
var showTooltip_rate_change = function(d) {
tooltip_rate_change
.transition()
.duration(200)

tooltip_rate_change
.style("visibility", "visible")
.html("<h3>"  + d.Cause + '</h3>' + '<p>The rate of ' + label_key(d.Measure) + ' (per 100,000 population) ' + d.Cause + ' have changed by ' + d.Change_since_2012 + '% since 2012.</p>')
.style("top", (event.pageY - 10) + "px")
.style("left", (event.pageX + 10) + "px")
.style('opacity', 1)

}

var mouseout_rc = function(d) {
tooltip_rate_change
.style("visibility", "hidden")
}

var rate_change_svg = d3.select("#my_level_2_rate_change_dataviz")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height_rate_change + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x_rate_change = d3.scaleLinear()
.domain([-40, 50])
.range([0, width]);

var y_rate_change = d3.scaleBand()
.domain(cause_categories)
.rangeRound([0, height_rate_change])
.padding(0.15);

function update_level_2_rate_change(data) {
rate_change_svg
.selectAll("*")
.remove();

// Create the bars
var rate_change_bars = rate_change_svg
.selectAll("rect")
.data(data)
.enter()
.append("rect")
.attr("x", function (d) {
    if (d.Change_since_2012 < 0) {
    return x_rate_change(d.Change_since_2012)
    } else {
    return x_rate_change(0)
    };
})
.attr("width", function (d) {
  if (d.Change_since_2012 < 0) {
  return x_rate_change(d.Change_since_2012 * -1) - x_rate_change(0)
  } else {
  return x_rate_change(d.Change_since_2012) - x_rate_change(0)
}; })
.attr("y", function (d) {
  return y_rate_change(d.Cause);
  })
.attr("height", y_rate_change.bandwidth())
// .attr("fill", function (d) {
//   if (d.Change_since_2012 > 0) {
//   return "#cc0000" }
//   else {
//   return "#00cccc" }; })
.style("fill", function(d) {
         return color_cause_group(d.Cause)})
.on("mousemove", showTooltip_rate_change)
.on("mouseout", mouseout_rc);

rate_change_svg
.selectAll(".value") // This selects the 'value' key from the data array
.data(data)
.enter()
.append("text")
.attr("class", "value")
.attr("x", function (d) {
if (d.Change_since_2012 < 0) {
  return (x_rate_change(d.Change_since_2012 * -1) - x_rate_change(0)) > 20 ? x_rate_change(d.Change_since_2012)  : x_rate_change(d.Change_since_2012) - 1;
  } else {
  return (x_rate_change(d.Change_since_2012) - x_rate_change(0)) > 20 ? x_rate_change(d.Change_since_2012)  : x_rate_change(d.Change_since_2012) + 1;
  }
  })
.attr("y", function (d) {
  return y_rate_change(d.Cause);
  })
.attr("dy", y_rate_change.bandwidth() - 2.55)
.attr("text-anchor", function (d) {
if (d.Change_since_2012 < 0) {
    return (x_rate_change(d.Change_since_2012 * -1) - x_rate_change(0)) > 90 ? "start" : "end";
    } else {
    return (x_rate_change(d.Change_since_2012) - x_rate_change(0)) > 90 ? "end" : "start";
    }
})
.style("fill", function (d) {
  if (d.Change_since_2012 < 0) {
  return (x_rate_change(d.Change_since_2012 * -1) - x_rate_change(0)) > 90 ? "#fff" : "#000"; }
  else {
  return (x_rate_change(d.Change_since_2012) - x_rate_change(0)) > 90 ? "#fff" : "#000"; }
  })
.text(function (d) {
  if (d.Change_since_2012 < 0) { // add an if else function to say if > 0 then increase, if < 0 then decrease.
  return d.Change_since_2012.toFixed(1) + '% decrease';}
  else {
  return d.Change_since_2012.toFixed(1) + '% increase';
  }
  })
  .on("mousemove", showTooltip_rate_change)
  .on("mouseout", mouseout_rc);

rate_change_svg
.selectAll(".name")
.data(data)
.enter()
.append("text")
        .attr("class", "name")
        .attr("x", function (d) {
            return d.Change_since_2012 < 0 ? x_rate_change(0) + 2.55 : x_rate_change(0) - 2.55
        })
        .attr("y", function (d) {
            return y_rate_change(d.Cause);
        })
        .attr("dy", y_rate_change.bandwidth() - 2.55)
        .attr("text-anchor", function (d) {
            return d.Change_since_2012 < 0 ? "start" : "end";
        })
        .text(function (d) {
            return d.Cause;
        })
        .on("mousemove", showTooltip_rate_change)
        .on("mouseout", mouseout_rc);

    rate_change_svg
        .append("line")
        .attr("x1", x_rate_change(0))
        .attr("x2", x_rate_change(0))
        .attr("y1", 0)
        .attr("y2", height_rate_change)
        .attr("stroke", "#000")
        .attr("stroke-width", "1px");
}

update_level_2_rate_change(deaths_level_2_rank_change);
