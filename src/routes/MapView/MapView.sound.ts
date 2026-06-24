import { WorkletSynthesizer } from "spessasynth_lib";
import type { Instrument } from "./MapView.lines";
import type { TrainGroup } from "./gateway/groupTrains";

const INSTRUMENT_MIDI: Record<Instrument, { program: number; channel: number }> = {
  bass: { program: 32, channel: 0 },
  piano: { program: 4, channel: 1 },
  vibraphone: { program: 11, channel: 2 },
  trombone: { program: 57, channel: 3 },
  saxophone: { program: 66, channel: 4 },
  celesta: { program: 8, channel: 5 },
  guitar: { program: 26, channel: 6 },
  maracas: { program: 0, channel: 9 },
  hihat: { program: 0, channel: 9 },
  rimshot: { program: 0, channel: 9 },
  percussion: { program: 0, channel: 9 },
};

const REVERB_SEND: Record<Instrument, number> = {
  bass: 18,
  piano: 55,
  vibraphone: 90,
  trombone: 65,
  saxophone: 65,
  celesta: 95,
  guitar: 55,
  maracas: 60,
  hihat: 50,
  rimshot: 55,
  percussion: 60,
};

const PAN: Record<Instrument, number> = {
  bass: 64,
  piano: 52,
  vibraphone: 30,
  trombone: 45,
  saxophone: 83,
  celesta: 98,
  guitar: 76,
  maracas: 64,
  hihat: 40,
  rimshot: 64,
  percussion: 88,
};

type ChordTones = { roots: number[]; tones: number[] };

const CHORDS: ChordTones[] = [
  { roots: [38, 50], tones: [2, 5, 9, 0] },
  { roots: [43, 55], tones: [7, 11, 2, 5] },
  { roots: [36, 48], tones: [0, 4, 7, 11] },
  { roots: [45, 57], tones: [9, 1, 4, 7] },
];

function getChord(scanPos: number): ChordTones {
  const idx = Math.min(Math.floor(scanPos * 4), 3);
  return CHORDS[idx];
}

type InstrumentRange = { low: number; high: number };

const INSTRUMENT_RANGE: Record<Instrument, InstrumentRange> = {
  bass: { low: 38, high: 55 },
  piano: { low: 48, high: 72 },
  vibraphone: { low: 53, high: 77 },
  trombone: { low: 50, high: 67 },
  saxophone: { low: 48, high: 74 },
  celesta: { low: 60, high: 96 },
  guitar: { low: 52, high: 71 },
  maracas: { low: 0, high: 0 },
  hihat: { low: 0, high: 0 },
  rimshot: { low: 0, high: 0 },
  percussion: { low: 0, high: 0 },
};

const VELOCITY_RANGE: Record<Instrument, [number, number]> = {
  bass: [74, 86],
  piano: [60, 72],
  vibraphone: [22, 48],
  trombone: [70, 82],
  saxophone: [70, 82],
  celesta: [22, 45],
  guitar: [60, 72],
  maracas: [65, 95],
  hihat: [65, 95],
  rimshot: [65, 95],
  percussion: [65, 95],
};

const EXTRA_SUSTAIN: Record<Instrument, number> = {
  bass: 350,
  piano: 550,
  vibraphone: 1000,
  trombone: 200,
  saxophone: 200,
  celesta: 550,
  guitar: 450,
  maracas: 200,
  hihat: 100,
  rimshot: 150,
  percussion: 200,
};

const DRUM_NOTES: Record<string, number> = {
  maracas: 70,
  hihat: 42,
  rimshot: 37,
  percussion: 38,
};

const SCAN_DURATION = 15_000;

let synth: WorkletSynthesizer | undefined;
let initialized = false;
let programsSet = false;
let muted = false;
let soloLine: string | null = null;
let userLocation: [number, number] | null = null;

const PROXIMITY_MAX_KM = 8;
const PROXIMITY_MIN_KM = 0.5;

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
}

export function setSoloLine(line: string | null): void {
  soloLine = line;
}

export function setUserLocation(coords: [number, number] | null): void {
  userLocation = coords;
}

const toRad = (d: number) => (d * Math.PI) / 180;

function haversineKm(a: [number, number], b: [number, number]): number {
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function proximityVelocityScale(groupCoords: [number, number]): number {
  if (!userLocation) return 1;
  const km = haversineKm(userLocation, groupCoords);
  if (km <= PROXIMITY_MIN_KM) return 1;
  if (km >= PROXIMITY_MAX_KM) return 0.15;
  const t = (km - PROXIMITY_MIN_KM) / (PROXIMITY_MAX_KM - PROXIMITY_MIN_KM);
  return 1 - t * 0.85;
}

export async function initSound(): Promise<void> {
  if (initialized) return;
  initialized = true;

  try {
    const ctx = new AudioContext();
    await ctx.audioWorklet.addModule("/spessasynth_processor.min.js");

    const buf = await (await fetch("/soundfont.sf3")).arrayBuffer();

    const s = new WorkletSynthesizer(ctx);
    await s.soundBankManager.addSoundBank(buf, "gm");
    await s.isReady;
    await ctx.resume();

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.7;

    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 55;
    highpass.Q.value = 0.7;

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 8;
    compressor.ratio.value = 2;
    compressor.attack.value = 0.02;
    compressor.release.value = 0.25;

    s.connect(masterGain);
    masterGain.connect(highpass);
    highpass.connect(compressor);
    compressor.connect(ctx.destination);

    synth = s;
  } catch {
    initialized = false;
  }
}

function ensurePrograms() {
  if (!synth || programsSet) return;
  programsSet = true;

  Object.entries(INSTRUMENT_MIDI)
    .filter(([, v]) => v.channel !== 9)
    .forEach(([key, v]) => {
      const inst = key as Instrument;
      synth!.programChange(v.channel, v.program);
      synth!.controllerChange(v.channel, 91, REVERB_SEND[inst]);
      synth!.controllerChange(v.channel, 10, PAN[inst]);
    });
}

function selectNote(scanPos: number, progress: number, instrument: Instrument): number {
  const chord = getChord(scanPos);
  const range = INSTRUMENT_RANGE[instrument];

  if (instrument === "bass") {
    const hash = Math.sin(progress * 7919.3) * 10000;
    const useRoot = Math.abs(hash) % 100 < 70;
    const candidates = useRoot ? chord.roots : chord.roots.map((r) => r + 7);
    const inRange = candidates.filter((n) => n >= range.low && n <= range.high);
    if (inRange.length > 0) {
      return inRange[Math.abs(Math.floor(hash)) % inRange.length];
    }
    return chord.roots[0];
  }

  const allNotes: number[] = [];
  for (let octave = 0; octave < 10; octave++) {
    for (const tone of chord.tones) {
      const note = octave * 12 + tone;
      if (note >= range.low && note <= range.high) {
        allNotes.push(note);
      }
    }
  }

  if (allNotes.length === 0) return 60;

  const hash = Math.sin(progress * 9999.7) * 10000;
  const idx = Math.abs(Math.floor(hash)) % allNotes.length;
  return allNotes[idx];
}

export function playGroupNote(group: TrainGroup, coords: [number, number], scanPos: number): void {
  if (!synth || muted) return;
  if (soloLine && group.line !== soloLine) return;
  ensurePrograms();

  const inst = INSTRUMENT_MIDI[group.instrument];
  if (!inst) return;

  const isDrum = inst.channel === 9;
  const midProgress = (group.startProgress + group.endProgress) / 2;
  const note = isDrum
    ? (DRUM_NOTES[group.instrument] ?? 38)
    : selectNote(scanPos, midProgress, group.instrument);

  const [vLow, vHigh] = VELOCITY_RANGE[group.instrument];
  const baseVelocity = vLow + Math.floor(Math.random() * (vHigh - vLow));
  const scale = proximityVelocityScale(coords);
  const velocity = Math.max(5, Math.floor(baseVelocity * scale));

  const groupWidth = group.endProgress - group.startProgress;
  const sustainMs = groupWidth * SCAN_DURATION + EXTRA_SUSTAIN[group.instrument];

  synth.noteOn(inst.channel, note, velocity);

  setTimeout(() => {
    synth?.noteOff(inst.channel, note);
  }, sustainMs);
}

export function stopSound(): void {
  if (!synth) return;
  Array.from({ length: 16 }, (_, i) => i).forEach((ch) => {
    synth!.noteOff(ch, 0);
  });
}
