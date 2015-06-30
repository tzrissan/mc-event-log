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

		_.each(data.bikes, function(bike) {
			data[bike] = {
				fuel: [],
				maintenance: [],
				tyreFront: [],
				tyreRear: [],
				other: [],
				seasons: data.seasons
			};
		});

  };

  initializeData();

	var sortByOdo = function(list) {
		return _.sortBy(list, 'odo').reverse();
	};

	var calculate = function(list) {
		var prev;
		_.each(list, function(current) {
			if (prev) {
				prev.prevOdo = current.odo;
				prev.dist = prev.odo - current.odo;
				prev.milage = Utils.milage(prev.fuel, prev.dist);
			}
			prev=current;
			current.fuel = parseFloat(current.fuel);
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

	var categorizeBikeData = function(d, b) {
		var newData = filterByBike(d, b);
		return {
			fuel: filterByType(newData, 'FUEL'),
			tyreFront: filterByType(newData, 'TYRE_FRONT'),
			tyreRear: filterByType(newData, 'TYRE_REAR'),
			maintenance: filterByType(newData, 'MAINTENANCE'),
			other: filterByType(newData, 'OTHER')
		};
	};

	var mergeNewDataToOld = function(bikeData, newBikeData, field) {
		bikeData[field] = calculate(sortByOdo(merge(bikeData[field], newBikeData[field])));
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

		var seasonStarts = _.map(filterByType(d, 'SEASON_START'), getSeasonDates);
		var seasonEnds = _.map(filterByType(d, 'SEASON_END'), getSeasonDates);

		var seasons = _.map(seasonStarts, function(start) {
			return {
				year: start.year, 
				date: Utils.str2date(start.date),
				start: Utils.str2date(start.date),
				end: getEndDate(seasonEnds, start.year)
			};
		});

		return _.sortBy(seasons, 'year').reverse();
	};

	var update = function(newData) {
		data.raw=merge(data.raw, newData);
		data.seasons=calculateSeasons(data.raw);

		_.each(data.bikes, function(bike) {
			var categorizedNewData = categorizeBikeData(newData, bike);
			mergeNewDataToOld(data[bike], categorizedNewData, 'fuel');
			mergeNewDataToOld(data[bike], categorizedNewData, 'tyreFront');
			mergeNewDataToOld(data[bike], categorizedNewData, 'tyreRear');
			mergeNewDataToOld(data[bike], categorizedNewData, 'maintenance');
			mergeNewDataToOld(data[bike], categorizedNewData, 'other');

			data[bike].tyres = sortByOdo(_.flatten([data[bike].tyreFront, data[bike].tyreRear]));
			data[bike].seasons = data.seasons;
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
		getItems: function(bike) {
			return data[bike];
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
				'fuel': item.fuel,
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
					localStorage.setItem('lastUpdate', JSON.stringify(data.lastUpdate));
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