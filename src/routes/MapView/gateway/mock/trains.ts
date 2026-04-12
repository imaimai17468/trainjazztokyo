import type { OdptTrainResponse } from "../../entity/odpt";

type LineConfig = {
  railway: string;
  stationPairs: [string, string][];
  directions: [string, string];
  trainCount: number;
};

const LINES: LineConfig[] = [
  {
    railway: "JR-East.Yamanote",
    directions: ["Outer", "Inner"],
    trainCount: 24,
    stationPairs: [
      ["Tokyo", "Yurakucho"],
      ["Shinbashi", "Hamamatsucho"],
      ["Tamachi", "Shinagawa"],
      ["Osaki", "Gotanda"],
      ["Meguro", "Ebisu"],
      ["Shibuya", "Harajuku"],
      ["Yoyogi", "Shinjuku"],
      ["ShinOkubo", "Takadanobaba"],
      ["Mejiro", "Ikebukuro"],
      ["Otsuka", "Sugamo"],
      ["Komagome", "Tabata"],
      ["Nishi-Nippori", "Nippori"],
    ],
  },
  {
    railway: "JR-East.ChuoRapid",
    directions: ["Outbound", "Inbound"],
    trainCount: 16,
    stationPairs: [
      ["Tokyo", "Kanda"],
      ["Ochanomizu", "Yotsuya"],
      ["Shinjuku", "Nakano"],
      ["Koenji", "Ogikubo"],
      ["Nishi-Ogikubo", "Kichijoji"],
      ["Mitaka", "Musashisakai"],
      ["Kokubunji", "Tachikawa"],
      ["Hachioji", "Takao"],
    ],
  },
  {
    railway: "JR-East.ChuoSobuLocal",
    directions: ["Westbound", "Eastbound"],
    trainCount: 14,
    stationPairs: [
      ["Mitaka", "Kichijoji"],
      ["Nishi-Ogikubo", "Ogikubo"],
      ["Asagaya", "Koenji"],
      ["Nakano", "Higashi-Nakano"],
      ["Okubo", "Shinjuku"],
      ["Yotsuya", "Ichigaya"],
      ["Akihabara", "Kinshicho"],
    ],
  },
  {
    railway: "JR-East.KeihinTohoku",
    directions: ["Southbound", "Northbound"],
    trainCount: 16,
    stationPairs: [
      ["Omiya", "SaitamaShintoshin"],
      ["Akabane", "Oji"],
      ["Tabata", "Nishi-Nippori"],
      ["Ueno", "Okachimachi"],
      ["Akihabara", "Kanda"],
      ["Tokyo", "Shinbashi"],
      ["Hamamatsucho", "Tamachi"],
      ["Shinagawa", "Kamata"],
    ],
  },
  {
    railway: "JR-East.Saikyo",
    directions: ["Southbound", "Northbound"],
    trainCount: 10,
    stationPairs: [
      ["Omiya", "Kitayono"],
      ["Musashi-Urawa", "Naka-Urawa"],
      ["Akabane", "Jujo"],
      ["Ikebukuro", "Shinjuku"],
      ["Shibuya", "Ebisu"],
    ],
  },
  {
    railway: "JR-East.ShonanShinjuku",
    directions: ["Southbound", "Northbound"],
    trainCount: 6,
    stationPairs: [
      ["Omiya", "Urawa"],
      ["Ikebukuro", "Shinjuku"],
      ["Osaki", "Shinagawa"],
    ],
  },
  {
    railway: "JR-East.UenoTokyo",
    directions: ["Southbound", "Northbound"],
    trainCount: 8,
    stationPairs: [
      ["Ueno", "Tokyo"],
      ["Shinbashi", "Shinagawa"],
      ["Akabane", "Oji"],
      ["Tabata", "Ueno"],
    ],
  },
  {
    railway: "TokyoMetro.Ginza",
    directions: ["Asakusa", "Shibuya"],
    trainCount: 16,
    stationPairs: [
      ["Shibuya", "OmoteSando"],
      ["Gaiemmae", "AoyamaItchome"],
      ["Akasaka-mitsuke", "Tameike-sanno"],
      ["Toranomon", "Shinbashi"],
      ["Ginza", "Kyobashi"],
      ["Nihombashi", "Mitsukoshimae"],
      ["Kanda", "Suehirocho"],
      ["Ueno", "Asakusa"],
    ],
  },
  {
    railway: "TokyoMetro.Marunouchi",
    directions: ["Ogikubo", "Ikebukuro"],
    trainCount: 18,
    stationPairs: [
      ["Ogikubo", "Shin-Koenji"],
      ["Shin-Nakano", "Nakano-Sakaue"],
      ["Nishi-Shinjuku", "Shinjuku"],
      ["Shinjuku-sanchome", "Shin-Otsuka"],
      ["Yotsuya", "AkasakaMitsuke"],
      ["Kasumigaseki", "Ginza"],
      ["Tokyo", "Otemachi"],
      ["Awajicho", "Ochanomizu"],
      ["Korakuen", "Ikebukuro"],
    ],
  },
  {
    railway: "TokyoMetro.Hibiya",
    directions: ["NakaMeguro", "KitaSenju"],
    trainCount: 14,
    stationPairs: [
      ["NakaMeguro", "Ebisu"],
      ["Hiroo", "Roppongi"],
      ["Kamiyacho", "Kasumigaseki"],
      ["Ginza", "Tsukiji"],
      ["Hatchobori", "Kayabacho"],
      ["NingyoMae", "Akihabara"],
      ["Ueno", "KitaSenju"],
    ],
  },
  {
    railway: "TokyoMetro.Tozai",
    directions: ["Nakano", "Nishi-Funabashi"],
    trainCount: 16,
    stationPairs: [
      ["Nakano", "Ochiai"],
      ["Takadanobaba", "Waseda"],
      ["Kagurazaka", "Iidabashi"],
      ["Kudanshita", "Takebashi"],
      ["Otemachi", "Nihombashi"],
      ["Kayabacho", "Monzen-nakacho"],
      ["Kiba", "Toyocho"],
      ["Nishi-Kasai", "Kasai"],
    ],
  },
  {
    railway: "TokyoMetro.Chiyoda",
    directions: ["YoyogiUehara", "Ayase"],
    trainCount: 14,
    stationPairs: [
      ["YoyogiUehara", "YoyogiKoen"],
      ["Meiji-jingumae", "OmoteSando"],
      ["Nogizaka", "Akasaka"],
      ["Kokkai-gijidomae", "Kasumigaseki"],
      ["Hibiya", "Otemachi"],
      ["Shin-Ochanomizu", "Yushima"],
      ["Sendagi", "Machiya"],
    ],
  },
  {
    railway: "TokyoMetro.Yurakucho",
    directions: ["Wakoshi", "ShinKiba"],
    trainCount: 12,
    stationPairs: [
      ["Wakoshi", "Chikatetsu-narimasu"],
      ["Kotake-mukaihara", "Ikebukuro"],
      ["Higashi-Ikebukuro", "Gokokuji"],
      ["Iidabashi", "Ichigaya"],
      ["Nagatacho", "Sakuradamon"],
      ["Yurakucho", "ShinKiba"],
    ],
  },
  {
    railway: "TokyoMetro.Hanzomon",
    directions: ["Shibuya", "Oshiage"],
    trainCount: 12,
    stationPairs: [
      ["Shibuya", "OmoteSando"],
      ["AoyamaItchome", "Nagatacho"],
      ["Hanzomon", "Kudanshita"],
      ["Jimbocho", "Otemachi"],
      ["Mitsukoshimae", "Suitengumae"],
      ["Kiyosumi-Shirakawa", "Oshiage"],
    ],
  },
  {
    railway: "TokyoMetro.Namboku",
    directions: ["Meguro", "AkabaneIwabuchi"],
    trainCount: 10,
    stationPairs: [
      ["Meguro", "Shirokanedai"],
      ["Azabu-Juban", "Roppongi-Itchome"],
      ["Tameike-Sanno", "Nagatacho"],
      ["Yotsuya", "Ichigaya"],
      ["Komagome", "Oji"],
    ],
  },
  {
    railway: "TokyoMetro.Fukutoshin",
    directions: ["Wakoshi", "Shibuya"],
    trainCount: 10,
    stationPairs: [
      ["Wakoshi", "Chikatetsu-akatsuka"],
      ["Kotake-mukaihara", "Senkawa"],
      ["Ikebukuro", "Zoshigaya"],
      ["Nishi-Waseda", "Shinjuku-Sanchome"],
      ["Meiji-jingumae", "Shibuya"],
    ],
  },
  {
    railway: "Toei.Asakusa",
    directions: ["NishiMagome", "Oshiage"],
    trainCount: 10,
    stationPairs: [
      ["Nishi-Magome", "Gotanda"],
      ["Takanawadai", "Sengakuji"],
      ["Daimon", "Shinbashi"],
      ["Nihombashi", "Asakusabashi"],
      ["Asakusa", "Oshiage"],
    ],
  },
  {
    railway: "Toei.Mita",
    directions: ["Meguro", "NishiTakashimadaira"],
    trainCount: 10,
    stationPairs: [
      ["Meguro", "Shirokanedai"],
      ["Mita", "Shibakoen"],
      ["Onarimon", "Uchisaiwaicho"],
      ["Hibiya", "Otemachi"],
      ["Jimbocho", "Suidobashi"],
    ],
  },
  {
    railway: "Toei.Shinjuku",
    directions: ["Shinjuku", "Motoyawata"],
    trainCount: 10,
    stationPairs: [
      ["Shinjuku", "ShinjukuSanchome"],
      ["Akebonobashi", "Ichigaya"],
      ["Kudanshita", "Jimbocho"],
      ["Ogawamachi", "Iwamotocho"],
      ["Morishita", "Ojima"],
    ],
  },
  {
    railway: "Toei.Oedo",
    directions: ["Hikarigaoka", "Tochomae"],
    trainCount: 14,
    stationPairs: [
      ["Tochomae", "Shinjuku-Nishiguchi"],
      ["Higashi-Shinjuku", "Wakamatsu-kawada"],
      ["Iidabashi", "Kasuga"],
      ["Ueno-okachimachi", "Shin-Okachimachi"],
      ["Kuramae", "Ryogoku"],
      ["Monzen-nakacho", "Tsukishima"],
      ["Daimon", "Roppongi"],
    ],
  },
  {
    railway: "Tokyu.Toyoko",
    directions: ["Shibuya", "Yokohama"],
    trainCount: 10,
    stationPairs: [
      ["Shibuya", "NakaMeguro"],
      ["Gakugeidaigaku", "Toritsudaigaku"],
      ["Jiyugaoka", "DenEnChofu"],
      ["Tama-Plaza", "Musashi-Kosugi"],
      ["Hiyoshi", "Tsunashima"],
    ],
  },
  {
    railway: "Tokyu.DenEnToshi",
    directions: ["Shibuya", "ChuoRinkan"],
    trainCount: 12,
    stationPairs: [
      ["Shibuya", "Ikejiri-Ohashi"],
      ["Sangenjaya", "Komazawa-Daigaku"],
      ["Sakura-Shimmachi", "Yoga"],
      ["Futako-Tamagawa", "Mizonokuchi"],
      ["Miyazakidai", "Tama-Plaza"],
      ["Azamino", "Nagatsuta"],
    ],
  },
  {
    railway: "Odakyu.Odawara",
    directions: ["Shinjuku", "Odawara"],
    trainCount: 12,
    stationPairs: [
      ["Shinjuku", "MinamiShinjuku"],
      ["Yoyogi-Uehara", "Shimokitazawa"],
      ["Setagaya-Daita", "Kyodo"],
      ["Komae", "Noborito"],
      ["Shin-Yurigaoka", "Machida"],
      ["Sagamiono", "Ebina"],
    ],
  },
  {
    railway: "Keio.Keio",
    directions: ["Shinjuku", "Takao"],
    trainCount: 12,
    stationPairs: [
      ["Shinjuku", "Sasazuka"],
      ["MeidaiMae", "Chitose-Karasuyama"],
      ["Tsutsujigaoka", "Chofu"],
      ["Higashi-Fuchu", "Fuchu"],
      ["Kitano", "Takao"],
      ["Takahatafudo", "Mogusaen"],
    ],
  },
];

const generateTrains = (): OdptTrainResponse =>
  LINES.flatMap((line) => {
    const prefix = line.railway.split(".").pop()?.slice(0, 2) ?? "XX";
    return Array.from({ length: line.trainCount }, (_, i) => {
      const pair = line.stationPairs[i % line.stationPairs.length];
      return {
        railway: line.railway,
        fromStation: `${line.railway}.${pair[0]}`,
        toStation: `${line.railway}.${pair[1]}`,
        railDirection: line.directions[i % 2],
        trainNumber: `${prefix}${String(i + 1).padStart(4, "0")}`,
        date: new Date().toISOString(),
      };
    });
  });

export const mockTrains = generateTrains();
