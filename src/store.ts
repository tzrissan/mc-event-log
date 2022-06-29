import { reactive } from 'vue'
import type { Tankkaus, Huolto, ApiFuelLogEvent } from './schema';
import { tapahtumat2tankkaukset, tapahtumat2huollot } from './konversiot';

class Store {
  tankkaukset: Tankkaus[] = [];
  huollot: Huolto[] = [];
  ajossaOlevaPyora: string | undefined;
  tiedotLadattu: boolean = false;
}


export const store = reactive<Store>(new Store())



export function paivitaData(tapahtumat: ApiFuelLogEvent[]): void {

  if (tapahtumat.length > 0) {

    let tankkaukset = tapahtumat2tankkaukset(tapahtumat);
    let huollot = tapahtumat2huollot(tapahtumat);

    store.tankkaukset = tankkaukset.reverse();
    store.huollot = huollot.reverse();
    store.ajossaOlevaPyora = store.tankkaukset[0].pyora;
    store.tiedotLadattu = true;

  }
}
