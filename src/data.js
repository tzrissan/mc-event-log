import axios from 'axios';
import _ from 'lodash';

export const PROD = !window.location.href.match(/localhost/);

const _data = {
    bikes: [],
    years: [],
    months: [],
    latestBike: undefined,
    events: PROD ? [] : [
        {
            "info": "Veikkaus banditin hankinnasta. Veikattu 2.12.2014",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 12000,
            "date": "2007-06-08",
            "type": "OTHER",
            "bike": "bandit"
        },
        {
            "info": "Banditin ostop\u00e4iv\u00e4. T\u00e4st\u00e4 se l\u00e4hti. Odo veikattu 2.12.2014",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 12000,
            "date": "2007-06-08",
            "type": "SEASON_START",
            "bike": "bandit"
        },
        {
            "info": "Veikkaus ekan kauden loppumisesta",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 17000,
            "date": "2007-10-12",
            "type": "SEASON_END",
            "bike": "bandit"
        },
        {
            "info": "Kauden mahdollinen aloitus. P\u00e4iv\u00e4 ja odo arvattu 25.11.2014",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 17000,
            "date": "2008-04-26",
            "type": "SEASON_START",
            "bike": "bandit"
        },
        {
            "info": "V-Stromin hankinta",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 10500,
            "date": "2008-07-18",
            "type": "OTHER",
            "bike": "vstrom"
        },
        {
            "info": "Banditin myynti. Arvio heitettu 2.12.2014",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 22000,
            "date": "2008-07-18",
            "type": "OTHER",
            "bike": "bandit"
        },
        {
            "info": "12k huolto",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 11875,
            "date": "2008-08-21",
            "type": "MAINTENANCE",
            "bike": "vstrom"
        },
        {
            "info": "Arvio takakumin vaihdosta",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 13000,
            "date": "2008-09-15",
            "type": "TYRE_REAR",
            "bike": "vstrom"
        },
        {
            "info": "Odo arvattu 24.11.2014",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 13948,
            "date": "2008-10-12",
            "type": "SEASON_END",
            "bike": "vstrom"
        },
        {
            "info": "Alkumerkint\u00e4, odo arvattu",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 13700,
            "date": "2009-04-27",
            "type": "SEASON_START",
            "bike": "vstrom"
        },
        {
            "info": "Eka tankki",
            "fuelused": 16.39,
            "fuelfilled": 16.39,
            "odo": 13948,
            "date": "2009-04-28",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Hki",
            "fuelused": 14.4,
            "fuelfilled": 14.4,
            "odo": 14117,
            "date": "2009-05-03",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Hki",
            "fuelused": 15.84,
            "fuelfilled": 15.84,
            "odo": 14259,
            "date": "2009-05-08",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Hki",
            "fuelused": 17.04,
            "fuelfilled": 17.04,
            "odo": 14517,
            "date": "2009-05-17",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Humppila",
            "fuelused": 15.4,
            "fuelfilled": 15.4,
            "odo": 14783,
            "date": "2009-05-20",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Nokia",
            "fuelused": 11.33,
            "fuelfilled": 11.33,
            "odo": 14996,
            "date": "2009-05-21",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Keskiseisontatuki + fender extender",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 15174,
            "date": "2009-05-23",
            "type": "OTHER",
            "bike": "vstrom"
        },
        {
            "info": "Hki",
            "fuelused": 16.0,
            "fuelfilled": 16.0,
            "odo": 15264,
            "date": "2009-05-25",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Pro-Oiler asennettu",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 15406,
            "date": "2009-06-02",
            "type": "OTHER",
            "bike": "vstrom"
        },
        {
            "info": "Hki",
            "fuelused": 16.24,
            "fuelfilled": 16.24,
            "odo": 15513,
            "date": "2009-06-04",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Hki",
            "fuelused": 18.27,
            "fuelfilled": 18.27,
            "odo": 15798,
            "date": "2009-06-12",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Eteen Z6",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 16054,
            "date": "2009-06-15",
            "type": "TYRE_FRONT",
            "bike": "vstrom"
        },
        {
            "info": "Hki",
            "fuelused": 16.14,
            "fuelfilled": 16.14,
            "odo": 16057,
            "date": "2009-06-16",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Jyv\u00e4skyl\u00e4",
            "fuelused": 18.76,
            "fuelfilled": 18.76,
            "odo": 16338,
            "date": "2009-06-17",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Haapaj\u00e4rvi",
            "fuelused": 12.11,
            "fuelfilled": 12.11,
            "odo": 16533,
            "date": "2009-06-17",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Oulu",
            "fuelused": 9.5,
            "fuelfilled": 9.5,
            "odo": 16676,
            "date": "2009-06-17",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Ranua",
            "fuelused": 11.06,
            "fuelfilled": 11.06,
            "odo": 16853,
            "date": "2009-06-17",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Sodankyl\u00e4",
            "fuelused": 15.4,
            "fuelfilled": 15.4,
            "odo": 17098,
            "date": "2009-06-18",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Inari, odo laskettu j\u00e4lkik\u00e4teen",
            "fuelused": 12.94,
            "fuelfilled": 12.94,
            "odo": 17295,
            "date": "2009-06-18",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Utsjoki",
            "fuelused": 10.05,
            "fuelfilled": 10.05,
            "odo": 17442,
            "date": "2009-06-19",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Utsjoki",
            "fuelused": 11.5,
            "fuelfilled": 11.5,
            "odo": 17645,
            "date": "2009-06-23",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Merkint\u00e4 puuttuu",
            "fuelused": 17.0,
            "fuelfilled": 17.0,
            "odo": 17913,
            "date": "2009-06-25",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Saariselk\u00e4",
            "fuelused": 12.57,
            "fuelfilled": 12.57,
            "odo": 18112,
            "date": "2009-06-26",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vanttauskoski",
            "fuelused": 18.0,
            "fuelfilled": 18.0,
            "odo": 18425,
            "date": "2009-06-27",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Kajaani",
            "fuelused": 19.6,
            "fuelfilled": 19.6,
            "odo": 18760,
            "date": "2009-06-27",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Juva",
            "fuelused": 18.18,
            "fuelfilled": 18.18,
            "odo": 19061,
            "date": "2009-06-27",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Kotka, odo laskettu j\u00e4lkik\u00e4teen",
            "fuelused": 12.14,
            "fuelfilled": 12.14,
            "odo": 19262,
            "date": "2009-06-30",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Hki",
            "fuelused": 17.77,
            "fuelfilled": 17.77,
            "odo": 19556,
            "date": "2009-07-05",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "18k huolto",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 19687,
            "date": "2009-07-13",
            "type": "MAINTENANCE",
            "bike": "vstrom"
        },
        {
            "info": "Hki",
            "fuelused": 17.23,
            "fuelfilled": 17.23,
            "odo": 19833,
            "date": "2009-07-16",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Kotka",
            "fuelused": 18.66,
            "fuelfilled": 18.66,
            "odo": 20158,
            "date": "2009-07-19",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Hki",
            "fuelused": 18.17,
            "fuelfilled": 18.17,
            "odo": 20436,
            "date": "2009-07-25",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Hanko",
            "fuelused": 18.0,
            "fuelfilled": 18.0,
            "odo": 20739,
            "date": "2009-07-28",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Kotka",
            "fuelused": 14.5,
            "fuelfilled": 14.5,
            "odo": 20975,
            "date": "2009-07-31",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Hki, eka mob.",
            "fuelused": 19.5,
            "fuelfilled": 19.5,
            "odo": 21296,
            "date": "2009-08-04",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Hki",
            "fuelused": 14.65,
            "fuelfilled": 14.65,
            "odo": 21533,
            "date": "2009-08-07",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Valkeakoski",
            "fuelused": 18.15,
            "fuelfilled": 18.15,
            "odo": 21848,
            "date": "2009-08-10",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Nokia, tankki arvattu",
            "fuelused": 17.0,
            "fuelfilled": 17.0,
            "odo": 22125,
            "date": "2009-08-16",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Hki",
            "fuelused": 18.03,
            "fuelfilled": 18.03,
            "odo": 22413,
            "date": "2009-08-23",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Hki-kotka",
            "fuelused": 20.16,
            "fuelfilled": 20.16,
            "odo": 22734,
            "date": "2009-08-30",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Hki",
            "fuelused": 19.0,
            "fuelfilled": 19.0,
            "odo": 23043,
            "date": "2009-09-04",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Nokia, s\u00e4hl\u00e4yst\u00e4, arvot arvattu",
            "fuelused": 16.5,
            "fuelfilled": 16.5,
            "odo": 23290,
            "date": "2009-09-06",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Hki",
            "fuelused": 18.31,
            "fuelfilled": 18.31,
            "odo": 23553,
            "date": "2009-09-11",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Hki->Pulkkilanharju",
            "fuelused": 19.0,
            "fuelfilled": 19.0,
            "odo": 23847,
            "date": "2009-09-20",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "p\u00e4ij\u00e4nne",
            "fuelused": 18.01,
            "fuelfilled": 18.01,
            "odo": 24166,
            "date": "2009-09-20",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "kotka",
            "fuelused": 15.01,
            "fuelfilled": 15.01,
            "odo": 24415,
            "date": "2009-09-27",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "24k huolto",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 24562,
            "date": "2009-09-28",
            "type": "MAINTENANCE",
            "bike": "vstrom"
        },
        {
            "info": "Hki",
            "fuelused": 18.1,
            "fuelfilled": 18.1,
            "odo": 24699,
            "date": "2009-10-08",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Talviparkkiin",
            "fuelused": 10.59,
            "fuelfilled": 10.59,
            "odo": 24864,
            "date": "2009-10-19",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Talviparkkiin",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 24864,
            "date": "2009-10-19",
            "type": "SEASON_END",
            "bike": "vstrom"
        },
        {
            "info": "Kauden aloitus",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 24864,
            "date": "2010-05-01",
            "type": "SEASON_START",
            "bike": "vstrom"
        },
        {
            "info": "J\u00e4rvenp\u00e4\u00e4",
            "fuelused": 17.84,
            "fuelfilled": 17.84,
            "odo": 25167,
            "date": "2010-05-13",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Hki",
            "fuelused": 17.74,
            "fuelfilled": 17.74,
            "odo": 25444,
            "date": "2010-05-21",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Hki kaupunkiajoa, Sipoo ajelua",
            "fuelused": 19.27,
            "fuelfilled": 19.27,
            "odo": 25742,
            "date": "2010-06-06",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Z6 Interact taakse",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 25942,
            "date": "2010-06-16",
            "type": "TYRE_REAR",
            "bike": "vstrom"
        },
        {
            "info": "Hki",
            "fuelused": 13.93,
            "fuelfilled": 13.93,
            "odo": 25950,
            "date": "2010-06-18",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Kotka+kaupunkia",
            "fuelused": 18.92,
            "fuelfilled": 18.92,
            "odo": 26275,
            "date": "2010-06-21",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vorssa, vakkalaan menossa",
            "fuelused": 10.0,
            "fuelfilled": 10.0,
            "odo": 26444,
            "date": "2010-06-24",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Ketju\u00f6jlyn t\u00e4ytt\u00f6",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 26333,
            "date": "2010-06-24",
            "type": "OTHER",
            "bike": "vstrom"
        },
        {
            "info": "Juhannus Vakkalassa",
            "fuelused": 18.32,
            "fuelfilled": 18.32,
            "odo": 26766,
            "date": "2010-06-29",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Kotka",
            "fuelused": 17.22,
            "fuelfilled": 17.22,
            "odo": 27062,
            "date": "2010-07-04",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Hki-j\u00e4k\u00e4 -eestaas. helle. +30",
            "fuelused": 18.97,
            "fuelfilled": 18.97,
            "odo": 27381,
            "date": "2010-07-11",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Hki-sipoo-kotka. Helle +30",
            "fuelused": 18.45,
            "fuelfilled": 18.45,
            "odo": 27688,
            "date": "2010-07-16",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Ketjy\u00f6ljyn t\u00e4ytt\u00f6",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 27946,
            "date": "2010-07-20",
            "type": "OTHER",
            "bike": "vstrom"
        },
        {
            "info": "kotka-Hki",
            "fuelused": 19.35,
            "fuelfilled": 19.35,
            "odo": 28022,
            "date": "2010-07-21",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Hki",
            "fuelused": 17.56,
            "fuelfilled": 17.56,
            "odo": 28301,
            "date": "2010-08-01",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Hki",
            "fuelused": 18.0,
            "fuelfilled": 18.0,
            "odo": 28625,
            "date": "2010-08-01",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Hki",
            "fuelused": 18.25,
            "fuelfilled": 18.25,
            "odo": 28941,
            "date": "2010-08-07",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Hki, vika tankki ennen Norjaa",
            "fuelused": 14.79,
            "fuelfilled": 14.79,
            "odo": 29161,
            "date": "2010-08-12",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Ketju\u00f6ljyn t\u00e4ytt\u00f6 (astia t\u00e4yteen ennen Norjaa)",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 29161,
            "date": "2010-08-13",
            "type": "OTHER",
            "bike": "vstrom"
        },
        {
            "info": "Grue finskoga",
            "fuelused": 12.88,
            "fuelfilled": 12.88,
            "odo": 29381,
            "date": "2010-08-14",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Lillehammer",
            "fuelused": 13.0,
            "fuelfilled": 13.0,
            "odo": 29610,
            "date": "2010-08-15",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Lom",
            "fuelused": 15.19,
            "fuelfilled": 15.19,
            "odo": 29876,
            "date": "2010-08-16",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Skj\u00e5k",
            "fuelused": 12.42,
            "fuelfilled": 12.42,
            "odo": 30107,
            "date": "2010-08-17",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Skei (Satkalle bensaa hakemassa)",
            "fuelused": 16.0,
            "fuelfilled": 16.0,
            "odo": 30394,
            "date": "2010-08-19",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Fj\u00f6rde",
            "fuelused": 6.0,
            "fuelfilled": 6.0,
            "odo": 30496,
            "date": "2010-08-21",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Unohtunut merkint\u00e4 (?)",
            "fuelused": 12.0,
            "fuelfilled": 12.0,
            "odo": 30700,
            "date": "2010-08-24",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Knarvik",
            "fuelused": 8.51,
            "fuelfilled": 8.51,
            "odo": 30843,
            "date": "2010-08-24",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Geilo",
            "fuelused": 11.0,
            "fuelfilled": 11.0,
            "odo": 31035,
            "date": "2010-08-25",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Hki",
            "fuelused": 11.5,
            "fuelfilled": 11.5,
            "odo": 31236,
            "date": "2010-08-26",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "E18, Ruotsi",
            "fuelused": 11.5,
            "fuelfilled": 11.5,
            "odo": 31434,
            "date": "2010-08-27",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "E18, Ruotsi, taas (unohtunut merkint\u00e4)",
            "fuelused": 12.5,
            "fuelfilled": 12.5,
            "odo": 31650,
            "date": "2010-08-28",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Kaarina",
            "fuelused": 13.5,
            "fuelfilled": 13.5,
            "odo": 31895,
            "date": "2010-08-30",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "30k huolto",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 32141,
            "date": "2010-08-30",
            "type": "MAINTENANCE",
            "bike": "vstrom"
        },
        {
            "info": "Takaisin kotona",
            "fuelused": 19.73,
            "fuelfilled": 19.73,
            "odo": 32202,
            "date": "2010-09-01",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Hki",
            "fuelused": 18.82,
            "fuelfilled": 18.82,
            "odo": 32462,
            "date": "2010-09-15",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Hki-j\u00e4k\u00e4-odilampi",
            "fuelused": 18.65,
            "fuelfilled": 18.65,
            "odo": 32766,
            "date": "2010-09-19",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Hki",
            "fuelused": 17.41,
            "fuelfilled": 17.41,
            "odo": 33007,
            "date": "2010-10-02",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Kotka",
            "fuelused": 12.8,
            "fuelfilled": 12.8,
            "odo": 33228,
            "date": "2010-10-03",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Hki",
            "fuelused": 19.5,
            "fuelfilled": 19.5,
            "odo": 33494,
            "date": "2010-10-20",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Talviparkkiin",
            "fuelused": 2.0,
            "fuelfilled": 2.0,
            "odo": 33514,
            "date": "2010-10-28",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Talviparkkiin",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 33514,
            "date": "2010-10-28",
            "type": "SEASON_END",
            "bike": "vstrom"
        },
        {
            "info": "Kauden aloitus",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 33514,
            "date": "2011-04-20",
            "type": "SEASON_START",
            "bike": "vstrom"
        },
        {
            "info": "Kauden eka tankki. Kotka",
            "fuelused": 18.95,
            "fuelfilled": 18.95,
            "odo": 33818,
            "date": "2011-04-21",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Paluu Kotkasta + Vantaa",
            "fuelused": 19.11,
            "fuelfilled": 19.11,
            "odo": 34128,
            "date": "2011-05-02",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki ruuhkajunnaamista",
            "fuelused": 18.52,
            "fuelfilled": 18.52,
            "odo": 34404,
            "date": "2011-05-10",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki ruuhkajunnaamista",
            "fuelused": 19.5,
            "fuelfilled": 19.5,
            "odo": 34698,
            "date": "2011-05-17",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 19.33,
            "fuelfilled": 19.33,
            "odo": 34992,
            "date": "2011-05-29",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki+Sipoo",
            "fuelused": 19.66,
            "fuelfilled": 19.66,
            "odo": 35309,
            "date": "2011-06-03",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki+Sipoo",
            "fuelused": 18.55,
            "fuelfilled": 18.55,
            "odo": 35611,
            "date": "2011-06-11",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 19.24,
            "fuelfilled": 19.24,
            "odo": 35917,
            "date": "2011-06-16",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Ajelua Kirkkonummi Vihti",
            "fuelused": 17.02,
            "fuelfilled": 17.02,
            "odo": 36210,
            "date": "2011-06-18",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Hki-Vantaa + Orimattila",
            "fuelused": 18.65,
            "fuelfilled": 18.65,
            "odo": 36525,
            "date": "2011-06-26",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "myrskyl\u00e4 + Vantaa-Hki",
            "fuelused": 19.18,
            "fuelfilled": 19.18,
            "odo": 36858,
            "date": "2011-07-04",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "myrskyl\u00e4\u00e4 + Vantaa-Hki",
            "fuelused": 18.05,
            "fuelfilled": 18.05,
            "odo": 37171,
            "date": "2011-07-07",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 19.19,
            "fuelfilled": 19.19,
            "odo": 37491,
            "date": "2011-07-12",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 19.56,
            "fuelfilled": 19.56,
            "odo": 37828,
            "date": "2011-07-19",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "karjalohja",
            "fuelused": 20.17,
            "fuelfilled": 20.17,
            "odo": 38187,
            "date": "2011-07-22",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Tourance eteen (ura ~4,6mm)",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 38369,
            "date": "2011-07-25",
            "type": "TYRE_FRONT",
            "bike": "vstrom"
        },
        {
            "info": "36k huolto",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 38369,
            "date": "2011-07-25",
            "type": "MAINTENANCE",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 19.84,
            "fuelfilled": 19.84,
            "odo": 38518,
            "date": "2011-07-27",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Nakkila",
            "fuelused": 19.1,
            "fuelfilled": 19.1,
            "odo": 38835,
            "date": "2011-07-31",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "paluu nakkilasta",
            "fuelused": 18.23,
            "fuelfilled": 18.23,
            "odo": 39160,
            "date": "2011-08-02",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki, sadetta",
            "fuelused": 18.36,
            "fuelfilled": 18.36,
            "odo": 39477,
            "date": "2011-08-10",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 18.61,
            "fuelfilled": 18.61,
            "odo": 39787,
            "date": "2011-08-18",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Kotka ja kaatosade Hki",
            "fuelused": 19.41,
            "fuelfilled": 19.41,
            "odo": 40130,
            "date": "2011-08-23",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Kaato pitk\u00e4nsillan p\u00e4\u00e4ss\u00e4",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 40341,
            "date": "2011-08-29",
            "type": "OTHER",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 19.5,
            "fuelfilled": 19.5,
            "odo": 40440,
            "date": "2011-08-31",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 19.36,
            "fuelfilled": 19.36,
            "odo": 40765,
            "date": "2011-09-11",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 19.0,
            "fuelfilled": 19.0,
            "odo": 41063,
            "date": "2011-09-19",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 20.62,
            "fuelfilled": 20.62,
            "odo": 41380,
            "date": "2011-10-13",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Nokia (talviparkkiin)",
            "fuelused": 16.61,
            "fuelfilled": 16.61,
            "odo": 41667,
            "date": "2011-10-15",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Nokia (talviparkkiin)",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 41667,
            "date": "2011-10-15",
            "type": "SEASON_END",
            "bike": "vstrom"
        },
        {
            "info": "Kauden aloitus",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 41667,
            "date": "2012-04-28",
            "type": "SEASON_START",
            "bike": "vstrom"
        },
        {
            "info": "Nouto Nokialta + hki",
            "fuelused": 17.71,
            "fuelfilled": 17.71,
            "odo": 41987,
            "date": "2012-04-30",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Nokia",
            "fuelused": 13.15,
            "fuelfilled": 13.15,
            "odo": 42185,
            "date": "2012-04-30",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Paluu Nokialta ja ty\u00f6matkaa",
            "fuelused": 18.32,
            "fuelfilled": 18.32,
            "odo": 42512,
            "date": "2012-05-02",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 19.87,
            "fuelfilled": 19.87,
            "odo": 42824,
            "date": "2012-05-12",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 19.18,
            "fuelfilled": 19.18,
            "odo": 43147,
            "date": "2012-05-20",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Tourance taakse",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 43247,
            "date": "2012-05-22",
            "type": "TYRE_REAR",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki, ruuhkia",
            "fuelused": 18.35,
            "fuelfilled": 18.35,
            "odo": 43442,
            "date": "2012-05-29",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 20.5,
            "fuelfilled": 20.5,
            "odo": 43759,
            "date": "2012-06-05",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki (kirkkonummella)",
            "fuelused": 19.62,
            "fuelfilled": 19.62,
            "odo": 44086,
            "date": "2012-06-14",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 20.53,
            "fuelfilled": 20.53,
            "odo": 44421,
            "date": "2012-06-20",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "42k huolto",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 44503,
            "date": "2012-06-26",
            "type": "MAINTENANCE",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki+Sipoo",
            "fuelused": 18.74,
            "fuelfilled": 18.74,
            "odo": 44743,
            "date": "2012-06-29",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Espoo (vika tankki ennen reissua)",
            "fuelused": 11.41,
            "fuelfilled": 11.41,
            "odo": 44932,
            "date": "2012-07-07",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Tukholma-S\u00e4rma",
            "fuelused": 14.0,
            "fuelfilled": 14.0,
            "odo": 45173,
            "date": "2012-07-08",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "S\u00e4rna-R\u00f8ros",
            "fuelused": 15.0,
            "fuelfilled": 15.0,
            "odo": 45425,
            "date": "2012-07-09",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Roros",
            "fuelused": 11.35,
            "fuelfilled": 11.35,
            "odo": 45626,
            "date": "2012-07-10",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "R\u00f8ros-Steinkjer",
            "fuelused": 10.62,
            "fuelfilled": 10.62,
            "odo": 45836,
            "date": "2012-07-10",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "S\u00f8mna",
            "fuelused": 16.49,
            "fuelfilled": 16.49,
            "odo": 46133,
            "date": "2012-07-16",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Kilboghamn",
            "fuelused": 13.26,
            "fuelfilled": 13.26,
            "odo": 46364,
            "date": "2012-07-17",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Reine",
            "fuelused": 13.56,
            "fuelfilled": 13.56,
            "odo": 46598,
            "date": "2012-07-18",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "L\u00f8dingen",
            "fuelused": 15.05,
            "fuelfilled": 15.05,
            "odo": 46852,
            "date": "2012-07-21",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Bjerkvik",
            "fuelused": 6.65,
            "fuelfilled": 6.65,
            "odo": 46975,
            "date": "2012-07-22",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Birtavarre",
            "fuelused": 12.56,
            "fuelfilled": 12.56,
            "odo": 47213,
            "date": "2012-07-23",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Alta",
            "fuelused": 13.91,
            "fuelfilled": 13.91,
            "odo": 47471,
            "date": "2012-07-23",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Karasjoki",
            "fuelused": 10.22,
            "fuelfilled": 10.22,
            "odo": 47672,
            "date": "2012-07-24",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Utsjoki",
            "fuelused": 7.9,
            "fuelfilled": 7.9,
            "odo": 47814,
            "date": "2012-07-26",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Sodankyl\u00e4",
            "fuelused": 18.82,
            "fuelfilled": 18.82,
            "odo": 48149,
            "date": "2012-07-26",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Kuusamo",
            "fuelused": 16.28,
            "fuelfilled": 16.28,
            "odo": 48446,
            "date": "2012-07-27",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Iisalmi",
            "fuelused": 19.25,
            "fuelfilled": 19.25,
            "odo": 48789,
            "date": "2012-07-27",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Jyv\u00e4skyl\u00e4",
            "fuelused": 13.04,
            "fuelfilled": 13.04,
            "odo": 49025,
            "date": "2012-07-27",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa (paluu Norjasta)",
            "fuelused": 17.1,
            "fuelfilled": 17.1,
            "odo": 49322,
            "date": "2012-07-29",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki+Em\u00e4salo",
            "fuelused": 19.13,
            "fuelfilled": 19.13,
            "odo": 49642,
            "date": "2012-08-05",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 19.0,
            "fuelfilled": 19.0,
            "odo": 49946,
            "date": "2012-08-10",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 19.01,
            "fuelfilled": 19.01,
            "odo": 50264,
            "date": "2012-08-20",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "48k huolto",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 50453,
            "date": "2012-08-27",
            "type": "MAINTENANCE",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 18.11,
            "fuelfilled": 18.11,
            "odo": 50552,
            "date": "2012-08-29",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 18.77,
            "fuelfilled": 18.77,
            "odo": 50854,
            "date": "2012-09-07",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 15.9,
            "fuelfilled": 15.9,
            "odo": 51107,
            "date": "2012-09-15",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 19.0,
            "fuelfilled": 19.0,
            "odo": 51392,
            "date": "2012-09-25",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 18.8,
            "fuelfilled": 18.8,
            "odo": 51667,
            "date": "2012-10-03",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 20.2,
            "fuelfilled": 20.2,
            "odo": 51966,
            "date": "2012-10-16",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki-Nokia",
            "fuelused": 21.5,
            "fuelfilled": 21.5,
            "odo": 52304,
            "date": "2012-10-20",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki-Nokia",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 52304,
            "date": "2012-10-20",
            "type": "SEASON_END",
            "bike": "vstrom"
        },
        {
            "info": "Kauden aloitus",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 52321,
            "date": "2013-04-21",
            "type": "SEASON_START",
            "bike": "vstrom"
        },
        {
            "info": "Nokia-Vantaa-Hki",
            "fuelused": 18.26,
            "fuelfilled": 18.26,
            "odo": 52597,
            "date": "2013-04-28",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 17.5,
            "fuelfilled": 17.5,
            "odo": 52866,
            "date": "2013-05-06",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki-Kotka",
            "fuelused": 18.81,
            "fuelfilled": 18.81,
            "odo": 53161,
            "date": "2013-05-17",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 18.85,
            "fuelfilled": 18.85,
            "odo": 53483,
            "date": "2013-05-21",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 19.6,
            "fuelfilled": 19.6,
            "odo": 53791,
            "date": "2013-05-29",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 19.67,
            "fuelfilled": 19.67,
            "odo": 54105,
            "date": "2013-06-07",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki,Sipoo",
            "fuelused": 20.46,
            "fuelfilled": 20.46,
            "odo": 54435,
            "date": "2013-06-17",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 19.0,
            "fuelfilled": 19.0,
            "odo": 54744,
            "date": "2013-06-27",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 19.28,
            "fuelfilled": 19.28,
            "odo": 55078,
            "date": "2013-07-11",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 18.16,
            "fuelfilled": 18.16,
            "odo": 55369,
            "date": "2013-07-21",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 19.02,
            "fuelfilled": 19.02,
            "odo": 55683,
            "date": "2013-07-29",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki-m\u00e4nts\u00e4l\u00e4",
            "fuelused": 16.2,
            "fuelfilled": 16.2,
            "odo": 55954,
            "date": "2013-08-02",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Suonenjoki",
            "fuelused": 15.48,
            "fuelfilled": 15.48,
            "odo": 56240,
            "date": "2013-08-03",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Tervo",
            "fuelused": 14.74,
            "fuelfilled": 14.74,
            "odo": 56505,
            "date": "2013-08-04",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Orimattila",
            "fuelused": 16.1,
            "fuelfilled": 16.1,
            "odo": 56813,
            "date": "2013-08-04",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 19.26,
            "fuelfilled": 19.26,
            "odo": 57135,
            "date": "2013-08-13",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "54k huolto",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 57160,
            "date": "2013-08-14",
            "type": "MAINTENANCE",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki, Kirkkonummen visiittej\u00e4",
            "fuelused": 19.7,
            "fuelfilled": 19.7,
            "odo": 57464,
            "date": "2013-09-06",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki-siuntio",
            "fuelused": 18.65,
            "fuelfilled": 18.65,
            "odo": 57780,
            "date": "2013-09-11",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki-Kirkkonummi",
            "fuelused": 18.34,
            "fuelfilled": 18.34,
            "odo": 58076,
            "date": "2013-09-18",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki-Knummi",
            "fuelused": 19.0,
            "fuelfilled": 19.0,
            "odo": 58382,
            "date": "2013-10-03",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Hki",
            "fuelused": 16.0,
            "fuelfilled": 16.0,
            "odo": 58630,
            "date": "2013-10-12",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Nokia",
            "fuelused": 10.65,
            "fuelfilled": 10.65,
            "odo": 58807,
            "date": "2013-10-12",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Nokia",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 58807,
            "date": "2013-10-12",
            "type": "SEASON_END",
            "bike": "vstrom"
        },
        {
            "info": "Kauden aloitus",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 58807,
            "date": "2014-04-19",
            "type": "SEASON_START",
            "bike": "vstrom"
        },
        {
            "info": "Nokia-knummi",
            "fuelused": 14.49,
            "fuelfilled": 14.49,
            "odo": 59065,
            "date": "2014-04-20",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Knummi-Hki",
            "fuelused": 18.14,
            "fuelfilled": 18.14,
            "odo": 59385,
            "date": "2014-04-23",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Mummun hautajaiset",
            "fuelused": 20.2,
            "fuelfilled": 20.2,
            "odo": 59720,
            "date": "2014-05-10",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Paluu Kotkasta, Knummi-Hki",
            "fuelused": 18.2,
            "fuelfilled": 18.2,
            "odo": 60037,
            "date": "2014-05-12",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Knummi-Hki",
            "fuelused": 18.82,
            "fuelfilled": 18.82,
            "odo": 60359,
            "date": "2014-05-17",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Knummi-Hki",
            "fuelused": 18.91,
            "fuelfilled": 18.91,
            "odo": 60693,
            "date": "2014-05-21",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Knummi-Hki",
            "fuelused": 18.91,
            "fuelfilled": 18.91,
            "odo": 61011,
            "date": "2014-05-31",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Knummi-Hki",
            "fuelused": 17.6,
            "fuelfilled": 17.6,
            "odo": 61325,
            "date": "2014-06-07",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Knummi-Hki",
            "fuelused": 19.6,
            "fuelfilled": 19.6,
            "odo": 61670,
            "date": "2014-06-13",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Knummi-Hki",
            "fuelused": 19.81,
            "fuelfilled": 19.81,
            "odo": 62018,
            "date": "2014-06-26",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Knummi-Hki-hanko",
            "fuelused": 19.0,
            "fuelfilled": 19.0,
            "odo": 62371,
            "date": "2014-07-06",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Knummi-Hki",
            "fuelused": 19.7,
            "fuelfilled": 19.7,
            "odo": 62730,
            "date": "2014-07-16",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Knummi-Kotka-Kuninkaantie",
            "fuelused": 19.0,
            "fuelfilled": 19.0,
            "odo": 63072,
            "date": "2014-07-26",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Knummi-Hki",
            "fuelused": 19.3,
            "fuelfilled": 19.3,
            "odo": 63427,
            "date": "2014-07-31",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Knummi-hiidenpirtti-lohja-knummi",
            "fuelused": 18.88,
            "fuelfilled": 18.88,
            "odo": 63767,
            "date": "2014-08-04",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Knummi-Hki",
            "fuelused": 18.45,
            "fuelfilled": 18.45,
            "odo": 64111,
            "date": "2014-08-08",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "60k huolto",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 63846,
            "date": "2014-08-08",
            "type": "MAINTENANCE",
            "bike": "vstrom"
        },
        {
            "info": "Vantaa-Nuuksio-Knummi-Hki",
            "fuelused": 18.51,
            "fuelfilled": 18.51,
            "odo": 64441,
            "date": "2014-08-13",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Knummi-Hki",
            "fuelused": 19.45,
            "fuelfilled": 19.45,
            "odo": 64780,
            "date": "2014-08-27",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Knummi-Hki",
            "fuelused": 19.02,
            "fuelfilled": 19.02,
            "odo": 65102,
            "date": "2014-09-04",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Knummi-Hki-Vihti",
            "fuelused": 18.5,
            "fuelfilled": 18.5,
            "odo": 65431,
            "date": "2014-09-08",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Knummi-Hki",
            "fuelused": 19.54,
            "fuelfilled": 19.54,
            "odo": 65756,
            "date": "2014-09-17",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Knummi-Hki",
            "fuelused": 18.41,
            "fuelfilled": 18.41,
            "odo": 66063,
            "date": "2014-09-25",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Knummi-Hki",
            "fuelused": 19.7,
            "fuelfilled": 19.7,
            "odo": 66378,
            "date": "2014-10-07",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Knummi-Hki",
            "fuelused": 18.78,
            "fuelfilled": 18.78,
            "odo": 66691,
            "date": "2014-10-13",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Knummi-Hki",
            "fuelused": 18.6,
            "fuelfilled": 18.6,
            "odo": 67000,
            "date": "2014-10-27",
            "type": "FUEL",
            "bike": "vstrom"
        },
        {
            "info": "Myyty",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 67050,
            "date": "2014-10-28",
            "type": "OTHER",
            "bike": "vstrom"
        },
        {
            "info": "Knummi-Hki. Knummi neste versys",
            "fuelused": 3.4,
            "fuelfilled": 18.49,
            "odo": 2987,
            "date": "2014-10-28",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Versys osto",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 2929,
            "date": "2014-10-28",
            "type": "OTHER",
            "bike": "versys"
        },
        {
            "info": "Versys osto. Tankki ei ollut t\u00e4ysi",
            "fuelused": 0.0,
            "fuelfilled": 0.0,
            "odo": 2929,
            "date": "2014-10-28",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Orkkiskumi/Scropion trail",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 0,
            "date": "2014-10-28",
            "type": "TYRE_FRONT",
            "bike": "versys"
        },
        {
            "info": "Orkkiskumi/Scropion trail",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 0,
            "date": "2014-10-28",
            "type": "TYRE_REAR",
            "bike": "versys"
        },
        {
            "info": "Kauden lopetus.Knummi. Odo tavattu.",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 3288,
            "date": "2014-11-05",
            "type": "SEASON_END",
            "bike": "versys"
        },
        {
            "info": "Py\u00f6r\u00e4 talviparkkiin tyhj\u00e4ll\u00e4 tankilla",
            "fuelused": 19.68,
            "fuelfilled": 0.0,
            "odo": 3287,
            "date": "2014-11-05",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Kausi k\u00e4yntiin Kirkkkonummen katsastuksen kellarista",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 3288,
            "date": "2015-04-24",
            "type": "SEASON_START",
            "bike": "versys"
        },
        {
            "info": "Py\u00f6r\u00e4 yl\u00f6s kellarista",
            "fuelused": 0.0,
            "fuelfilled": 6.02,
            "odo": 3288,
            "date": "2015-04-25",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Tankki t\u00e4yteen ennen l\u00e4ht\u00f6\u00e4 eteenp\u00e4in",
            "fuelused": 0.06,
            "fuelfilled": 13.66,
            "odo": 3289,
            "date": "2015-04-25",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Nikkil\u00e4",
            "fuelused": 16.36,
            "fuelfilled": 16.36,
            "odo": 3573,
            "date": "2015-05-10",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Hki p\u00e4rr\u00e4yst\u00e4",
            "fuelused": 17.95,
            "fuelfilled": 17.95,
            "odo": 3850,
            "date": "2015-05-24",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Hki kaupunkiajoa",
            "fuelused": 18.6,
            "fuelfilled": 18.6,
            "odo": 4132,
            "date": "2015-06-13",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Kotkaan/Saaren",
            "fuelused": 18.61,
            "fuelfilled": 18.61,
            "odo": 4446,
            "date": "2015-06-18",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Hki +Kotkaan",
            "fuelused": 18.14,
            "fuelfilled": 18.14,
            "odo": 4728,
            "date": "2015-06-26",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Kotkasta kotiin ja Vihtiin",
            "fuelused": 16.27,
            "fuelfilled": 16.27,
            "odo": 5020,
            "date": "2015-06-28",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Kawan eka huolto",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 5210,
            "date": "2015-07-01",
            "type": "MAINTENANCE",
            "bike": "versys"
        },
        {
            "info": "Vihti + Hki",
            "fuelused": 19.21,
            "fuelfilled": 19.21,
            "odo": 5359,
            "date": "2015-07-06",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Hki-Kotka",
            "fuelused": 16.81,
            "fuelfilled": 16.81,
            "odo": 5650,
            "date": "2015-07-13",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Mj\u00f6lby",
            "fuelused": 16.22,
            "fuelfilled": 16.22,
            "odo": 5960,
            "date": "2015-07-15",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Helsingborg",
            "fuelused": 18.34,
            "fuelfilled": 18.34,
            "odo": 6290,
            "date": "2015-07-16",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Heilingenhagen",
            "fuelused": 15.56,
            "fuelfilled": 15.56,
            "odo": 6584,
            "date": "2015-07-16",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Hannover",
            "fuelused": 16.6,
            "fuelfilled": 16.6,
            "odo": 6871,
            "date": "2015-07-17",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Fulda",
            "fuelused": 15.96,
            "fuelfilled": 15.96,
            "odo": 7134,
            "date": "2015-07-19",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Illertissen",
            "fuelused": 18.25,
            "fuelfilled": 18.25,
            "odo": 7442,
            "date": "2015-07-19",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "S\u00f6lden",
            "fuelused": 16.74,
            "fuelfilled": 16.74,
            "odo": 7747,
            "date": "2015-07-21",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Rabland",
            "fuelused": 11.91,
            "fuelfilled": 11.91,
            "odo": 7978,
            "date": "2015-07-22",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Tiefencastel",
            "fuelused": 13.4,
            "fuelfilled": 13.4,
            "odo": 8232,
            "date": "2015-07-23",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Muster",
            "fuelused": 10.64,
            "fuelfilled": 10.64,
            "odo": 8450,
            "date": "2015-07-24",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Schattdorf",
            "fuelused": 10.11,
            "fuelfilled": 10.11,
            "odo": 8653,
            "date": "2015-07-25",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Mieders",
            "fuelused": 15.47,
            "fuelfilled": 15.47,
            "odo": 8960,
            "date": "2015-07-26",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Salzburg",
            "fuelused": 10.34,
            "fuelfilled": 10.34,
            "odo": 9180,
            "date": "2015-07-27",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Hochleiten",
            "fuelused": 17.29,
            "fuelfilled": 17.29,
            "odo": 9510,
            "date": "2015-07-27",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Praha",
            "fuelused": 16.92,
            "fuelfilled": 16.92,
            "odo": 9828,
            "date": "2015-07-29",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "L\u00fcbben",
            "fuelused": 16.49,
            "fuelfilled": 16.49,
            "odo": 10124,
            "date": "2015-07-29",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Mecklenburg",
            "fuelused": 17.81,
            "fuelfilled": 17.81,
            "odo": 10391,
            "date": "2015-07-29",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Lindvall",
            "fuelused": 18.25,
            "fuelfilled": 18.25,
            "odo": 10688,
            "date": "2015-07-30",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Norsholm",
            "fuelused": 14.7,
            "fuelfilled": 14.7,
            "odo": 10973,
            "date": "2015-07-30",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Salo",
            "fuelused": 14.91,
            "fuelfilled": 14.91,
            "odo": 11253,
            "date": "2015-07-31",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Hki + kaupunkiajoa + K\u00e4rk\u00f6l\u00e4",
            "fuelused": 14.47,
            "fuelfilled": 14.47,
            "odo": 11496,
            "date": "2015-08-22",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Hki kaupunkiajoa",
            "fuelused": 17.93,
            "fuelfilled": 17.93,
            "odo": 11789,
            "date": "2015-08-29",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Hki kaupunkiajoa . Knummi",
            "fuelused": 14.68,
            "fuelfilled": 14.68,
            "odo": 11989,
            "date": "2015-09-13",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Hki kaupunkiajoa",
            "fuelused": 18.08,
            "fuelfilled": 18.08,
            "odo": 12223,
            "date": "2015-10-22",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "12k huolto",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 12227,
            "date": "2015-10-22",
            "type": "MAINTENANCE",
            "bike": "versys"
        },
        {
            "info": "Kirkkonummi",
            "fuelused": 7.56,
            "fuelfilled": 7.56,
            "odo": 12343,
            "date": "2015-10-24",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Kauden p\u00e4\u00e4t\u00f6s, Herttoniemi, +2C",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 12376,
            "date": "2015-10-27",
            "type": "SEASON_END",
            "bike": "versys"
        },
        {
            "info": "Kausi k\u00e4yntiin Herttoniemest\u00e4",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 12376,
            "date": "2016-04-16",
            "type": "SEASON_START",
            "bike": "versys"
        },
        {
            "info": "Hki kaupunkiajoa",
            "fuelused": 18.41,
            "fuelfilled": 18.41,
            "odo": 12605,
            "date": "2016-05-03",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Hki-Pellinki-Hki-Paippinen-JP\u00e4\u00e4",
            "fuelused": 17.48,
            "fuelfilled": 17.48,
            "odo": 12906,
            "date": "2016-05-08",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Hki kaupunkiajoa",
            "fuelused": 17.18,
            "fuelfilled": 17.18,
            "odo": 13130,
            "date": "2016-05-22",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Solita MC Forssa + Hki kaupunkiajoa",
            "fuelused": 18.25,
            "fuelfilled": 18.25,
            "odo": 13471,
            "date": "2016-05-25",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Hki+Kotka",
            "fuelused": 17.69,
            "fuelfilled": 17.69,
            "odo": 13768,
            "date": "2016-05-29",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Hki kaupunkiajoa",
            "fuelused": 17.74,
            "fuelfilled": 17.74,
            "odo": 14030,
            "date": "2016-06-10",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Malmi-Hki",
            "fuelused": 17.47,
            "fuelfilled": 17.47,
            "odo": 14300,
            "date": "2016-06-18",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Malmi-Hki +Kotkaan",
            "fuelused": 18.91,
            "fuelfilled": 18.91,
            "odo": 14622,
            "date": "2016-06-25",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Malmi-Hki",
            "fuelused": 18.22,
            "fuelfilled": 18.22,
            "odo": 14946,
            "date": "2016-06-29",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Pilot Road 3",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 15060,
            "date": "2016-07-04",
            "type": "TYRE_FRONT",
            "bike": "versys"
        },
        {
            "info": "Pilot Road 3",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 15060,
            "date": "2016-07-04",
            "type": "TYRE_REAR",
            "bike": "versys"
        },
        {
            "info": "Malmi-Hki",
            "fuelused": 18.0,
            "fuelfilled": 18.0,
            "odo": 15243,
            "date": "2016-07-09",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Malmi-Hki-Rajamarket",
            "fuelused": 18.77,
            "fuelfilled": 18.77,
            "odo": 15583,
            "date": "2016-07-21",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Kontiolahti",
            "fuelused": 15.93,
            "fuelfilled": 15.93,
            "odo": 15896,
            "date": "2016-07-21",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Kuhmo",
            "fuelused": 10.79,
            "fuelfilled": 10.79,
            "odo": 16105,
            "date": "2016-07-22",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Kuusamo",
            "fuelused": 13.23,
            "fuelfilled": 13.23,
            "odo": 16378,
            "date": "2016-07-22",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Sodankyl\u00e4",
            "fuelused": 12.29,
            "fuelfilled": 12.29,
            "odo": 16632,
            "date": "2016-07-23",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Inari",
            "fuelused": 9.24,
            "fuelfilled": 9.24,
            "odo": 16838,
            "date": "2016-07-23",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Hesseng",
            "fuelused": 16.61,
            "fuelfilled": 16.61,
            "odo": 17156,
            "date": "2016-07-25",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Tana Bru",
            "fuelused": 8.8,
            "fuelfilled": 8.8,
            "odo": 17339,
            "date": "2016-07-25",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Kj\u00f8llefjord",
            "fuelused": 10.18,
            "fuelfilled": 10.18,
            "odo": 17540,
            "date": "2016-07-26",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Lakselv",
            "fuelused": 15.82,
            "fuelfilled": 15.82,
            "odo": 17849,
            "date": "2016-07-27",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Kautokeino",
            "fuelused": 10.0,
            "fuelfilled": 10.0,
            "odo": 18055,
            "date": "2016-07-28",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Pello",
            "fuelused": 14.81,
            "fuelfilled": 14.81,
            "odo": 18359,
            "date": "2016-07-28",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Paavola",
            "fuelused": 17.01,
            "fuelfilled": 17.01,
            "odo": 18699,
            "date": "2016-07-29",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Vaajakoski",
            "fuelused": 15.1,
            "fuelfilled": 15.1,
            "odo": 19016,
            "date": "2016-07-29",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Malmille + kaupunkiajoa",
            "fuelused": 18.99,
            "fuelfilled": 18.99,
            "odo": 19377,
            "date": "2016-08-05",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "18k huolto",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 19408,
            "date": "2016-08-08",
            "type": "MAINTENANCE",
            "bike": "versys"
        },
        {
            "info": "Malmi-Hki-Kirkkonummi",
            "fuelused": 17.04,
            "fuelfilled": 17.04,
            "odo": 19646,
            "date": "2016-08-20",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Porvoo, Hausj\u00e4rvi, Heinola",
            "fuelused": 18.66,
            "fuelfilled": 18.66,
            "odo": 20006,
            "date": "2016-08-21",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Malmi-Hki-Lahti",
            "fuelused": 18.16,
            "fuelfilled": 18.16,
            "odo": 20328,
            "date": "2016-08-27",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Lahti-Jyv\u00e4skyl\u00e4-Lahti",
            "fuelused": 17.79,
            "fuelfilled": 17.79,
            "odo": 20685,
            "date": "2016-08-28",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Malmi-Hki",
            "fuelused": 18.41,
            "fuelfilled": 18.41,
            "odo": 20974,
            "date": "2016-09-12",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Malmi-Hki",
            "fuelused": 19.07,
            "fuelfilled": 19.07,
            "odo": 21262,
            "date": "2016-09-21",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Malmi-Hki-Vierum\u00e4ki",
            "fuelused": 18.21,
            "fuelfilled": 18.21,
            "odo": 21543,
            "date": "2016-10-02",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Malmi-Hki",
            "fuelused": 19.62,
            "fuelfilled": 19.62,
            "odo": 21876,
            "date": "2016-10-12",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Malmi-Hki",
            "fuelused": 12.57,
            "fuelfilled": 12.57,
            "odo": 22087,
            "date": "2016-10-29",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Honkanummelle talviparkkiin",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 22088,
            "date": "2016-10-29",
            "type": "SEASON_END",
            "bike": "versys"
        },
        {
            "info": "Huhtikuu r\u00e4nt\u00e4sateita. Kausi kuikulla k\u00e4yntiin vaikka keli ei silt\u00e4 viel\u00e4k\u00e4\u00e4n tunnu.",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 22090,
            "date": "2017-04-26",
            "type": "SEASON_START",
            "bike": "versys"
        },
        {
            "info": "Malmi-Hki",
            "fuelused": 17.92,
            "fuelfilled": 17.92,
            "odo": 22335,
            "date": "2017-05-17",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Kittil\u00e4/Lohja",
            "fuelused": 17.1,
            "fuelfilled": 17.1,
            "odo": 22621,
            "date": "2017-05-28",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Kuninkaantie",
            "fuelused": 17.94,
            "fuelfilled": 17.94,
            "odo": 22904,
            "date": "2017-06-02",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Kotka-Malmi-Hki",
            "fuelused": 18.42,
            "fuelfilled": 18.42,
            "odo": 23214,
            "date": "2017-06-07",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Hki-Malmi ennen Thaimaata",
            "fuelused": 18.35,
            "fuelfilled": 18.35,
            "odo": 23473,
            "date": "2017-06-17",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Kuninkaantie (Marin kanssa)",
            "fuelused": 17.17,
            "fuelfilled": 17.17,
            "odo": 23749,
            "date": "2017-07-05",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Rekisterikilpi putosi (99-GEP)",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 24439,
            "date": "2017-07-09",
            "type": "OTHER",
            "bike": "versys"
        },
        {
            "info": "Kotka-Espoo-Hki (Mari)",
            "fuelused": 17.31,
            "fuelfilled": 17.31,
            "odo": 24061,
            "date": "2017-07-09",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Kes\u00e4lenkki: Hki-Heinola-Hevossaari-Kimola-Vierum\u00e4ri",
            "fuelused": 17.95,
            "fuelfilled": 17.95,
            "odo": 24401,
            "date": "2017-07-09",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Uusi kilpi kiinni (58-LHX)",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 24439,
            "date": "2017-07-17",
            "type": "OTHER",
            "bike": "versys"
        },
        {
            "info": "Tenala",
            "fuelused": 15.79,
            "fuelfilled": 15.79,
            "odo": 24670,
            "date": "2017-07-22",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Bromarv, Malmi-Hki",
            "fuelused": 18.34,
            "fuelfilled": 18.34,
            "odo": 25010,
            "date": "2017-07-27",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Malmi-Hki",
            "fuelused": 18.9,
            "fuelfilled": 18.9,
            "odo": 25326,
            "date": "2017-08-05",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Em\u00e4salo-Malmi-Hki",
            "fuelused": 17.87,
            "fuelfilled": 17.87,
            "odo": 25628,
            "date": "2017-08-11",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Verla, P\u00e4ij\u00e4tsalo ja Marjo",
            "fuelused": 17.02,
            "fuelfilled": 17.02,
            "odo": 25951,
            "date": "2017-08-11",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Malmi-Hki",
            "fuelused": 19.29,
            "fuelfilled": 19.29,
            "odo": 26261,
            "date": "2017-08-22",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "24k huolto",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 26422,
            "date": "2017-08-30",
            "type": "MAINTENANCE",
            "bike": "versys"
        },
        {
            "info": "Malmi-Hki",
            "fuelused": 18.85,
            "fuelfilled": 18.85,
            "odo": 26535,
            "date": "2017-09-04",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Malmi-Hki",
            "fuelused": 18.51,
            "fuelfilled": 18.51,
            "odo": 26803,
            "date": "2017-09-21",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Hki-Kotka-Malmi-Hki",
            "fuelused": 19.38,
            "fuelfilled": 19.38,
            "odo": 27137,
            "date": "2017-09-25",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Malmi-Hki",
            "fuelused": 18.16,
            "fuelfilled": 18.16,
            "odo": 27391,
            "date": "2017-10-09",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Talviparkkiin, Tyhj\u00e4ll\u00e4 tankilla. Bensat arvattu, odo arvattu",
            "fuelused": 16.5,
            "fuelfilled": 0.0,
            "odo": 27631,
            "date": "2017-11-16",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Talviparkkiin Ormuspellontielle",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 27631,
            "date": "2017-11-16",
            "type": "SEASON_END",
            "bike": "versys"
        },
        {
            "info": null,
            "fuelused": null,
            "fuelfilled": null,
            "odo": 27631,
            "date": "2018-04-13",
            "type": "SEASON_START",
            "bike": "versys"
        },
        {
            "info": "Malmi-Hki",
            "fuelused": 1.33,
            "fuelfilled": 17.83,
            "odo": 27653,
            "date": "2018-04-14",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Malmi-Hki",
            "fuelused": 18.01,
            "fuelfilled": 18.01,
            "odo": 27916,
            "date": "2018-04-28",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Malmi-Hki-Em\u00e4salo",
            "fuelused": 16.06,
            "fuelfilled": 16.06,
            "odo": 28185,
            "date": "2018-05-06",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Malmi-Hki",
            "fuelused": 18.01,
            "fuelfilled": 18.01,
            "odo": 28463,
            "date": "2018-05-15",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Malmi-Hki-Kotka, Marjo",
            "fuelused": 17.33,
            "fuelfilled": 17.33,
            "odo": 28748,
            "date": "2018-05-20",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Malmi-Hki",
            "fuelused": 17.64,
            "fuelfilled": 17.64,
            "odo": 29029,
            "date": "2018-05-26",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Malmi-Hki-Siuntio",
            "fuelused": 15.87,
            "fuelfilled": 15.87,
            "odo": 29311,
            "date": "2018-05-31",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Malmi-Kotka-Malmi+Mari",
            "fuelused": 18.49,
            "fuelfilled": 18.49,
            "odo": 29636,
            "date": "2018-06-03",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Malmi-Hki",
            "fuelused": 19.04,
            "fuelfilled": 19.04,
            "odo": 29927,
            "date": "2018-06-11",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Pilot Road 4 taakse",
            "fuelused": null,
            "fuelfilled": null,
            "odo": 30101,
            "date": "2018-06-14",
            "type": "TYRE_REAR",
            "bike": "versys"
        },
        {
            "info": "Malmi-Hki-Paippinen",
            "fuelused": 16.91,
            "fuelfilled": 16.91,
            "odo": 30226,
            "date": "2018-06-16",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Malmi-Hki-Kotka",
            "fuelused": 17.23,
            "fuelfilled": 17.23,
            "odo": 30507,
            "date": "2018-06-24",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Malmi-Hki",
            "fuelused": 17.32,
            "fuelfilled": 17.32,
            "odo": 30815,
            "date": "2018-07-04",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Malmi-Hki",
            "fuelused": 18.61,
            "fuelfilled": 18.61,
            "odo": 31164,
            "date": "2018-07-16",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Hki-Jotseno (Mari)",
            "fuelused": 16.09,
            "fuelfilled": 16.09,
            "odo": 31474,
            "date": "2018-07-19",
            "type": "FUEL",
            "bike": "versys"
        },
        {
            "info": "Joutseno (Mari)",
            "fuelused": 17.55,
            "fuelfilled": 17.55,
            "odo": 31811,
            "date": "2018-07-23",
            "type": "FUEL",
            "bike": "versys"
        }
    ]

};

function countMilages(events) {
    function countDistancesAndMilageForFuelEvents(bike) {
        const bikeFuelEvents = _.chain(events).filter({type: 'FUEL', bike: bike}).value();
        var prev;
        var sortedList = _.sortBy(bikeFuelEvents, 'odo').reverse();
        _.each(sortedList, function (current) {
            if (prev) {
                prev.dist = prev.odo - current.odo;
                prev.milage = parseFloat((100.0 * prev.fuelused / prev.dist).toFixed(2));
            }
            prev = current;
        });
    }

    function countDistancesForFrontTyres(bike) {
        const bikeFrontTyreEvents = _.chain(events).filter({type: 'TYRE_FRONT', bike: bike}).value();
        var prev;
        var sortedList = _.sortBy(bikeFrontTyreEvents, 'odo').reverse();
        _.each(sortedList, function (current) {
            if (prev) {
                current.dist = prev.odo - current.odo;
            }
            prev = current;
        });
    }

    function countDistancesForRearTyres(bike) {
        const bikeFrontTyreEvents = _.chain(events).filter({type: 'TYRE_REAR', bike: bike}).value();
        var prev;
        var sortedList = _.sortBy(bikeFrontTyreEvents, 'odo').reverse();
        _.each(sortedList, function (current) {
            if (prev) {
                current.dist = prev.odo - current.odo;
            }
            prev = current;
        });
    }

    function countDistancesForMaintenance(bike) {
        const bikeFrontTyreEvents = _.chain(events).filter({type: 'MAINTENANCE', bike: bike}).value();
        var prev;
        var sortedList = _.sortBy(bikeFrontTyreEvents, 'odo').reverse();
        _.each(sortedList, function (current) {
            if (prev) {
                prev.dist = prev.odo - current.odo;
            }
            prev = current;
        });
    }

    _data.bikes.forEach(bike => {
        countDistancesAndMilageForFuelEvents(bike);
        countDistancesForFrontTyres(bike);
        countDistancesForRearTyres(bike);
        countDistancesForMaintenance(bike);
    });
}

export const DATE_REGEX = /(\d{4})-(\d{2})-(\d{2})/;

function countExtraInformationFromData() {
    _data.bikes = _.chain(_data.events).map(e => e.bike).uniq().sort().value();
    _data.years = _.chain(_data.events).map(e => e.date).map(d => d.replace(DATE_REGEX, '$1')).uniq().sort().reverse().value();
    _data.months = _.chain(_data.events).map(e => e.date).map(d => d.replace(DATE_REGEX, '$2')).uniq().sort().value();
    _data.latestBike = _.chain(_data.events)
        .filter({type: 'FUEL'})
        .sortBy('date')
        .last().value().bike;
    countMilages(_data.events);
}

function reload() {
    axios.create().get('/data')
        .then((response) => {
            _data.events = response.data;
            countExtraInformationFromData();
        });
}

!PROD && countExtraInformationFromData();

PROD && reload();

const GasLogData = {
    get() {
        return _data;
    },
    reload,
    countExtraInformationFromData
};

export const MONTH_NAMES = ['Tammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu', 'Toukokuu', 'Kesäkuu', 'Heinäkuu', 'Elokuu', 'Syyskuu', 'Lokakuu', 'Marraskuu', 'Joulukuu'];

export default GasLogData;