<template>
  <form @submit.prevent="tallennaTapahtuma" name="uusi-tankkaus-lomake">
    <fieldset :disabled="lomakeLukittu">

      <label for="pvm">Pvm</label>
      <input id="pvm" type="date" required v-model="lomake.pvm" />

      <label for="fuel">Tankattu</label>
      <input id="fuel" placeholder="litraa" type="number" required min=0 max=30 step=0.01
        v-model.number="lomake.bensa" />

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
import { ref } from 'vue'
import { api } from "../api";
import { TankkausTapahtumaLomake } from '../schema';
import { store } from '../store';

const lomake = ref(new TankkausTapahtumaLomake(
  moment(new Date()).format('YYYY-MM-DD'),
  undefined,
  undefined,
  "Malmi-Hki"
))

const tallennusKaynnissa = ref(false);

function tallennaTapahtuma() {
  tallennusKaynnissa.value = true;
  api.tallennaTankkausTapahtuma(lomake.value)
}

</script>

<script lang="ts">

export default {
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

<style>
fieldset {
  display: grid;
}
</style>
