<template>
    <div>
        <form @submit="saveNewLine" name="new-line-form">
            <fieldset v-bind:disabled="local.isSaving || local.isLoading">
                <div class="new-line">
                    <label for="date">Pvm</label>
                    <input id="date" type="date" required
                           v-model.number="local.date"/>
                </div>
                <div class="new-line">
                    <label for="fuel">Tankattu</label>
                    <input id="fuel" placeholder="litraa"
                           type="number" min=0 max=21 step=0.01
                           v-model.number="local.fuel"/>
                </div>
                <div class="new-line">
                    <label for="odo">Odo</label>
                    <input id="odo" placeholder="matkamittarin lukema"
                           type="number" v-bind:min="local.minOdo" v-bind:max="local.maxOdo" step=1 required
                           v-model="local.odo"/>
                </div>
                <div class="new-line">
                    <label for="info">Info</label>
                    <input id="info" type="text"
                           v-model="local.info"/>
                </div>
                <input type="submit" value="Lähetä"/>
            </fieldset>
        </form>
    </div>
</template>

<script>

    import _ from 'lodash';
    import GasLogData from '../data.js'
    import axios from 'axios';

    const local = {
        currentBike: undefined,
        date: new Date().toISOString().split('T')[0],
        fuel: undefined,
        odo: undefined,
        info: "Malmi-Hki",
        isSaving: false,
        isLoading: true,
        minOdo: 0,
        maxOdo: 0
    };

    let global = undefined;

    const readDataFromGlobalToLocal = (local, global) => {
        local.currentBike = global.latestBike;
        local.isLoading = _.isUndefined(local.currentBike);
        local.minOdo = _.chain(global.events).filter({bike: local.currentBike}).sortBy('odo').map(e => e.odo).last().value() || 0;
        local.maxOdo = local.minOdo + 1000;
    };

    export default {
        name: 'NewEvent',
        data() {
            global = GasLogData.get();
            readDataFromGlobalToLocal(local, global);
            return {local, global};
        },
        methods: {
            saveNewLine(e) {
                e.preventDefault();
                local.isSaving = true;
                axios.post('/data', _.pick(local, 'date', 'fuel', 'odo', 'info'))
                    .then(function (response) {
                        response.data.forEach(
                            function(newEvent) {
                                if (!global.events.find(_.matches(newEvent))) {
                                    global.events.push(newEvent);
                                }
                            }
                        );
                        GasLogData.countExtraInformationFromData();
                        local.isSaving = false;
                    })
            }
        },
        watch: {
            'global.latestBike'() {
                readDataFromGlobalToLocal(local, global);
            }
        }
    }

</script>

<style scoped>
    fieldset {
        border: 0;
        width: 400px
    }

    fieldset[disabled] {
        color: graytext;
    }

    .new-line label {
        width: 80px;
        display: inline-block;
    }

    input {
        height: 1.8em;
        padding: 1px 10px;
        margin: 2px 5px;
        border: 1px solid black;
        width: 250px;
        background: white;
        display: inline-block;
    }

    input:disabled {
        border-color: graytext;
    }

    input[type="submit"] {
        height: 1.8em;
        background: #4CB5F5;
        width: 172px;
        font-size: large;
        font-weight: bold;
    }

    input[type="submit"]:disabled {
        background: #B7B8B6;
    }
</style>