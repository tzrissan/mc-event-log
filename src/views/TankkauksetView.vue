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
import { store } from '../store.js';
import moment from 'moment';
import type { Tankkaus } from '@/schema.js';

function matkanKuvaajanLeveys(matka: number): string {
  return (matka / 4).toFixed(0) + 'px'
};

function bensanKuvaajanLeveys(bensa: number): string {
  return (bensa * 4).toFixed(0) + 'px'
};

function kulutuksenKuvaajanLeveys(kulutus: number): string {
  return (kulutus * 10).toFixed(0) + 'px'
};

function lueNumero(o: Tankkaus, k: keyof Tankkaus): number | undefined {
  const value = o[k];
  if (typeof value === 'number') {
    return value;
  }
};

function lueListastaNumerot(objects: Tankkaus[], key: keyof Tankkaus): number[] {
  return objects
    .map(o => lueNumero(o, key))
    .filter(val => val !== undefined) as number[];
};

function keskiarvo(numerot: number[]): number {
  // Tulkitaan kaikki puuttuvat arvot nolliksi
  const yhteensa = numerot.reduce((a, b) => ((a || 0) + (b || 0)), 0);
  const lukumaara = numerot.length;

  if (lukumaara > 0) {
    return yhteensa / lukumaara;
  } else {
    return 0;
  }
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
      const matkat = lueListastaNumerot(store.tankkaukset, 'matka')
      return keskiarvo(matkat)
    },
    matkanKeskiarvonLeveys(): string {
      return matkanKuvaajanLeveys(this.matkojenKeskiarvo);
    },
    bensanKeskiarvo(): number {
      const bensat = lueListastaNumerot(store.tankkaukset, 'bensa')
      return keskiarvo(bensat)
    },
    bensanKeskiarvonLeveys(): string {
      return bensanKuvaajanLeveys(this.bensanKeskiarvo);
    },
    kulutuksenKeskiarvo(): number {
      const bensat = lueListastaNumerot(store.tankkaukset, 'kulutus')
      return keskiarvo(bensat)
    },
    kulutuksenKeskiarvonLeveys(): string {
      return kulutuksenKuvaajanLeveys(this.kulutuksenKeskiarvo);
    }
  }
}
</script>

<style scoped>
.kuvaaja {
  border: none;
  border-right: 2px solid rgba(151, 151, 151, 0.1);
  background-color: rgba(235, 235, 235, 0.64);
  overflow: visible;
  margin: 0.2em 0;
  z-index: 2;
  text-align: left;
}

.keskiarvo {
  border: none;
  border-right: 2px solid rgba(151, 151, 151, 0.1);
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
