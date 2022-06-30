import { reactive } from 'vue'
import type { Tankkaus, Huolto, Rengas, Ajokausi, ApiFuelLogEvent } from './schema';
import { tapahtumat2tankkaukset, tapahtumat2huollot, tapahtumat2renkaat, tapahtumat2ajokaudet } from './konversiot';

class Store {
  tankkaukset: Tankkaus[] = [];
  huollot: Huolto[] = [];
  renkaat: Rengas[] = [];
  ajokaudet: Ajokausi[] = [];
  ajossaOlevaPyora: string | undefined;
  tiedotLadattu: boolean = false;
}

export const store = reactive<Store>(new Store())



export function paivitaData(tapahtumat: ApiFuelLogEvent[]): void {

  if (tapahtumat.length > 0) {

    const tankkaukset = tapahtumat2tankkaukset(tapahtumat);
    const huollot = tapahtumat2huollot(tapahtumat);
    const renkaat = tapahtumat2renkaat(tapahtumat);
    const ajokaudet = tapahtumat2ajokaudet(tapahtumat);

    store.tankkaukset = tankkaukset.reverse();
    store.huollot = huollot.reverse();
    store.renkaat = renkaat.reverse();
    store.ajokaudet = ajokaudet;
    store.ajossaOlevaPyora = tankkaukset[0].pyora;
    store.tiedotLadattu = true;

  }
}

function lueNumero(o: Tankkaus, k: keyof Tankkaus): number | undefined {
  const value = o[k];
  if (typeof value === 'number') {
    return value;
  }
};

export function lueListastaNumerot(objects: Tankkaus[], key: keyof Tankkaus): number[] {
  return objects
    .map(o => lueNumero(o, key))
    .filter(val => val !== undefined) as number[];
};

export function keskiarvo(numerot: number[]): number {
  // Tulkitaan kaikki puuttuvat arvot nolliksi
  const yhteensa = numerot.reduce((a, b) => ((a || 0) + (b || 0)), 0);
  const lukumaara = numerot.length;

  if (lukumaara > 0) {
    return yhteensa / lukumaara;
  } else {
    return 0;
  }
};
