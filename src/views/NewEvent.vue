<template>
  <div>
    <form @submit="saveNewLine" name="new-line-form" v-if="!local.newEvent">
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
    <div class="newEvent" v-if="local.newEvent">
      <div class="title">{{ local.newEvent.date | moment('D.M.YYYY') }} | {{ local.newEvent.bike }} | {{
        local.newEvent.odo }}
      </div>
      <div>Matka {{ local.newEvent.dist }} km</div>
      <div>Tankattu {{ local.newEvent.fuel }} litraa</div>
      <div>Kulutus {{ local.newEvent.milage }} litraa satasella</div>
      <input type="button" value="OK" v-on:click="local.newEvent = undefined"/>
    </div>
  </div>
</template>

<script>

  import _ from 'lodash'
  import GasLogData, { PROD } from '@/data'
  import axios from 'axios'

  const local = {
    currentBike: undefined,
    date: new Date().toISOString().split('T')[0],
    fuel: undefined,
    odo: undefined,
    info: 'Malmi-Hki',
    isSaving: false,
    isLoading: true,
    minOdo: 0,
    maxOdo: 0,
    newEvent: undefined
  }

  let global

  function resetForm () {
    local.date = new Date().toISOString().split('T')[0]
    local.fuel = undefined
    local.odo = undefined
    local.info = 'Malmi-Hki'
  }

  function updateNewEventsToGlobalData (local, global, newEvents) {
    newEvents.forEach(
      function (newEvent) {
        local.newEvent = newEvent
        if (!global.events.find(_.matches(newEvent))) {
          global.events.push(newEvent)
        }
      }
    )
    GasLogData.countExtraInformationFromData()
    resetForm()
    local.isSaving = false
  }

  const readDataFromGlobalToLocal = (local, global) => {
    local.currentBike = global.latestBike
    local.isLoading = _.isUndefined(local.currentBike)
    local.minOdo = _.chain(global.events).filter({ bike: local.currentBike }).sortBy('odo').map(e => e.odo).last().value() || 0
    local.maxOdo = local.minOdo + 1000
  }

  export default {
    name: 'NewEvent',
    data () {
      global = GasLogData.get()
      resetForm()
      readDataFromGlobalToLocal(local, global)
      return { local, global }
    },
    methods: {
      saveNewLine (e) {
        e.preventDefault()
        local.isSaving = true
        if (!PROD) {
          updateNewEventsToGlobalData(local, global, [{
            ..._.pick(local, 'date', 'fuel', 'odo', 'info'),
            fuelused: local.fuel,
            type: 'FUEL',
            bike: 'versys'
          }])
        } else {
          axios.post('/data', _.pick(local, 'date', 'fuel', 'odo', 'info'))
            .then(function (response) {
              updateNewEventsToGlobalData(local, global, response.data)
            })
        }
      }
    },
    watch: {
      'global.latestBike' () {
        readDataFromGlobalToLocal(local, global)
      }
    }
  }

</script>

<style scoped lang="scss">

  @import "../assets/colors";

  fieldset {
    border: 0;
    width: 400px
  }

  fieldset[disabled] {
    color: graytext;
  }

  .new-line {
    label {
      width: 80px;
      display: inline-block;
    }
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

  input[type="submit"], input[type="button"] {
    height: 1.8em;
    background: $blueSky;
    width: 172px;
    font-size: large;
    font-weight: bold;
  }

  input[type="submit"]:disabled {
    background: $granite;
  }

  .newEvent {
    border: 1px solid black;
    margin: 50px;
    padding: 20px
  }

  .newEvent {
    .title {
      font-size: large;
      font-weight: bold;
      margin-bottom: 10px
    }

    input[type="button"] {
      margin-top: 20px;
    }
  }

</style>
