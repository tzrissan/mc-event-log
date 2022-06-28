<template>
  <table>
    <colgroup>
      <col class="pvm" />
      <col class="odo" />
      <col class="matka" />
      <col class="bensa" />
      <col class="kulutus" />
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
        <td class="yksikko-km">{{ tankkaus.odo }} </td>
        <td class="yksikko-km">{{ tankkaus.matka }}</td>
        <td class="yksikko-ltr">{{ desimaali(tankkaus.bensa) }}</td>
        <td>{{ desimaali(tankkaus.kulutus) }}
          <div v-if="tankkaus.kulutus !== undefined" class="yksikko-ltr-per-100-km"><br /></div>
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
  white-space: nowrap;
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

.yksikko-ltr-per-100-km {
  display: inline-block;
  font-size: 0.5rem;
  line-height: 0.5rem;
}


.yksikko-ltr-per-100-km::before {
  content: "litraa /"
}

.yksikko-ltr-per-100-km::after {
  content: "100 km"
}


@media (max-width: 412px) {
  .yksikko-ltr-per-100-km {
    display: none;
  }
}

.yksikko-km:not(:empty)::after {
  content: " km";
  font-size: small;
}

@media (max-width: 768px) {
  .yksikko-km:not(:empty)::after {
    font-size: xx-small;
  }
}

@media (max-width: 412px) {
  .yksikko-km:not(:empty)::after {
    content: "";
  }
}


.yksikko-ltr::after {
  content: " ltr";
  font-size: small;
}

@media (max-width: 768px) {
  .yksikko-ltr::after {
    font-size: xx-small;
  }
}

@media (max-width: 412px) {
  .yksikko-ltr::after {
    content: "";
  }
}
</style>
