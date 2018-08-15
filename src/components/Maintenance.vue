<template>
    <div>
        <div class="bike-selection">
            <div class="bike-selection-grid">
                <div class="grid-item"
                     v-for="bike in global.bikes"
                     v-on:click="selectBike(bike)"
                     v-bind:class="{selected: local.selectedBike === bike}"
                     v-bind:key="bike"
                >{{ bike }}</div>
            </div>
        </div>

        <div class="mc">
            <div class="maintenence current">
                <div class="info" >Viimeisin havainto pyörästä:<br>
                    odo: {{ latestOdo(local.selectedBike, global.events) }} <br>
                    pvm: {{ latestDate(local.selectedBike, global.events) | moment("D.M.YYYY") }}</div>
                <span class="updownarrow">&#x2195;</span>
                <span class="dist"> {{ currentMaintenanceDistance(local.selectedBike, global.events) }} km</span>
            </div>
            <div class="maintenence"
                 v-for="event in filterMaintenence(local.selectedBike, global.events)"
                 v-bind:key="event.odo">
                <div class="info" >{{event.odo}} | {{event.date  | moment("D.M.YYYY")  }} | {{event.info}}</div>
                <span class="updownarrow" v-if="event.dist">&#x2195;</span>
                <span class="dist" v-if="event.dist"> {{event.dist}} km</span>
            </div>
        </div>
    </div>
</template>

<script>
    import _ from 'lodash';
    import GasLogData from '../data.js'

    const local = {
        selectedBike: undefined
    };

    export default {
        name: 'Maintenance',
        data: function () {
            const global = GasLogData.get();
            local.selectedBike = global.latestBike;
            return { local, global };
        },
        methods: {
            selectBike: (bike) => {
                local.selectedBike = bike;
            },
            filterMaintenence: (bike, events) =>
                _.chain(events)
                    .filter({bike: bike, type: 'MAINTENANCE'})
                    .sortBy('date')
                    .reverse()
                    .value(),
            currentMaintenanceDistance: (bike, events) =>  {
                const lastMaintenance = _.chain(events)
                    .filter({bike: bike, type: 'MAINTENANCE'})
                    .sortBy(['odo', 'date'])
                    .last()
                    .get('odo', '0')
                    .value();
                const latestUpdate = _.chain(events)
                    .filter({bike: bike})
                    .sortBy(['odo', 'date'])
                    .last()
                    .get('odo', '0')
                    .value();
                return parseInt(latestUpdate) - parseInt(lastMaintenance)
            },
            latestOdo: (bike, events) =>  _.chain(events)
                .filter({bike: bike})
                .sortBy('date')
                .last()
                .get('odo', '0')
                .value(),
            latestDate: (bike, events) =>  _.chain(events)
                .filter({bike: bike})
                .sortBy('date')
                .last()
                .get('date')
                .value()
        }
    }

</script>

<style scoped>

    .bike-selection {
        text-align: center;
        #border-bottom: 1px solid lightgray;
        padding: 20px
    }

    .mc {
        align: center;
        padding: 20px;
    }

    .current {
        border-bottom: 1px solid lightgray;
    }

    .maintenence div.info {
        align: center;
        padding: 5px;
        margin: 0 50px;
    }

    .maintenence span.dist {
        padding: 5px;
        font-size: small;
    }

    .maintenence span.updownarrow {
        font-size: x-large;
        padding: 0;
        margin: 0 0 0 80px;
    }

    .bike-selection-grid {
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
