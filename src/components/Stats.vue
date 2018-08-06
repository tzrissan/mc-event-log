<template>
    <div>
        <div class="filters" v-if="global">
            <select v-model="local.selectedStatistic">
                <option
                        v-for="(stat, name) in local.statisticOptions"
                        v-bind:key="name"
                        v-bind:value="name">{{ stat.title }}
                </option>
            </select>
        </div>
        <BarChart
                v-bind:data="chartData(global.events)"
                v-bind:options="chartOptions(local.selectedStatistic)"></BarChart>
    </div>

</template>

<script>
    import _ from 'lodash';
    import GasLogData from '../data'
    import {MONTH_NAMES, DATE_REGEX} from '../data'
    import BarChart from './BarChart'
    import {CHART_COLORS, nextColor, currentColor} from './ChartColors'

    const local = {
        selectedStatistic: 'all',
        statisticOptions: {
            compareBikes: {
                title: 'Pyörät',
                yAxes: [
                    {id: 'km', type: 'linear', position: 'left', ticks: {min: 0}},
                    {id: 'ltr', type: 'linear', position: 'left', gridLines: {display: false}, ticks: {min: 0}},
                    {id: 'milage', type: 'linear', position: 'right', gridLines: {display: false}, ticks: {min: 0}}
                ],
                datasets(events) {

                    const global = GasLogData.get();

                    function totalDistance(bike, events) {
                        const bikeEvents = _.filter(events, {bike});
                        const minOdo = _.chain(bikeEvents).map(e => e.odo).min().value();
                        const maxOdo = _.chain(bikeEvents).map(e => e.odo).max().value();
                        return maxOdo - minOdo;
                    }

                    function totalFuel(bike, events) {
                        return _.chain(events)
                            .filter({bike})
                            .map(e => e.fuelused)
                            .filter(f => !_.isUndefined(f) && !_.isNaN(f))
                            .reduce((sum, fuel) => sum + fuel, 0)
                            .value()
                    }

                    function averageMilage(bike, events) {
                        const bikeEvents = _.filter(events, {bike, type: 'FUEL'});
                        const totalDistance = _.chain(bikeEvents)
                            .map(e => e.dist)
                            .filter(n => _.isNumber(n) && !_.isNaN(n))
                            .reduce((sum, dist) => sum + dist, 0).value();
                        const totalFuel = _.chain(bikeEvents)
                            .map(e => e.fuelused)
                            .filter(n => _.isNumber(n) && !_.isNaN(n))
                            .reduce((sum, fuel) => sum + fuel, 0).value();
                        const avgMilage = 100 * totalFuel / totalDistance;
                        return _.isNaN(avgMilage) ? undefined : avgMilage;
                    }

                    return [{
                        label: `kilometriä`,
                        borderWidth: 2,
                        borderColor: CHART_COLORS.blue(),
                        backgroundColor: CHART_COLORS.blue(0.6),
                        data: global.bikes.map(bike => totalDistance(bike, events)),
                        yAxisID: "km"
                    }, {
                        label: `litraa`,
                        borderWidth: 2,
                        borderColor: CHART_COLORS.pink(),
                        backgroundColor: CHART_COLORS.pink(0.6),
                        data: global.bikes.map(bike => totalFuel(bike, events)),
                        yAxisID: "ltr"
                    }, {
                        label: `keskikulutus`,
                        borderColor: CHART_COLORS.green(),
                        backgroundColor: CHART_COLORS.green(0.6),
                        data: global.bikes.map(bike => averageMilage(bike, events)),
                        yAxisID: "milage"
                    }]
                },
                labels() {
                    return GasLogData.get().bikes;
                }
            },
            compareBikesByMonth: {
                title: 'Pyörät kuukausittain',
                yAxes: [
                    {id: 'km', type: 'linear', position: 'left'},
                    {id: 'ltr', type: 'linear', position: 'left', gridLines: {display: false}},
                    {id: 'milage', type: 'linear', position: 'right', gridLines: {display: false}}
                ],
                datasets(events) {
                    const fuelEvents = _.filter(events, {type: 'FUEL'});
                    const months = monthsWithEvents(fuelEvents);
                    const datasets = [];
                    local.bikes.forEach(bike => {
                        const bikeEvents = _.filter(fuelEvents, {bike: bike.name});
                        datasets.push({
                            label: `${bike.name}, ajettu matka`,
                            borderColor: bike.borderColor,
                            backgroundColor: bike.backgroundColor,
                            data: months.map(m => countDistance(bikeEvents, byMonth(m))),
                            yAxisID: "km",
                            type: 'line'
                        });
                        datasets.push({
                            label: 'Käytetty polttoaine',
                            borderColor: bike.borderColor,
                            backgroundColor: bike.backgroundColor,
                            data: months.map(m => countFuel(bikeEvents, byMonth(m))),
                            yAxisID: "ltr"
                        });
                        datasets.push({
                            label: `${bike.name},  litraa satasella`,
                            borderColor: bike.borderColor,
                            backgroundColor: bike.backgroundColor,
                            data: months.map(m => milageByMonth(bikeEvents, m)),
                            type: 'line',
                            fill: false,
                            yAxisID: "milage"
                        });
                    });
                    return datasets;
                },
                labels(events) {
                    return monthsWithEvents(_.filter(events, {type: 'FUEL'})).map(m => MONTH_NAMES[parseInt(m) - 1])
                }
            },
            allByMonth: {
                title: 'Pyörät yhteensä kuukausittain',
                yAxes: [
                    {id: 'km', type: 'linear', position: 'left'},
                    {id: 'ltr', type: 'linear', position: 'left', gridLines: {display: false}},
                    {id: 'milage', type: 'linear', position: 'right', gridLines: {display: false}}
                ],
                datasets(events) {
                    const fuelEvents = _.filter(events, {type: 'FUEL'});
                    const months = monthsWithEvents(fuelEvents);
                    return [
                        {
                            label: 'Ajettu matka',
                            borderColor: 'rgb(76, 181, 245)',
                            backgroundColor: 'rgb(76, 181, 245, 0.6)',
                            data: months.map(m => countDistance(fuelEvents, byMonth(m))),
                            yAxisID: "km",
                            type: 'line',
                        },
                        {
                            label: 'Käytetty polttoaine',
                            borderColor: 'rgb(255, 105, 180)',
                            backgroundColor: 'rgb(255, 105, 180, 0.6)',
                            data: months.map(m => countFuel(fuelEvents, byMonth(m))),
                            yAxisID: "ltr"
                        },
                        {
                            label: 'Litraa satasella',
                            borderColor: '#B3C100',
                            backgroundColor: '#B3C100',
                            data: months.map(m => milageByMonth(fuelEvents, m)),
                            type: 'line',
                            fill: false,
                            yAxisID: "milage"
                        }
                    ];
                },
                labels(events) {
                    return monthsWithEvents(_.filter(events, {type: 'FUEL'})).map(m => MONTH_NAMES[parseInt(m) - 1])
                }
            },
            seasons: {
                title: 'Ajokaudet',
                yAxes: [
                    {id: 'km', type: 'linear', position: 'left', ticks: {min: 0}},
                    {id: 'ltr', type: 'linear', position: 'left', gridLines: {display: false}, ticks: {min: 0}},
                    {id: 'milage', type: 'linear', position: 'right', gridLines: {display: false}}
                ],
                datasets(events) {
                    const fuelEvents = _.filter(events, {type: 'FUEL'});
                    const seasons = seasonsWithEvents(fuelEvents).reverse();
                    const distances = seasons.map(s => countDistance(fuelEvents, bySeason(s)));
                    const fuels = seasons.map(s => countFuel(fuelEvents, bySeason(s)));
                    const milages = _.zip(fuels, distances).map(z => (100 * z[0] / z[1]));
                    const avgDistance = (distances.reduce((s, d) => s + d, 0) / distances.length).toFixed(0);
                    const avgFuel = (fuels.reduce((s, d) => s + d, 0) / fuels.length).toFixed(2);
                    const avgMilage = (100 * fuels.reduce((s, d) => s + d, 0) / distances.reduce((s, d) => s + d, 0));
                    return [{
                        label: `kilometriä`,
                        borderColor: CHART_COLORS.blue(),
                        backgroundColor: CHART_COLORS.blue(0.6),
                        data: distances,
                        yAxisID: "km"
                    }, {
                        label: `litraa`,
                        borderColor: CHART_COLORS.pink(),
                        backgroundColor: CHART_COLORS.pink(0.6),
                        data: fuels,
                        yAxisID: "ltr"
                    }, {
                        label: `litraa satasella`,
                        borderColor: CHART_COLORS.pine(),
                        backgroundColor: CHART_COLORS.pine(0.6),
                        data: milages,
                        type: 'line',
                        fill: false,
                        yAxisID: "milage"
                    }, {
                        label: `keskiarvo (${avgDistance} km)`,
                        borderColor: CHART_COLORS.blue(),
                        backgroundColor: CHART_COLORS.blue(0.6),
                        data: seasons.map(() => avgDistance),
                        type: 'line',
                        fill: false,
                        yAxisID: "km",
                        radius: 0
                    }, {
                        label: `keskiarvo (${avgFuel} ltr)`,
                        borderColor: CHART_COLORS.pink(),
                        backgroundColor: CHART_COLORS.pink(0.6),
                        data: seasons.map(() => avgFuel),
                        type: 'line',
                        fill: false,
                        yAxisID: "ltr",
                        radius: 0
                    }, {
                        label: `keskiarvo (${avgMilage} ltr/100km)`,
                        borderColor: CHART_COLORS.pine(),
                        backgroundColor: CHART_COLORS.pine(0.6),
                        data: seasons.map(() => avgMilage),
                        type: 'line',
                        fill: false,
                        yAxisID: "milage",
                        radius: 0
                    }];
                },
                labels(events) {
                    return seasonsWithEvents(_.filter(events, {type: 'FUEL'})).reverse();
                }
            },
            seasonsDistanceByMonth: {
                title: 'Ajokausien matkat kuukausittain',
                yAxes: [
                    {id: 'km', type: 'linear'}
                ],
                datasets(events) {
                    const fuelEvents = _.filter(events, {type: 'FUEL'});
                    const months = monthsWithEvents(fuelEvents);
                    const seasons = seasonsWithEvents(fuelEvents);
                    return seasons.map(season => {
                        const seasonEvents = _.filter(fuelEvents, bySeason(season));
                        const seasonBikes = _.chain(seasonEvents).map(e => e.bike).uniq().sort().value().join(', ');
                        const distance = _.reduce(seasonEvents, (sum, event) => sum + _.get(event, 'dist', 0), 0);
                        const backgroundColor = _.get(_.filter(local.bikes, {name: seasonBikes}), '[0].backgroundColor', 'rgb(183,184,182,0.3)');
                        return {
                            label: `${season}, ${seasonBikes} (${distance} km)`,
                            borderColor: nextColor(),
                            backgroundColor: backgroundColor,
                            data: months.map(m => countDistance(seasonEvents, byMonth(m))),
                            yAxisID: "km",
                            type: 'line'
                        };
                    }).concat(
                        local.bikes.map(bike => {
                            const bikeEvents = _.filter(fuelEvents, {bike: bike.name});
                            const monthCount = _.chain(bikeEvents)
                                .map(e => e.date)
                                .map(d => d.replace(DATE_REGEX, '$1-$2'))
                                .uniq()
                                .value().length;
                            const totalDistance = _.chain(bikeEvents)
                                .map(e => e.dist).filter(n => _.isNumber(n) && !_.isNaN(n))
                                .reduce((sum, dist) => sum + dist, 0).value();
                            const avgDist = totalDistance / monthCount;

                            return {
                                label: `${bike.name} average`,
                                borderColor: bike.borderColor,
                                data: months.map(() => avgDist),
                                yAxisID: "km",
                                type: 'line',
                                fill: false,
                                radius: 0
                            };
                        })
                    );
                },
                labels(events) {
                    return monthsWithEvents(_.filter(events, {type: 'FUEL'})).map(m => MONTH_NAMES[parseInt(m) - 1])
                }
            },
            seasonsMilageByMonth: {
                title: 'Ajokausien keskikulutukset kuukausittain',
                yAxes: [
                    {id: 'milage', type: 'linear'}
                ],
                datasets(events) {
                    const fuelEvents = _.filter(events, {type: 'FUEL'});
                    const months = monthsWithEvents(fuelEvents);
                    const seasons = seasonsWithEvents(fuelEvents);
                    return seasons.map(season => {
                        const seasonEvents = _.filter(fuelEvents, e => e.date.replace(DATE_REGEX, '$1') === season);
                        const seasonBikes = _.chain(seasonEvents).map(e => e.bike).uniq().sort().value().join(', ');
                        const distance = _.reduce(seasonEvents, (sum, event) => sum + _.get(event, 'dist', 0), 0);
                        const borderColor = _.get(_.filter(local.bikes, {name: seasonBikes}), '[0].borderColor', 'rgb(183,184,182,0.3)');
                        return {
                            label: `${season}, ${seasonBikes} (${distance} km)`,
                            borderColor: borderColor,
                            data: months.map(m => milageByMonth(seasonEvents, m)),
                            type: 'line',
                            fill: false,
                            yAxisID: "milage"
                        };
                    }).concat(
                        local.bikes.map(bike => {
                            const bikeEvents = _.filter(fuelEvents, {bike: bike.name});
                            const totalDistance = _.chain(bikeEvents)
                                .map(e => e.dist)
                                .filter(n => _.isNumber(n) && !_.isNaN(n))
                                .reduce((sum, dist) => sum + dist, 0).value();
                            const totalFuel = _.chain(bikeEvents)
                                .map(e => e.fuelused)
                                .filter(n => _.isNumber(n) && !_.isNaN(n))
                                .reduce((sum, fuel) => sum + fuel, 0).value();
                            const avgMilage = 100 * totalFuel / totalDistance;

                            return {
                                label: `${bike.name} average`,
                                borderColor: bike.borderColor,
                                data: months.map(() => avgMilage),
                                type: 'line',
                                fill: false,
                                yAxisID: "milage",
                                radius: 0
                            };
                        })
                    );
                },
                labels(events) {
                    return monthsWithEvents(_.filter(events, {type: 'FUEL'})).map(m => MONTH_NAMES[parseInt(m) - 1])
                }
            }
        },
        bikes: []
    };

    function monthsWithEvents(fuelEvents) {
        return _.chain(fuelEvents)
            .map(e => e.date)
            .map(d => d.replace(DATE_REGEX, '$2'))
            .uniq()
            .sort()
            .value();
    }

    function seasonsWithEvents(fuelEvents) {
        return _.chain(fuelEvents)
            .map(e => e.date)
            .map(d => d.replace(DATE_REGEX, '$1'))
            .uniq()
            .sort()
            .reverse()
            .value();
    }

    function byMonth(month) {
        return e => e.date.replace(DATE_REGEX, '$2') === month;
    }

    function bySeason(season) {
        return e => e.date.replace(DATE_REGEX, '$1') === season;
    }

    function countDistance(events, filter) {
        const dist = _.chain(events)
            .filter(filter)
            .map(e => e.dist)
            .filter(dist => _.isNumber(dist))
            .reduce((sum, dist) => sum + dist, 0)
            .value();
        return dist && dist > 30 ? dist : undefined;
    }

    function countFuel(events, filter) {
        const fuel = _.chain(events)
            .filter(filter)
            .map(e => e.fuelused)
            .filter(fuel => _.isNumber(fuel))
            .reduce((sum, fuel) => sum + fuel, 0)
            .value();
        return fuel && fuel > 5 ? fuel : undefined;
    }

    function milageByMonth(events, month) {
        const fuel = countFuel(events, byMonth(month));
        const dist = countDistance(events, byMonth(month));

        return (dist && fuel && dist > 30) ? 100 * fuel / dist : undefined;
    }

    export default {
        name: 'Stats',
        data() {
            const global = GasLogData.get();
            local.selectedStatistic = 'compareBikes'; //'compareBikesByMonth';
            local.bikes = _.chain(global.events)
                .filter({type: 'FUEL'})
                .map(e => e.bike)
                .uniq()
                .sort()
                .map(bike => ({
                    name: bike,
                    borderColor: nextColor(),
                    backgroundColor: currentColor(0.6)
                })).value();
            return {local, global};
        },
        components: {
            BarChart
        },
        methods: {
            chartOptions() {
                return {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        yAxes: local.statisticOptions[local.selectedStatistic].yAxes
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            },
            chartData(events) {
                const stat = local.statisticOptions[local.selectedStatistic];
                return {
                    labels: stat.labels(events),
                    datasets: stat.datasets(events)
                }
            }
        }
    }

</script>

<style scoped>

    .filters {
        font-weight: bold;
        text-align: center;
        margin: 20px;
    }

    .filters select {
        font-size: large;
        padding: 5px 20px;
    }

</style>