import railwayData from "./tokyo-railway.json";
import { LINE_COLORS, LINE_INSTRUMENTS, RAILWAY_COLOR } from "./MapView.lines";
import type { Instrument } from "./MapView.lines";

type Path = {
  points: [number, number][];
  distances: number[];
  totalLength: number;
};

type Route = {
  name: string;
  paths: Path[];
};

type Train = {
  routeIndex: number;
  pathIndex: number;
  progress: number;
  speed: number;
  direction: 1 | -1;
};

const TRAINS_PER_PATH = 4;
const MIN_PATH_LENGTH = 0.005;
const CHAIN_THRESHOLD = 0.005;
const SNAPSHOT_INTERVAL = 15_000;
const TRAIN_SPEED_PER_SNAPSHOT = 0.04;

function dist(a: [number, number], b: [number, number]): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
}

function buildPaths(segs: [number, number][][]): Path[] {
  const remaining = segs.map((s) => [...s]);
  const chains: [number, number][][] = [];

  while (remaining.length > 0) {
    const chain = remaining.shift()!;
    let changed = true;
    while (changed && remaining.length > 0) {
      changed = false;
      for (let i = 0; i < remaining.length; i++) {
        const seg = remaining[i];
        if (dist(chain[chain.length - 1], seg[0]) < CHAIN_THRESHOLD) {
          chain.push(...seg.slice(1));
        } else if (dist(chain[chain.length - 1], seg[seg.length - 1]) < CHAIN_THRESHOLD) {
          chain.push(...seg.slice(0, -1).reverse());
        } else if (dist(chain[0], seg[seg.length - 1]) < CHAIN_THRESHOLD) {
          chain.unshift(...seg.slice(0, -1));
        } else if (dist(chain[0], seg[0]) < CHAIN_THRESHOLD) {
          chain.unshift(...seg.slice(1).reverse());
        } else {
          continue;
        }
        remaining.splice(i, 1);
        changed = true;
        break;
      }
    }
    chains.push(chain);
  }

  const paths: Path[] = [];
  for (const points of chains) {
    if (points.length < 2) continue;
    const distances: number[] = [0];
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      total += dist(points[i - 1], points[i]);
      distances.push(total);
    }
    if (total < MIN_PATH_LENGTH) continue;
    paths.push({ points, distances, totalLength: total });
  }

  return paths;
}

function buildRoutes(): Route[] {
  const segsByLine = new Map<string, [number, number][][]>();

  for (const f of railwayData.lines.features) {
    const name = f.properties.line as string;
    const coords = f.geometry.coordinates as [number, number][];
    if (!segsByLine.has(name)) segsByLine.set(name, []);
    segsByLine.get(name)!.push(coords);
  }

  const routes: Route[] = [];
  for (const [name, segs] of segsByLine) {
    const paths = buildPaths(segs);
    if (paths.length > 0) {
      routes.push({ name, paths });
    }
  }

  return routes;
}

function interpolate(path: Path, progress: number): [number, number] {
  const targetDist = progress * path.totalLength;
  let lo = 0;
  let hi = path.distances.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (path.distances[mid] <= targetDist) lo = mid;
    else hi = mid;
  }
  const segStart = path.distances[lo];
  const segEnd = path.distances[hi];
  const t = segEnd > segStart ? (targetDist - segStart) / (segEnd - segStart) : 0;
  const a = path.points[lo];
  const b = path.points[hi];
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

let routes: Route[] = [];
let trains: Train[] = [];
let currentPositions: TrainPosition[] = [];

export type TrainPosition = {
  coordinates: [number, number];
  color: string;
  line: string;
  instrument: Instrument;
};

export function initTrains() {
  routes = buildRoutes();
  trains = [];

  for (let r = 0; r < routes.length; r++) {
    const route = routes[r];
    for (let p = 0; p < route.paths.length; p++) {
      for (let i = 0; i < TRAINS_PER_PATH; i++) {
        const progress = i / TRAINS_PER_PATH + Math.random() * (1 / TRAINS_PER_PATH) * 0.5;
        const direction = i % 2 === 0 ? 1 : -1;
        const speed = TRAIN_SPEED_PER_SNAPSHOT * (0.8 + Math.random() * 0.4);
        trains.push({
          routeIndex: r,
          pathIndex: p,
          progress: Math.min(Math.max(progress, 0), 1),
          speed,
          direction: direction as 1 | -1,
        });
      }
    }
  }

  currentPositions = computePositions();
}

function computePositions(): TrainPosition[] {
  return trains.map((train) => {
    const route = routes[train.routeIndex];
    const path = route.paths[train.pathIndex];
    return {
      coordinates: interpolate(path, train.progress),
      color: LINE_COLORS[route.name] ?? RAILWAY_COLOR,
      line: route.name,
      instrument: LINE_INSTRUMENTS[route.name] ?? "percussion",
    };
  });
}

function advanceTrains() {
  for (const train of trains) {
    train.progress += train.speed * train.direction;

    if (train.progress >= 1) {
      train.progress = 1;
      train.direction = -1;
    } else if (train.progress <= 0) {
      train.progress = 0;
      train.direction = 1;
    }
  }

  currentPositions = computePositions();
}

export function getPositions(): TrainPosition[] {
  return currentPositions;
}

export { SNAPSHOT_INTERVAL, advanceTrains };
