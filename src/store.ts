import { reactive } from 'vue'
import type { Tankkaus, Huolto, Rengas, ApiFuelLogEvent } from './schema';
import { tapahtumat2tankkaukset, tapahtumat2huollot, tapahtumat2renkaat } from './konversiot';

class Store {
  tankkaukset: Tankkaus[] = [];
  huollot: Huolto[] = [];
  renkaat: Rengas[] = [];
  ajossaOlevaPyora: string | undefined;
  tiedotLadattu: boolean = false;
}


export const store = reactive<Store>(new Store())



export function paivitaData(tapahtumat: ApiFuelLogEvent[]): void {

  if (tapahtumat.length > 0) {

    const tankkaukset = tapahtumat2tankkaukset(tapahtumat);
    const huollot = tapahtumat2huollot(tapahtumat);
    const renkaat = tapahtumat2renkaat(tapahtumat);

    store.tankkaukset = tankkaukset.reverse();
    store.huollot = huollot.reverse();
    store.renkaat = renkaat.reverse();
    store.ajossaOlevaPyora = store.tankkaukset[0].pyora;
    store.tiedotLadattu = true;

  }
}
