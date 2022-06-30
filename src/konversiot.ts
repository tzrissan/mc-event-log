
import moment from 'moment';
import { Tankkaus, Huolto, RenkaanVaihto, TapahtumanTyyppi, ApiFuelLogEvent, Rengas, Ajokausi, AjokaudenPyora } from './schema';

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
    if (tankkaus.matka > 50) { // hyvin lyhyet matkat tuottaa epäluotettavia arvoja
      tankkaus.kulutus = tankkaus.bensa / tankkaus.matka * 100;
    }
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
      return new Rengas(asennettu, ika, matka, poistettu)
    } else {
      return new Rengas(asennettu, ika, 0)
    }
  }
}


//FIXME: Lisää dataan tyypitetty tieto pyörän hankinnasta ja myynnistä
/**  @deprecated */
const uusiRengasAlleHackLista: string[] = [
  'Veikkaus banditin hankinnasta. Veikattu 2.12.2014',
  'V-Stromin hankinta',
  'Versys osto'
]

//FIXME: Lisää dataan tyypitetty tieto pyörän hankinnasta ja myynnistä
/**  @deprecated */
const renkaanLopputapahtumaHackLista: string[] = [
  'Banditin myynti. Arvio heitettu 2.12.2014',
  'Myyty'
]

//FIXME: Lisää dataan tyypitetty tieto pyörän hankinnasta ja myynnistä
/**  @deprecated */
const muutTapahtumatJotkaVaikuttaaRenkaisiin: string[] =
  uusiRengasAlleHackLista.concat(renkaanLopputapahtumaHackLista);


export function tapahtumat2renkaat(tapahtumat: ApiFuelLogEvent[]): Rengas[] {
  const renkaanVaihtoTapahtumat = tapahtumat
    .filter((renkaanVaihto: ApiFuelLogEvent) => (
      renkaanVaihto.type === TapahtumanTyyppi.Eturengas
      || renkaanVaihto.type === TapahtumanTyyppi.Takarengas

      //FIXME: Lisää dataan tyypitetty tieto pyörän hankinnasta ja myynnistä
      || (renkaanVaihto.type === TapahtumanTyyppi.Muu
        && muutTapahtumatJotkaVaikuttaaRenkaisiin.includes(renkaanVaihto.info || ''))
    ))
    .flatMap(tapahtuma => {
      if (tapahtuma.type === TapahtumanTyyppi.Muu
        && uusiRengasAlleHackLista.includes(tapahtuma.info || '')) {

        const ostetunPyoranMukanaTullutEturengas = { ...tapahtuma };
        ostetunPyoranMukanaTullutEturengas.type = TapahtumanTyyppi.Eturengas;

        const ostetunPyoranMukanaTullutTakarengas = { ...tapahtuma };
        ostetunPyoranMukanaTullutTakarengas.type = TapahtumanTyyppi.Takarengas;

        return [ostetunPyoranMukanaTullutEturengas, ostetunPyoranMukanaTullutTakarengas];
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
  const viimeisinEtuRenkaanvaihto = renkaat.filter(() => true).reverse().find(rengas => rengas.asennettu.tyyppi === TapahtumanTyyppi.Eturengas);
  const viimeisinTakaRenkaanvaihto = renkaat.filter(() => true).reverse().find(rengas => rengas.asennettu.tyyppi === TapahtumanTyyppi.Takarengas);

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

export function tapahtumat2ajokaudet(tapahtumat: ApiFuelLogEvent[]): Ajokausi[] {
  const kausienAlut = tapahtumat.filter(tapahtuma => tapahtuma.type === TapahtumanTyyppi.KaudenAloitus).sort(tapahtumienOletusVertailu);
  const kausienLoput = tapahtumat.filter(tapahtuma => tapahtuma.type === TapahtumanTyyppi.KaudenLopetus).sort(tapahtumienOletusVertailu);
  const viimeisinTapahtuma = tapahtumat.reduce((viimeisin: ApiFuelLogEvent, ehdokas: ApiFuelLogEvent) => {
    if (ehdokas.date > viimeisin.date) {
      return ehdokas;
    } else {
      return viimeisin;
    }
  })

  return kausienAlut.map(alkuTapahtuma => {
    const alkuPvm = moment(alkuTapahtuma.date, ['YYYY-MM-DD']);
    const vuosi = alkuTapahtuma.date.split('-')[0];
    const kaudenTapahtumat = tapahtumat.filter(tapahtuma => tapahtuma.date.startsWith(vuosi))
    const kaudenLoppu = kaudenTapahtumat.find(tapahtuma => tapahtuma.type === TapahtumanTyyppi.KaudenLopetus)
    const loppuPvm = kaudenLoppu ? moment(kaudenLoppu.date, ['YYYY-MM-DD']) : undefined;
    const kaudellaKaytettyjenPyorienNimet = [... new Set(kaudenTapahtumat.map(tapahtuma => tapahtuma.bike))].sort();
    const ajokaudenPyorat = kaudellaKaytettyjenPyorienNimet.map(pyora => {
      const pyoranTapahtumat = kaudenTapahtumat.filter(tapahtuma => tapahtuma.bike === pyora);
      const pyoranOdot = pyoranTapahtumat.map(tapahtuma => tapahtuma.odo);
      const pyoranMinOdo = Math.min(...pyoranOdot);
      const pyoranMaxOdo = Math.max(...pyoranOdot);
      return new AjokaudenPyora(pyora, pyoranMinOdo, pyoranMaxOdo);
    });
    const ajokaudenPituuskilometreissa = ajokaudenPyorat.map(pyora => pyora.loppuOdo - pyora.alkuOdo).reduce((a, b) => (a || 0) + (b || 0), 0);

    return new Ajokausi(
      vuosi,
      alkuPvm.toDate(),
      !kaudenLoppu,
      paiviaPaivienValissa(alkuPvm, loppuPvm || moment(new Date())),
      ajokaudenPituuskilometreissa,
      ajokaudenPyorat,
      loppuPvm ? loppuPvm.toDate() : undefined
    );
  }
  );
}
