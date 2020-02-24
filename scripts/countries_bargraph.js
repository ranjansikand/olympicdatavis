function drawBarGraph(data, svg, dataMedals, topSports) {
  var boundingBox = d3.select(svg).node().getBoundingClientRect();
  var height = boundingBox.height;
  var width = boundingBox.width;

  var margins = {
      top: 30,
      bottom: 25,
      left: 45,
      right: 30
  };

  var country = 'USA';
  // add axes
  var x = d3.scaleLinear()
    .range([margins.left, (width - 1)])
    .domain([0]);
  var y = d3.scaleLinear()
    .range([height, margins.bottom])
    .domain([0, 1.05*d3.max(data, function(d) {return d.value})]);

  d3.select(svg).append("g")
    .attr('class', 'xaxis')
    .attr('transform', 'translate(' + (0) + ','
      + (height - margins.bottom) + ')')
    .call(d3.axisBottom(x).ticks(68));

  d3.select(svg).append("g")
    .attr('class', 'yaxis')
    .attr("transform", "translate( " + margins.left + ", "
      + (-1*margins.bottom) + ")")
    .call(d3.axisLeft(y).ticks(8));

  // add title
  d3.select(svg).append('text')
    .attr('x', function(d) {
      return (width/2) - 220;
    })
    .attr('y', '20')
    .text("Number of Olympic Athletes Sent from Participating Countries")
    .attr('font-size', '22px');

  let tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip');
  var maxVal = d3.max(data, function(d) {return d.value});

  addLegend(width, height, maxVal);

  d3.select(svg)
    .selectAll("rect")
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'barg')
    .attr("x", function (d,i) {
        return (i * ((width - margins.left - 1) / data.length))
          + margins.left;
    })
    .attr("y", function (d) {
        return height - margins.bottom - (height - margins.top
           - margins.bottom) * (d.value/maxVal);
    })
    .attr('width', function(d) {
      return ((width - margins.left - 1)/data.length) - 1;
    })
    .attr('height', function(d) {
      return (height - margins.top - margins.bottom) *
        (d.value/maxVal);
    })
    .style('fill', function(d) {
      return "rgb(" + 256*((d.value)/maxVal) + ", 0, 0)";
    })
    .on('mouseover', showTooltip)
    .on('mouseleave', hideTooltip)
    .on('click', function(d) {
      d3.select(this)
        .transition()
        .duration(125)
        .style('fill', 'green');
      d3.select(this)
        .transition()
        .delay(175)
        .duration(125)
        .style('fill', function(d) {
          return "rgb(" + 256*((d.value)/maxVal) + ", 0, 0)";
        });

      country = d.key;
      drawRadial(country, topSports);
      donutVisBase(dataMedals, country, '.pie');
    });


  function showTooltip(d) {
    tooltip.style('left', (d3.event.pageX + 10) + 'px')
      .style('top', (d3.event.pageY - 25) + 'px')
      .style('display', 'inline-block')
      .html(d.key + ': '+ d.value + ' athletes');
  }

  function hideTooltip() {
    tooltip.style('display', 'none');
  }
}

function addLegend(w, h, maxVal) {
      var key = d3.select(".bar")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

      var yLoc = h/6;

      var legend = key.append("defs")
        .append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "0%")
        .attr("spreadMethod", "pad");

      legend.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "rgb(0,0,0)")
        .attr("stop-opacity", 1);

      legend.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "rgb(256,0,0)")
        .attr("stop-opacity", 1);

      key.append("rect")
        .attr("width", w/2 - 35)
        .attr("height", 18)
        .style("fill", "url(#gradient)")
        .attr("transform", "translate(" + (w/2) + "," + yLoc + ")");

      key.append("text")
        .attr('x', function(d) {
          return (w/2);
        })
        .attr('y', function(d) {
          return yLoc;
        })
        .text('0')
        .attr('font-size', '11px');

      key.append("text")
        .attr('x', function(d) {
          return w - 62;
        })
        .attr('y', function(d) {
          return yLoc;
        })
        .text(function (d) {
          return maxVal;
        })
        .attr('font-size', '11px');
}
