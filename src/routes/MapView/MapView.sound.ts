import { WorkletSynthesizer } from "spessasynth_lib";
import type { Instrument } from "./MapView.lines";
import type { TrainGroup } from "./gateway/groupTrains";

const INSTRUMENT_MIDI: Record<Instrument, { program: number; channel: number }> = {
  bass: { program: 33, channel: 0 },
  piano: { program: 2, channel: 1 },
  vibraphone: { program: 11, channel: 2 },
  trombone: { program: 58, channel: 3 },
  saxophone: { program: 67, channel: 4 },
  celesta: { program: 8, channel: 5 },
  maracas: { program: 0, channel: 9 },
  hihat: { program: 0, channel: 9 },
  guitar: { program: 27, channel: 6 },
  rimshot: { program: 0, channel: 9 },
  percussion: { program: 0, channel: 9 },
};

// Cm diatonic minor progression (darker):
//   0.00–0.25: Cm9      (C Eb G Bb D)
//   0.25–0.50: Fm9      (F Ab C Eb G)
//   0.50–0.75: Abmaj7   (Ab C Eb G)
//   0.75–1.00: Gm7b5    (G Bb Db F)
type ChordTones = { roots: number[]; tones: number[] };

const CHORDS: ChordTones[] = [
  { roots: [36, 48], tones: [0, 3, 7, 10] }, // Cm: C=0, Eb=3, G=7, Bb=10
  { roots: [41, 53], tones: [5, 8, 0, 3] }, // Fm: F=5, Ab=8, C=0, Eb=3
  { roots: [44, 56], tones: [8, 0, 3, 7] }, // Ab: Ab=8, C=0, Eb=3, G=7
  { roots: [43, 55], tones: [7, 10, 1, 5] }, // Gm7b5: G=7, Bb=10, Db=1, F=5
];

function getChord(scanPos: number): ChordTones {
  const idx = Math.min(Math.floor(scanPos * 4), 3);
  return CHORDS[idx];
}

type InstrumentRange = { low: number; high: number };

const INSTRUMENT_RANGE: Record<Instrument, InstrumentRange> = {
  bass: { low: 36, high: 52 },
  piano: { low: 55, high: 74 },
  vibraphone: { low: 60, high: 79 },
  trombone: { low: 48, high: 65 },
  saxophone: { low: 53, high: 72 },
  celesta: { low: 67, high: 84 },
  guitar: { low: 53, high: 70 },
  maracas: { low: 0, high: 0 },
  hihat: { low: 0, high: 0 },
  rimshot: { low: 0, high: 0 },
  percussion: { low: 0, high: 0 },
};

const VELOCITY_RANGE: Record<Instrument, [number, number]> = {
  bass: [20, 36],
  piano: [14, 28],
  vibraphone: [12, 24],
  trombone: [16, 30],
  saxophone: [18, 32],
  celesta: [10, 20],
  guitar: [14, 26],
  maracas: [10, 18],
  hihat: [8, 16],
  rimshot: [10, 18],
  percussion: [10, 18],
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

function createImpulseResponse(ctx: AudioContext): AudioBuffer {
  const rate = ctx.sampleRate;
  const length = rate * 2.2;
  const buffer = ctx.createBuffer(2, length, rate);

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp((-3.5 * i) / length);
    }
  }

  return buffer;
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

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 12;
    compressor.ratio.value = 3;
    compressor.attack.value = 0.01;
    compressor.release.value = 0.25;

    const warmth = ctx.createBiquadFilter();
    warmth.type = "lowshelf";
    warmth.frequency.value = 250;
    warmth.gain.value = 4;

    const darken = ctx.createBiquadFilter();
    darken.type = "highshelf";
    darken.frequency.value = 2500;
    darken.gain.value = -6;

    const rolloff = ctx.createBiquadFilter();
    rolloff.type = "lowpass";
    rolloff.frequency.value = 3500;
    rolloff.Q.value = 0.4;

    const convolver = ctx.createConvolver();
    convolver.buffer = createImpulseResponse(ctx);

    const dryGain = ctx.createGain();
    dryGain.gain.value = 0.45;

    const wetGain = ctx.createGain();
    wetGain.gain.value = 0.55;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.7;

    s.connect(warmth);
    warmth.connect(darken);
    darken.connect(rolloff);
    rolloff.connect(compressor);

    compressor.connect(dryGain);
    compressor.connect(convolver);

    dryGain.connect(masterGain);
    convolver.connect(wetGain);
    wetGain.connect(masterGain);

    masterGain.connect(ctx.destination);

    synth = s;
  } catch {
    initialized = false;
  }
}

function ensurePrograms() {
  if (!synth || programsSet) return;
  programsSet = true;

  Object.values(INSTRUMENT_MIDI)
    .filter((v) => v.channel !== 9)
    .forEach((v) => {
      synth!.programChange(v.channel, v.program);
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
  const sustainMs = groupWidth * SCAN_DURATION;

  synth.noteOn(inst.channel, note, velocity);

  setTimeout(() => {
    synth?.noteOff(inst.channel, note);
  }, sustainMs + 200);
}

export function stopSound(): void {
  if (!synth) return;
  Array.from({ length: 16 }, (_, i) => i).forEach((ch) => {
    synth!.noteOff(ch, 0);
  });
}
