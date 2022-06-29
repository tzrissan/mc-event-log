
import moment from 'moment';
import { Tankkaus, Huolto, RenkaanVaihto, TapahtumanTyyppi, ApiFuelLogEvent, Rengas } from './schema';

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


function luoRenkaanVaihto(renkaanVaihto: ApiFuelLogEvent) {
  if (!(renkaanVaihto.type === TapahtumanTyyppi.Eturengas
    || renkaanVaihto.type === TapahtumanTyyppi.Takarengas
    || renkaanVaihto.type === TapahtumanTyyppi.Muu)) {
    throw new Error("Renkaan vaihdon pitää olla etu- tai takarenkaan vaihto: " + renkaanVaihto.type);
  } else {
    return new RenkaanVaihto(
      renkaanVaihto.id,
      moment(renkaanVaihto.date, ['YYYY-MM-DD']).toDate(),
      renkaanVaihto.bike,
      renkaanVaihto.odo,
      renkaanVaihto.type,
      renkaanVaihto.info,

    );
  }
}


function etsiSeuraavaTapahtuma(
  pyora: string,
  tyyppi: TapahtumanTyyppi,
  odo: number,
  tapahtumat: ApiFuelLogEvent[]): ApiFuelLogEvent | undefined {

  return tapahtumat.find((tapahtuma) => (
    tapahtuma.bike === pyora
    && (tapahtuma.type === tyyppi || tapahtuma.type === TapahtumanTyyppi.Muu)
    && tapahtuma.odo > odo));

}

function paiviaPaivienValissa(alku: moment.Moment, loppu: moment.Moment): number {
  return moment.duration(loppu.diff(alku)).asDays();
}

function luoRengas(asennusTapahtuma: ApiFuelLogEvent, poistoTapahtuma?: ApiFuelLogEvent): Rengas | undefined {

  if (asennusTapahtuma.type == TapahtumanTyyppi.Muu) {

    return undefined;

  } else {

    const asennettu = luoRenkaanVaihto(asennusTapahtuma);
    const poistettu = poistoTapahtuma ? luoRenkaanVaihto(poistoTapahtuma) : undefined;

    const alkuPvm = asennettu.pvm;
    const loppuPvm = poistettu ? poistettu.pvm : new Date();
    const ika = paiviaPaivienValissa(moment(alkuPvm), moment(loppuPvm));

    // TODO: selvitä muista tiedoista isoin ODO ja laske matka siitä
    // const alkuOdo = asennettu.odo;
    // const loppuOdo = poistettu ? poistettu.odo :

    if (poistettu) {
      const matka = poistettu.odo - asennettu.odo
      return new Rengas(asennettu, poistettu, ika, matka)
    } else {
      return new Rengas(asennettu, undefined, ika, undefined)
    }
  }
}



export function tapahtumat2renkaat(tapahtumat: ApiFuelLogEvent[]): Rengas[] {
  const renkaanVaihtoTapahtumat = tapahtumat
    .filter((renkaanVaihto: ApiFuelLogEvent) => (
      renkaanVaihto.type === TapahtumanTyyppi.Eturengas
      || renkaanVaihto.type === TapahtumanTyyppi.Takarengas

      //FIXME: Lisää dataan tyypitetty tieto pyörän hankinnasta ja myynnistä
      || (renkaanVaihto.type === TapahtumanTyyppi.Muu
        && (renkaanVaihto.info === 'Veikkaus banditin hankinnasta. Veikattu 2.12.2014'
          || renkaanVaihto.info === 'Banditin myynti. Arvio heitettu 2.12.2014'
          || renkaanVaihto.info === 'V-Stromin hankinta'
          || renkaanVaihto.info === 'Myyty'
          || renkaanVaihto.info === 'Versys osto'))
    ))
    .flatMap(tapahtuma => {
      if (tapahtuma.type === TapahtumanTyyppi.Muu) {
        if (tapahtuma.info === 'Veikkaus banditin hankinnasta. Veikattu 2.12.2014'
          || tapahtuma.info === 'Versys osto'
          || tapahtuma.info === 'V-Stromin hankinta') {

          const ostetunPyoranMukanaTullutEturengas = { ...tapahtuma };
          ostetunPyoranMukanaTullutEturengas.type = TapahtumanTyyppi.Eturengas;

          const ostetunPyoranMukanaTullutTakarengas = { ...tapahtuma };
          ostetunPyoranMukanaTullutTakarengas.type = TapahtumanTyyppi.Takarengas;

          return [ostetunPyoranMukanaTullutEturengas, ostetunPyoranMukanaTullutTakarengas];

        }
      }
      return [tapahtuma];
    })
    .sort(tapahtumienOletusVertailu);

  const renkaat = renkaanVaihtoTapahtumat
    .map((renkaanVaihtoTapahtuma: ApiFuelLogEvent): Rengas | undefined => {
      const poistettu = etsiSeuraavaTapahtuma(
        renkaanVaihtoTapahtuma.bike,
        renkaanVaihtoTapahtuma.type,
        renkaanVaihtoTapahtuma.odo,
        renkaanVaihtoTapahtumat)
      return luoRengas(renkaanVaihtoTapahtuma, poistettu);
    })
    .filter((x: any) => x !== undefined) as Rengas[];

  const uusinTapahtuma = tapahtumat.sort(tapahtumienOletusVertailu).reverse()[0];
  const viimeisinEtuRenkaanvaihto = renkaat.filter(() => true).reverse().find(rengas => rengas.asennettu.type === TapahtumanTyyppi.Eturengas);
  const viimeisinTakaRenkaanvaihto = renkaat.filter(() => true).reverse().find(rengas => rengas.asennettu.type === TapahtumanTyyppi.Takarengas);

  if (viimeisinEtuRenkaanvaihto) {
    viimeisinEtuRenkaanvaihto.ikaKm = uusinTapahtuma.odo - viimeisinEtuRenkaanvaihto.asennettu.odo
    viimeisinEtuRenkaanvaihto.ikaPv =
      paiviaPaivienValissa(
        moment(viimeisinEtuRenkaanvaihto.asennettu.pvm),
        moment(uusinTapahtuma.date, ['YYYY-MM-DD']));
  }

  if (viimeisinTakaRenkaanvaihto) {
    viimeisinTakaRenkaanvaihto.ikaKm = uusinTapahtuma.odo - viimeisinTakaRenkaanvaihto.asennettu.odo
    viimeisinTakaRenkaanvaihto.ikaPv =
      paiviaPaivienValissa(
        moment(viimeisinTakaRenkaanvaihto.asennettu.pvm),
        moment(uusinTapahtuma.date, ['YYYY-MM-DD']));
  }

  return renkaat;
}

