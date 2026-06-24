import type { TrainPosition } from "../entity/train";
import { fetchTrains } from "./fetchTrains";
import { convertTrains } from "./convertTrains";

const SNAPSHOT_INTERVAL = 15_000;
const MAX_RETRIES = 2;
const RETRY_DELAY = 1_000;

type TrainGateway = {
  init(): Promise<void>;
  refresh(): Promise<void>;
  getPositions(): TrainPosition[];
  readonly snapshotInterval: number;
};

async function fetchWithRetry(): Promise<TrainPosition[]> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const data = await fetchTrains();
      const positions = convertTrains(data);
      if (positions.length > 0) return positions;
    } catch {
      /* retry */
    }
    if (attempt < MAX_RETRIES - 1) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY));
    }
  }
  return [];
}

export function createTrainGateway(): TrainGateway {
  let positions: TrainPosition[] = [];

  return {
    snapshotInterval: SNAPSHOT_INTERVAL,

    async init() {
      positions = await fetchWithRetry();
    },

    async refresh() {
      try {
        const data = await fetchTrains();
        const next = convertTrains(data);
        if (next.length > 0) positions = next;
      } catch {
        /* keep previous positions */
      }
    },

    getPositions() {
      return positions;
    },
  };
}
