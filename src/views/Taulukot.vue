<template>
  <div>
    <table class="stats">
      <thead>
      <tr>
        <th @click="sortBy('vuosi')">Vuosi</th>
        <th @click="sortBy('total')">Total</th>
        <th v-for="(kuukausi, idx) in kuukaudet" :key="kuukausi" @click="sortBy(idx)">{{ kuukausi }}</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="vuosi in vuodet" :key="vuosi[0]">
        <th>{{ vuosi.vuosi }}</th>
        <td class="number total">
          <span v-if="vuosi.total">{{ vuosi.total }} km</span>
        </td>
        <td class="number" v-for="(d, idx) in vuosi.dist" :key="idx">
          <span v-if="d">{{ d }} km</span>
        </td>
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
          .map(p => {
            const dist = kuukaudet.map(kk => distance(p[0], kk, p[1]))
            const total = dist.reduce((a, i) => a + i, 0)
            return {
              vuosi: p[0],
              dist,
              total
            }
          })
          .filter(v => v.total > 0)
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
          this.sort = columnNo
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
    border-collapse: collapse;
    margin: 30px auto;

    th {
      background-color: $blueSky;
      color: white;
      font-weight: normal;
      padding: 0.5em 1em;
    }

    td {
      padding: 0.5em 1em;

      &:last-child {
        border-right: 1px solid black;
      }

      &.total {
        border-left: 1px solid black;
        border-right: 1px solid black;
      }

    }

    tr {
      &:nth-child(odd) {
        background-color: #eee;
      }

      &:last-child {
        border-right: 1px solid black;
        border-bottom: 1px solid black;
      }
    }

    .number {
      text-align: right;
    }
  }

</style>
