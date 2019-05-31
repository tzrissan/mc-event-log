<template>
  <div>
    <table class="stats">
      <thead>
      <tr>
        <th @click="sortBy(null)">Vuosi</th>
        <th class="number" v-for="(kuukausi, idx) in kuukaudet" :key="kuukausi" @click="sortBy(idx)">{{ kuukausi }}</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="vuosi in vuodet" :key="vuosi[0]">
        <td>{{ vuosi.vuosi }}</td>
        <td class="number" v-for="(d, idx) in vuosi.dist" :key="idx">{{ d }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
  import _ from 'lodash'
  import GasLogData from '../data.js'

  export default {
    name: 'Taulukot',
    data: function () {
      return {
        global: GasLogData.get(),
        sort: 'vuosi'
      }
    },
    computed: {
      vuodet () {
        const kuukaudet = this.kuukaudet
        const distance = this.distance
        const sort = this.sort
        return _.chain(this.global.events)
          .groupBy(e => e.date.substr(0, 4))
          .toPairs()
          .map(p => ({
            vuosi: p[0],
            dist: kuukaudet.map(kk => distance(p[0], kk, p[1]))
          }))
          .sortBy(sort)
          .value()
          .reverse()
      },
      kuukaudet () {
        return _.uniq(this.global.events
          .map(e => e.date)
          .map(s => s.substr(5, 2)))
          .sort()
      }
    },
    methods: {
      sortBy (columnNo) {
        if (_.isNumber(columnNo)) {
          this.sort = `dist[${columnNo}]`
        } else {
          this.sort = 'vuosi'
        }
      },
      distance (vuosi, kuukausi, list) {
        const prefix = `${vuosi}-${kuukausi}`
        return list
          .filter(e => e.date.substr(0, 7) === prefix)
          .filter(e => e.type === 'FUEL')
          .map(e => e.dist)
          .filter(d => _.isNumber(d) && !_.isNaN(d))
          .reduce((a, i) => a + i, 0)
      }
    }
  }
</script>

<style scoped lang="scss">

  @import "../assets/colors";

  .stats {;
    min-width: 80%;

    border-collapse: collapse;
    margin: 30px auto;

    th {
      background-color: $blueSky;
      color: white;
      font-weight: normal;
      text-align: left;
      padding: 5px 10px;
    }

    td {
      padding: 2px 10px;
    }

    .number {
      text-align: right;
    }

    tr:nth-child(odd) {
      background-color: #eee;
    }
  }

</style>
