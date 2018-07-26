<template>
    <table>
        <thead>
        <tr>
            <th>pvm</th>
            <th>odo</th>
            <th>matka</th>
            <th>fuel</th>
            <th>kulutus</th>
            <th>bike</th>
            <th class="info">info</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="event in sortEvents(fuelEvents(events))" v-bind:key="event.bike + event.odo">
            <td>{{ event.date | moment("D.M.YYYY") }}</td>
            <td>{{ event.odo }}
                <small>km</small>
            </td>
            <td>{{ event.dist }}
                <small v-if="event.dist">km</small>
            </td>
            <td v-if="event.fuelused === event.fuelfilled">{{ event.fuelused }}
                <small>ltr</small>
            </td>
            <td v-if="event.fuelused !== event.fuelfilled">
                <span v-bind:title="'Tankattu ' + event.fuelfilled + ' ltr'"><small>&#x26A0;</small> {{ event.fuelused }} <small>ltr</small></span>
            </td>
            <td class="milage">
                <div class="unit" v-if="event.milage">litraa/<br/>100km</div>
                <div class="amount">{{ event.milage }}</div>
                <span v-if="!event.milage">-</span>
            </td>
            <td>{{ event.bike }}</td>
            <td class="info">{{ event.info }}</td>
        </tr>
        </tbody>
    </table>
</template>

<script>
    import _ from 'lodash';
    import GasLogData from '../data.js'

    export default {
        name: 'GasLog',
        data: function () {
            return GasLogData.get();
        },
        methods: {
            fuelEvents: (events) => events.filter(event => event.type === 'FUEL'),
            sortEvents: (events, sort = 'date', asc = false) => {
                const sorted = _.sortBy(events, sort);
                return asc ? sorted : sorted.reverse();
            }
        }
    }
</script>

<style scoped>
    table {
        border: 1px solid black;
        margin: 0;
        border-collapse: collapse;
        text-align: right;
        width: 100%;
    }

    tr:nth-child(even) {
        background: #EEE;
    }

    th, td {
        margin: 0;
        padding: 0 5px;
        white-space: nowrap;
    }

    th:last-child, td:last-child {
        padding: 0 15px 0 5px;
        border-left: 1px solid black;
    }

    th {
        border-bottom: 1px solid black;
    }

    .info {
        white-space: pre-wrap;
        text-align: left;
    }

    .amount {
        float: right;
        clear: none;
    }

    .unit {
        float: right;
        clear: none;
        font-size: 0.5em;
        line-height: 0.9em;
        padding-top: 0.1em;
    }

</style>