
import moment from 'moment';
import { Tankkaus, TapahtumanTyyppi, ApiFuelLogEvent } from './schema';


export function ensimmainenApiTankkaus2Tankkaus(tankkausTapahtuma: ApiFuelLogEvent): Tankkaus {
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

export function apiTankkaus2Tankkaus(tankkausTapahtuma: ApiFuelLogEvent, edellinenTankkausTapahtuma: Tankkaus): Tankkaus {
  const tankkaus = ensimmainenApiTankkaus2Tankkaus(tankkausTapahtuma)
  if (tankkausTapahtuma.bike === edellinenTankkausTapahtuma.pyora) {
    tankkaus.matka = tankkaus.odo - edellinenTankkausTapahtuma.odo;
    tankkaus.kulutus = tankkaus.bensa / tankkaus.matka * 100;
  }
  return tankkaus;
}
