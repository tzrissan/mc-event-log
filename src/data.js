import axios from 'axios'
import _ from 'lodash'

export const PROD = !window.location.href.match(/localhost/)
export const DATE_REGEX = /(\d{4})-(\d{2})-(\d{2})/
export const MONTH_NAMES = ['Tammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu', 'Toukokuu', 'Kesäkuu', 'Heinäkuu', 'Elokuu', 'Syyskuu', 'Lokakuu', 'Marraskuu', 'Joulukuu']

const _data = {
  bikes: [],
  years: [],
  months: [],
  latestBike: undefined,
  events: []
}

function countMilages (events) {
  function countDistancesAndMilageForFuelEvents (bike) {
    const bikeFuelEvents = _.chain(events).filter({ type: 'FUEL', bike: bike }).sortBy('odo').value()
    let prev
    _.each(bikeFuelEvents, function (current) {
      if (prev) {
        current.dist = current.odo - prev.odo
        current.milage = parseFloat((100.0 * current.fuelused / current.dist).toFixed(2))
      }
      prev = current
    })
  }

  function countDistancesForFrontTyres (bike) {
    const bikeFrontTyreEvents = _.chain(events).filter({ type: 'TYRE_FRONT', bike: bike }).sortBy('odo').value()
    let prev = _.chain(events).filter({ bike: bike }).sortBy('odo').first().value()
    _.each(bikeFrontTyreEvents, function (current) {
      if (prev) {
        current.dist = current.odo - prev.odo
      } else {
        current.dist = current.odo
      }
      prev = current
    })
  }

  function countDistancesForRearTyres (bike) {
    const bikeRearTyreEvents = _.chain(events).filter({ type: 'TYRE_REAR', bike: bike }).sortBy('odo').value()
    let prev = _.chain(events).filter({ bike: bike }).sortBy('odo').first().value()
    _.each(bikeRearTyreEvents, function (current) {
      current.dist = current.odo - prev.odo
      prev = current
    })
  }

  function countDistancesForMaintenance (bike) {
    const bikeMaintenanceEvents = _.chain(events).filter({ type: 'MAINTENANCE', bike: bike }).sortBy('odo').value()
    let prev = _.chain(events).filter({ bike: bike }).sortBy('odo').first().value()
    _.each(bikeMaintenanceEvents, function (current) {
      current.dist = current.odo - prev.odo
      prev = current
    })
  }

  _data.bikes.forEach(bike => {
    countDistancesAndMilageForFuelEvents(bike)
    countDistancesForFrontTyres(bike)
    countDistancesForRearTyres(bike)
    countDistancesForMaintenance(bike)
  })
}

function countExtraInformationFromData () {
  _data.bikes = _.toPairs(_data.events.reduce((acc, event) => {
    if (!acc[event.bike] || acc[event.bike] < event.date) {
      acc[event.bike] = event.date
    }
    return acc
  }, {})).sort((a, b) =>
    a[1] > b[1] ? 1
      : a[1] === b[1] ? 0 : -1
  ).map(e => e[0])
  _data.years = _.chain(_data.events).map(e => e.date).map(d => d.replace(DATE_REGEX, '$1')).uniq().sort().reverse().value()
  _data.months = _.chain(_data.events).map(e => e.date).map(d => d.replace(DATE_REGEX, '$2')).uniq().sort().value()
  _data.latestBike = _.chain(_data.events)
    .filter({ type: 'FUEL' })
    .sortBy('date')
    .last().value().bike
  countMilages(_data.events)
}

function reload () {
  axios.create().get('/data')
    .then((response) => {
      _data.events = response.data
      countExtraInformationFromData()
    })
}

reload()

const GasLogData = {
  get () {
    return _data
  },
  reload,
  countExtraInformationFromData
}

export default GasLogData
