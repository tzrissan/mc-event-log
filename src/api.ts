import axios from 'axios'
import { paivitaData } from './store'
import type { ApiFuelLogEvent, TankkausTapahtumaLomake } from './schema'

export const api = {

  lataaTapahtumat() {
    axios
      .get("/data")
      .then((res: any) => {
        paivitaData(res.data as ApiFuelLogEvent[])
      });
  },

  tallennaTankkausTapahtuma(lomake: TankkausTapahtumaLomake) {
    axios
      .post("/data", lomake)
      .then((res: any) => {
        this.lataaTapahtumat()
      });
  }
}
