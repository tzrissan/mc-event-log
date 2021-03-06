<template>
  <div>
    <div class="filters" v-if="global">
      <select v-model="local.selectedStatistic">
        <option
          v-for="(stat, name) in local.statisticOptions"
          v-bind:key="name"
          v-bind:value="name">{{ stat.title }}
        </option>
      </select>
    </div>
    <BarChart
      v-if="isCurrentStatType(local.selectedStatistic, 'bar')"
      v-bind:data="chartData"
      v-bind:options="chartOptions"
      v-bind:styles="styles"></BarChart>
    <PieChart
      v-if="isCurrentStatType(local.selectedStatistic, 'pie')"
      v-bind:data="chartData"
      v-bind:options="chartOptions"></PieChart>
  </div>

</template>

<script>
import _ from 'lodash'
import GasLogData, { MONTH_NAMES, DATE_REGEX } from '@/data'
import { CHART_COLORS, nextColor, currentColor } from '@/components/ChartColors'
import BarChart from '@/components/BarChart'
import PieChart from '@/components/PieChart'
import moment from 'moment'

const local = {
  selectedStatistic: 'seasonsDistanceByMonth',
  statisticOptions: {
    compareBikes: {
      title: 'Pyörät',
      type: 'bar',
      yAxes: [
        { id: 'km', type: 'linear', position: 'left', ticks: { min: 0 } },
        { id: 'ltr', type: 'linear', position: 'right', gridLines: { display: false }, ticks: { min: 0 } },
        { id: 'kpl', type: 'linear', position: 'right', gridLines: { display: false }, ticks: { min: 0 } },
      ],
      datasets (events) {
        function totalDistance (bike) {
          const bikeEvents = _.filter(events, { bike })
          const minOdo = _.chain(bikeEvents).map(e => e.odo).min().value()
          const maxOdo = _.chain(bikeEvents).map(e => e.odo).max().value()
          return maxOdo - minOdo
        }

        function totalFuel (bike) {
          return _.chain(events)
            .filter({ bike })
            .map(e => e.fuelused)
            .filter(f => !_.isUndefined(f) && !_.isNaN(f))
            .reduce((sum, fuel) => sum + fuel, 0)
            .value()
        }

        function seasonCount (bike) {
          return _.chain(events)
            .filter({ bike })
            .map(e => e.date)
            .map(d => d.replace(DATE_REGEX, '$1'))
            .uniq()
            .value().length
        }

        function maintenanceCount (bike) {
          return _.chain(events)
            .filter({ bike })
            .filter({ type: 'MAINTENANCE' })
            .value().length
        }

        function tyreCount (bike) {
          return _.chain(events)
            .filter({ bike })
            .filter(e => (e.type === 'TYRE_FRONT' || e.type === 'TYRE_REAR'))
            .value().length
        }

        return _.flatten(local.allBikes.map(bike => {
          return [{
            label: bike.name,
            borderColor: bike.borderColor,
            backgroundColor: bike.backgroundColor,
            yAxisID: 'km',
            data: [totalDistance(bike.name)]
          }, {
            label: bike.name,
            borderColor: bike.borderColor,
            backgroundColor: bike.backgroundColor,
            yAxisID: 'ltr',
            data: [0, totalFuel(bike.name)]
          }, {
            label: bike.name,
            borderColor: bike.borderColor,
            backgroundColor: bike.backgroundColor,
            yAxisID: 'kpl',
            data: [0, 0, seasonCount(bike.name), maintenanceCount(bike.name), tyreCount(bike.name)]
          }]
        }))
      },
      labels () {
        return ['kilometriä', 'litraa', 'ajokausia', 'huoltoja', 'renkaita']
      }
    },
    compareBikesByMonth: {
      title: 'Pyörät kuukausittain',
      type: 'bar',
      yAxes: [
        { id: 'km', type: 'linear', position: 'left' },
        { id: 'ltr', type: 'linear', position: 'left', gridLines: { display: false } },
        { id: 'milage', type: 'linear', position: 'right', gridLines: { display: false } }
      ],
      datasets (events) {
        const fuelEvents = _.filter(events, { type: 'FUEL' })
        const months = monthsWithEvents(events)
        const datasets = []
        local.fuelledBikes.forEach(bike => {
          const bikeEvents = _.filter(fuelEvents, { bike: bike.name })
          datasets.push({
            label: `${bike.name}, ajettu matka`,
            borderColor: bike.borderColor,
            backgroundColor: bike.backgroundColor,
            data: months.map(m => countDistance(bikeEvents, byMonth(m))),
            yAxisID: 'km',
            type: 'line'
          })
          datasets.push({
            label: `${bike.name}, käytetty polttoaine`,
            borderColor: bike.borderColor,
            backgroundColor: bike.backgroundColor,
            data: months.map(m => countFuel(bikeEvents, byMonth(m))),
            hidden: true,
            yAxisID: 'ltr'
          })
          datasets.push({
            label: `${bike.name}, litraa satasella`,
            borderColor: bike.borderColor,
            backgroundColor: bike.backgroundColor,
            data: months.map(m => milageByMonth(bikeEvents, m)),
            type: 'line',
            fill: false,
            yAxisID: 'milage'
          })
        })
        return datasets
      },
      labels (events) {
        return monthsWithEvents(_.filter(events, { type: 'FUEL' })).map(m => MONTH_NAMES[parseInt(m) - 1])
      }
    },
    seasons: {
      title: 'Ajokaudet',
      type: 'bar',
      yAxes: [
        { id: 'km', type: 'linear', position: 'left', ticks: { min: 0 } },
        { id: 'length', type: 'linear', position: 'left', gridLines: { display: false }, ticks: { min: 0 } },
        { id: 'ltr', type: 'linear', position: 'right', gridLines: { display: false }, ticks: { min: 0 } },
        { id: 'milage', type: 'linear', position: 'right', gridLines: { display: false } }
      ],
      datasets (events) {
        function totalDistance (season, events) {
          const seasonEvents = _.filter(events, bySeason(season))
          const seasonBikes = _.chain(seasonEvents).map(e => e.bike).uniq().value()

          function seasonLength () {
            const dates = seasonEvents.map(e => e.date).sort()
            return moment(dates[dates.length - 1]).diff(moment(dates[0]), 'days')
          }

          return {
            distance: seasonBikes.map(bike => {
              const bikeEvents = _.filter(seasonEvents, { bike })
              const minOdo = _.chain(bikeEvents).map(e => e.odo).min().value()
              const maxOdo = _.chain(bikeEvents).map(e => e.odo).max().value()
              return maxOdo - minOdo
            }).reduce((sum, dist) => _.isNumber(dist) && !_.isNaN(dist) ? sum + dist : sum, 0),
            length: seasonLength()
          }
        }

        const fuelEvents = _.filter(events, { type: 'FUEL' })
        const seasons = seasonsWithEvents(events).reverse()
        const distancesAndLengths = seasons.map(s => totalDistance(s, events))
        const distances = distancesAndLengths.map(season => season.distance)
        const lengths = distancesAndLengths.map(season => season.length)
        const fuels = seasons.map(s => countFuel(fuelEvents, bySeason(s)))
        const milages = _.zip(fuels, distances).map(z => (100 * z[0] / z[1]))
        const avgDistance = (distances.reduce((s, d) => s + d, 0) / distances.length).toFixed(0)
        const avgLength = (lengths.reduce((s, d) => s + d, 0) / lengths.length).toFixed(0)
        const avgFuel = _.chain(fuels)
          .filter(f => _.isNumber(f) && !_.isNaN(f))
          .reduce((acc, fuel) => ({
            sum: acc.sum + fuel,
            count: acc.count + 1,
            avg () {
              return this.sum / this.count
            }
          }), { sum: 0.0, count: 0 })
          .value().avg()
          .toFixed()
        const avgMilage = _.chain(_.zip(fuels, distances))
          .filter(z => _.isNumber(z[0]) && !_.isNaN(z[0]))
          .filter(z => _.isNumber(z[1]) && !_.isNaN(z[1]))
          .reduce((acc, z) => ({
            fuel: acc.fuel + z[0],
            dist: acc.dist + z[1],
            milage () {
              return 100 * this.fuel / this.dist
            }
          }), { fuel: 0, dist: 0 })
          .value().milage().toFixed(2)
        return [{
          label: `kilometriä`,
          borderColor: CHART_COLORS.blue(),
          backgroundColor: CHART_COLORS.blue(0.6),
          type: 'line',
          data: distances,
          yAxisID: 'km'
        }, {
          label: `päivää`,
          borderColor: CHART_COLORS.green(),
          backgroundColor: CHART_COLORS.green(0.6),
          type: 'line',
          fill: false,
          data: lengths,
          yAxisID: 'length'
        }, {
          label: `litraa`,
          borderColor: CHART_COLORS.pink(),
          backgroundColor: CHART_COLORS.pink(0.6),
          data: fuels,
          hidden: true,
          yAxisID: 'ltr'
        }, {
          label: `litraa satasella`,
          borderColor: CHART_COLORS.pine(),
          backgroundColor: CHART_COLORS.pine(0.6),
          data: milages,
          type: 'line',
          fill: false,
          yAxisID: 'milage'
        }, {
          label: `keskiarvo (${avgDistance} km)`,
          borderColor: CHART_COLORS.blue(),
          backgroundColor: CHART_COLORS.blue(0.6),
          data: seasons.map(() => avgDistance),
          type: 'line',
          fill: false,
          yAxisID: 'km',
          radius: 0
        }, {
          label: `keskiarvo (${avgLength} päivää)`,
          borderColor: CHART_COLORS.green(),
          backgroundColor: CHART_COLORS.green(0.6),
          data: seasons.map(() => avgLength),
          type: 'line',
          fill: false,
          yAxisID: 'length',
          radius: 0
        }, {
          label: `keskiarvo (${avgFuel} ltr)`,
          borderColor: CHART_COLORS.pink(),
          backgroundColor: CHART_COLORS.pink(0.6),
          data: seasons.map(() => avgFuel),
          hidden: true,
          type: 'line',
          fill: false,
          yAxisID: 'ltr',
          radius: 0
        }, {
          label: `keskiarvo (${avgMilage} ltr/100km)`,
          borderColor: CHART_COLORS.pine(),
          backgroundColor: CHART_COLORS.pine(0.6),
          data: seasons.map(() => avgMilage),
          type: 'line',
          fill: false,
          yAxisID: 'milage',
          radius: 0
        }]
      },
      labels (events) {
        return seasonsWithEvents(events).reverse()
      }
    },
    seasonsDistanceByMonth: {
      title: 'Ajokausien matkat kuukausittain',
      type: 'bar',
      yAxes: [
        { id: 'km', type: 'linear' }
      ],
      datasets (events, latestBike) {
        const fuelEvents = _.filter(events, { type: 'FUEL' })
        const months = monthsWithEvents(events)
        const seasons = seasonsWithEvents(events)
        const currentSeason = seasons[0]
        return _.flatten(local.fuelledBikes.map(bike => {
          const bikeEvents = _.filter(fuelEvents, { bike: bike.name })
          const bikeSeasons = seasonsWithEvents(bikeEvents)
          const totalMonthCount = _.chain(bikeEvents)
            .map(e => e.date)
            .map(d => d.replace(DATE_REGEX, '$1-$2'))
            .uniq()
            .value().length
          const totalDistance = _.chain(bikeEvents)
            .map(e => e.dist).filter(n => _.isNumber(n) && !_.isNaN(n))
            .reduce((sum, dist) => sum + dist, 0).value()
          const totalAvgDistPerMonth = parseFloat((totalDistance / totalMonthCount).toFixed())
          return _.concat([{
              label: `${bike.name} average`,
              borderColor: bike.borderColor,
              backgroundColor: 'rgb(255,255,255,0)',
              data: months.map(m => countAverageDistance(bikeEvents, byMonth(m))),
              hidden: bike.name !== latestBike,
              yAxisID: 'km',
              type: 'line',
              fill: false,
              borderDash: [10, 5]
            }],
            bikeSeasons.map(season => {
              const seasonEvents = _.filter(bikeEvents, bySeason(season))
              const distance = _.reduce(seasonEvents, (sum, event) => sum + _.get(event, 'dist', 0), 0)
              const borderColor = _.get(_.filter(local.fuelledBikes, { name: bike.name }), '[0].borderColor', 'rgb(183,184,182)')
              const backgroundColor = _.get(_.filter(local.fuelledBikes, { name: bike.name }), '[0].backgroundColor', 'rgb(183,184,182,0.3)')
              return {
                label: `${season}, ${bike.name} (${distance} km)`,
                borderColor,
                backgroundColor: backgroundColor,
                borderWidth: season === currentSeason ? 4 : 2,
                fill: false,
                data: months.map(m => countDistance(seasonEvents, byMonth(m))),
                yAxisID: 'km',
                hidden: !(seasons.slice(0, 3).includes(season)),
                type: 'line'
              }
            }),
            [{
              label: `${bike.name} total average (${totalAvgDistPerMonth} km)`,
              borderColor: bike.borderColor,
              backgroundColor: 'rgb(255,255,255,0)',
              data: months.map(() => totalAvgDistPerMonth),
              hidden: bike.name !== latestBike,
              yAxisID: 'km',
              type: 'line',
              fill: false,
              radius: 0,
              borderDash: [3, 5]
            }])
        }))
      },
      labels (events) {
        return monthsWithEvents(_.filter(events, { type: 'FUEL' })).map(m => MONTH_NAMES[parseInt(m) - 1])
      }
    },
    seasonsDistanceSumByMonth: {
      title: 'Ajokausien matkat kuukausittain (kumulatiivinen)',
      type: 'bar',
      yAxes: [
        { id: 'km', type: 'linear' }
      ],
      datasets (events, latestBike) {
        const fuelEvents = _.filter(events, { type: 'FUEL' })
        const months = monthsWithEvents(fuelEvents)
        const seasons = seasonsWithEvents(fuelEvents)
        const currentSeason = seasons[0]
        return seasons.map(season => {
          const seasonEvents = _.filter(fuelEvents, bySeason(season))
          const seasonBikes = _.chain(seasonEvents).map(e => e.bike).uniq().sort().value().join(', ')
          const seasonTotalDist = _.reduce(seasonEvents, (sum, event) => sum + _.get(event, 'dist', 0), 0)
          const borderColor = _.get(_.filter(local.fuelledBikes, { name: seasonBikes }), '[0].borderColor', 'rgb(183,184,182)')
          const backgroundColor = _.get(_.filter(local.fuelledBikes, { name: seasonBikes }), '[0].backgroundColor', 'rgb(183,184,182,0.3)')
          const data = months.map(m => countDistance(seasonEvents, byMonth(m)))
            .reduce((acc, dist) => {
              if (acc.length === 0 || !_.isNumber(acc[acc.length - 1]) || _.isNaN(acc[acc.length - 1])) {
                acc.push(_.isNumber(dist) && !_.isNaN(dist) ? dist : undefined)
              } else if (_.isNumber(dist) && !_.isNaN(dist)) {
                acc.push(acc[acc.length - 1] + dist)
              } else {
                acc.push(undefined)
              }
              return acc
            }, [])
          return {
            label: `${season}, ${seasonBikes} (${seasonTotalDist} km)`,
            borderColor,
            backgroundColor: backgroundColor,
            borderWidth: season === currentSeason ? 4 : 2,
            data,
            hidden: !(seasons.slice(0, 3).includes(season)),
            yAxisID: 'km',
            type: 'line',
            fill: false
          }
        })
      },
      labels (events) {
        return monthsWithEvents(_.filter(events, { type: 'FUEL' })).map(m => MONTH_NAMES[parseInt(m) - 1])
      }
    },
    seasonsMilageByMonth: {
      title: 'Ajokausien keskikulutukset kuukausittain',
      type: 'bar',
      yAxes: [
        { id: 'milage', type: 'linear' }
      ],
      datasets (events, latestBike) {
        const fuelEvents = _.filter(events, { type: 'FUEL' })
        const months = monthsWithEvents(fuelEvents)
        const seasons = seasonsWithEvents(fuelEvents)
        const currentSeason = seasons[0]
        return local.fuelledBikes.map(bike => {
          const bikeEvents = _.filter(fuelEvents, { bike: bike.name })
          return {
            label: `${bike.name} average`,
            borderColor: bike.borderColor,
            backgroundColor: 'rgb(255,255,255,0)',
            data: months.map(m => milageByMonth(bikeEvents, m)),
            hidden: bike.name !== latestBike,
            yAxisID: 'milage',
            type: 'line',
            fill: false,
            borderDash: [10, 5]
          }
        }).concat(seasons.map(season => {
          const seasonEvents = _.filter(fuelEvents, e => e.date.replace(DATE_REGEX, '$1') === season)
          const seasonBikes = _.chain(seasonEvents).map(e => e.bike).uniq().sort().value().join(', ')
          const distance = _.reduce(seasonEvents, (sum, event) => sum + _.get(event, 'dist', 0), 0)
          const borderColor = _.get(_.filter(local.fuelledBikes, { name: seasonBikes }), '[0].borderColor', 'rgb(183,184,182,0.3)')
          const backgroundColor = _.get(_.filter(local.fuelledBikes, { name: seasonBikes }), '[0].backgroundColor', 'rgb(183,184,182,0.3)')
          return {
            label: `${season}, ${seasonBikes} (${distance} km)`,
            borderColor: borderColor,
            backgroundColor: backgroundColor,
            borderWidth: season === currentSeason ? 4 : 2,
            data: months.map(m => milageByMonth(seasonEvents, m)),
            hidden: !(seasons.slice(0, 3).includes(season)),
            type: 'line',
            fill: false,
            yAxisID: 'milage'
          }
        })).concat(
          local.fuelledBikes.map(bike => {
            const bikeEvents = _.filter(fuelEvents, { bike: bike.name })
            const totalDistance = _.chain(bikeEvents)
              .map(e => e.dist)
              .filter(n => _.isNumber(n) && !_.isNaN(n))
              .reduce((sum, dist) => sum + dist, 0).value()
            const totalFuel = _.chain(bikeEvents)
              .map(e => e.fuelused)
              .filter(n => _.isNumber(n) && !_.isNaN(n))
              .reduce((sum, fuel) => sum + fuel, 0).value()
            const avgMilage = parseFloat((100 * totalFuel / totalDistance).toFixed(2))

            return {
              label: `${bike.name} average (${avgMilage} litraa satasella)`,
              borderColor: bike.borderColor,
              backgroundColor: 'rgb(255,255,255,0)',
              data: months.map(() => avgMilage),
              hidden: bike.name !== latestBike,
              type: 'line',
              fill: false,
              yAxisID: 'milage',
              radius: 0,
              borderDash: [3, 5]
            }
          })
        )
      },
      labels (events) {
        return monthsWithEvents(_.filter(events, { type: 'FUEL' })).map(m => MONTH_NAMES[parseInt(m) - 1])
      }
    }
  },
  allBikes: [],
  fuelledBikes: []
}

function monthsWithEvents (fuelEvents) {
  return _.chain(fuelEvents)
    .map(e => e.date)
    .map(d => d.replace(DATE_REGEX, '$2'))
    .uniq()
    .sort()
    .value()
}

function seasonsWithEvents (fuelEvents) {
  return _.chain(fuelEvents)
    .map(e => e.date)
    .map(d => d.replace(DATE_REGEX, '$1'))
    .uniq()
    .sort()
    .reverse()
    .value()
}

function byMonth (month) {
  return e => e.date.replace(DATE_REGEX, '$2') === month
}

function bySeason (season) {
  return e => e.date.replace(DATE_REGEX, '$1') === season
}

function countDistance (events, filter) {
  const dist = _.chain(events)
    .filter(filter)
    .map(e => e.dist)
    .filter(dist => _.isNumber(dist))
    .reduce((sum, dist) => sum + dist, 0)
    .value()
  return dist && dist > 30 ? dist : undefined
}

function countAverageDistance (events, filter) {
  const filteredEvents = _.filter(events, filter)
  const monthCount = _.chain(filteredEvents)
    .map(e => e.date)
    .map(d => d.replace(DATE_REGEX, '$1-$2'))
    .uniq()
    .value().length
  const totalDistance = _.chain(filteredEvents)
    .map(e => e.dist).filter(n => _.isNumber(n) && !_.isNaN(n))
    .reduce((sum, dist) => sum + dist, 0).value()
  const avgDist = parseFloat((totalDistance / monthCount).toFixed())
  return avgDist
}

function countFuel (events, filter) {
  const fuel = _.chain(events)
    .filter(filter)
    .map(e => e.fuelused)
    .filter(fuel => _.isNumber(fuel) && !_.isNaN(fuel))
    .reduce((sum, fuel) => sum + fuel, 0)
    .value()
  return fuel && fuel > 5 ? fuel : undefined
}

function milageByMonth (events, month) {
  const fuel = countFuel(events, byMonth(month))
  const dist = countDistance(events, byMonth(month))

  return (dist && fuel && dist > 30) ? 100 * fuel / dist : undefined
}

export default {
  name: 'Stats',
  components: {
    PieChart,
    BarChart
  },
  data () {
    const global = GasLogData.get()
    local.allBikes = _.chain(global.events)
      .map(e => e.bike)
      .uniq()
      .sort()
      .map(bike => ({
        name: bike,
        borderColor: nextColor(),
        backgroundColor: currentColor(0.6)
      })).value()

    local.fuelledBikes = _.chain(global.events)
      .filter({ type: 'FUEL' })
      .map(e => e.bike)
      .uniq()
      .sort()
      .map(bike => _.find(local.allBikes, { name: bike }))
      .value()

    return { local, global }
  },
  methods: {
    isCurrentStatType (selected, typeToTest) {
      return local.statisticOptions[selected].type === typeToTest
    }
  },
  computed: {
    chartOptions () {
      return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: this.local.statisticOptions[this.local.selectedStatistic].yAxes
        },
        legend: {
          position: 'bottom'
        }
      }
    },
    chartData () {
      const stat = this.local.statisticOptions[this.local.selectedStatistic]
      return {
        labels: stat.labels(this.global.events),
        datasets: stat.datasets(this.global.events, this.global.latestBike),
        maintainAspectRatio: false
      }
    },
    styles () {
      return {
        // width: '90vw',
        // height: '70vh',
        // 'min-height': '500px',
        // 'min-width': '800px'
      }
    }
  }
}

</script>

<style scoped>

.filters {
  font-weight: bold;
  text-align: center;
  margin: 20px;
}

.filters select {
  font-size: large;
  padding: 5px 20px;
}

</style>
