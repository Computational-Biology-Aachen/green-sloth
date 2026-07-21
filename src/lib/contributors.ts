import anna from "$lib/assets/people/anna.png";
import elouen from "$lib/assets/people/elouen.png";
import huy from "$lib/assets/people/huy.png";
import josha from "$lib/assets/people/josha.png";
import maja from "$lib/assets/people/maja.png";
import malick from "$lib/assets/people/malick.png";
import marvin from "$lib/assets/people/marvin.png";
import tanvir from "$lib/assets/people/tanvir.png";
import tim from "$lib/assets/people/tim.png";
import type { Contributor } from "$lib/types";

const contributors: Record<string, Contributor> = {
  elouencorvest: {
    key: "elouencorvest",
    name: "Elouen Corvest",
    github: "ElouenCorvest",
    photo: elouen,
  },
  huynguyen: {
    key: "huynguyen",
    name: "Quang Huy Nguyen",
    github: "PhotosyntheticBatman",
    photo: huy,
  },
  joshaebeling: {
    key: "joshaebeling",
    name: "Josha Ebeling",
    github: "pmfjosh",
    photo: josha,
  },
  majablume: {
    key: "majablume",
    name: "Maja Blume",
    github: "MajaBlume",
    photo: maja,
  },
  marvinvanaalst: {
    key: "marvinvanaalst",
    name: "Marvin van Aalst",
    homepage: "https://marvinvanaalst.github.io/",
    orcid: "0000-0002-7434-0249",
    github: "marvinvanaalst",
    gitlab: "marvin.vanaalst",
    photo: marvin,
  },
  tanvirhassan: {
    key: "tanvirhassan",
    name: "Tanvir Hassan",
    github: "Tanvir96rwth",
    photo: tanvir,
  },
  timnies: {
    key: "timnies",
    name: "Tim Nies",
    github: "tnies",
    photo: tim,
  },
  malickcisse: {
    key: "malickcisse",
    name: "Malick Cisse",
    github: "kosmosofmalick-spec",
    photo: malick,
  },
  annamatuszynska: {
    key: "annamatuszynska",
    name: "Anna Matuszyńska",
    github: "AnnaMatuszynska",
    photo: anna,
  },
};

export default contributors;
