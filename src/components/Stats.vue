<template>
    <div>
        <div class="title">Kuukausittain yhteensä</div>
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
    import {nextColor, currentColor} from './ChartColors'

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

    function defaultDatasets(fuelEvents) {
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
    }

    const local = {
        selectedStatistic: 'all',
        statisticOptions: {
            all: {
                title: 'Kaikki yhteensä',
                yAxes: defaultYAxes,
                filter: () => true,
                datasets: defaultDatasets
            },
            compare: {
                title: 'Pyörien vertailu',
                yAxes: defaultYAxes.filter(yaxis => yaxis.id === 'milage' || yaxis.id === 'km' ),
                filter: () => true,
                datasets(fuelEvents, local) {
                    const months = monthsWithEvents(fuelEvents);
                    const datasets = [];
                    local.bikes.forEach(bike => {
                        const bikeEvents = _.filter(fuelEvents, {bike});
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
                    return datasets;
                }
            },
            seasonsDistance: {
                title: 'Matkat ajokausittain',
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
                        return {
                            label: `${season}, ${seasonBikes} (${distance} km)`,
                            borderColor: nextColor(),
                            backgroundColor: currentColor(0.6),
                            data: months.map(m => distByMonth(seasonEvents, m)),
                            yAxisID: "km",
                            type: 'line'
                        };
                    });
                }
            },
            seasonsMilage: {
                title: 'Kulutukset ajokausittain',
                yAxes: defaultYAxes.filter(yaxis => yaxis.id === 'milage'),
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
                }
            }
        }
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
        const fuel = fuelByMonth(events, month);
        const dist = distByMonth(events, month);
        const milage = 100 * fuel / dist;
        if (dist < 50) return undefined;
        return milage > 0 ? milage : undefined;
    }

    export default {
        name: 'Stats',
        data() {
            const global = GasLogData.get();
            local.selectedStatistic = global.latestBike;
            local.bikes = _.chain(global.events).filter({type: 'FUEL'}).map(e => e.bike).uniq().sort().value();
            local.bikes.forEach(bike => {
                local.statisticOptions[bike] = {
                    title: bike,
                    yAxes: defaultYAxes,
                    filter: { bike },
                    datasets: defaultDatasets
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
                const fuelEvents = _.chain(events)
                    .filter({type: 'FUEL'})
                    .filter(local.statisticOptions[local.selectedStatistic].filter)
                    .value();
                return {
                    labels: monthsWithEvents(fuelEvents).map(m => MONTH_NAMES[parseInt(m) - 1]),
                    datasets: local.statisticOptions[local.selectedStatistic].datasets(fuelEvents, local)
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