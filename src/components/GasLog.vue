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
                <td v-bind:class="flagStyles(event, 'dist')">{{ event.dist | number(0) }}
                    <small v-if="event.dist">km</small>
                </td>
                <td v-bind:class="flagStyles(event, 'fuelused')"
                    v-if="event.fuelused === event.fuelfilled">{{ event.fuelused | number }}
                    <small>ltr</small>
                </td>
                <td v-else>
                    <span v-bind:title="'Tankattu ' + event.fuelfilled + ' ltr'"><small>&#x26A0;</small> {{ event.fuelused | number }} <small>ltr</small></span>
                </td>
                <td class="milage" v-bind:class="flagStyles(event, 'milage')">
                    <div class="amount" v-if="event.milage">{{ event.milage | number }}</div>
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

    const currentYear = new Date().getFullYear().toString();

    const local = {
        sort: 'date',
        sortAsc: false,
        filters: [{date: {title: currentYear, year: currentYear, regex: new RegExp(`${currentYear}-..-..`)}}]
    };

    function clearFlags(events) {
        events.forEach(event => delete event.flags)
    }

    function setFlags(events, property, sanityCheck = () => true, asc = true) {
        if (events && events.length > 0) {
            let sortedEvents = _.chain(events).filter(sanityCheck).sortBy(property).value();
            if (!asc) {
                sortedEvents = sortedEvents.reverse();
            }
            _.set(_.head(sortedEvents), ['flags', property, 'best'], true);

            const top5percent = Math.max(Math.trunc(events.length * 0.05), 1);
            _.tail(sortedEvents).slice(0,top5percent).forEach(event => _.set(event, ['flags', property, 'good'], true));
            sortedEvents.filter(event =>
                _.get(event, property) * 1.05 > _.head(sortedEvents) &&
                _.get(event, property) * 0.95 < _.head(sortedEvents)
            ).forEach(event => _.set(event, ['flags', property, 'good'], true));

            sortedEvents = sortedEvents.reverse();
            _.set(_.head(sortedEvents), ['flags', property, 'worst'], true);

            _.tail(sortedEvents).slice(0,top5percent).forEach(event => _.set(event, ['flags', property, 'bad'], true));
            sortedEvents.filter(event =>
                _.get(event, property) * 1.05 > _.head(sortedEvents) &&
                _.get(event, property) * 0.95 < _.head(sortedEvents)
            ).forEach(event => _.set(event, ['flags', property, 'bad'], true));
        }
    }

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
            fuelEvents(events) {
                clearFlags(events);
                let filteredEvents = _.filter(events, {type: 'FUEL'});
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

                setFlags(filteredEvents, 'dist', event => event.dist && event.dist > 50, false);
                setFlags(filteredEvents, 'fuelused', event => event.fuelused && event.fuelused > 5);
                setFlags(filteredEvents, 'milage', event => event.milage);

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
            },
            flagStyles(event, property) {
                function is(event, property, quality) {
                    return _.get(event, ['flags', property, quality], false);
                }
                return {
                    best: is(event, property, 'best'),
                    good: is(event, property, 'good'),
                    worst: is(event, property, 'worst'),
                    bad: is(event, property, 'bad')
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

    .best {
        color: darkgreen;
        font-weight: bold;
        border-bottom: 1px dashed green;
    }

    .worst {
        color: red;
        font-weight: bold;
        border-bottom: 1px dashed red;
    }

    .good {
        color: darkgreen;
        font-weight: bold;
    }

    .bad {
        color: red;
        font-weight: bold;
    }

</style>