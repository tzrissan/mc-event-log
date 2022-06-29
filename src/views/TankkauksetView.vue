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
        <th class="pvm">Pvm</th>
        <th class="odo">Odo</th>
        <th>Matka</th>
        <th>Bensa</th>
        <th>Kulutus</th>
        <th class="info">Info</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="tankkaus in store.tankkaukset">
        <td class="pvm">{{ pvm(tankkaus.pvm) }}</td>
        <td class="yksikko-km">{{ tankkaus.odo }} </td>

        <td v-if="tankkaus.matka">
          <div v-if="matkanKeskiarvonLeveys" class="keskiarvo" v-bind:style="{ width: matkanKeskiarvonLeveys }" />
          <div class="yksikko-km kuvaaja" v-bind:style="{ width: matkanKuvaajanLeveys(tankkaus.matka) }">
            {{ tankkaus.matka }}</div>
        </td>
        <td v-else />

        <td>
          <div class="yksikko-ltr kuvaaja" v-bind:style="{ width: bensanKuvaajanLeveys(tankkaus.bensa) }">
            {{ desimaali(tankkaus.bensa) }}</div>
        </td>

        <td v-if="tankkaus.kulutus !== undefined">
          <div class="kuvaaja" v-bind:style="{ width: kulutuksenKuvaajanLeveys(tankkaus.kulutus) }">
            {{ desimaali(tankkaus.kulutus) }}
            <div class="yksikko-ltr-per-100-km"><br /></div>
          </div>
        </td>
        <td v-else />
        <td class="info">{{ tankkaus.info }}</td>
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
    },
    matkanKuvaajanLeveys(matka: number): string {
      return (matka / 4).toFixed(0) + 'px'
    },
    bensanKuvaajanLeveys(bensa: number): string {
      return (bensa * 4).toFixed(0) + 'px'
    },
    kulutuksenKuvaajanLeveys(kulutus: number): string {
      return (kulutus * 10).toFixed(0) + 'px'
    },
  },
  computed: {
    matkanKeskiarvonLeveys(): string {
      const matkat = store.tankkaukset
        .map(tankkaus => tankkaus.matka)
        .filter(matka => matka !== undefined)
      const matkaYhteensa = matkat.reduce((a, b) => ((a || 0) + (b || 0)), 0);

      if (matkaYhteensa && matkat.length > 0) {
        return this.matkanKuvaajanLeveys(matkaYhteensa / matkat.length);
      } else {
        return '0px';
      }

    }
  }
}
</script>

<style scoped>
.kuvaaja {
  border: none;
  border-right: 2px solid rgba(235, 235, 235, 1);
  background-color: rgba(235, 235, 235, 0.64);
  overflow: visible;
  margin: 0.2em 0;
  z-index: 2;
  text-align: left;
}

.keskiarvo {
  border: none;
  border-right: 1px solid rgba(49, 76, 228, 0.1);
  width: 50px;
  height: 100%;
  z-index: 1;
  position: absolute;
  background: none;
  pointer-events: none;
}

.kuvaaja.hyva-arvo {
  border-right: 2px solid rgba(8, 165, 21, 0.5);
  background-color: rgba(8, 165, 21, 0.23);
}

.kuvaaja.huono-arvo {
  border-right: 2px solid rgba(204, 0, 0, 0.5);
  background-color: rgba(204, 0, 0, 0.23);
}
</style>
