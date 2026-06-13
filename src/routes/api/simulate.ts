type SimulatedTrain = {
  railway: string;
  fromStation: string;
  toStation?: string;
  railDirection: string;
  trainNumber: string;
  departureTime?: string;
  date: string;
  progress: number;
};

type LineProfile = {
  railway: string;
  headwayMinutes: number;
  roundTripMinutes: number;
  isLoop: boolean;
};

const LINE_PROFILES: LineProfile[] = [
  {
    railway: "JR-East.Yamanote",
    headwayMinutes: 3,
    roundTripMinutes: 60,
    isLoop: true,
  },
  {
    railway: "JR-East.ChuoRapid",
    headwayMinutes: 4,
    roundTripMinutes: 50,
    isLoop: false,
  },
  {
    railway: "JR-East.ChuoSobuLocal",
    headwayMinutes: 4,
    roundTripMinutes: 70,
    isLoop: false,
  },
  {
    railway: "JR-East.KeihinTohoku",
    headwayMinutes: 3,
    roundTripMinutes: 90,
    isLoop: false,
  },
  {
    railway: "JR-East.Saikyo",
    headwayMinutes: 5,
    roundTripMinutes: 60,
    isLoop: false,
  },
  {
    railway: "JR-East.ShonanShinjuku",
    headwayMinutes: 8,
    roundTripMinutes: 80,
    isLoop: false,
  },
  {
    railway: "JR-East.UenoTokyo",
    headwayMinutes: 6,
    roundTripMinutes: 70,
    isLoop: false,
  },
  {
    railway: "Tokyu.Toyoko",
    headwayMinutes: 4,
    roundTripMinutes: 50,
    isLoop: false,
  },
  {
    railway: "Tokyu.DenEnToshi",
    headwayMinutes: 4,
    roundTripMinutes: 60,
    isLoop: false,
  },
  {
    railway: "Odakyu.Odawara",
    headwayMinutes: 5,
    roundTripMinutes: 80,
    isLoop: false,
  },
  {
    railway: "Keio.Keio",
    headwayMinutes: 5,
    roundTripMinutes: 60,
    isLoop: false,
  },
];

function isServiceHours(): boolean {
  const now = new Date();
  const h = now.getHours();
  return h >= 5 && h < 25;
}

function getHeadwayMultiplier(): number {
  const now = new Date();
  const h = now.getHours();
  if (h >= 7 && h <= 9) return 0.7;
  if (h >= 17 && h <= 20) return 0.8;
  if (h >= 22 || h <= 5) return 2.5;
  return 1.0;
}

export function generateSimulatedTrains(excludeRailways: Set<string>): SimulatedTrain[] {
  if (!isServiceHours()) return [];

  const now = Date.now();
  const multiplier = getHeadwayMultiplier();
  const results: SimulatedTrain[] = [];

  for (const profile of LINE_PROFILES) {
    if (excludeRailways.has(profile.railway)) continue;

    const headway = profile.headwayMinutes * multiplier;
    const roundTrip = profile.roundTripMinutes;
    const trainCount = Math.max(2, Math.round(roundTrip / headway));

    for (let i = 0; i < trainCount; i++) {
      const offset = (i / trainCount) * roundTrip * 60 * 1000;
      const elapsed = (now + offset) % (roundTrip * 60 * 1000);
      const cyclePos = elapsed / (roundTrip * 60 * 1000);

      let progress: number;
      let direction: string;

      if (profile.isLoop) {
        progress = cyclePos;
        direction = "Clockwise";
      } else {
        if (cyclePos < 0.5) {
          progress = cyclePos * 2;
          direction = "Outbound";
        } else {
          progress = (1 - cyclePos) * 2;
          direction = "Inbound";
        }
      }

      results.push({
        railway: profile.railway,
        fromStation: `${profile.railway}.sim${i}`,
        toStation: undefined,
        railDirection: direction,
        trainNumber: `SIM-${profile.railway.split(".").pop()}-${i}`,
        date: new Date().toISOString(),
        progress,
      });
    }
  }

  return results;
}
