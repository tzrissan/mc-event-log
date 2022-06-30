<template>
  <h1>ajokaudet</h1>
  <table>
    <colgroup>
      <col class="ajokausi" />
      <col class="aikavali" />
      <col class="paivia" />
      <col class="kilometreja" />
      <col />
    </colgroup>
    <thead>
      <tr>
        <th>Vuosi</th>
        <th>Aikaväli</th>
        <th>Päiviä</th>
        <th>Kilometrejä</th>
        <th>km/pv</th>
        <th>Pyörä(t)</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="ajokausi in store.ajokaudet">
        <th>{{ ajokausi.vuosi }}</th>
        <td>{{ pvm(ajokausi.alkuPvm) }} -
          <span v-if="ajokausi.loppPvm">{{ pvm(ajokausi.loppPvm) }}</span>
        </td>
        <td>
          <div class="yksikko-pv kuvaaja" v-bind:style="{ width: kaudenPvLeveys(ajokausi.pituusPaivissa) }">
            <div class="keskiarvo" v-bind:style="{ width: kaudenPvKeskiarvonLeveys }"></div>
            {{ ajokausi.pituusPaivissa.toFixed(0) }}
          </div>
        </td>
        <td>
          <div class="yksikko-km kuvaaja" v-bind:style="{ width: kaudenKmLeveys(ajokausi.pituusKilometreissa) }">
            <div class="keskiarvo" v-bind:style="{ width: kaudenKmKeskiarvonLeveys }"></div>
            {{ ajokausi.pituusKilometreissa }}
          </div>
        </td>
        <td>
          <div class="yksikko-km-per-pv kuvaaja"
            v-bind:style="{ width: kaudenKmPerPvLeveys(ajokausi.kilometrejaPaivassa) }">
            <div class="keskiarvo" v-bind:style="{ width: kaudenKmPerPvKeskiarvonLeveys }"></div>
            {{ ajokausi.kilometrejaPaivassa.toFixed(1) }}
          </div>
        </td>
        <td>{{ listaaPyorat(ajokausi.pyorat) }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">

import type { Ajokausi, AjokaudenPyora } from '@/schema.js';
import { store, keskiarvo } from '../store.js';
import moment from 'moment';

class TaulukonRivi {
  vuosi: string;
  pyora: string;
  vuodenEnsimmainenRivi: boolean;

  constructor(
    vuosi: string,
    pyora: string,
    vuodenEnsimmainenRivi: boolean,
  ) {
    this.vuosi = vuosi;
    this.pyora = pyora;
    this.vuodenEnsimmainenRivi = vuodenEnsimmainenRivi;
  }
}

function kaudenPvLeveys(paivia: number): string {
  return (paivia / 3).toFixed(0) + 'px'
};

function kaudenKmLeveys(km: number): string {
  return (km / 100).toFixed(0) + 'px'
};

function kaudenKmPerPvLeveys(km: number): string {
  return km.toFixed(0) + 'px'
};


export default {
  data() {
    return {
      store
    }
  },
  methods: {
    kaudenPvLeveys,
    kaudenKmLeveys,
    kaudenKmPerPvLeveys,
    pvm(date?: Date): string {
      if (date) {
        return moment(date).format('DD.MM.YYYY');
      } else {
        return "";
      }
    },
    listaaPyorat(pyorat: AjokaudenPyora[]) {
      return pyorat.map(p => {
        return p.pyora + ' (' + p.alkuOdo + '-' + p.loppuOdo + ')'
      }).join(', ');
    }
  },
  computed: {
    kaudenPvKeskiarvo(): number {
      const paivat = this.store.ajokaudet
        .filter(ak => !ak.kesken)
        .map(ak => ak.pituusPaivissa)
        .filter(m => m !== undefined) as number[];
      return keskiarvo(paivat);
    },
    kaudenPvKeskiarvonLeveys(): string {
      return kaudenPvLeveys(this.kaudenPvKeskiarvo);
    },

    kaudenKmKeskiarvo(): number {
      const matkat = this.store.ajokaudet
        .filter(ak => !ak.kesken)
        .map(ak => ak.pituusKilometreissa)
        .filter(m => m !== undefined) as number[];
      return keskiarvo(matkat);
    },
    kaudenKmKeskiarvonLeveys(): string {
      return kaudenKmLeveys(this.kaudenKmKeskiarvo);
    },

    kaudenKmPerPvKeskiarvo(): number {
      const matkat = this.store.ajokaudet
        .filter(ak => !ak.kesken)
        .map(ak => ak.kilometrejaPaivassa)
        .filter(m => m !== undefined) as number[];
      return keskiarvo(matkat);
    },
    kaudenKmPerPvKeskiarvonLeveys(): string {
      return kaudenKmPerPvLeveys(this.kaudenKmPerPvKeskiarvo);
    }
  }
}

</script>

<style scoped >
col.ajokausi {
  width: 6rem;
}
</style>
