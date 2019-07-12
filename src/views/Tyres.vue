<template>
  <div>
    <div class="mc">
      <table>
        <col width="80"/>
        <col/>
        <tr class="bike" v-for="bike in allData" :key="bike.name">
          <td class="bike-name">{{bike.name}}</td>
          <td>
            <div class="graph">
              <div class="front">
                <div class="tyre-front firstEvent" :style="bike.firstEvent.style">
                  <div class="desc">
                    <div class="date">{{ bike.firstEvent.date | moment('D.M.YYYY') }}</div>
                    <div>{{ bike.firstEvent.info }}</div>
                    <div>{{ bike.firstEvent.odo }}</div>
                    <div v-if="bike.firstEvent.dist">{{ bike.firstEvent.dist }} km</div>
                  </div>
                </div>
                <div v-for="event in bike.TYRE_FRONT.tyreEvents"
                     :key="event.odo"
                     :style="event.style"
                     class="tyre-front"
                     :class="{ myEvent: event.myEvent}">
                  <div class="desc">
                    <div class="date">{{ event.date | moment('D.M.YYYY') }} | {{ event.odo }}</div>
                    <div>{{ event.info }}</div>
                    <div v-if="event.dist">{{ event.dist }} km</div>
                  </div>
                </div>
                <div class="tyre-front lastEvent" :style="bike.lastEvent.frontStyle">
                  <div class="desc">
                    <div class="date">{{ bike.lastEvent.date | moment('D.M.YYYY') }} | {{ bike.lastEvent.odo }}</div>
                    <div>Eturengas: {{ bike.lastEvent.frontDist }} km</div>
                    <div>Takarengas: {{ bike.lastEvent.rearDist }} km</div>
                  </div>
                </div>
              </div>
              <div class="rear">
                <div class="tyre-rear firstEvent" :style="bike.firstEvent.style"></div>
                <div v-for="event in bike.TYRE_REAR.tyreEvents"
                     :key="event.odo"
                     :style="event.style"
                     class="tyre-rear"
                     :class="{ myEvent: event.myEvent, firstEvent: event.firstEvent, current: event.current }">
                  <div class="desc">
                    <div class="date">{{ event.date | moment('D.M.YYYY') }} | {{ event.odo }}</div>
                    <div>{{ event.info }}</div>
                    <div v-if="event.dist">{{ event.dist }} km</div>
                  </div>
                </div>
                <div class="tyre-rear lastEvent" :style="bike.lastEvent.rearStyle"></div>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
  import _ from 'lodash'
  import GasLogData from '../data.js'

  export default {
    name: 'Tyres',
    data: function () {
      return {
        global: GasLogData.get()
      }
    },
    computed: {
      maxOdo () {
        return Math.max(...this.global.events.map(e => e.odo))
      },
      allData () {
        return this.global.bikes
          .map(bike => ({
            name: bike,
            events: _.filter(this.global.events, { bike })
          }))
          .flatMap(bike => ({
            name: bike.name,
            firstEvent: this.firstEvent(bike.events),
            lastEvent: this.lastEvent(bike.events),
            TYRE_FRONT: this.statsForBike(bike.events, 'TYRE_FRONT'),
            TYRE_REAR: this.statsForBike(bike.events, 'TYRE_REAR')
          }))
          .reverse()
      }
    },
    methods: {
      firstEvent (bikeEvents) {
        const minOdo = Math.min(...bikeEvents.map(e => e.odo))
        return {
          odo: minOdo,
          info: 'Enimmäinen merkintä',
          date: _.first(bikeEvents.map(e => e.date).sort()),
          myEvent: false,
          firstEvent: true,
          current: false,
          style: this.width(minOdo)
        }
      },
      lastEvent (bikeEvents) {
        const minOdo = Math.min(...bikeEvents.map(e => e.odo))
        const maxOdo = Math.max(...bikeEvents.map(e => e.odo))
        const lastFrontChange = _.chain(bikeEvents).filter({ type: 'TYRE_FRONT' }).sortBy('odo').last().get('odo', minOdo).value()
        const frontDist = maxOdo - lastFrontChange
        const lastRearChange = _.chain(bikeEvents).filter({ type: 'TYRE_REAR' }).sortBy('odo').last().get('odo', minOdo).value()
        const rearDist = maxOdo - lastRearChange
        return {
          odo: maxOdo,
          frontDist,
          rearDist,
          info: 'Viimeisin merkintä',
          date: _.last(bikeEvents.map(e => e.date).sort()),
          myEvent: false,
          firstEvent: true,
          current: false,
          frontStyle: this.width(frontDist),
          rearStyle: this.width(rearDist)
        }
      },
      statsForBike (bikeEvents, eventType) {
        const odos = bikeEvents.map(e => e.odo)
        const minOdo = Math.min(...odos)
        const maxOdo = Math.max(...odos)
        const width = this.width
        const tyreEvents = _.filter(bikeEvents, { type: eventType }).map(e => ({
          odo: e.odo,
          dist: e.dist,
          info: e.info,
          date: e.date,
          myEvent: true,
          firstEvent: false,
          current: false,
          style: width(e.dist)
        }))
        return {
          minOdo, maxOdo, tyreEvents
        }
      },
      width (dist) {
        const width = Math.trunc((dist / this.maxOdo) * 10000) / 100
        return `width: calc(${width}% - 2px);`
      }
    }
  }

</script>

<style scoped lang="scss">

  @import "../assets/colors";

  .mc {
    margin-top: 30px;
    padding-left: 20px;
    padding-right: 20px;

    table {
      width: 100%;
      border-collapse: collapse;

      .bike {

        border-bottom: 1px solid lightgrey;

        .bike-name {
          text-align: center;
          vertical-align: center;
        }

        .graph {
          padding-top: 90px;
          padding-bottom: 90px;

          .tyre-front, .tyre-rear {
            display: inline-block;
            height: 30px;
            padding-top: 5px;
            border: none;
            border-right: 2px solid white;
            background-color: lightgrey;
            text-align: center;
            position: relative;

            .desc {
              padding: 3px 10px 2px 5px;
              font-size: small;
              height: 50px;
              background-color: white;
              border: 2px solid $blueSky;
              position: absolute;
              top: -70px;
              right: -22px;
              white-space: nowrap;
              z-index: 4;
              text-align: right;

              &:hover {
                z-index: 5;
              }

              .date {
                border-bottom: 1px solid lightgrey;
              }
            }

            &.myEvent {
              background-color: $blueSky;

              .desc::after {
                content: "";
                width: 0px;
                height: 0px;
                border: 10px solid transparent;
                position: absolute;
                right: 10px;
                bottom: -21px;
                border-top-color: $blueSky;
              }
            }

            &.lastEvent {
              background-color: $fields;
              font-size: initial;

              .desc {
                top: initial;
                bottom: -70px;
                border-color: $fields;

                &::after {
                  content: "";
                  width: 0px;
                  height: 0px;
                  border: 10px solid transparent;
                  position: absolute;
                  right: 12px;
                  top: -21px;
                  border-bottom-color: $fields;
                }

                &::before {
                  content: "";
                  width: 0px;
                  height: 0px;
                  border: 10px solid transparent;
                  position: absolute;
                  right: 12px;
                  bottom: -21px;
                  border-top-color: $fields;
                }
              }
            }

            &.firstEvent {
              background-color: lightgrey;
              font-size: initial;

              .desc {
                top: initial;
                bottom: -70px;
                border-color: lightgrey;
                right: -70px;

                &::after {
                  content: "";
                  width: 0px;
                  height: 0px;
                  border: 10px solid transparent;
                  position: absolute;
                  right: 57px;
                  top: -21px;
                  border-bottom-color: lightgrey;
                }

                &::before {
                  content: "";
                  width: 0px;
                  height: 0px;
                  border: 10px solid transparent;
                  position: absolute;
                  right: 57px;
                  bottom: -21px;
                  border-top-color: lightgrey;
                }
              }
            }
          }

          .rear {
            padding-top: 78px;
          }

          .tyre-rear {
            &.firstEvent, &.current {
              .desc {
                display: none;
              }
            }

            &.myEvent {
              .desc {
                top: initial;
                bottom: -70px;
                border-color: $blueSky;
                right: -70px;

                &::after {
                  content: "";
                  width: 0px;
                  height: 0px;
                  border: 10px solid transparent;
                  position: absolute;
                  right: 57px;
                  top: -21px;
                  border-bottom-color: $blueSky;
                }
              }
            }
          }
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

</style>
