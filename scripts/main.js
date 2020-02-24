// process data into d3
var dataProcessor = function(d) {
  return {
    ID: d.ID,
    Age: parseFloat(d.Age),
    Weight: parseFloat(d.Weight),
    Height: parseFloat(d.Height),
    Year: parseFloat(d.Year),
    NOC: d.NOC,
    Sport: d.Sport,
    Medal: d.Medal
  };
}

d3.csv("./data/athlete_events.csv", dataProcessor, function(data) {
  // only data for medal winners
  var dataMedals = data
    .filter(function(d) {
      return (d.Medal != 'NA');
    });

  // countries and their attributes
  var countries = d3.nest()
    .key(function(d) {return d.NOC;})
    .key(function(d) {return d.Medal})
    .entries(dataMedals);

  // countries and their number of athletes (above 498 -- leaves about 52)
  var countryRolled = d3.nest()
    .key(function(d) { return d.NOC; })
    .rollup(function(d) {
      return d.length;
    })
    .entries(data)
    .filter(function(d) {
      return d.value > 600;
    });

  // visualization calls
  var country = 'USA';
  drawRadial(country, data);
  donutVisBase(dataMedals, country, '.pie');
  drawBarGraph(countryRolled, '.bar', dataMedals, data);
});
