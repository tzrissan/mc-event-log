<template>
    <div>
        <div class="title">Kuukausittain yhteensä</div>
        <div class="filters" v-if="global">
            <select v-model="local.selectedBike">
                <option v-bind:value="'all'">Kaikki yhteensä</option>
                <option v-bind:value="'compare'">Kaikki vierekkäin</option>
                <option v-bind:value="'seasons-distance'">Matkat ajokausittain</option>
                <option v-bind:value="'seasons-milage'">Kulutukset ajokausittain</option>
                <option v-for="bike in global.bikes" v-bind:value="bike">{{ bike }}</option>
            </select>
        </div>
        <BarChart
                v-bind:data="chartData(global.events, local.selectedBike)"
                v-bind:options="chartOptions(global.events)"></BarChart>
    </div>

</template>

<script>
    import _ from 'lodash';
    import GasLogData from '../data'
    import {MONTH_NAMES, DATE_REGEX} from '../data'
    import BarChart from './BarChart'
    import {nextColor, currentColor} from './ChartColors'

    const local = {
        selectedBike: 'all',
        bikes: []
    };

    function byMonth(month) {
        return e => e.date.replace(DATE_REGEX, '$2') === month;
    }

    function distByMonth(events, month) {
        return _.chain(events)
            .filter(byMonth(month))
            .map(e => e.dist)
            .filter(dist => _.isNumber(dist))
            .reduce((sum, dist) => sum + dist, 0)
            .value();
    }

    function fuelByMonth(events, month) {
        return _.chain(events)
            .filter(byMonth(month))
            .map(e => e.fuelused)
            .filter(fuel => _.isNumber(fuel))
            .reduce((sum, fuel) => sum + fuel, 0)
            .value();
    }

    function milageByMonth(events, month) {
        return 100 * fuelByMonth(events, month) / distByMonth(events, month);
    }

    export default {
        name: 'Stats',
        data() {
            const global = GasLogData.get();
            local.selectedBike = global.latestBike;
            local.bikes = _.chain(global.events).filter({type: 'FUEL'}).map(e => e.bike).uniq().sort().value();
            return { local, global };
        },
        components: {
            BarChart
        },
        methods: {
            chartOptions(events) {

                /*const fuelEvents = _.filter(events, {type: 'FUEL'});

                const monthData = _.chain(fuelEvents)
                    .map(e => ({
                        group: e.date.replace(DATE_REGEX, '$2') + e.bike,
                        fuel: e.fuelused,
                        dist: e.dist
                    }))
                    .reduce((months, event) => {
                        const fuel = _.get(months, [event.group, 'fuel'], 0) + _.get(event, 'fuel', 0);
                        const dist = _.get(months, [event.group, 'dist'], 0.0) + _.get(event, 'dist', 0.0);
                        _.set(months, [event.group, 'fuel'], fuel);
                        _.set(months, [event.group, 'dist'], dist);
                        return months;
                    }, {})
                    .value();

                _.values(monthData).forEach(md => md.milage = 100 * md.fuel / md.dist);*/

                return {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        yAxes: [
                            {
                                id: 'km',
                                type: 'linear',
                                position: 'left',
                                label: "km"
                            },
                            {
                                id: 'ltr',
                                type: 'linear',
                                position: 'left',
                                gridLines: {
                                    display: false
                                }
                            },
                            {
                                id: 'milage',
                                type: 'linear',
                                position: 'right',
                                gridLines: {
                                    display: false
                                },
                                /*ticks: {
                                    min: Math.trunc(_.chain(monthData).map(e => e.milage).min().value()),
                                    max: Math.trunc(_.chain(monthData).map(e => e.milage).max().value()) + 1,
                                }*/
                            }

                        ]
                    },
                    animation: {
                        //duration: 700,
                        easing: 'easeInOutQuad'
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            },
            chartData(events, bike) {

                const filter = {type: 'FUEL'};
                if (bike !== 'all' && bike !== 'compare' && bike !== 'seasons-distance' && bike !== 'seasons-milage') {
                    filter.bike = bike
                }
                const fuelEvents = _.filter(events, filter);

                const months = _.chain(fuelEvents)
                    .map(e => e.date)
                    .map(d => d.replace(DATE_REGEX, '$2'))
                    .uniq()
                    .sort()
                    .value();

                const datasets = [];
                if (bike === 'compare') {
                    this.local.bikes.forEach(bike => {
                        const bikeEvents = _.filter(fuelEvents, {bike: bike});
                        datasets.push({
                            label: 'Ajettu matka, ' + bike,
                            borderColor: nextColor(),
                            backgroundColor: currentColor(0.6),
                            data: months.map(m => distByMonth(bikeEvents, m)),
                            yAxisID: "km",
                            type: 'line'
                        });
                        datasets.push({
                            label: 'Litraa satasella, ' + bike,
                            borderColor: nextColor(),
                            backgroundColor: currentColor(0.6),
                            data: months.map(m => milageByMonth(bikeEvents, m)),
                            type: 'line',
                            fill: false,
                            yAxisID: "milage"
                        });
                    });
                }
                else if (bike === 'seasons-distance') {
                    const seasons = _.chain(fuelEvents)
                        .map(e => e.date)
                        .map(d => d.replace(DATE_REGEX, '$1'))
                        .uniq()
                        .sort()
                        .reverse()
                        .value();
                    seasons.forEach(season => {
                        const seasonEvents = _.filter(fuelEvents, e => e.date.replace(DATE_REGEX, '$1') === season);
                        const seasonBikes = _.chain(seasonEvents).map(e=>e.bike).uniq().sort().value().join(', ');
                        const distance = _.reduce(seasonEvents, (sum, event) => sum + _.get(event, 'dist', 0), 0);
                        datasets.push({
                            label: `${season}, ${seasonBikes} (${distance} km)`,
                            borderColor: nextColor(),
                            backgroundColor: currentColor(0.6),
                            data: months.map(m => distByMonth(seasonEvents, m)),
                            yAxisID: "km",
                            type: 'line'
                        });
                    });
                }
                else if (bike === 'seasons-milage') {
                    const seasons = _.chain(fuelEvents)
                        .map(e => e.date)
                        .map(d => d.replace(DATE_REGEX, '$1'))
                        .uniq()
                        .sort()
                        .reverse()
                        .value();
                    seasons.forEach(season => {
                        const seasonEvents = _.filter(fuelEvents, e => e.date.replace(DATE_REGEX, '$1') === season);
                        const seasonBikes = _.chain(seasonEvents).map(e=>e.bike).uniq().sort().value().join(', ');
                        const distance = _.reduce(seasonEvents, (sum, event) => sum + _.get(event, 'dist', 0), 0);
                        datasets.push({
                            label: `${season}, ${seasonBikes} (${distance} km)`,
                            borderColor: nextColor(),
                            backgroundColor: currentColor(0.6),
                            data: months.map(m => milageByMonth(seasonEvents, m)),
                            type: 'line',
                            fill: false,
                            yAxisID: "milage"
                        });
                    });
                }
                else {
                    datasets.push({
                        label: 'Ajettu matka',
                        borderColor: 'rgb(76, 181, 245)',
                        backgroundColor: 'rgb(76, 181, 245, 0.6)',
                        data: months.map(m => distByMonth(fuelEvents, m)),
                        yAxisID: "km",
                        type: 'line',
                    });
                    datasets.push({
                        label: 'Käytetty polttoaine',
                        borderColor: 'rgb(255, 105, 180)',
                        backgroundColor: 'rgb(255, 105, 180, 0.6)',
                        data: months.map(m => fuelByMonth(fuelEvents, m)),
                        type: 'line',
                        fill: false,
                        yAxisID: "ltr"
                    });
                    datasets.push({
                        label: 'Litraa satasella',
                        borderColor: '#B3C100',
                        backgroundColor: '#B3C100',
                        data: months.map(m => milageByMonth(fuelEvents, m)),
                        type: 'line',
                        fill: false,
                        yAxisID: "milage"
                    });
                }

                return {
                    labels: months.map(m => MONTH_NAMES[parseInt(m) - 1]),
                    datasets
                }
            }
        }
    }

</script>

<style scoped>

    .title {
        font-size: x-large;
        font-weight: bold;
        text-align: center;
        margin: 20px;
    }

    .filters {
        text-align: center;
    }

</style>