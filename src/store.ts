import { reactive } from 'vue'
import { Tankkaus, TapahtumanTyyppi, ApiFuelLogEvent } from './schema';
import {
  ensimmainenApiTankkaus2Tankkaus,
  apiTankkaus2Tankkaus
} from './konversiot';

class Store {
  constructor() {
    this.tankkaukset = [];
  }
  tankkaukset: Tankkaus[]
  ajossaOlevaPyora: string | undefined;
  tiedotLadattu: boolean = false;
}


export const store = reactive<Store>(new Store())

export function paivitaData(tapahtumat: ApiFuelLogEvent[]) {

  if (tapahtumat.length > 0) {

    let tankkaukset = tapahtumat
      .filter((tankkaus: ApiFuelLogEvent) => tankkaus.type === TapahtumanTyyppi.Tankkaus)
      .sort((a: ApiFuelLogEvent, b: ApiFuelLogEvent) => {
        if (a.date === b.date) {
          return a.odo - b.odo;
        } else if (a.date > b.date) {
          return 1;
        } else {
          return -1;
        }
      })
      .reduce((tankkaukset: Tankkaus[], tankkausTapahtuma: ApiFuelLogEvent): Tankkaus[] => {

        if (tankkaukset.length === 0) {
          // historian alku; matkaa tai kulutusta ei tiedetä
          return [ensimmainenApiTankkaus2Tankkaus(tankkausTapahtuma)];
        } else {
          const edellinenTankkausTapahtuma = tankkaukset[tankkaukset.length - 1];
          tankkaukset.push(apiTankkaus2Tankkaus(tankkausTapahtuma, edellinenTankkausTapahtuma));
          return tankkaukset;
        }

      }, []);

    store.tankkaukset = tankkaukset.reverse();
    store.ajossaOlevaPyora = store.tankkaukset[0].pyora;
    store.tiedotLadattu = true;

  }
}
