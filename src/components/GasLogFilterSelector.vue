<template>
    <div>
        <div class="settings" v-on:click="toggleShowFilters">
            <div class="selectedFilters">{{ titles(filters) }}</div>
            <filter-glyph class="filter-icon"></filter-glyph>
        </div>
        <div class="filter-modal" v-if="local.showFilterDialog" v-on:click="toggleShowFilters">
            <h1>Suodata vuodella</h1>
            <div class="grid-container">
                <div class="grid-item"
                     v-for="month in decorateMonths(global.months)"
                     v-bind:key="month.month"
                     v-bind:class="{selected: month.selected}"
                     v-on:click="selectMonth(filters, month)">{{ month.month }}</div>
            </div>
            <h1>Suodata kuukaudella</h1>
            <div class="grid-container">
                <div class="grid-item"
                     v-for="year in decorateYears(global.years)"
                     v-bind:key="year.year"
                     v-bind:class="{selected: year.selected}"
                     v-on:click="selectYear(filters, year)">{{ year.year }}</div>
            </div>
            <h1>Suodata pyörällä</h1>
            <div class="grid-container">
                <div class="grid-item"
                     v-for="bike in decorateBikes(global.bikes)"
                     v-bind:key="bike.name"
                     v-bind:class="{selected: bike.selected}"
                     v-on:click="selectBike(filters, bike)">{{ bike.name }}</div>
            </div>
        </div>
    </div>
</template>

<script>
    import _ from 'lodash';
    import GasLogData from '../data.js'
    import { MONTH_NAMES } from '../data.js'
    import FilterGlyph from "./FilterGlyph";

    const local = {
        showFilterDialog: false
    };

    export default {
        name: 'GasLogFilterSelector',
        components: {FilterGlyph},
        props: {
            filters: {
                type: Array,
                default: () => []
            }
        },
        data: function () {
            local.selectedFilterYear = _.get(this.filters.find(e => e.date && e.date.year), 'date.year');
            local.selectedFilterMonth = _.get(this.filters.find(e => e.date && e.date.month), 'date.month');
            local.selectedFilterBike = _.get(this.filters.find(e => e.bike), 'bike');
            return { local, global: GasLogData.get() };
        },
        methods: {
            toggleShowFilters: () => {
                local.showFilterDialog = !local.showFilterDialog;
            },
            decorateMonths: (months) => months.map(month => ({
                num: month,
                month: MONTH_NAMES[parseInt(month)-1],
                selected: (local.selectedFilterMonth === month)
            })),
            decorateYears: (years) => years.map(year => ({
                year: year,
                selected: (local.selectedFilterYear === year)
            })),
            decorateBikes: (bikes) => bikes.map(bike => ({
                name: bike,
                selected: (local.selectedFilterBike === bike)
            })),
            selectYear: (filters, year) => {
                let yearFilter = filters.find(e => e.date && e.date.year);
                if (!yearFilter) {
                    yearFilter = { date: { year: undefined, regex: /.*/ }};
                    filters.push(yearFilter);
                }
                if (yearFilter.date.year === year.year) {
                    const idx = filters.findIndex(e => e.date && e.date.year);
                    filters.splice(idx, 1);
                    local.selectedFilterYear = undefined;
                } else {
                    yearFilter.date.title = year.year;
                    yearFilter.date.year = year.year;
                    yearFilter.date.regex = new RegExp(`${year.year}-..-..`);
                    local.selectedFilterYear = year.year;
                }
            },
            selectMonth: (filters, month) => {
                let monthFilter = filters.find(e => e.date && e.date.month);
                if (!monthFilter) {
                    monthFilter = { date: { month: undefined, regex: /.*/ }};
                    filters.push(monthFilter);
                }
                if (monthFilter.date.month === month.num) {
                    const idx = filters.findIndex(e => e.date && e.date.month);
                    filters.splice(idx, 1);
                    local.selectedFilterMonth = undefined;
                } else {
                    monthFilter.date.title = month.month;
                    monthFilter.date.month = month.num;
                    monthFilter.date.regex = new RegExp(`....-${month.num}-..`);
                    local.selectedFilterMonth = month.num;
                }
            },
            selectBike: (filters, bike) => {
                let bikeFilter = filters.find(e => e.bike);
                if (!bikeFilter) {
                    bikeFilter = { bike: undefined };
                    filters.push(bikeFilter);
                }
                if (bikeFilter.bike === bike.name) {
                    const idx = filters.findIndex(e => e.bike);
                    filters.splice(idx, 1);
                    local.selectedFilterBike = undefined;
                } else {
                    bikeFilter.bike = bike.name;
                    local.selectedFilterBike = bike.name;
                }
            },
            titles: (filters) => filters.map(f => f.date ? f.date.title : _.values(f)).join(', ')
        }
    }

</script>

<style scoped>

    .settings {
        text-align: right;
        padding: 2px 0;
    }
    .settings .selectedFilters, .settings .filter-icon {
        display: inline-block;
        margin: 0 10px
    }

    .filter-modal {
        border: 2px solid black;
        z-index: 50;
        width: 90%;
        height: 90%;
        top: 3%;
        left: 3%;
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
        border: 1px solid black;
        text-align: center;
        padding: 10px;
    }

    .selected {
        border: 0;
        background-color: #4CB5F5;
        color: white;
        font-weight: bold;
    }

</style>