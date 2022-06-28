import axios from 'axios'
import { paivitaData } from './store'
import { ApiFuelLogEvent } from './schema'

export const api = {
  lataaTapahtumat() {
    axios.get("/data")
      .then((res: any) => {
        paivitaData(res.data as ApiFuelLogEvent[])
      })
  }
}
