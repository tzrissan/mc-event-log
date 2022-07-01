<template>
  <form @submit.prevent="tallennaTapahtuma" name="uusi-tankkaus-lomake">
    <fieldset :disabled="lomakeLukittu">

      <label for="pvm">Pvm</label>
      <input id="pvm" type="date" required v-model="lomake.date" />

      <label for="fuel">Tankattu</label>
      <input id="fuel" placeholder="litraa" type="number" required min=0 max=30 step=0.01
        v-model.number="lomake.fuel" />

      <label for="odo">Odo</label>
      <input id="odo" placeholder="matkamittarin lukema" type="number" required :min="minOdo" :max="maxOdoInput" step=1
        v-model.number="lomake.odo" />

      <label for="info">Info</label>
      <input id="info" type="text" v-model="lomake.info" />

      <input type="submit" value="Lähetä" />
    </fieldset>

    <div v-if="store.tallennusKaynnissa">Tallennetaan....</div>

  </form>

</template>

<script setup lang="ts">

import moment from 'moment';
import { api } from "../api";
import { TankkausTapahtumaLomake } from '../schema';
import { store } from '../store';

</script>

<script lang="ts">

export default {
  data() {
    return {
      lomake: new TankkausTapahtumaLomake(
        moment(new Date()).format('YYYY-MM-DD'),
        undefined,
        undefined,
        "Malmi-Hki"
      )
    }
  },
  methods: {
    tallennaTapahtuma() {
      store.tallennusKaynnissa = true;
      api.tallennaTankkausTapahtuma(this.lomake)
    }
  },
  computed: {
    latausKaynnissa(): boolean {
      return !store.tiedotLadattu;
    },
    lomakeLukittu(): boolean {
      return store.tallennusKaynnissa || !store.tiedotLadattu;
    },
    minOdo(): number {
      return store.viimeisinTankkaus ? store.viimeisinTankkaus.odo : 0;
    },
    maxOdoInput(): number {
      return this.minOdo + 500;
    }
  }
}

</script>

<style scoped>
fieldset {
  display: grid;
}

label {
  margin-top: 0.3rem;
  font-size: 0.7rem;
}

input {
  font-size: 1rem;
}

input[type=submit] {
  margin-top: 1.5rem;
  height: 1.8rem;
  background: #4cb5f5;
  width: 100%;
  font-size: 1rem;
  font-weight: 700;
  box-shadow: none;
  border: 1px solid;
  border-radius: 0.2rem;
}
</style>
