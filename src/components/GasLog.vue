<template>
    <div class="gaslog">
        <table>
            <thead>
            <tr>
                <th>pvm</th>
                <th>odo</th>
                <th>fuel</th>
                <th>bike</th>
                <th>info</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="event in events" v-bind:key="event.bike + event.odo + event.type">
                <td>{{ event.date | moment("d.M.YYYY") }}</td>
                <td>{{ event.odo }} <small>km</small></td>
                <td v-if="event.fuelused === event.fuelfilled">{{ event.fuelused }} <small>ltr</small></td>
                <td v-if="event.fuelused !== event.fuelfilled">
                    <span v-bind:title="'Tankattu ' + event.fuelfilled + ' ltr'">* {{ event.fuelused }} <small>ltr</small></span>
                </td>
                <td>{{ event.bike }}</td>
                <td class="info">{{ event.info }}</td>
            </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
    import GasLogData from '../data.js'
    export default {
        name: 'GasLog',
        data: function() {
            return {
                events: GasLogData.get().events.filter(event => event.type === 'FUEL')
            };
        }
    }
</script>

<style scoped>
    table {
        border: 1px solid black;
        margin: 0;
        border-collapse: collapse;
        text-align: right;
    }
    tr:nth-child(even) {
        background: #EEE;
    }
    th, td {
        margin: 0;
        padding: 0 0 0 5px;
        white-space: nowrap;
    }
    th:last-child, td:last-child {
        padding: 0 15px 0 5px;
    }
    th {

        border-bottom: 1px solid black;
    }
    td {
    }
    .info {
        white-space: pre-wrap;
        text-align: left;
    }
    .gaslog {
        border: 1px solid black;
        overflow-x: scroll;
        padding: 10px;
    }
</style>