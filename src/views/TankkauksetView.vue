<template>
  <table>
    <colgroup>
      <col class="pvm" />
      <col class="odo" />
      <col class="matka"/>
      <col class="bensa"/>
      <col class="kulutus"/>
      <col />
    </colgroup>
    <thead>
      <tr>
        <th class="pvm">pvm</th>
        <th class="odo">odo</th>
        <th>matka</th>
        <th>bensa</th>
        <th>kulutus</th>
        <th class="info">info</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="tankkaus in store.tankkaukset">
        <td class="pvm">{{ pvm(tankkaus.pvm) }}</td>
        <td>{{ tankkaus.odo }} <small>km</small></td>
        <td>{{ tankkaus.matka }} <small>km</small></td>
        <td>{{ tankkaus.bensa }} <small>ltr</small></td>
        <td>{{ desimaali(tankkaus.kulutus) }}
          <div class="ltr-per-100-km"><br /></div>
        </td>
        <td class="info">{{ tankkaus.info }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import { store } from '../store.js'
import moment from 'moment';

export default {
  data() {
    console.log(store);
    return {
      store: store
    }
  },
  methods: {
    pvm( date: Date ) {
      return moment(date).format('DD.MM.YYYY')
    },
    desimaali( numero: number) {
      return Math.round(numero * 100) / 100
    }
  }
}
</script>

<style scoped>
table {
  border: 1px solid var(--color-border);
  margin: 0;
  border-collapse: collapse;
  min-width: 100%;
  table-layout: fixed;
}

tr:nth-child(even) {
  background-color: var(--color-background-soft);
}

th {
  border: 1px solid var(--color-border);
  background-color: var(--color-background-soft);
  padding: 0 0.2rem;
  font-weight: bold;
}

td {
  text-align: right;
  border-right: 1px solid var(--color-border);
  padding: 0 0.2rem;
}

.pvm {
  text-align: center;
}

col.pvm {
  width: 6rem;
}


col.odo {
  width: 6rem;
}

col.matka {
  width: 6rem;
}

col.bensa {
  width: 6rem;
}

col.kulutus {
  width: 6rem;
}

col.info {
  min-width: 6rem;
}

.info {
  text-align: left;
}

.ltr-per-100-km {
  display: inline-block;
  font-size: 0.5rem;
  line-height: 0.5rem;
}


.ltr-per-100-km::before {
  content: "litraa /"
}

.ltr-per-100-km::after {
  content: "100 km"
}
</style>
