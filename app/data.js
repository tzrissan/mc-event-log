var _ = require('../bower_components/underscore/underscore-min.js');

angular.module('mcEventLog').factory('Data', function($rootScope, LocalStorage, RestBack, Utils) {

  'use strict';

  var data;

  var initializeData = function () {

  	data = {
			lastUpdate: undefined,
			raw: [],
			bikes: ['versys', 'vstrom', 'bandit'],
			seasons: { }
		};

  };

  initializeData();

	var calculate = function(list) {
		var prev;
		var sortedList = _.sortBy(list, 'odo').reverse();
		_.each(sortedList, function(current) {
			if (prev) {
				prev.prevOdo = current.odo;
				prev.dist = prev.odo - current.odo;
				prev.milage = Utils.milage(prev.fuelused, prev.dist);
			}
			prev=current;
			current.fuelused = parseFloat(current.fuelused);
			current.fuelfilled = parseFloat(current.fuelfilled);
			current.odo = parseInt(current.odo);
		});
		return list;
	};

	//FIXME: muuttaa parametriensa tilaa -> korjaa funktionaaliseksi
	var merge = function(oldData, newData) {
		if (! oldData) oldData = [];
		var oldOdos =_.chain(oldData)
                              .pluck('odo')
                              .map(function(odo) { return parseInt(odo); })
                              .value();
		_.each(newData, function(elem) {
			elem.odo=parseInt(elem.odo);
			if (!_.contains(oldOdos, elem.odo)) {
				oldData.push(elem);
			}
		});
		return oldData;
	};

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

	var update = function(newData) {
		data.raw=merge(data.raw, newData);
		data.seasons=calculateSeasons(data.raw);

		var bikes = _.chain(data.raw)
		             .pluck('bike')
		             .uniq()
		             .value();
		var eventTypes = _.chain(data.raw)
		             .pluck('type')
		             .uniq()
		             .value();

		_.each(bikes, function(bike) {
			_.each(eventTypes, function (eventType) {
				calculate(_.chain(data.raw)
					         .filter(function(line) { return line.bike===bike; } )
					         .filter(function(line) { return line.type===eventType; } )
					         .value());
			});
		});

		LocalStorage.store(data);
		$rootScope.$broadcast('raw-data-was-updated');
	};

	var updateDataTimestamp = function() {
		data.lastUpdate = currentTimestamp();
	};

	var currentTimestamp = function() {
		var today = new Date();
		return today.getFullYear() + "-" + (today.getMonth()+1) + "-" + today.getDate() + " " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	};

	var loadNewData = function(callback) {
		var onUpdate = function(data) {
			updateDataTimestamp();
			update(data);
			if (callback) callback();
		};

		if (data.lastUpdate) {
			RestBack.loadLatestItems(data.lastUpdate, onUpdate);
		} else {
			RestBack.loadAllData(onUpdate);
		}
	};

	var reload = function(callback) {
		initializeData();
		LocalStorage.clear();
		loadNewData(callback);
	};

	var loadDataFromLocalStorage = function() {
			var localData = LocalStorage.load();
			if (localData) {
				update(localData.lines);
				data.lastUpdate = localData.lastUpdate;
			}
	};

	loadDataFromLocalStorage();

	return {
		addLine: function(newLine, callback) {
			RestBack.saveLine(newLine, function() {
				loadNewData(callback);
			});
		},
		addLines: function(newLines) {
			update(newLines);
		},
		getItems: function() {
			return data.raw;
		},
		getMonthSummary: function() {
			return months;
		},
		getYearSummary: function() {
			return years;
		},
		loadNewData: loadNewData,
		loadAllData: function(callback) {
			RestBack.loadAllData(function(data){
				data.lastUpdate = currentTimestamp();
				update(data);
				if (callback) callback();
			});
 		},
		maxValues: {
			odo: data.maxOdo,
			lastUpdate: data.lastUpdate
		},
		reload: reload
	};
})

.factory('RestBack', function($http) {

	'use strict';

	return {
		loadAllData: function(callback) {
			$http.get('/data').success(callback);
		},
		loadLatestItems: function(lastUpdate, callback) {
			$http.get('/data?after=' + lastUpdate ).success(callback);
		},
		saveLine: function(line, callback) {
			$http.post('/data', line).success(callback);
		}
	};
})

.factory('LocalStorage', function() {

	'use strict';
	
	var filterValuesForStorage = function(data) {
		return _.map(data, function(item) {
			return {
				'odo': item.odo,
				'fuelfilled': item.fuelfilled,
				'fuelused': item.fuelused,
				'info': item.info,
				'type': item.type,
				'date': item.date,
				'bike': item.bike
			};
		});
	};

	return {
		store: function(data) {
			try {
				if (data.lastUpdate) { 
					localStorage.setItem('lastUpdate', data.lastUpdate);
				}
				localStorage.setItem('lines', JSON.stringify(filterValuesForStorage(data.raw)));
			  localStorage.setItem('lines-size', JSON.stringify(data.raw.length));
			} catch( err ) {
			}
		},
		load: function() {
			if (localStorage.lastUpdate) {
				try {
					return {
						lastUpdate: localStorage.getItem('lastUpdate'), 
						lines: JSON.parse(localStorage.getItem('lines'))
					};
				} catch ( err ) {
				}
			} else {
				return [];
			}
		},
		clear: function() {
			localStorage.removeItem('lastUpdate');
			localStorage.removeItem('lines');
		}
	};
});