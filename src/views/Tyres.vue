<template>
  <div>
    <div class="mc">
      <table>
        <col width="80"/>
        <col/>
        <tr class="bike" v-for="bike in allData" :key="bike.bike">
          <td class="bike-name">{{bike.bike}}</td>
          <td>
            <div class="graph">
              <div class="front">
                <div v-for="event in bike.TYRE_FRONT.maintenances"
                     :key="event.odo"
                     :style="event.style"
                     class="tyre-front"
                     :class="{ myEvent: event.myEvent, firstEvent: event.firstEvent, current: event.current }">
                  <div class="desc">
                    <div class="date">{{ event.date | moment("D.M.YYYY") }}</div>
                    <div>{{ event.info }}</div>
                    <div>{{ event.odo }}</div>
                    <div v-if="event.dist">{{ event.dist }} km</div>
                  </div>
                </div>
              </div>
              <div class="rear">
                <div v-for="event in bike.TYRE_REAR.maintenances"
                     :key="event.odo"
                     :style="event.style"
                     class="tyre-rear"
                     :class="{ myEvent: event.myEvent, firstEvent: event.firstEvent, current: event.current }">
                  <div class="desc">
                    <div class="date">{{ event.date | moment("D.M.YYYY") }}</div>
                    <div>{{ event.info }}</div>
                    <div>{{ event.odo }}</div>
                    <div v-if="event.dist">{{ event.dist }} km</div>
                  </div>
                </div>
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
      maxOdo() {
        return Math.max(...this.global.events.map(e => e.odo))
      },
      allData() {
        return this.global.bikes
          .flatMap(bike => ({
              bike,
              TYRE_FRONT: this.statsForBike(bike, 'TYRE_FRONT', 'eturengas'),
              TYRE_REAR: this.statsForBike(bike, 'TYRE_REAR', 'takanakki')
            })
          ).reverse()
      }
    },
    methods: {
      statsForBike(bike, eventType, title) {
        const bikeEvents = _.filter(this.global.events, {bike})
        const odos = bikeEvents.map(e => e.odo)
        const dates = bikeEvents.map(e => e.date).sort()
        const minOdo = Math.min(...odos)
        const maxOdo = Math.max(...odos)
        const minDate = _.first(dates)
        const maxDate = _.last(dates)
        const width = this.width
        const maintenances = _.filter(bikeEvents, {type: eventType}).map(e => ({
          odo: e.odo,
          dist: e.dist,
          info: e.info,
          date: e.date,
          myEvent: true,
          firstEvent: false,
          current: false,
          style: width(e.dist)
        }))
        const spacer = {
          odo: minOdo,
          info: 'Enimmäinen merkintä',
          date: minDate,
          myEvent: false,
          firstEvent: true,
          current: false,
          style: width(minOdo)
        }
        const lastMaintenanceOdo = maintenances.length > 0 ? Math.max(...maintenances.map(m => m.odo)) : minOdo
        const currentMaintenanceDistance = maxOdo - lastMaintenanceOdo
        const upcoming = {
          odo: maxOdo,
          dist: currentMaintenanceDistance,
          info: 'Viimeisin merkintä',
          date: maxDate,
          myEvent: false,
          firstEvent: false,
          current: true,
          style: width(currentMaintenanceDistance)
        }
        return {
          title: `${bike}, ${title}`, minOdo, maxOdo, maintenances: [spacer, ...maintenances, upcoming]
        }
      },
      width(dist) {
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
          padding-top: 110px;
          padding-bottom: 110px;

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
              height: 65px;
              background-color: white;
              border: 2px solid $blueSky;
              position: absolute;
              top: -83px;
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

            &.current {
              background-color: $fields;
              font-size: initial;

              .desc {
                top: initial;
                bottom: -83px;
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
                bottom: -83px;
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
            padding-top: 90px;
          }

          .tyre-rear {
            &.firstEvent, &.current {
              color: red;

              .desc {
                display: none;
              }
            }

            &.myEvent {
              .desc {
                top: initial;
                bottom: -83px;
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
