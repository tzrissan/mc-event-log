<template>
    <div>
        <div class="title">Kuukausittain yhteensä</div>
        <BarChart
                v-bind:data="computedData(global.events)"
                v-bind:options="options"></BarChart>
    </div>

</template>

<script>
    import _ from 'lodash';
    import GasLogData from '../data.js'
    import {MONTH_NAMES, DATE_REGEX} from '../data.js'
    import BarChart from './BarChart'

    export default {
        name: 'Stats',
        data() {
            return {
                global: GasLogData.get(),
                options: {
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
                                    display:false
                                }
                            },
                            {
                                id: 'milage',
                                type: 'linear',
                                position: 'right',
                                gridLines: {
                                    display:false
                                }
                            }

                        ]
                    },
                    animation: {
                        duration: false
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        },
        components: {
            BarChart
        },
        methods: {
            computedData(events) {

                const fuelEvents = _.filter(events, {type: 'FUEL'});

                const months = _.chain(fuelEvents)
                    .map(e => e.date)
                    .map(d => d.replace(DATE_REGEX, '$2'))
                    .uniq()
                    .sort()
                    .value();

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

                return {
                    labels: months.map(m => MONTH_NAMES[parseInt(m) - 1]),
                    datasets: [
                        {
                            label: 'Ajettu matka',
                            backgroundColor: '#4CB5F5',
                            data: months.map(m => distByMonth(fuelEvents, m)),
                            yAxisID: "km"
                        },
                        {
                            label: 'Käytetty polttoaine',
                            backgroundColor: '#34675C',
                            data: months.map(m => fuelByMonth(fuelEvents, m)),
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
                    ]
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

</style>