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

    <div class="mc">
      <div class="maintenence current">
        <div class="info">Viimeisin havainto pyörästä:<br>
          odo: {{ latestOdo }} <br>
          pvm: {{ latestDate | moment("D.M.YYYY") }}
        </div>
        <span class="updownarrow">&#x2195;</span>
        <span class="dist"> {{ currentMaintenanceDistance }} km</span>
      </div>
    </div>
    <div class="mc">
      <div class="graph">
        <div v-for="event in maintenanceEvents"
             :key="event.odo"
             :style="width(event.dist, latestOdo)"
             class="maintenence">
          <div class="distance">{{ event.dist }} km</div>
          <div class="desc">
            {{ event.date | moment("D.M.YYYY") }}<br>
            {{ event.info }}<br>
            {{ event.odo }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import _ from 'lodash'
  import GasLogData from '../data.js'

  const local = {
    selectedBike: undefined
  }

  export default {
    name: 'Maintenance',
    data: function () {
      return { local, global: GasLogData.get() }
    },
    computed: {
      selectedBike: function () {
        return local.selectedBike ? local.selectedBike : this.global.latestBike
      },
      maintenanceEvents: function () {
        return _.chain(this.global.events)
          .filter({ bike: this.selectedBike, type: 'MAINTENANCE' })
          .sortBy('date')
          .value()
      },
      currentMaintenanceDistance: function () {
        const lastMaintenance = _.chain(this.global.events)
          .filter({ bike: this.selectedBike, type: 'MAINTENANCE' })
          .sortBy(['odo', 'date'])
          .last()
          .get('odo', '0')
          .value()
        const latestUpdate = _.chain(this.global.events)
          .filter({ bike: this.selectedBike })
          .sortBy(['odo', 'date'])
          .last()
          .get('odo', '0')
          .value()
        return parseInt(latestUpdate) - parseInt(lastMaintenance)
      },
      firstOdo: function () {
        return _.chain(this.global.events)
          .filter({ bike: this.selectedBike })
          .sortBy('date')
          .first()
          .get('odo', '0')
          .value()
      },
      latestOdo: function () {
        return _.chain(this.global.events)
          .filter({ bike: this.selectedBike })
          .sortBy('date')
          .last()
          .get('odo', '0')
          .value()
      },
      latestDate: function () {
        return _.chain(this.global.events)
          .filter({ bike: this.selectedBike })
          .sortBy('date')
          .last()
          .get('date')
          .value()
      }
    },
    methods: {
      selectBike: (bike) => {
        local.selectedBike = bike
      },
      width (dist, totalDist) {
        const width = Math.trunc((dist / totalDist) * 10000) / 100
        return `width: calc(${width}% - 2px);`
      }
    }
  }

</script>

<style scoped lang="scss">

  @import "../assets/colors";

  .bike-selection {
    text-align: center;
    padding: 20px
  }

  .current {
    border-bottom: 1px solid lightgray;
  }

  .mc {
    align: center;
    padding: 20px;

    .graph {
      margin-top: 100px;
      margin-right: 50px;
      background-color: $blueSky;
    }

    .maintenence {
      display: inline-block;
      height: 30px;
      padding-top: 5px;
      border-right: 2px solid white;
      position: relative;
      .distance {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 5px;
        text-align: center;
      }
      .desc {
        padding: 3px 10px 2px 5px;
        font-size: small;
        height: 50px;
        color: white;
        background-color: $blueSky;
        border: 1px solid $blueSky;
        position: absolute;
        top: -66px;
        right: -22px;
        white-space: nowrap;
        &::before {
          content: "";
          width: 2px;
          height: 57px;
          border: 0;
          background-color: white;
          position: absolute;
          left: -2px;
          top: -1px;
        }
        &::after {
          content: "";
          width: 0px;
          height: 0px;
          border: 10px solid transparent;
          position: absolute;
          right: 10px;
          bottom: -21px;
          border-top: 10px solid $blueSky;
        }
      }
    }
  }

  .maintenence {
    div.info {
      align: center;
      padding: 5px;
      margin: 0 50px;
    }

    span.dist {
      padding: 5px;
      font-size: small;
    }

    span.updownarrow {
      font-size: x-large;
      padding: 0;
      margin: 0 0 0 80px;
    }
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
    background-color: $blueSky;
    color: white;
    font-weight: bold;
  }

</style>
