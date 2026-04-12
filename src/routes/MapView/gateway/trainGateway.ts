import type { TrainPosition } from "../entity/train";
import { fetchTrains } from "./fetchTrains";
import { convertTrains } from "./convertTrains";

const SNAPSHOT_INTERVAL = 15_000;

type TrainGateway = {
  init(): Promise<void>;
  refresh(): Promise<void>;
  getPositions(): TrainPosition[];
  readonly snapshotInterval: number;
};

export function createTrainGateway(): TrainGateway {
  let positions: TrainPosition[] = [];

  return {
    snapshotInterval: SNAPSHOT_INTERVAL,

    async init() {
      const data = await fetchTrains();
      positions = convertTrains(data);
    },

    async refresh() {
      const data = await fetchTrains();
      positions = convertTrains(data);
    },

    getPositions() {
      return positions;
    },
  };
}
