<template>
  <div>
    <div class="bike-selection">
      <div class="bike-selection-grid">
        <div class="grid-item"
             v-for="bike in global.bikes"
             v-on:click="selectBike(bike)"
             v-bind:class="{selected: selectedBike === bike}"
             v-bind:key="bike"
        >{{ bike }}
        </div>
      </div>
    </div>
    <table>
      <thead>
      <tr>
        <th>pvm</th>
        <th>odo</th>
        <th>bike</th>
        <th>info</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="event in otherEvents" v-bind:key="key(event)">
        <td>{{ event.date | moment("D.M.YYYY") }}</td>
        <td>{{ event.odo }}
          <small>km</small>
        </td>
        <td>{{ event.bike }}</td>
        <td class="info">{{ event.info }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
  import _ from 'lodash'
  import GasLogData from '../data.js'

  const local = {
    selectedBike: undefined
  }

  export default {
    name: 'Misc',
    data: function () {
      const global = GasLogData.get()
      return { local, global }
    },
    computed: {
      selectedBike: function () {
        return local.selectedBike ? local.selectedBike : this.global.latestBike
      },
      otherEvents: function () {
        return _.chain(this.global.events)
          .filter({ bike: this.selectedBike, type: 'OTHER' })
          .sortBy('date')
          .reverse()
          .value()
      }
    },
    methods: {
      selectBike: (bike) => {
        local.selectedBike = bike
      },
      key: (event) => {
        return event.bike + event.odo + event.info
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

  .bike-selection {
    text-align: center;
    #border-bottom: 1px solid lightgray;
    padding: 20px
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
