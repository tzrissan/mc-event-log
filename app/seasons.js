var _ = require('../bower_components/underscore/underscore-min.js');

angular.module('mcEventLog').factory('SeasonUtil', function(Utils) {

  var filterByBike = function(d, b) {
    return _.filter(d, function(line) { return line.bike===b; } );
  };

  var filterByType = function(d, t) {
    return _.filter(d, function(line) { return line.type===t; } );
  };


  var calculateSeasons = function(d) {
    var getSeasonDates = function(item) {
      return {
        year: parseInt(Utils.str2year(item.date)),
        date: item.date
      };
    };

    var getEndDate = function(seasonEnds, year) {
      var endDate = _.find(seasonEnds, function(item) { return year===item.year; });
      if(endDate) {
        return Utils.str2date(endDate.date);
      } else {
        return new Date();
      }
    };

    var countDistance = function(year, d) {
      var itemsWithOdoThisYear = _.filter(d, function(l) { return _.isFinite(l.odo) && ""+year===Utils.str2year(l.date); } );
      var bikes = _.chain(itemsWithOdoThisYear).pluck('bike').uniq().value();

      return _.chain(bikes).map(function(bike) {
        return {
          bike: bike,
          odos: _.chain(itemsWithOdoThisYear).filter(function(b) { return b.bike===bike; }).pluck('odo').value()
        };
      }).map(function(bike) {
        return {
          bike: bike.bike,
          distance: _.max(bike.odos) - _.min(bike.odos)
        };
      }).reduce(function(a,b) { return a+b.distance; }, 0).value();
    };

    var countFuelused = function(year, d) {
      return _.chain(d)
              .filter(function(l) { return ""+year===Utils.str2year(l.date); })
              .map(function(l) { return l.fuelused; } )
              .filter(function(f) { return _.isFinite(f); } )
              .reduce(function(a, b) { return a + b; })
              .value();
    };

    var seasonStarts = _.map(filterByType(d, 'SEASON_START'), getSeasonDates);
    var seasonEnds = _.map(filterByType(d, 'SEASON_END'), getSeasonDates);

    var seasons = _.map(seasonStarts, function(start) {
      var season = { };
      season.year=start.year;
      season.start=Utils.str2date(start.date);
      season.end=getEndDate(seasonEnds, start.year);
      season.distance=countDistance(start.year, d);
      season.fuelused=countFuelused(start.year, d);
      season.date=season.start;
      season.length=(season.end-season.start)/(1000*60*60*24);
      season.distancePerDay=season.distance/season.length;
      return season;
    });

    return _.sortBy(seasons, 'year').reverse();
  };

  return {
    calculateSeasons: calculateSeasons
  };

});