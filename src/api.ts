import axios from 'axios'
import { store, paivitaData } from './store'
import type { ApiFuelLogEvent, TankkausTapahtumaLomake } from './schema';

export const api = {

  lataaTapahtumat() {
    axios
      .get("/data")
      .then((res: any) => {
        paivitaData(res.data as ApiFuelLogEvent[])
      })
      .catch((e: any) => store.virhe = true);
  },

  tallennaTankkausTapahtuma(lomake: TankkausTapahtumaLomake) {
    axios
      .post("/data", lomake)
      .then((res: any) => {
        store.tallennusKaynnissa = false;
        this.lataaTapahtumat();
      })
      .catch((e: any) => store.virhe = true);
  }
}
