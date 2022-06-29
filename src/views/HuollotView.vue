<template>
  <h1>huollot</h1>
  <table>
    <colgroup>
      <col class="pvm" />
      <col class="pyora" />
      <col class="odo" />
      <col class="matka" />
      <col />
      <col />
    </colgroup>
    <thead>
      <tr>
        <th class="pvm">Pvm</th>
        <th class="pyora">Pyörä</th>
        <th class="odo">Odo</th>
        <th class="matka">Matka</th>
        <th class="info">Info</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="huolto in store.huollot">
        <td class="pvm">{{ pvm(huolto.pvm) }}</td>
        <td>{{ huolto.pyora }}</td>
        <td class="yksikko-km">{{ huolto.odo }}</td>
        <td class="yksikko-km">{{ huolto.matka }}</td>
        <td class="info">{{ huolto.info }}</td>
      </tr>
    </tbody>
  </table>
</template>


<script lang="ts">
import { store } from '../store.js';
import moment from 'moment';

export default {
  data() {
    return {
      store
    }
  },
  methods: {
    pvm(date: Date) {
      return moment(date).format('DD.MM.YYYY')
    },
    desimaali(numero: number | undefined) {
      if (numero === undefined) {
        return '';
      } else {
        return numero.toFixed(2);
      }
    }
  }
}
</script>
