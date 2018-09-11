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
                v-if="isCurrentStatType(local.selectedStatistic, 'bar')"
                v-bind:data="chartData"
                v-bind:options="chartOptions"></BarChart>
        <PieChart
                v-if="isCurrentStatType(local.selectedStatistic, 'pie')"
                v-bind:data="chartData"
                v-bind:options="chartOptions"></PieChart>
    </div>

</template>

<script>
    import _ from 'lodash';
    import GasLogData from '../data';
    import {MONTH_NAMES, DATE_REGEX} from '../data';
    import {CHART_COLORS, nextColor, currentColor} from './ChartColors';
    import BarChart from './BarChart';
    import PieChart from './PieChart';


    const local = {
        selectedStatistic: 'seasonsDistanceByMonth',
        statisticOptions: {
            compareBikes: {
                title: 'Pyörät',
                type: 'pie',
                yAxes: [ ],
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

                    function seasonCount(bike, events) {
                        return _.chain(events)
                            .filter({bike})
                            .map(e => e.date)
                            .map(d=>d.replace(DATE_REGEX, '$1'))
                            .uniq()
                            .value().length;
                    }

                    return [{
                        label: `kilometriä`,
                        borderColor: local.allBikes.map(bike => bike.borderColor),
                        backgroundColor: local.allBikes.map(bike => bike.backgroundColor),
                        data: global.bikes.map(bike => totalDistance(bike, events))
                    }, {
                        label: `litraa`,
                        borderColor: local.allBikes.map(bike => bike.borderColor),
                        backgroundColor: local.allBikes.map(bike => bike.backgroundColor),
                        data: global.bikes.map(bike => totalFuel(bike, events))
                    }, {
                        label: `ajokausia`,
                        borderColor: local.allBikes.map(bike => bike.borderColor),
                        backgroundColor: local.allBikes.map(bike => bike.backgroundColor),
                        data: global.bikes.map(bike => seasonCount(bike, events))
                    }]
                },
                labels() {
                    return GasLogData.get().bikes;
                }
            },
            compareBikesByMonth: {
                title: 'Pyörät kuukausittain',
                type: 'bar',
                yAxes: [
                    {id: 'km', type: 'linear', position: 'left'},
                    {id: 'ltr', type: 'linear', position: 'left', gridLines: {display: false}},
                    {id: 'milage', type: 'linear', position: 'right', gridLines: {display: false}}
                ],
                datasets(events) {
                    const fuelEvents = _.filter(events, {type: 'FUEL'});
                    const months = monthsWithEvents(fuelEvents);
                    const datasets = [];
                    local.fuelledBikes.forEach(bike => {
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
                            label: `${bike.name}, käytetty polttoaine`,
                            borderColor: bike.borderColor,
                            backgroundColor: bike.backgroundColor,
                            data: months.map(m => countFuel(bikeEvents, byMonth(m))),
                            hidden: true,
                            yAxisID: "ltr"
                        });
                        datasets.push({
                            label: `${bike.name}, litraa satasella`,
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
                type: 'bar',
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
                            yAxisID: "ltr",
                            hidden: true
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
                type: 'bar',
                yAxes: [
                    {id: 'km', type: 'linear', position: 'left', ticks: {min: 0}},
                    {id: 'ltr', type: 'linear', position: 'left', gridLines: {display: false}, ticks: {min: 0}},
                    {id: 'milage', type: 'linear', position: 'right', gridLines: {display: false}}
                ],
                datasets(events) {

                    function totalDistance(season, events) {
                        const seasonEvents = _.filter(events, bySeason(season));
                        const seasonBikes = _.chain(seasonEvents).map(e => e.bike).uniq().value();

                        return seasonBikes.map(bike => {
                            const bikeEvents = _.filter(seasonEvents, {bike});
                            const minOdo = _.chain(bikeEvents).map(e => e.odo).min().value();
                            const maxOdo = _.chain(bikeEvents).map(e => e.odo).max().value();
                            return maxOdo - minOdo;
                        }).reduce((sum, dist) => _.isNumber(dist) && !_.isNaN(dist) ? sum + dist : sum, 0);
                    }

                    const fuelEvents = _.filter(events, {type: 'FUEL'});
                    const seasons = seasonsWithEvents(events).reverse();
                    const distances = seasons.map(s => totalDistance(s, events));
                    const fuels = seasons.map(s => countFuel(fuelEvents, bySeason(s)));
                    const milages = _.zip(fuels, distances).map(z => (100 * z[0] / z[1]));
                    const avgDistance = (distances.reduce((s, d) => s + d, 0) / distances.length).toFixed(0);
                    const avgFuel = _.chain(fuels)
                        .filter(f => _.isNumber(f) && !_.isNaN(f))
                        .reduce((acc, fuel) => ({
                            sum: acc.sum + fuel,
                            count: acc.count + 1,
                            avg() { return this.sum / this.count }
                        }), {sum: 0.0, count: 0})
                        .value().avg()
                        .toFixed();
                    const avgMilage = _.chain(_.zip(fuels, distances))
                        .filter(z => _.isNumber(z[0]) && !_.isNaN(z[0]))
                        .filter(z => _.isNumber(z[1]) && !_.isNaN(z[1]))
                        .reduce((acc, z) => ({
                            fuel: acc.fuel + z[0],
                            dist: acc.dist + z[1],
                            milage() { return 100 * this.fuel / this.dist }
                        }), {fuel: 0, dist: 0})
                        .value().milage().toFixed(2);
                    return [{
                        label: `kilometriä`,
                        borderColor: CHART_COLORS.blue(),
                        backgroundColor: CHART_COLORS.blue(0.6),
                        type: 'line',
                        data: distances,
                        yAxisID: "km"
                    }, {
                        label: `litraa`,
                        borderColor: CHART_COLORS.pink(),
                        backgroundColor: CHART_COLORS.pink(0.6),
                        data: fuels,
                        hidden: true,
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
                        hidden: true,
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
                    return seasonsWithEvents(events).reverse();
                }
            },
            seasonsDistanceByMonth: {
                title: 'Ajokausien matkat kuukausittain',
                type: 'bar',
                yAxes: [
                    {id: 'km', type: 'linear'}
                ],
                datasets(events, latestBike) {
                    const fuelEvents = _.filter(events, {type: 'FUEL'});
                    const months = monthsWithEvents(fuelEvents);
                    const seasons = seasonsWithEvents(fuelEvents);
                    return seasons.map(season => {
                        const seasonEvents = _.filter(fuelEvents, bySeason(season));
                        const seasonBikes = _.chain(seasonEvents).map(e => e.bike).uniq().sort().value().join(', ');
                        const distance = _.reduce(seasonEvents, (sum, event) => sum + _.get(event, 'dist', 0), 0);
                        const backgroundColor = _.get(_.filter(local.fuelledBikes, {name: seasonBikes}), '[0].backgroundColor', 'rgb(183,184,182,0.3)');
                        return {
                            label: `${season}, ${seasonBikes} (${distance} km)`,
                            borderColor: nextColor(),
                            backgroundColor: backgroundColor,
                            data: months.map(m => countDistance(seasonEvents, byMonth(m))),
                            yAxisID: "km",
                            hidden: !seasonBikes.includes(latestBike),
                            type: 'line'
                        };
                    }).concat(
                        local.fuelledBikes.map(bike => {
                            const bikeEvents = _.filter(fuelEvents, {bike: bike.name});
                            const monthCount = _.chain(bikeEvents)
                                .map(e => e.date)
                                .map(d => d.replace(DATE_REGEX, '$1-$2'))
                                .uniq()
                                .value().length;
                            const totalDistance = _.chain(bikeEvents)
                                .map(e => e.dist).filter(n => _.isNumber(n) && !_.isNaN(n))
                                .reduce((sum, dist) => sum + dist, 0).value();
                            const avgDist = parseFloat((totalDistance / monthCount).toFixed());

                            return {
                                label: `${bike.name} average (${avgDist} km)`,
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
            seasonsDistanceSumByMonth: {
                title: 'Ajokausien matkat yhteensä kuukausittain',
                type: 'bar',
                yAxes: [
                    {id: 'km', type: 'linear'}
                ],
                datasets(events, latestBike) {
                    const fuelEvents = _.filter(events, {type: 'FUEL'});
                    const months = monthsWithEvents(fuelEvents);
                    const seasons = seasonsWithEvents(fuelEvents);
                    return seasons.map(season => {
                        const seasonEvents = _.filter(fuelEvents, bySeason(season));
                        const seasonBikes = _.chain(seasonEvents).map(e => e.bike).uniq().sort().value().join(', ');
                        const seasonTotalDist = _.reduce(seasonEvents, (sum, event) => sum + _.get(event, 'dist', 0), 0);
                        const backgroundColor = _.get(_.filter(local.fuelledBikes, {name: seasonBikes}), '[0].backgroundColor', 'rgb(183,184,182,0.3)');
                        const data = months.map(m => countDistance(seasonEvents, byMonth(m)))
                            .reduce((acc, dist) => {
                                if (acc.length === 0 || !_.isNumber(acc[acc.length - 1]) || _.isNaN(acc[acc.length - 1])) {
                                    acc.push(_.isNumber(dist) && !_.isNaN(dist) ? dist : undefined);
                                } else if (_.isNumber(dist) && !_.isNaN(dist)) {
                                    acc.push(acc[acc.length - 1] + dist);
                                } else {
                                    acc.push(undefined);
                                }
                                return acc;
                            }, []);
                        return {
                            label: `${season}, ${seasonBikes} (${seasonTotalDist} km)`,
                            borderColor: nextColor(),
                            backgroundColor: backgroundColor,
                            data,
                            hidden: !seasonBikes.includes(latestBike),
                            yAxisID: "km",
                            type: 'line'
                        };
                    });
                },
                labels(events) {
                    return monthsWithEvents(_.filter(events, {type: 'FUEL'})).map(m => MONTH_NAMES[parseInt(m) - 1])
                }
            },
            seasonsMilageByMonth: {
                title: 'Ajokausien keskikulutukset kuukausittain',
                type: 'bar',
                yAxes: [
                    {id: 'milage', type: 'linear'}
                ],
                datasets(events, latestBike) {
                    const fuelEvents = _.filter(events, {type: 'FUEL'});
                    const months = monthsWithEvents(fuelEvents);
                    const seasons = seasonsWithEvents(fuelEvents);
                    return seasons.map(season => {
                        const seasonEvents = _.filter(fuelEvents, e => e.date.replace(DATE_REGEX, '$1') === season);
                        const seasonBikes = _.chain(seasonEvents).map(e => e.bike).uniq().sort().value().join(', ');
                        const distance = _.reduce(seasonEvents, (sum, event) => sum + _.get(event, 'dist', 0), 0);
                        const borderColor = _.get(_.filter(local.fuelledBikes, {name: seasonBikes}), '[0].borderColor', 'rgb(183,184,182,0.3)');
                        const backgroundColor = _.get(_.filter(local.fuelledBikes, {name: seasonBikes}), '[0].backgroundColor', 'rgb(183,184,182,0.3)');
                        return {
                            label: `${season}, ${seasonBikes} (${distance} km)`,
                            borderColor: borderColor,
                            backgroundColor: backgroundColor,
                            data: months.map(m => milageByMonth(seasonEvents, m)),
                            hidden: !seasonBikes.includes(latestBike),
                            type: 'line',
                            fill: false,
                            yAxisID: "milage"
                        };
                    }).concat(
                        local.fuelledBikes.map(bike => {
                            const bikeEvents = _.filter(fuelEvents, {bike: bike.name});
                            const totalDistance = _.chain(bikeEvents)
                                .map(e => e.dist)
                                .filter(n => _.isNumber(n) && !_.isNaN(n))
                                .reduce((sum, dist) => sum + dist, 0).value();
                            const totalFuel = _.chain(bikeEvents)
                                .map(e => e.fuelused)
                                .filter(n => _.isNumber(n) && !_.isNaN(n))
                                .reduce((sum, fuel) => sum + fuel, 0).value();
                            const avgMilage = parseFloat(( 100 * totalFuel / totalDistance).toFixed(2));

                            return {
                                label: `${bike.name} average (${avgMilage} litraa satasella)`,
                                borderColor: bike.borderColor,
                                backgroundColor: bike.backgroundColor,
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
        allBikes: [],
        fuelledBikes: []
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
            .filter(fuel => _.isNumber(fuel) && !_.isNaN(fuel))
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
        components: {
            PieChart,
            BarChart
        },
        data() {
            const global = GasLogData.get();
            local.allBikes = _.chain(global.events)
                .map(e => e.bike)
                .uniq()
                .sort()
                .map(bike => ({
                    name: bike,
                    borderColor: nextColor(),
                    backgroundColor: currentColor(0.6)
                })).value();

            local.fuelledBikes = _.chain(global.events)
                .filter({type: 'FUEL'})
                .map(e => e.bike)
                .uniq()
                .sort()
                .map(bike => _.find(local.allBikes, {name: bike}))
                .value();

            return {local, global};
        },
        methods: {
            isCurrentStatType(selected, typeToTest) {
                return local.statisticOptions[selected].type === typeToTest;
            }
        },
        computed: {
            chartOptions() {
                return {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        yAxes: this.local.statisticOptions[this.local.selectedStatistic].yAxes
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            },
            chartData() {
                const stat = this.local.statisticOptions[this.local.selectedStatistic];
                return {
                    labels: stat.labels(this.global.events),
                    datasets: stat.datasets(this.global.events, this.global.latestBike)
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