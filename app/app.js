require('../bower_components/angular/angular.min.js');
//module.exports = angular;

var mcEventLog = angular.module('mcEventLog', []);

require('./controller.js');
require('./data-columns.js');
require('./data.js');
require('./datatable.js');
require('./seasons.js');
require('./statistics.js');
require('./utils.js');
