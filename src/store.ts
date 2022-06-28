import { reactive } from 'vue'

class Tankkaus {
  constructor() {
    this.pvm = new Date();
    this.odo = 12345;
    this.matka = 123;
    this.bensa = 12.34;
    this.kulutus = 123 / 33;
    this.info = "TODO load content";
  }
  pvm: Date;
  odo: number;
  matka: number;
  bensa: number;
  kulutus: number;
  info: string;
}

class Store {
  constructor() {
    this.tankkaukset = [new Tankkaus(), new Tankkaus(), new Tankkaus()];
  }
  tankkaukset: Tankkaus[]
}

export const store = reactive<Store>(new Store())
