import axios from 'axios';
import _ from 'lodash';

export const DATE_REGEX = /(\d{4})-(\d{2})-(\d{2})/;
export const MONTH_NAMES = ['Tammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu', 'Toukokuu', 'Kesäkuu', 'Heinäkuu', 'Elokuu', 'Syyskuu', 'Lokakuu', 'Marraskuu', 'Joulukuu'];

const data = {
    bikes: [],
    years: [],
    months: [],
    latestBike: undefined,
    events: []
};

function countMilages(events) {
    function countDistancesAndMilageForFuelEvents(bike) {
        const bikeFuelEvents = _.chain(events).filter({type: 'FUEL', bike: bike}).value();
        var prev;
        var sortedList = _.sortBy(bikeFuelEvents, 'odo').reverse();
        _.each(sortedList, function (current) {
            if (prev) {
                prev.dist = prev.odo - current.odo;
                prev.milage = parseFloat((100.0 * prev.fuelused / prev.dist).toFixed(2));
            }
            prev = current;
        });
    }

    function countDistancesForFrontTyres(bike) {
        const bikeFrontTyreEvents = _.chain(events).filter({type: 'TYRE_FRONT', bike: bike}).value();
        var prev;
        var sortedList = _.sortBy(bikeFrontTyreEvents, 'odo').reverse();
        _.each(sortedList, function (current) {
            if (prev) {
                current.dist = prev.odo - current.odo;
            }
            prev = current;
        });
    }

    function countDistancesForRearTyres(bike) {
        const bikeFrontTyreEvents = _.chain(events).filter({type: 'TYRE_REAR', bike: bike}).value();
        var prev;
        var sortedList = _.sortBy(bikeFrontTyreEvents, 'odo').reverse();
        _.each(sortedList, function (current) {
            if (prev) {
                current.dist = prev.odo - current.odo;
            }
            prev = current;
        });
    }

    function countDistancesForMaintenance(bike) {
        const bikeFrontTyreEvents = _.chain(events).filter({type: 'MAINTENANCE', bike: bike}).value();
        var prev;
        var sortedList = _.sortBy(bikeFrontTyreEvents, 'odo').reverse();
        _.each(sortedList, function (current) {
            if (prev) {
                prev.dist = prev.odo - current.odo;
            }
            prev = current;
        });
    }

    data.bikes.forEach(bike => {
        countDistancesAndMilageForFuelEvents(bike);
        countDistancesForFrontTyres(bike);
        countDistancesForRearTyres(bike);
        countDistancesForMaintenance(bike);
    });
}



function countExtraInformationFromData() {
    data.bikes = _.chain(data.events).map(e => e.bike).uniq().sort().value();
    data.years = _.chain(data.events).map(e => e.date).map(d => d.replace(DATE_REGEX, '$1')).uniq().sort().reverse().value();
    data.months = _.chain(data.events).map(e => e.date).map(d => d.replace(DATE_REGEX, '$2')).uniq().sort().value();
    data.latestBike = _.chain(data.events)
        .filter({type: 'FUEL'})
        .sortBy('date')
        .last().value().bike;
    countMilages(data.events);
}

function reload() {
    axios.create().get('/data')
        .then((response) => {
            data.events = response.data;
            countExtraInformationFromData();
        });
}

reload();

const GasLogData = {
    get() {
        return data;
    },
    reload,
    countExtraInformationFromData
};

export default GasLogData;