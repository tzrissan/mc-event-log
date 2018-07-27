<template>
    <div>
        <div class="settings" v-on:click="toggleShowFilters"><div/><div/><div/></div>
        <table>
            <thead>
            <tr>
                <th v-on:click="toggleSort('date')">pvm <column-sort-indicator v-if="local.sort==='date'" v-bind:asc="local.sortAsc"/></th>
                <th v-on:click="toggleSort('odo')">odo <column-sort-indicator v-if="local.sort==='odo'" v-bind:asc="local.sortAsc"/></th>
                <th v-on:click="toggleSort('dist')">matka <column-sort-indicator v-if="local.sort==='dist'" v-bind:asc="local.sortAsc"/></th>
                <th v-on:click="toggleSort('fuelused')">fuel <column-sort-indicator v-if="local.sort==='fuelused'" v-bind:asc="local.sortAsc"/></th>
                <th v-on:click="toggleSort('milage')">kulutus <column-sort-indicator v-if="local.sort==='milage'" v-bind:asc="local.sortAsc"/></th>
                <th v-on:click="toggleSort('bike')">bike <column-sort-indicator v-if="local.sort==='bike'" v-bind:asc="local.sortAsc"/></th>
                <th v-on:click="toggleSort('info')" class="info">info <column-sort-indicator v-if="local.sort==='info'" v-bind:asc="local.sortAsc"/>
                </th>
            </tr>

            </thead>
            <tbody>
            <tr v-for="event in sortEvents(fuelEvents(global.events), local.sort, local.sortAsc)" v-bind:key="event.bike + event.odo">
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
                <td v-else>
                    <span v-bind:title="'Tankattu ' + event.fuelfilled + ' ltr'"><small>&#x26A0;</small> {{ event.fuelused }} <small>ltr</small></span>
                </td>
                <td class="milage">
                    <div class="amount" v-if="event.milage">{{ event.milage }}</div>
                    <div class="unit" v-if="event.milage">litraa/<br/>100km</div>
                    <span v-else>-</span>
                </td>
                <td>{{ event.bike }}</td>
                <td class="info">{{ event.info }}</td>
            </tr>
            </tbody>
        </table>
        <div class="filter-modal" v-if="local.showFilters">
            <h1>Suodata</h1>
            <div class="grid-container">
                <div class="grid-item">Päivä</div>
                <div class="grid-item">Kuukausi</div>
                <div class="grid-item">Vuosi</div>
                <div class="grid-item">Pyörä</div>
                <div class="grid-item">Odo</div>
                <div class="grid-item">Info</div>
            </div>
            <h1>Laske summat</h1>
            <div class="grid-container">
                <div class="grid-item">Päivä</div>
                <div class="grid-item">Kuukausi</div>
                <div class="grid-item">Vuosi</div>
                <div class="grid-item">Pyörä</div>
            </div>
        </div>
    </div>
</template>

<script>
    import _ from 'lodash';
    import GasLogData from '../data.js'
    import ColumnSortIndicator from "./ColumnSortIndicator";

    const local = {
        showFilters: false,
        sort: 'date',
        sortAsc: false
    };

    export default {
        name: 'GasLog',
        components: {ColumnSortIndicator},
        data: function () {
            return {
                local,
                global: GasLogData.get()
            };
        },
        methods: {
            fuelEvents: (events) => events.filter(event => event.type === 'FUEL'),
            sortEvents: (events, sort, asc) => {
                const sorted = _.sortBy(events, sort);
                return asc ? sorted : sorted.reverse();
            },
            toggleShowFilters: () => { local.showFilters = !local.showFilters; },
            toggleSort: (sort) => {
                if (local.sort === sort) {
                    local.sortAsc = !local.sortAsc;
                } else {
                    local.sort = sort;
                }
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

    thead {
        background: #EEE;
    }

    tbody tr:nth-child(even) {
        background: #EEE;
    }

    th, td {
        margin: 0;
        padding: 0 5px;
        white-space: nowrap;
        border-left: 1px solid lightgray;
    }

    th:last-child, td:last-child {
        padding: 0 15px 0 5px;
        border-left: 1px solid black;
    }

    th {
        text-align: center;
        border: 1px solid black;
    }

    .info {
        white-space: pre-wrap;
        text-align: left;
    }

    .amount {
        display: inline-block;
    }

    .unit {
        display: inline-block;
        font-size: 0.5em;
        line-height: 0.9em;
        padding-top: 0.1em;
    }

    .settings {
        float: right;
    }

    .settings div {
        width: 20px;
        height: 3px;
        background-color: black;
        margin: 2px 0;
    }

    .filter-modal {
        border: 2px solid black;
        z-index: 50;
        width: 80vw;
        height: 80vh;
        top: 10vh;
        left: 10vw;
        position: fixed;
        background-color: white;
        padding: 10px;
    }

    .grid-container {
        display: grid;
        grid-template-columns: auto auto auto;
        grid-row-gap: 5px;
        grid-column-gap: 5px;
    }
    .grid-item {
        background-color: rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(0, 0, 0, 0.8);
        text-align: center;
    }


</style>