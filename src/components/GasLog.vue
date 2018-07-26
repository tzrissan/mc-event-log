<template>
    <div class="gaslog">
        <table>
            <thead>
            <tr>
                <th>pvm</th>
                <th>odo</th>
                <th>fuel</th>
                <th>info</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="line in demo" v-bind:key="line.odo">
                <td>{{ line.date | moment("d.M.YYYY") }}</td>
                <td>{{ line.odo }} <small>km</small></td>
                <td>{{ line.fuelused }} <small>ltr</small></td>
                <td class="info">{{ line.info }}</td>
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
            return GasLogData.get();
        }
    }
</script>

<style scoped>
    table {
        border: 1px solid black;
        margin: 0;
        border-collapse: collapse;
        text-align: left;
    }
    tr:nth-child(even) {
        background: #EEE;
    }
    th, td {
        margin: 0;
        padding: 0 0 0 5px;
        white-space: pre;
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
    }
    .gaslog {
        border: 1px solid black;
        overflow-x: scroll;
        padding: 10px;
    }
</style>