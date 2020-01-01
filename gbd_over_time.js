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


//////////////////////////////////
// Slope chart top ten measures //
//////////////////////////////////

height_rank_change = 450

// append the svg object to the body of the page
var rank_change_svg = d3.select("#top_10_change_datavis")
    .append("svg")
    .attr("width", width)
    .attr("height", height_rank_change + margin.top)
    .append("g");

var request = new XMLHttpRequest();
request.open("GET", "./Rate_change_over_time_levels_0_1_2_for_slope.json", false);
request.send(null);
var json = JSON.parse(request.responseText);

deaths_rate_rank_change = json.filter(function (d) {
    return d.measure === 'Deaths' &
        d.Sex === 'Both' &
        d.Area === 'West Sussex' &
        +d.Level === 2
});

yll_rate_rank_change = json.filter(function (d) {
    return d.measure === 'YLLs (Years of Life Lost)' &
        d.Sex === 'Both' &
        d.Area === 'West Sussex' &
        +d.Level === 2
});

yld_rate_rank_change = json.filter(function (d) {
    return d.measure === 'YLDs (Years Lived with Disability)' &
        d.Sex === 'Both' &
        d.Area === 'West Sussex' &
        +d.Level === 2
});

daly_rate_rank_change = json.filter(function (d) {
    return d.measure === 'DALYs (Disability-Adjusted Life Years)' &
        d.Sex === 'Both' &
        d.Area === 'West Sussex' &
        +d.Level === 2
});

years_to_show = ["Rank_in_2007", "Rank_in_2012", "Rank_in_2017"]

// Decide the place for each line
x_rank_change = d3.scalePoint()
.domain(years_to_show)
  // .range([0,width])
.range([width * .3, width * .65])

function update_top_10_change(e) {

rank_change_svg
.selectAll("*")
.remove();

e = e || window.event;

var src = e.target;
var items = document.querySelectorAll('.switch-field-fg-slope button');
  for(var i = 0; i < items.length; i++) {
  items[i].classList.remove('active');
    }

src.classList.toggle('active');
var filter = src.dataset.filter;
var data = this[filter];

// Parse the Data
var max_17 = d3.max(data, function (d) {
  return +d['Rank_in_2017'];
  });
var max_12 = d3.max(data, function (d) {
  return +d['Rank_in_2012'];
  });
var max_07 = d3.max(data, function (d) {
  return +d['Rank_in_2007'];
  });
var max_02 = d3.max(data, function (d) {
  return +d['Rank_in_2002'];
  });
var max_97 = d3.max(data, function (d) {
  return +d['Rank_in_1997'];
  });

// Use the highest value of rank across 1997, 2007 and 2017 to determine the y axis scale for consistency.
var y_rank_change = {}
for (i in years_to_show) {
      name = years_to_show[i]
      y_rank_change[name] = d3.scaleLinear()
          .domain([1, d3.max([max_07, max_12, max_17])])
          .range([50, height_rank_change])
    }

y_place_label = d3.scaleLinear()
  .domain([1, d3.max([max_07, max_12, max_17])])
  .range([50, height_rank_change])

// The path function returns x and y coordinates to draw the lines
function path(d) {
    return d3.line()(years_to_show.map(function (p) {
    return [x_rank_change(p), y_rank_change[p](d[p])];
    }));
    }

// Draw the lines
rank_change_svg
.selectAll("myPath")
.data(data)
.enter()
.append("path")
.attr("d", path)
.attr('fill', 'none')
.style("stroke", function (d) {
  return color_cause_group(d.Cause)
  })
.style("opacity", 1)
.style('stroke-width', 2)

// Create cause label
rank_change_svg
.selectAll('text.labels')
.attr('id', 'cause_label_1')
.data(data)
.enter()
.append('text')
.text(function (d) {
    return d.Cause
    })
.style('stroke', function (d) {
    return color_cause_group(d.Cause)
    })
.attr('text-anchor', 'end')
.attr('x', x_rank_change(years_to_show[0]) - 30)
.attr('y', function (d) {
    return y_place_label(d.Rank_in_2007)
    })
.attr('dy', '0em')
.style('font-size', '.7rem')
.style('fontWeight', 'normal');

// Create cause 07 label
rank_change_svg.selectAll('text.labels')
.data(data)
.enter()
.append('text')
.text(function (d) {
      return d.Label_2007 + ' per 100,000'
    })
.style("stroke", function (d) {
      return color_cause_group(d.Cause)
    })
.attr('text-anchor', 'end')
.attr('x', x_rank_change(years_to_show[0]) - 30)
.attr('y', function (d) {
      return y_place_label(d.Rank_in_2007)
    })
.attr('dy', '1em')
.style('font-size', '.7rem')
.style('fontWeight', 'normal');

// Create cause 17 label
rank_change_svg.selectAll('text.labels')
.data(data)
.enter()
.append('text')
.text(function (d) {
  return d.Cause
  })
.style("stroke", function (d) {
  return color_cause_group(d.Cause)
  })
.attr('text-anchor', 'start')
.attr('x', x_rank_change(years_to_show[2]) + 10)
.attr('y', function (d) {
  return y_place_label(d.Rank_in_2017)
  })
.attr('dy', '0em')
.style('font-size', '.7rem')
.style('fontWeight', 'normal');

// Create cause 17 label
rank_change_svg.selectAll('text.labels')
.data(data)
.enter()
.append('text')
.text(function (d) {
  return d.Label_2017 + ' per 100,000'
  })
.style("stroke", function (d) {
  return color_cause_group(d.Cause)
  })
.attr('text-anchor', 'start')
.attr('x', x_rank_change(years_to_show[2]) + 10)
.attr('y', function (d) {
  return y_place_label(d.Rank_in_2017)
  })
.attr('dy', '1em')
.style('font-size', '.7rem')
.style('fontWeight', 'normal');

rank_change_svg
.append('text')
.text('2007')
.attr('text-anchor', 'middle')
.attr('x', x_rank_change(years_to_show[0]))
.attr('y', 20)
.attr('dy', '1em')
.style('font-size', '1.2rem')
.style('fontWeight', 'bold');

rank_change_svg
.append('text')
.text('2012')
.attr('text-anchor', 'middle')
.attr('x', x_rank_change(years_to_show[1]))
.attr('y', 20)
.attr('dy', '1em')
.style('font-size', '1.2rem')
.style('fontWeight', 'bold');

rank_change_svg
.append('text')
.text('2017')
.attr('text-anchor', 'middle')
.attr('x', x_rank_change(years_to_show[2]))
.attr('y', 20)
.attr('dy', '1em')
.style('font-size', '1.2rem')
.style('fontWeight', 'bold');

// Draw the axis for each year and add label at the top
rank_change_svg
.selectAll("myAxis")
.data(years_to_show)
.enter()
.append("g")
.attr("transform", function (d) {
      return "translate(" + x_rank_change(d) + ")";
})
.each(function (d) {
    d3.select(this).call(d3.axisLeft().scale(y_rank_change[d]));
    })
.append("text")
.style("text-anchor", "middle")
.attr("y", -11)
.text(function (d) {
    return d;
  })
.style("fill", "black")
.style("font-weight", 'bold')
}

var button = document.querySelector('.switch-field-fg-slope button');
button.click();

/////////////////
// Rate change //
/////////////////

height_rate_change = 500

var rate_change_svg = d3.select("#my_level_2_rate_change_dataviz")
.append("svg")
.attr("width", width)
.attr("height", height_rate_change + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
.html("<h3>"  + d.Cause + '</h3>' + '<p class = "tooltip_b">The rate of ' + label_key(d.Measure) + ' (per 100,000 population) ' + d.Cause + ' have changed by ' + d3.format('0.1f')(d.Change_since_2012) + '% since 2012.</p>')
.style("top", (event.pageY - 10) + "px")
.style("left", (event.pageX + 10) + "px")
.style('opacity', 1)
}

var mouseout_rc = function(d) {
tooltip_rate_change
.style("visibility", "hidden")
}


var x_rate_change = d3.scaleLinear()
.domain([-40, 50])
.range([0, width]);

var y_rate_change = d3.scaleBand()
.domain(cause_categories)
.rangeRound([0, height_rate_change])
.padding(0.15);

function update_level_2_rate_change(e) {
rate_change_svg
.selectAll("*")
.remove();

e = e || window.event;

var src = e.target;
var items = document.querySelectorAll('.switch-field-fg-change button');
  for(var i = 0; i < items.length; i++) {
  items[i].classList.remove('active');
    }

src.classList.toggle('active');
var filter = src.dataset.filter;
var data = this[filter];

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


var button = document.querySelector('.switch-field-fg-change button');
button.click();

// update_level_2_rate_change(deaths_level_2_rank_change);
