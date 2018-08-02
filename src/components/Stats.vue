<template>
    <div>
        <div class="filters" v-if="global">
            <select v-model="local.selectedStatistic">
                <option
                        v-for="(stat, name) in local.statisticOptions"
                        v-bind:key="name"
                        v-bind:value="name">{{ stat.title }}</option>
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

    const defaultYAxes = [
        { id: 'km',  type: 'linear', position: 'left' },
        { id: 'ltr', type: 'linear', position: 'left', gridLines: { display: false }},
        { id: 'milage', type: 'linear', position: 'right', gridLines: { display: false }}
    ];

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

    const local = {
        selectedStatistic: 'all',
        statisticOptions: {
            allByMonth: {
                title: 'Yhteensä kuukausittain',
                yAxes: defaultYAxes,
                filter: () => true,
                datasets(fuelEvents) {
                    const months = monthsWithEvents(fuelEvents);
                    return [
                        {
                            label: 'Ajettu matka',
                            borderColor: 'rgb(76, 181, 245)',
                            backgroundColor: 'rgb(76, 181, 245, 0.6)',
                            data: months.map(m => distByMonth(fuelEvents, m)),
                            yAxisID: "km",
                            type: 'line',
                        },
                        {
                            label: 'Käytetty polttoaine',
                            borderColor: 'rgb(255, 105, 180)',
                            backgroundColor: 'rgb(255, 105, 180, 0.6)',
                            data: months.map(m => fuelByMonth(fuelEvents, m)),
                            type: 'line',
                            fill: false,
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
                labels(fuelEvents) {
                    return monthsWithEvents(fuelEvents).map(m => MONTH_NAMES[parseInt(m) - 1])
                }
            },
            compare: {
                title: 'Pyörien vertailu',
                yAxes: defaultYAxes.filter(yaxis => yaxis.id === 'milage' || yaxis.id === 'km' ),
                filter: () => true,
                datasets(fuelEvents, local) {
                    const months = monthsWithEvents(fuelEvents);
                    const datasets = [];
                    local.bikes.forEach(bike => {
                        const bikeEvents = _.filter(fuelEvents, {bike: bike.name});
                        datasets.push({
                            label: `${bike.name}, ajettu matka`,
                            borderColor: bike.borderColor,
                            backgroundColor: bike.backgroundColor,
                            data: months.map(m => distByMonth(bikeEvents, m)),
                            yAxisID: "km",
                            type: 'line'
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
                labels(fuelEvents) {
                    return monthsWithEvents(fuelEvents).map(m => MONTH_NAMES[parseInt(m) - 1])
                }
            },
            seasonsDistance: {
                title: 'Ajokauden matkat kukausittain',
                yAxes: [ defaultYAxes[0] ],
                filter: () => true,
                datasets(fuelEvents) {
                    const months = monthsWithEvents(fuelEvents);
                    const seasons = _.chain(fuelEvents)
                        .map(e => e.date)
                        .map(d => d.replace(DATE_REGEX, '$1'))
                        .uniq()
                        .sort()
                        .reverse()
                        .value();
                    return seasons.map(season => {
                        const seasonEvents = _.filter(fuelEvents, e => e.date.replace(DATE_REGEX, '$1') === season);
                        const seasonBikes = _.chain(seasonEvents).map(e => e.bike).uniq().sort().value().join(', ');
                        const distance = _.reduce(seasonEvents, (sum, event) => sum + _.get(event, 'dist', 0), 0);
                        const backgroundColor = _.get(_.filter(local.bikes, {name: seasonBikes}), '[0].backgroundColor', 'rgb(183,184,182,0.3)');
                        return {
                            label: `${season}, ${seasonBikes} (${distance} km)`,
                            borderColor: nextColor(),
                            backgroundColor: backgroundColor,
                            data: months.map(m => distByMonth(seasonEvents, m)),
                            yAxisID: "km",
                            type: 'line'
                        };
                    });
                },
                labels(fuelEvents) {
                    return monthsWithEvents(fuelEvents).map(m => MONTH_NAMES[parseInt(m) - 1])
                }
            },
            seasonsMilage: {
                title: 'Ajokausien keskikulutukset ajokausittain',
                yAxes: defaultYAxes.filter(yaxis => yaxis.id === 'milage'),
                filter: () => true,
                datasets(fuelEvents) {
                    const months = monthsWithEvents(fuelEvents);
                    const seasons = seasonsWithEvents(fuelEvents);
                    return seasons.map(season => {
                        const seasonEvents = _.filter(fuelEvents, e => e.date.replace(DATE_REGEX, '$1') === season);
                        const seasonBikes = _.chain(seasonEvents).map(e => e.bike).uniq().sort().value().join(', ');
                        const distance = _.reduce(seasonEvents, (sum, event) => sum + _.get(event, 'dist', 0), 0);
                        return {
                            label: `${season}, ${seasonBikes} (${distance} km)`,
                            borderColor: nextColor(),
                            backgroundColor: currentColor(0.6),
                            data: months.map(m => milageByMonth(seasonEvents, m)),
                            type: 'line',
                            fill: false,
                            yAxisID: "milage"
                        };
                    });
                },
                labels(fuelEvents) {
                    return monthsWithEvents(fuelEvents).map(m => MONTH_NAMES[parseInt(m) - 1])
                }
            }
        },
        bikes: []
    };

    function byMonth(month) {
        return e => e.date.replace(DATE_REGEX, '$2') === month;
    }

    function distByMonth(events, month) {
        const dist = _.chain(events)
            .filter(byMonth(month))
            .map(e => e.dist)
            .filter(dist => _.isNumber(dist))
            .reduce((sum, dist) => sum + dist, 0)
            .value();
        return dist && dist > 30 ? dist : undefined;
    }

    function fuelByMonth(events, month) {
        const fuel = _.chain(events)
            .filter(byMonth(month))
            .map(e => e.fuelused)
            .filter(fuel => _.isNumber(fuel))
            .reduce((sum, fuel) => sum + fuel, 0)
            .value();
        return fuel && fuel > 5 ? fuel : undefined;
    }

    function milageByMonth(events, month) {
        const fuel = fuelByMonth(events, month);
        const dist = distByMonth(events, month);

        return (dist && fuel && dist > 30) ? 100 * fuel / dist : undefined;
    }

    export default {
        name: 'Stats',
        data() {
            const global = GasLogData.get();
            local.selectedStatistic = global.latestBike;
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
            local.bikes.forEach(bike => {
                local.statisticOptions[bike.name] = {
                    title: bike.name,
                    yAxes: defaultYAxes,
                    filter: { bike: bike.name },
                    datasets(fuelEvents) {
                        const months = monthsWithEvents(fuelEvents);
                        return [
                            {
                                label: 'Ajettu matka',
                                borderColor: bike.borderColor,
                                backgroundColor: bike.backgroundColor,
                                data: months.map(m => distByMonth(fuelEvents, m)),
                                yAxisID: "km",
                                type: 'line',
                            },
                            {
                                label: 'Käytetty polttoaine',
                                borderColor: CHART_COLORS.pink(),
                                backgroundColor: CHART_COLORS.pink(0.6),
                                data: months.map(m => fuelByMonth(fuelEvents, m)),
                                type: 'line',
                                fill: false,
                                yAxisID: "ltr"
                            },
                            {
                                label: 'Litraa satasella',
                                borderColor: CHART_COLORS.yellow(),
                                backgroundColor: CHART_COLORS.yellow(0.6),
                                data: months.map(m => milageByMonth(fuelEvents, m)),
                                type: 'line',
                                fill: false,
                                yAxisID: "milage"
                            }
                        ];
                    },
                    labels(fuelEvents) {
                        return monthsWithEvents(fuelEvents).map(m => MONTH_NAMES[parseInt(m) - 1])
                    }
                }
            });
            return { local, global };
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
                const fuelEvents = _.chain(events)
                    .filter({type: 'FUEL'})
                    .filter(stat.filter)
                    .value();
                return {
                    labels: stat.labels(fuelEvents, local),
                    datasets: stat.datasets(fuelEvents, local)
                }
            }
        }
    }

</script>

<style scoped>

    .filters {
        font-size: x-large;
        font-weight: bold;
        text-align: center;
        margin: 20px;
    }

</style>