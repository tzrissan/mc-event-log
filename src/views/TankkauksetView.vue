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
          <div class="yksikko-km kuvaaja" v-bind:style="{ width: matkanKuvaajanLeveys(tankkaus.matka) }">
            <div v-if="matkojenKeskiarvo < tankkaus.matka" class="keskiarvo"
              v-bind:style="{ width: matkanKeskiarvonLeveys }"></div>
            {{ tankkaus.matka }}
          </div>
        </td>
        <td v-else />

        <td>
          <div class="yksikko-ltr kuvaaja" v-bind:style="{ width: bensanKuvaajanLeveys(tankkaus.bensa) }">
            <div v-if="bensanKeskiarvo < tankkaus.bensa" class="keskiarvo"
              v-bind:style="{ width: bensanKeskiarvonLeveys }"></div>
            {{ desimaali(tankkaus.bensa) }}
          </div>
        </td>

        <td v-if="tankkaus.kulutus !== undefined">
          <div class="kuvaaja" v-bind:style="{ width: kulutuksenKuvaajanLeveys(tankkaus.kulutus) }">
            <div v-if="kulutuksenKeskiarvo < tankkaus.kulutus" class="keskiarvo"
              v-bind:style="{ width: kulutuksenKeskiarvonLeveys }"></div>
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
import { store, lueListastaNumerot, keskiarvo } from '../store.js';
import moment from 'moment';

function matkanKuvaajanLeveys(matka: number): string {
  return (matka / 4).toFixed(0) + 'px'
};

function bensanKuvaajanLeveys(bensa: number): string {
  return (bensa * 4).toFixed(0) + 'px'
};

function kulutuksenKuvaajanLeveys(kulutus: number): string {
  return (kulutus * 10).toFixed(0) + 'px'
};

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
    matkanKuvaajanLeveys,
    bensanKuvaajanLeveys,
    kulutuksenKuvaajanLeveys,
  },
  computed: {
    matkojenKeskiarvo(): number {
      const matkat = lueListastaNumerot(store.tankkaukset, 'matka');
      return keskiarvo(matkat);
    },
    matkanKeskiarvonLeveys(): string {
      return matkanKuvaajanLeveys(this.matkojenKeskiarvo);
    },
    bensanKeskiarvo(): number {
      const bensat = lueListastaNumerot(store.tankkaukset, 'bensa');
      return keskiarvo(bensat);
    },
    bensanKeskiarvonLeveys(): string {
      return bensanKuvaajanLeveys(this.bensanKeskiarvo);
    },
    kulutuksenKeskiarvo(): number {
      const bensat = lueListastaNumerot(store.tankkaukset, 'kulutus');
      return keskiarvo(bensat);
    },
    kulutuksenKeskiarvonLeveys(): string {
      return kulutuksenKuvaajanLeveys(this.kulutuksenKeskiarvo);
    }
  }
}
</script>

