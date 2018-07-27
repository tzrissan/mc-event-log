<template>
    <div>
        <div class="settings" v-on:click="toggleShowFilters">
            <div class="selectedFilters">{{ titles(filters) }}</div>
            <div class="hamburger">
                <div/>
                <div/>
                <div/>
            </div>
        </div>
        <div class="filter-modal" v-if="showFilterDialog" v-on:click="toggleShowFilters">
            <h1>Suodata</h1>
            <div class="grid-container">
                <div class="grid-item"
                     v-for="month in months"
                     v-bind:key="month.month"
                     v-bind:class="{selected: month.selected}"
                     v-on:click="selectMonth(filters, month)">{{ month.month }}</div>
                <div class="grid-item"
                     v-for="year in years"
                     v-bind:key="year.year"
                     v-bind:class="{selected: year.selected}"
                     v-on:click="selectYear(filters, year)">{{ year.year }}</div>
                <div class="grid-item"
                     v-for="bike in bikes"
                     v-bind:key="bike.name"
                     v-bind:class="{selected: bike.selected}"
                     v-on:click="selectBike(filters, bike)">{{ bike.name }}</div>
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

    const data = {
        showFilterDialog: false,
        years: [],
        months: [],
        bikes: []
    };

    const dateRegex = /(\d{4})-(\d{2})-(\d{2})/;

    export default {
        name: 'GasLogFilterSelector',
        props: {
            filters: {
                type: Array,
                default: () => []
            }
        },
        data: function () {
            const selectedFilterYear = _.get(this.filters.find(e => e.date && e.date.year), 'date.year');
            const selectedFilterMonth = _.get(this.filters.find(e => e.date && e.date.month), 'date.month');
            const selectedFilterBike = _.get(this.filters.find(e => e.bike), 'bike');
            const monthNames = ['Tammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu', 'Toukokuu', 'Kesäkuu', 'Heinäkuu', 'Elokuu', 'Syyskuu', 'Lokakuu', 'Marraskuu', 'Joulukuu'];
            const allEvents = GasLogData.get().events;
            data.years = _.chain(allEvents).map(e => e.date)
                .map(d => d.replace(dateRegex, '$1'))
                .uniq().sort().reverse()
                .map(year => {
                    return {
                        year: year,
                        selected: (selectedFilterYear === year)
                    }
                })
                .value();
            data.months = _.chain(allEvents).map(e => e.date)
                .map(d => d.replace(dateRegex, '$2'))
                .uniq().sort()
                .map(month => {
                    return {
                        num: month,
                        month: monthNames[parseInt(month)-1],
                        selected: (selectedFilterMonth === month)
                    }
                })
                .value();
            data.bikes = _.chain(allEvents).map(e => e.bike)
                .uniq().sort()
                .map(bike => {
                    return {
                        name: bike,
                        selected: (selectedFilterBike === bike)
                    }
                })
                .value();
            return data;
        },
        methods: {
            toggleShowFilters: () => {
                data.showFilterDialog = !data.showFilterDialog;
            },
            selectYear: (filters, year) => {
                let yearFilter = filters.find(e => e.date && e.date.year);
                if (!yearFilter) {
                    yearFilter = { date: { year: undefined, regex: /.*/ }};
                    filters.push(yearFilter);
                }
                if (yearFilter.date.year === year.year) {
                    const idx = filters.findIndex(e => e.date && e.date.year);
                    filters.splice(idx, 1);
                    data.years.forEach(y => y.selected = false)
                } else {
                    yearFilter.date.title = year.year;
                    yearFilter.date.year = year.year;
                    yearFilter.date.regex = new RegExp(`${year.year}-..-..`);
                    data.years.forEach(y => y.selected = (y.year === year.year))
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
                    data.months.forEach(y => y.selected = false)
                } else {
                    monthFilter.date.title = month.month;
                    monthFilter.date.month = month.num;
                    monthFilter.date.regex = new RegExp(`....-${month.num}-..`);
                    data.months.forEach(y => y.selected = (y.num === month.num))
                }
            },
            selectBike: (filters, bike) => {
                let bikeFilter = filters.find(e => e.bike);
                if (!bikeFilter) {
                    console.log('new filter')
                    bikeFilter = { bike: undefined };
                    filters.push(bikeFilter);
                }
                if (bikeFilter.bike === bike.name) {
                    const idx = filters.findIndex(e => e.bike);
                    filters.splice(idx, 1);
                    data.bikes.forEach(y => y.selected = false)
                } else {
                    bikeFilter.bike = bike.name;
                    data.bikes.forEach(y => y.selected = (y.name === bike.name))
                }
            },
            titles: (filters) => filters.map(f => f.date ? f.date.title : _.values(f)).join(', ')
        }
    }

</script>

<style scoped>

    .settings {
        text-align: center;
    }
    .settings .selectedFilters, .settings .hamburger {
        display: inline-block;
        margin: 0 10px
    }

    .hamburger div {
        width: 20px;
        height: 3px;
        background-color: black;
        margin: 2px 0;
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
        background-color: rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(0, 0, 0, 0.8);
        text-align: center;
        padding: 10px;
    }

    .selected {
        #border: 2px solid #34675C;
        border: 0;
        background-color: #4CB5F5;
        color: white;
        font-weight: bold;
    }

</style>