<template>
  <table>
    <colgroup>
      <col class="pyora" />
      <col class="rengas" />

      <col class="pvm" />
      <col class="odo" />

      <col class="pvm" />
      <col class="odo" />

      <col class="ika" />
      <col class="matka" />
      <col />
      <col />
    </colgroup>
    <thead>
      <tr>
        <th class="pyora">Pyörä</th>
        <th class="rengas">Rengas</th>
        <th class="pvm">Pvm</th>
        <th class="ika">Ikä</th>
        <th class="odo">Odo</th>
        <th class="matka">Matka</th>
        <th class="info">Info</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="rengas in store.renkaat">
        <td>{{ rengas.asennettu.pyora }}</td>
        <td>{{ luettavaTyyppi(rengas.asennettu.type) }}</td>
        <td class="pvm">{{ pvm(rengas.asennettu.pvm) }}
          -
          <span v-if="rengas.poistettu">{{ pvm(rengas.poistettu.pvm) }}</span>
          <span v-else>{{ pvm(new Date()) }}</span>
        </td>
        <td>
          <div class="yksikko-pv kuvaaja" v-bind:style="{ width: renkaanPvKuvaajanLeveys(rengas.ikaPv) }">
            <div class="keskiarvo" v-if="onEturengas(rengas.tyyppi)"
              v-bind:style="{ width: etuRenkaanPvKeskiarvonLeveys }"></div>
            <div class="keskiarvo" v-if="onTakarengas(rengas.tyyppi)"
              v-bind:style="{ width: takaRenkaanPvKeskiarvonLeveys }"></div>
            {{ rengas.ikaPv.toFixed(0) }}
          </div>
        </td>


        <td class="yksikko-km">
          <span> {{ rengas.asennettu.odo }}</span>
          -
          <span v-if="rengas.poistettu"> {{ rengas.poistettu.odo }}</span>
          <span v-else>{{ rengas.asennettu.odo + rengas.ikaKm }}</span>
        </td>

        <td>
          <div class="yksikko-km kuvaaja" v-bind:style="{ width: renkaanKmKuvaajanLeveys(rengas.ikaKm) }">
            <div class="keskiarvo" v-if="onEturengas(rengas.tyyppi)"
              v-bind:style="{ width: etuRenkaanKmKeskiarvonLeveys }"></div>
            <div class="keskiarvo" v-if="onTakarengas(rengas.tyyppi)"
              v-bind:style="{ width: takaRenkaanKmKeskiarvonLeveys }"></div>
            {{ rengas.ikaKm }}
          </div>
        </td>

        <td class="info">{{ rengas.asennettu.info }}
          <span v-if="rengas.poistettu" class="info"> --> {{ rengas.poistettu.info }}</span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import { store, keskiarvo } from '../store.js';
import moment from 'moment';
import { TapahtumanTyyppi } from '@/schema.js';

function renkaanKmKuvaajanLeveys(matka: number): string {
  return (matka / 200).toFixed(0) + 'px'
};

function renkaanPvKuvaajanLeveys(aikaPv: number): string {
  return (aikaPv / 10).toFixed(0) + 'px'
};

export default {
  data() {
    return {
      store
    }
  },
  methods: {
    pvm(date?: Date): string {
      if (date) {
        return moment(date).format('DD.MM.YYYY');
      } else {
        return "";
      }
    },
    luettavaTyyppi(tapahtumanTyyppi: TapahtumanTyyppi): string {
      if (tapahtumanTyyppi == TapahtumanTyyppi.Eturengas) {
        return "etu";
      } else if (tapahtumanTyyppi == TapahtumanTyyppi.Takarengas) {
        return "taka";
      } else {
        return "ei ole rengas: " + tapahtumanTyyppi;
      }
    },
    renkaanKmKuvaajanLeveys,
    renkaanPvKuvaajanLeveys,
    onEturengas(tyyppi: TapahtumanTyyppi): boolean {
      return tyyppi === TapahtumanTyyppi.Eturengas
    },
    onTakarengas(tyyppi: TapahtumanTyyppi): boolean {
      return tyyppi === TapahtumanTyyppi.Takarengas
    }
  },
  computed: {
    etuRenkaanKmKeskiarvo(): number {
      const matkat = store.renkaat
        .filter(r => r.asennettu.type === TapahtumanTyyppi.Eturengas)
        .map(r => r.ikaKm)
        .filter(ikaKm => ikaKm !== undefined) as number[];
      return keskiarvo(matkat);
    },
    etuRenkaanKmKeskiarvonLeveys(): string {
      return renkaanKmKuvaajanLeveys(this.etuRenkaanKmKeskiarvo);
    },
    takaRenkaanKmKeskiarvo(): number {
      const matkat = store.renkaat
        .filter(r => r.asennettu.type === TapahtumanTyyppi.Takarengas)
        .map(r => r.ikaKm)
        .filter(ikaKm => ikaKm !== undefined) as number[];
      return keskiarvo(matkat);
    },
    takaRenkaanKmKeskiarvonLeveys(): string {
      return renkaanKmKuvaajanLeveys(this.takaRenkaanKmKeskiarvo);
    },

    etuRenkaanPvKeskiarvo(): number {
      const matkat = store.renkaat
        .filter(r => r.asennettu.type === TapahtumanTyyppi.Eturengas)
        .map(r => r.ikaPv)
        .filter(ikaPv => ikaPv !== undefined) as number[];
      return keskiarvo(matkat);
    },
    etuRenkaanPvKeskiarvonLeveys(): string {
      return renkaanPvKuvaajanLeveys(this.etuRenkaanPvKeskiarvo);
    },
    takaRenkaanPvKeskiarvo(): number {
      const matkat = store.renkaat
        .filter(r => r.asennettu.type === TapahtumanTyyppi.Takarengas)
        .map(r => r.ikaPv)
        .filter(ikaPv => ikaPv !== undefined) as number[];
      return keskiarvo(matkat);
    },
    takaRenkaanPvKeskiarvonLeveys(): string {
      return renkaanPvKuvaajanLeveys(this.takaRenkaanPvKeskiarvo);
    }
  }
}
</script>

<style scoped>
col.rengas {
  width: 6rem;
}

.yksikko-pv:not(:empty)::after {
  content: " pv";
  font-size: small;
}

@media (max-width: 768px) {
  .yksikko-pv:not(:empty)::after {
    font-size: xx-small;
  }
}

@media (max-width: 412px) {
  .yksikko-pv:not(:empty)::after {
    content: "";
  }
}
</style>
