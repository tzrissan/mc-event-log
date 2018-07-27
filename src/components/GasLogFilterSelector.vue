<template>
    <div>
        <div class="settings" v-on:click="toggleShowFilters">
            <div/>
            <div/>
            <div/>
        </div>
        <div class="filter-modal" v-if="showFilterDialog" v-on:click="toggleShowFilters">
            <h1>Suodata {{ filters }}</h1>
            <div class="grid-container">
                <div class="grid-item">Päivä</div>
                <div class="grid-item">Kuukausi</div>
                <div class="grid-item" v-on:click="selectYear(filters)">Vuosi {{selectedFilterYear}}</div>
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

    const data = {
        showFilterDialog: false,
        selectedFilterYear: undefined,
    };

    export default {
        name: 'GasLogFilterSelector',
        props: {
            filters: {
                type: Array,
                default: () => []
            }
        },
        data: function () {
            data.selectedFilterYear = _.chain(this.filters).map(f => _.get(f, 'date.year')).filter(d => !_.isUndefined(d)).head();
            return data;
        },
        methods: {
            toggleShowFilters: () => {
                data.showFilterDialog = !data.showFilterDialog;
            },
            selectYear: (filters) => {
                filters.length = 0;
                filters.push({bike: 'vstrom'})
            }
        }
    }

</script>

<style scoped>

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

</style>