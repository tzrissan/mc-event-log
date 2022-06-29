
import moment from 'moment';
import { Tankkaus, Huolto, TapahtumanTyyppi, ApiFuelLogEvent } from './schema';

/*
* Oletusjärjestys on:
* - ensisijaisesti päivämäärällä (oletetaan että omistan vain yhden pyörän kerrallaan)
* - toissijaisesti odolla
*/
function tapahtumienOletusVertailu(a: ApiFuelLogEvent, b: ApiFuelLogEvent) {
  if (a.date === b.date) {
    return a.odo - b.odo;
  } else if (a.date > b.date) {
    return 1;
  } else {
    return -1;
  }
}

function luoTankkaus(tankkausTapahtuma: ApiFuelLogEvent): Tankkaus {
  if (tankkausTapahtuma.type !== TapahtumanTyyppi.Tankkaus) {
    throw new Error("Tankkauksen pitää olla tankkaus");
  } else if (tankkausTapahtuma.fuelused === undefined) {
    throw new Error("Tankkauksen yhteydessä pitää tankata");
  } else {
    return new Tankkaus(
      tankkausTapahtuma.id,
      moment(tankkausTapahtuma.date, ['YYYY-MM-DD']).toDate(),
      tankkausTapahtuma.bike,
      tankkausTapahtuma.odo,
      tankkausTapahtuma.type,
      tankkausTapahtuma.info,
      tankkausTapahtuma.fuelused,
      undefined,
      undefined
    );
  }
}

function apiTankkaus2Tankkaus(tankkausTapahtuma: ApiFuelLogEvent, edellinenTankkausTapahtuma?: Tankkaus): Tankkaus {
  const tankkaus = luoTankkaus(tankkausTapahtuma)
  if (edellinenTankkausTapahtuma && tankkausTapahtuma.bike === edellinenTankkausTapahtuma.pyora) {
    tankkaus.matka = tankkaus.odo - edellinenTankkausTapahtuma.odo;
    tankkaus.kulutus = tankkaus.bensa / tankkaus.matka * 100;
  }
  return tankkaus;
}

export function tapahtumat2tankkaukset(tapahtumat: ApiFuelLogEvent[]): Tankkaus[] {
  return tapahtumat
    .filter((tankkaus: ApiFuelLogEvent) => tankkaus.type === TapahtumanTyyppi.Tankkaus)
    .sort(tapahtumienOletusVertailu)
    .reduce((tankkaukset: Tankkaus[], tankkausTapahtuma: ApiFuelLogEvent): Tankkaus[] => {
      const edellinenTankkausTapahtuma = tankkaukset[tankkaukset.length - 1];
      tankkaukset.push(apiTankkaus2Tankkaus(tankkausTapahtuma, edellinenTankkausTapahtuma));
      return tankkaukset;
    }, []);
}

function luoHuolto(huoltoTapahtuma: ApiFuelLogEvent): Huolto {
  if (huoltoTapahtuma.type !== TapahtumanTyyppi.Huolto) {
    throw new Error("Huollon pitää olla huolto");
  } else {
    return new Huolto(
      huoltoTapahtuma.id,
      moment(huoltoTapahtuma.date, ['YYYY-MM-DD']).toDate(),
      huoltoTapahtuma.bike,
      huoltoTapahtuma.odo,
      huoltoTapahtuma.type,
      huoltoTapahtuma.info,
      undefined
    );
  }
}

function apiHuoltoTapahtuma2Huolto(huoltoTapahtuma: ApiFuelLogEvent, edellinenHuolto?: Huolto): Huolto {
  const huolto = luoHuolto(huoltoTapahtuma)
  if (edellinenHuolto && huoltoTapahtuma.bike === edellinenHuolto.pyora) {
    huolto.matka = huolto.odo - edellinenHuolto.odo;
  }
  return huolto;
}

export function tapahtumat2huollot(tapahtumat: ApiFuelLogEvent[]): Huolto[] {
  return tapahtumat
    .filter((tankkaus: ApiFuelLogEvent) => tankkaus.type === TapahtumanTyyppi.Huolto)
    .sort(tapahtumienOletusVertailu)
    .reduce((huollot: Huolto[], tankkausTapahtuma: ApiFuelLogEvent): Huolto[] => {
      const edellinenHuolto = huollot[huollot.length - 1];
      huollot.push(apiHuoltoTapahtuma2Huolto(tankkausTapahtuma, edellinenHuolto))
      return huollot;

    }, []);
}
