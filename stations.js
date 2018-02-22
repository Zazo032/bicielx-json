var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var url = 'https://gestion.bicielx.es/mapa_prestamo.php';
var interval = 60000;

function getStations() {
  var stationsList = { stations: [] };
  request(url, function (error, response, html) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(html);
      var scripts = $('script').filter(function() {
          return ($(this).html().indexOf('var beaches =') > -1);
      });
      if (scripts.length === 1) {
          var text = $(scripts[0]).html();
          var data = text.substr(text.indexOf('var beaches') + 15, text.indexOf(']];') - text.indexOf('var beaches') - 14);
          var info = data.split("],[");
          for (var i = 0; i < info.length; i++) {
            if (i == 0) { info[i] = info[i].substr(1); }
            else if (i == info.length - 1) { info[i] = info[i].substr(0, info[i].length-1); }
            var station = info[i].split(",");
            var json = JSON.parse('{"name": "' + station[0].substr(1, station[0].length-2) + '", "lat": ' + station[1].trim() + ', "lng": ' + station[2].trim() + ', "id": ' + station[3].trim() + ', "slots": ' + station[4].trim() +', "bikes": ' + station[5].trim() + '}');
            stationsList.stations.push(json);
          }

          var outputFilename = 'stations.json';
          fs.writeFile(outputFilename, JSON.stringify(stationsList, null, 2), function(err) {
              if(err) {
                console.log(err);
              } else {
                console.log("Stations JSON built and saved to " + outputFilename + " on " + new Date());
              }
          });
      }
    }
  });
}
setInterval(getStations, interval);
