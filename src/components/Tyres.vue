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
            <svg width="500" height="300" >

                <!-- Frame -->
                <polygon points="210,160 280,270, 130,270, 100,160" style="fill:black"/>
                <ellipse cx="150" cy="140" rx="70" ry="40" style="fill:white" transform = "rotate(10, 150 140)" />

                <!-- V2-->
                <polygon points="310,230, 290,220, 270,260, 290,270" style="fill:black" />
                <polygon points="250,230, 270,220, 290,260, 270,270" stroke="white" stroke-width="5" style="fill:red" />
                <polygon points="250,230, 270,220, 290,260, 270,270" style="fill:black" />
                <circle r="10" cx="280" cy="260" stroke="white" stroke-width="14" fill="white" />
                <circle r="10" cx="280" cy="260" stroke="black" stroke-width="10" fill="white" />

                <!-- Tank -->
                <ellipse cx="250" cy="170" rx="85" ry="35" style="fill:white" transform = "rotate(-20, 250 170)"/>
                <ellipse cx="305" cy="167" rx="33" ry="40" style="fill:white" />
                <ellipse cx="263" cy="185" rx="70" ry="30" style="fill:white"/>
                <polygon points="263,215 230,215 200,214, 250,205" style="fill:white"/>

                <ellipse cx="250" cy="170" rx="80" ry="30" style="fill:black" transform = "rotate(-20, 250 170)"/>
                <ellipse cx="305" cy="167" rx="30" ry="35" style="fill:black" />
                <ellipse cx="263" cy="185" rx="65" ry="25" style="fill:black"/>
                <polygon points="263,210 230,210 200,209, 250,200" style="fill:black"/>

                <!-- Handlebars -->
                <polygon points="360,174, 367,166, 280,88, 275,92" style="fill:black" />
                <polygon points="280,88, 285,94, 250,97 250,91" style="fill:black" />

                <!-- Tyres -->
                <circle r="75" cx="415" cy="217" stroke="black" stroke-width="15" fill="none" />
                <circle r="55" cx="70" cy="233" stroke="white" stroke-width="30" fill="none" />
                <circle r="55" cx="70" cy="233" stroke="black" stroke-width="20" fill="none" />


                <!-- actual information -->
                <text v-if="local.selectedBike" x="415" y="217" dy="-0.3em" text-anchor="middle">{{ currentFrontTyreDistance(local.selectedBike, global.events) }} km</text>
                <text v-if="local.selectedBike" x="415" y="217" dy="0.9em" text-anchor="middle">{{ lastFrontTyreChange(local.selectedBike, global.events) | moment("D.M.YYYY")  }}</text>
                <text v-if="local.selectedBike" x="70" y="233" dy="-0.3em" text-anchor="middle">{{ currentRearTyreDistance(local.selectedBike, global.events) }} km</text>
                <text v-if="local.selectedBike" x="70" y="233" dy="0.9em" text-anchor="middle">{{ lastRearTyreChange(local.selectedBike, global.events) | moment("D.M.YYYY")  }}</text>
            </svg>

            <div class="tyre-history-grid">
                <div class="grid-item">
                    <h1>Takarenkaan vaihdot</h1>
                    <div class="tyreChange"
                         v-for="event in filterRearTyreChanges(local.selectedBike, global.events)"
                         v-bind:key="event.odo">
                        <div class="odo" v-if="event.odo">{{event.odo}} </div>
                        <div class="date">{{event.date  | moment("D.M.YYYY")  }}</div>
                        <div class="info">{{event.info}}</div>
                        <div class="dist" v-if="event.dist">{{event.dist}} km</div>
                    </div>
                </div>
                <div class="grid-item">
                    <h1>Eturenkaan vaihdot</h1>
                    <div class="tyreChange"
                         v-for="event in filterFrontTyreChanges(local.selectedBike, global.events)"
                         v-bind:key="event.odo">
                        <div class="odo" v-if="event.odo">{{event.odo}} </div>
                        <div class="date">{{event.date  | moment("D.M.YYYY")  }}</div>
                        <div class="info">{{event.info}}</div>
                        <div class="dist" v-if="event.dist">{{event.dist}} km</div>
                    </div>
                </div>
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
        name: 'Tyres',
        data: function () {
            const global = GasLogData.get();
            local.selectedBike = global.latestBike;
            return { local, global };
        },
        methods: {
            selectBike: (bike) => {
                local.selectedBike = bike;
            },
            lastFrontTyreChange: (bike, events) => {
                return _.chain(events)
                    .filter({bike: bike, type: 'TYRE_FRONT'})
                    .sortBy('date')
                    .last()
                    .get('date')
                    .value()
            },
            lastRearTyreChange: (bike, events) => {
                return _.chain(events)
                    .filter({bike: bike, type: 'TYRE_REAR'})
                    .sortBy('date')
                    .last()
                    .get('date')
                    .value();
            },
            filterFrontTyreChanges: (bike, events) => {
                return _.chain(events)
                    .filter({bike: bike, type: 'TYRE_FRONT'})
                    .sortBy('date')
                    .reverse()
                    .value();
            },
            filterRearTyreChanges: (bike, events) => {
                return _.chain(events)
                    .filter({bike: bike, type: 'TYRE_REAR'})
                    .sortBy('date')
                    .reverse()
                    .value();
            },
            currentFrontTyreDistance: (bike, events) => {
                const lastChange = _.chain(events)
                    .filter({bike: bike, type: 'TYRE_FRONT'})
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
                return parseInt(latestUpdate) - parseInt(lastChange)
            },
            currentRearTyreDistance: (bike, events) => { const lastChange = _.chain(events)
                .filter({bike: bike, type: 'TYRE_REAR'})
                .sortBy('date')
                .last()
                .get('odo', '0')
                .value();
                const latestUpdate = _.chain(events)
                    .filter({bike: bike})
                    .sortBy('date')
                    .last()
                    .get('odo', '0')
                    .value();
                return parseInt(latestUpdate) - parseInt(lastChange)
            }

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
        text-align: left;
        width: 500px;
        margin: 0 auto;
    }

    .tyreChange:not(:last-child) {
        border-bottom: 1px solid grey;
        padding: 0 10px;
    }

    .tyreChange div:not(:last-child) {
        border-right: 1px solid grey;
    }

    .odo, .dist, .info, .date {
        display: inline-block;
        white-space: nowrap;
        padding: 0 5px;
    }

    .dist {
        font-size: small;
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

    .tyre-history-grid {
        display: grid;
        grid-template-columns: auto auto;
        grid-row-gap: 5px;
        grid-column-gap: 5px;
    }

    .tyre-history-grid .grid-item {
        border: none;
    }

    .tyre-history-grid h1 {
        font-size: large;
    }

    .selected {
        border: 0;
        background-color: #4CB5F5;
        color: white;
        font-weight: bold;
    }

</style>
