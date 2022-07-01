<template>
  <form @submit.prevent="tallennaTapahtuma" name="uusi-tankkaus-lomake">
    <fieldset :disabled="lomakeLukittu">

      <label for="pvm">Pvm</label>
      <input id="pvm" type="date" required v-model="lomake.date" />

      <label for="fuel">Tankattu</label>
      <input id="fuel" placeholder="litraa" type="number" required min=0 max=30 step=0.01
        v-model.number="lomake.fuel" />

      <label for="odo">Odo</label>
      <input id="odo" placeholder="matkamittarin lukema" type="number" required step=1 v-model.number="lomake.odo" />

      <label for="info">Info</label>
      <input id="info" type="text" v-model="lomake.info" />

      <input type="submit" value="Lähetä" />
    </fieldset>

    <div v-if="tallennusKaynnissa">Tallennetaan....</div>

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
      tallennusKaynnissa: false,
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
      this.tallennusKaynnissa = true;
      api.tallennaTankkausTapahtuma(this.lomake)
    }
  },
  computed: {
    latausKaynnissa() {
      return !store.tiedotLadattu;
    },
    lomakeLukittu() {
      return this.tallennusKaynnissa || !store.tiedotLadattu;
    }
  }
}

</script>

<style scoped>
fieldset {
  display: grid;
}
</style>
