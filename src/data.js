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
        const bikeFuelEvents = _.chain(events).filter({type: 'FUEL', bike: bike}).sortBy('odo').value();
        let prev;
        _.each(bikeFuelEvents, function (current) {
            if (prev) {
                current.dist = current.odo - prev.odo;
                current.milage = parseFloat((100.0 * current.fuelused / current.dist).toFixed(2));
            }
            prev = current;
        });
    }

    function countDistancesForFrontTyres(bike) {
        const bikeFrontTyreEvents = _.chain(events).filter({type: 'TYRE_FRONT', bike: bike}).sortBy('odo').value();
        var prev;
        _.each(bikeFrontTyreEvents, function (current) {
            if (prev) {
                current.dist = current.odo - prev.odo;
            } else {
                current.dist = current.odo;
            }
            prev = current;
        });
    }

    function countDistancesForRearTyres(bike) {
        const bikeRearTyreEvents = _.chain(events).filter({type: 'TYRE_REAR', bike: bike}).sortBy('odo').value();
        var prev;
        _.each(bikeRearTyreEvents, function (current) {
            if (prev) {
                current.dist = current.odo - prev.odo;
            } else {
                current.dist = current.odo;
            }
            prev = current;
        });
    }

    function countDistancesForMaintenance(bike) {
        const bikeMaintenanceEvents = _.chain(events).filter({type: 'MAINTENANCE', bike: bike}).sortBy('odo').value();
        var prev;
        _.each(bikeMaintenanceEvents, function (current) {
            if (prev) {
                current.dist = current.odo - prev.odo;
            } else {
                current.dist = current.odo;
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
    data.bikes = _.toPairs(data.events.reduce((acc, event) => {
        if (!acc[event.bike] || acc[event.bike] < event.date) {
            acc[event.bike] = event.date;
        }
        return acc;
    }, {})).sort((a, b) =>
        a[1] > b[1] ? 1 :
            a[1] === b[1] ? 0 : -1
    ).map(e => e[0]);
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
