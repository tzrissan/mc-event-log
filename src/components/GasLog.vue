<template>
    <div>
        <gas-log-filter-selector v-bind:filters="local.filters"/>
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
    </div>
</template>

<script>
    import _ from 'lodash';
    import GasLogData from '../data.js'
    import ColumnSortIndicator from "./ColumnSortIndicator";
    import GasLogFilterSelector from "./GasLogFilterSelector";

    const local = {
        sort: 'date',
        sortAsc: false,
        filters: [{date: {title: "2018", year: "2018", regex: /2018-..-../}}, {bike: 'versys'}]
    };

    export default {
        name: 'GasLog',
        components: {GasLogFilterSelector, ColumnSortIndicator},
        data: function () {
            return {
                local,
                global: GasLogData.get()
            };
        },
        methods: {
            fuelEvents: (events) => {
                let filteredEvents = events.filter(event => event.type === 'FUEL');
                local.filters
                    .map(filter => {
                        if (filter.date) {
                            return (e) => ('' + e.date).match(filter.date.regex);
                        } else {
                            return filter;
                        }
                    })
                    .forEach(filter => {
                        filteredEvents = _.filter(filteredEvents, filter)
                    });
                return filteredEvents
            },
            sortEvents: (events, sort, asc) => {
                const sorted = _.sortBy(events, sort);
                return asc ? sorted : sorted.reverse();
            },
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
        white-space: nowrap;
        border-left: 1px solid lightgray;
    }

    td {
        padding: 0 5px;
    }

    th {
        padding: 5px 10px;
    }

    td:first-child {
        border-left: 1px solid black;
    }

    tr:first-child td {
        padding-top: 3px;
    }
    tr:last-child td {
        padding-bottom: 3px;
    }

    th {
        text-align: center;
        border: 1px solid black;
    }

    .info {
        white-space: pre-wrap;
        text-align: left;
        border-left: 1px solid black;
    }

    .amount {
        display: inline-block;
    }

    .unit {
        display: inline-block;
        font-size: 0.5em;
        line-height: 0.9em;
        padding-top: 0.1em;
        margin-left: 3px;
        text-align: left;
    }

</style>