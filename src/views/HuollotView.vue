<template>
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

        <td v-if="huolto.matka">
          <div class="yksikko-km kuvaaja" v-bind:style="{ width: huollonKuvaajanLeveys(huolto.matka) }">
            <div v-if="huoltojenKeskiarvo < huolto.matka" class="keskiarvo"
              v-bind:style="{ width: huoltojenKeskiarvonLeveys }"></div>
            {{ huolto.matka }}
          </div>
        </td>
        <td v-else></td>

        <td class="info">{{ huolto.info }}</td>
      </tr>
    </tbody>
  </table>
</template>


<script lang="ts">
import { store, keskiarvo } from '../store.js';
import moment from 'moment';

function huollonKuvaajanLeveys(matka: number): string {
  return (matka / 80).toFixed(0) + 'px'
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
    huollonKuvaajanLeveys
  },
  computed: {
    huoltojenKeskiarvo(): number {
      const matkat = this.store.huollot.map(h => h.matka).filter(m => m !== undefined) as number[];
      return keskiarvo(matkat);
    },
    huoltojenKeskiarvonLeveys(): string {
      return huollonKuvaajanLeveys(this.huoltojenKeskiarvo);
    }
  }
}
</script>
