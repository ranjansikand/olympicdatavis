// code for chart rendering based on implementation by Anton Orlov

function drawRadial(country, sportSet) {
  clearSVG('.radial');

  var countryMatch = sportSet
    .filter(function(d) {
      return d.NOC == country;
    });
  var topSports = d3.nest()
    .key(function(d) {
      return d.Sport;
    })
    .rollup(function(d) {
      return d.length;
    })
    .entries(countryMatch);

  var max1 = 0,
    max2 = 0,
    max3 = 0;
  var name1, name2, name3;

  topSports.forEach(function(d) {
    if (d.value > max1) {
      max1 = d.value;
      name1 = d.key;
    } else if (d.value > max2) {
      max2 = d.value;
      name2 = d.key;
    } else if (d.value > max3) {
      max3 = d.value;
      name3 = d.key;
    }
  });

  var boundingBox = d3.select('.radial').node().getBoundingClientRect();
  var height = boundingBox.height;
    width = boundingBox.width;
    chartRadius = height / 2 - 40;

  let svg = d3.select('.radial').append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(' + width / 3 + ',' + height / 2 + ')');

  let tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip');

  const PI = Math.PI,
    arcMinRadius = 10,
    arcPadding = 10,
    labelPadding = -5,
    numTicks = 10;

  var data = topSports
    .filter(function(d) {
      return (d.key == name1 || d.key == name2 || d.key == name3);
    });
  data.forEach(function(d) {
    d.name = d.key;
    delete d["key"];
  });

    // title
  svg.append('text')
    .attr('class', 'title')
    .attr('x', function(d) {
      return (25 + chartRadius);
    })
    .attr('y', '0')
    .text(function(d) {
      return ('Sports with Highest Number of Competing Athletes for ' + country);
    })
    .attr('font-size', '22px');

  createRadial(data);

  function createRadial(data) {
      let scale = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return d.value; }) * 1.1])
        .range([0, 2 * PI]);

      let ticks = scale.ticks(numTicks).slice(0, -1);
      let keys = data.map(function(d, i) {
        return d.name
      });

      //number of arcs
      const numArcs = keys.length;
      const arcWidth = (chartRadius - arcMinRadius - numArcs * arcPadding) / numArcs;

      let arc = d3.arc()
        .innerRadius(function(d, i) {
          return getInnerRadius(i);
        })
        .outerRadius(function(d, i) {
          return getOuterRadius(i);
        })
        .startAngle(0)
        .endAngle(function(d, i) {
          return scale(d)
        });

      let radialAxis = svg.append('g')
        .attr('class', 'r axis')
        .selectAll('g')
          .data(data)
          .enter().append('g');

      radialAxis.append('circle')
        .attr('r', (d, i) => getOuterRadius(i) + arcPadding);

      radialAxis.append('text')
        .attr('x', labelPadding)
        .attr('y', (d, i) => -getOuterRadius(i) + arcPadding)
        .text(d => d.name);

      let axialAxis = svg.append('g')
        .attr('class', 'a axis')
        .selectAll('g')
          .data(ticks)
          .enter().append('g')
            .attr('transform', d => 'rotate(' + (rad2deg(scale(d)) - 90) + ')');

      axialAxis.append('line')
        .attr('x2', chartRadius);

      axialAxis.append('text')
        .attr('x', chartRadius + 10)
        .style('text-anchor', d => (scale(d) >= PI && scale(d) < 2 * PI ? 'end' : null))
        .attr('transform', d => 'rotate(' + (90 - rad2deg(scale(d))) + ',' + (chartRadius + 10) + ',0)')
        .text(d => d);

      //data arcs
      let arcs = svg.append('g')
        .attr('class', 'data')
        .selectAll('path')
          .data(data)
          .enter().append('path')
          .attr('class', 'arc')
          .style('fill', function(d) {
            return 'rgb(' +
              222*((d.value - d3.min(data, function(d) { return d.value; }))
              / (d3.max(data, function(d) { return d.value; })
              - d3.min(data, function(d) { return d.value; })))
              + ',0,0)';
          })

      arcs.transition()
        .delay((d, i) => i * 200)
        .duration(1000)
        .attrTween('d', arcTween);

      arcs.on('mousemove', showTooltip)
      arcs.on('mouseout', hideTooltip)


      function arcTween(d, i) {
        let interpolate = d3.interpolate(0, d.value);
        return t => arc(interpolate(t), i);
      }

      function showTooltip(d) {
        tooltip.style('left', (d3.event.pageX + 10) + 'px')
          .style('top', (d3.event.pageY - 25) + 'px')
          .style('display', 'inline-block')
          .html(d.value + ' athletes');
      }

      function hideTooltip() {
        tooltip.style('display', 'none');
      }

      function rad2deg(angle) {
        return angle * 180 / PI;
      }

      function getInnerRadius(index) {
        return arcMinRadius + (numArcs - (index + 1)) * (arcWidth + arcPadding);
      }

      function getOuterRadius(index) {
        return getInnerRadius(index) + arcWidth;
      }
  }
}
