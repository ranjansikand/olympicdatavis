function donutVisBase(data, country, svg) {
  clearSVG(svg);

  // gold winners and sports for country
  var goldMedals = data
    .filter(function(d) {
      return (d.Medal == 'Gold' && d.NOC == country);
    });

  // silver
  var silverMedals = data
    .filter(function(d) {
      return (d.Medal == 'Silver' && d.NOC == country);
    });

  // bronze
  var bronzeMedals = data
    .filter(function(d) {
      return (d.Medal == 'Bronze' && d.NOC == country);
    });

  var donutData = 'null';

  makeDonut(goldMedals, silverMedals, bronzeMedals, country, svg, data);
}

/************core pie chart**************/
function makeDonut(goldMedals, silverMedals, bronzeMedals, country, svg, data) {
  var boundingBox = d3.select(svg).node().getBoundingClientRect();
  var h = boundingBox.height;
  var w = boundingBox.width;

  var donutdata = [
    goldMedals.length, silverMedals.length, bronzeMedals.length
  ];
  var outerRadius = 0;
  if (w>h) {
    outerRadius = (1/9)*(h);
  } else {
    outerRadius = (1/9)*(w);
  }

  var innerRadius = 0;
  var arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

  var pie = d3.pie();

  var goldThreshold = donutdata[0];
  var silverThreshold = donutdata[1];
  var bronzeThreshold = donutdata[2]

  // color based on medal awarded
  // order: gold, silver, bronze
  var color = d3.scaleOrdinal()
    .range(['#e5ce0c', '#e5e4e0', '#a4610a']);

  var arcs = d3.select(svg).selectAll("g.arc")
    .data(pie(donutdata))
    .enter()
    .append("g")
    .attr("class", "arc")
    .attr("transform", "translate(" + (w/2) + "," + (((h)/2)-25) + ")");

  arcs.append("path")
  .attr("fill", function(d, i) {
    return color(i);
  })
  .attr("d", arc)
  .attr("stroke", "white")
  .style("stroke-width", "0.5px")
  .on('mouseover', function(d) {
    d3.select(this).transition().duration(100).attr('opacity', .5);
  })
  .on('mouseleave', function(d) {
    d3.select(this).transition().duration(100).attr('opacity', 1);
  })
  .on('click', function(d) {
    d3.select(svg).selectAll('text.title').remove();
    if (d.value == goldMedals.length) {
      makepie(goldMedals, country, 'Gold', svg, outerRadius, data);
    } else if (d.value == silverMedals.length) {
      makepie(silverMedals, country, 'Silver', svg, outerRadius, data);
    } else {
      makepie(bronzeMedals, country, 'Bronze', svg, outerRadius, data);
    }
  });

  // title
  d3.select(svg).append('text')
    .attr('class', 'title')
    .attr('x', function(d) {
      return ((w/2) - 125);
    })
    .attr('y', '20')
    .text(function(d) {
      return ('Medal breakdown for ' + country);
    })
    .attr('font-size', '22px');

  arcs.append("text")
    .attr("transform", function(d) {
      return "translate(" + arc.centroid(d) + ")";
    })
    .attr("text-anchor", "middle")
    .text(function(d) {
      return d.value;
    });
}

/***********************************************************/
/*********** central donut ring ***********/
function makepie(data, country, medal, svg, outerRadius, donutData) {
  var boundingBox = d3.select(svg).node().getBoundingClientRect();
  var h = boundingBox.height;
  var w = boundingBox.width;
  var piedata = d3.nest()
    .key(function(d) {
      return d.Sport;
    })
    .rollup(function(d) {
      return d.length;
    })
    .entries(data);

  let tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip');

  var innerRadius2 = outerRadius;
  var outerRadius2 = 2 * innerRadius2;

  var arc2 = d3.arc()
    .innerRadius(innerRadius2)
    .outerRadius(outerRadius2);

  var pie2 = d3.pie()
    .sort(null)
    .value(function(d) {
      return d.count;
    });

  var tracker = 0;
  var maxV = 0;
  piedata.forEach(function(d) {
    d.count = d.value;
    delete d["value"];
    tracker += d.count;
    if (d.count > maxV) {
      maxV = d.count;
    }
  });

  var arcs2 = d3.select(svg).selectAll("pie")
    .data(pie2(piedata))
    .enter()
    .append("g")
    .attr("class", "pie")
    .attr("transform", "translate(" + (w/2) + "," + (((h)/2)-25) + ")");

    var selected = 0;
  //Draw arc paths
  arcs2.append("path")
    .attr('class', 'midring')
    .attr("fill", function(d) {
      return 'rgb(' + 252*(d.value/maxV) + ',0,0)';
    })
    .attr("d", arc2)
    .attr("stroke", "white")
    .style("stroke-width", "0.1px")
    .on('mouseover', showTooltip)
    .on('mouseleave', hideTooltip)
    .on('click', function(d, i) {
        d3.select('.pie').selectAll('text.title').remove();
        d3.select('.pie').selectAll('path.outerring').remove();
        d3.select('.pie').selectAll('text.outerring').remove();
        makeCenterPie(piedata[i].key, medal, country, svg, outerRadius2, donutData);
    });

  // wedge labels
  arcs2.append("text")
    .attr("transform", function(d) {
      return "translate(" + arc2.centroid(d) + ")";
    })
    .attr("text-anchor", "middle")
    .text(function(d, i) {
      if (d.value > (.05 * tracker)) {
        return piedata[i].key;
      }
    })
    .attr('font-size', '11px')
    .style('fill', ' #cfcfcf');

  // title
  d3.select(svg).append('text')
    .attr('class', 'title')
    .attr('x', function(d) {
      return ((w/2) - 125);
    })
    .attr('y', '20')
    .text(function(d) {
      return (medal + ' Events for ' + country);
    })
    .attr('font-size', '22px');

    function showTooltip(d) {
      tooltip.style('left', (d3.event.pageX + 10) + 'px')
        .style('top', (d3.event.pageY - 25) + 'px')
        .style('display', 'inline-block')
        .html(d.value + ' medal(s)');
    }

    function hideTooltip() {
      tooltip.style('display', 'none');
    }

}

/********************************************************/
// name is misleading: this is the outer ring
function makeCenterPie(sport, medal, country, svg, innerRadiusPie, donutData) {
  var boundingBox = d3.select(svg).node().getBoundingClientRect();
  var h = boundingBox.height;
  var w = boundingBox.width;

  var tempdata = donutData
    .filter(function(d) {
      return ((d.NOC == country) && (d.Medal == medal) && (d.Sport == sport));
    });

  var centerdata = d3.nest()
    .key(function(d) {
      return d.ID;
    })
    .rollup(function(d) {
      return d.length;
    })
    .entries(tempdata);

  var innerRadius = innerRadiusPie;
  var outerRadius = innerRadius * (3/2);

  var arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

  var pie = d3.pie();
  var oneMedal = 0;
  var twoMedal = 0;
  var threeMedal = 0;
  var fourMedal = 0;

  centerdata.forEach(function(d) {
    d.count = d.value;
    delete d["value"];
    if (d.count == 1) { oneMedal+=1;
    } else if (d.count == 2) { twoMedal+=1;
    } else if (d.count == 3) { threeMedal+=1;
    } else { fourMedal+=1; }
  })

  var dataset = [oneMedal, twoMedal, threeMedal, fourMedal];

  var color = d3.scaleOrdinal()
    .range(['#050000','#5c0000','#ad0000','#ff0000']);

  var svg = d3.select(svg)
    .append("svg")
    .attr("width", w)
    .attr("height", h);

  var arcs = svg.selectAll("center")
    .data(pie(dataset))
    .enter()
    .append("g")
    .attr("class", "arc")
    .attr("transform", "translate(" +(w/2) + "," + (((h)/2)-25) + ")");

  arcs.append("path")
    .attr('class', 'outerring')
    .attr("fill", function(d, i) {
      return color(i);
    })
    .attr("d", arc)
    .attr("stroke", "white")
    .style("stroke-width", "0.5px")
    .on('mouseover', function(d) {
      d3.select(this).transition().duration(100)
        .style('opacity', '0.2');
    })
    .on('mouseleave', function(d) {
      d3.select(this).transition().duration(100).style('opacity', '1');
    })
    .on('click', function(d) {
      clearSVG('.pie');
      donutVisBase(donutData, country, '.pie');
    });

  // wedge labels
  arcs.append("text")
    .attr('class', 'outerring')
    .attr("transform", function(d) {
      return "translate(" + arc.centroid(d) + ")";
    })
    .attr("text-anchor", "middle")
    .text(function(d) {
      if (d.value == oneMedal && d.value >= 1) {
        oneMedal = -1;
        return 'One medal: ' + d.value;
      } else if (d.value == twoMedal && d.value >= 1) {
        twoMedal = -1;
        return 'Two: ' + d.value;
      } else if (d.value == threeMedal && d.value >= 1) {
        threeMedal = -1;
        return 'Three: ' + d.value;
      } else if (d.value == fourMedal && d.value >= 1){
        return 'Four or more: ' + d.value;
      } else {
        return '';
      };
    })
    .style('fill', '#cfcfcf');

  // title text
  d3.select('.pie').append('text')
    .attr('class', 'title')
    .attr('x', '0')
    .attr('y', '20')
    .text(function(d) {
      return ('Number of Medals Won by '+ sport +
        ' Athletes Representing ' + country);
    })
    .attr('font-size', '21px');

  d3.select('.pie').append('text')
    .attr('class', 'title')
    .attr('x', function(d) {
      return 10;
    })
    .attr('y', function(d) {
      return h/5;
    })
    .text(function(d) {
      return ('(click outer ring to revert chart)');
    })
    .attr('font-size', '12px');
}

function clearSVG(svg) {
  d3.select(svg).selectAll('text').remove();
  d3.select(svg).selectAll('g').remove();
}
