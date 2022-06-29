export enum TapahtumanTyyppi {
  Tankkaus = 'FUEL',
  Eturengas = 'TYRE_FRONT',
  Takarengas = 'TYRE_REAR',
  Huolto = 'MAINTENANCE',
  KaudenAloitus = 'SEASON_START',
  KaudenLopetus = 'SEASON_END',
  Muu = 'OTHER'
}

export class ApiFuelLogEvent {
  id: number;
  date: string;
  bike: string;
  odo: number;
  type: TapahtumanTyyppi;
  info: string | undefined;
  fuelfilled: number | undefined;
  fuelused: number | undefined;

  constructor(
    id: number,
    date: string,
    bike: string,
    odo: number,
    type: TapahtumanTyyppi,
    info: string | undefined,
    fuelfilled: number | undefined,
    fuelused: number | undefined) {
    this.id = id;
    this.date = date;
    this.bike = bike;
    this.odo = odo;
    this.type = type;
    this.info = info;
    this.fuelfilled = fuelfilled;
    this.fuelused = fuelused;
  }
}

export class Tankkaus {
  id: number;
  pvm: Date;
  pyora: string;
  odo: number;
  type: TapahtumanTyyppi.Tankkaus;
  info: string | undefined;
  bensa: number;
  matka: number | undefined;
  kulutus: number | undefined;

  constructor(
    id: number,
    pvm: Date,
    pyora: string,
    odo: number,
    type: TapahtumanTyyppi.Tankkaus,
    info: string | undefined,
    bensa: number,
    matka: number | undefined,
    kulutus: number | undefined
  ) {
    this.id = id;
    this.pvm = pvm;
    this.pyora = pyora;
    this.odo = odo;
    this.type = type;
    this.info = info;
    this.bensa = bensa;
    this.matka = matka;
    this.kulutus = kulutus;
  }
}

export class Huolto {
  id: number;
  pvm: Date;
  pyora: string;
  odo: number;
  type: TapahtumanTyyppi.Huolto;
  info: string | undefined;
  matka: number | undefined;

  constructor(
    id: number,
    pvm: Date,
    pyora: string,
    odo: number,
    type: TapahtumanTyyppi.Huolto,
    info: string | undefined,
    matka: number | undefined
  ) {
    this.id = id;
    this.pvm = pvm;
    this.pyora = pyora;
    this.odo = odo;
    this.type = type;
    this.info = info;
    this.matka = matka;
  }

}

export class TankkausTapahtumaLomake {
  pvm: string;
  bensa: number | undefined;
  odo: number | undefined;
  info: string | undefined;

  constructor(
    pvm: string,
    bensa: number | undefined,
    odo: number | undefined,
    info: string | undefined
  ) {
    this.pvm = pvm;
    this.odo = odo;
    this.info = info;
    this.bensa = bensa;
  }

}
