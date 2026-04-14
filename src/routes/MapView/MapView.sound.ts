import { WorkletSynthesizer } from "spessasynth_lib";
import type { Instrument } from "./MapView.lines";
import type { TrainPosition } from "./entity/train";

const INSTRUMENT_MIDI: Record<Instrument, { program: number; channel: number }> = {
  bass: { program: 32, channel: 0 },
  piano: { program: 4, channel: 1 },
  vibraphone: { program: 11, channel: 2 },
  trombone: { program: 57, channel: 3 },
  saxophone: { program: 66, channel: 4 },
  celesta: { program: 8, channel: 5 },
  maracas: { program: 0, channel: 9 },
  hihat: { program: 0, channel: 9 },
  guitar: { program: 26, channel: 6 },
  rimshot: { program: 0, channel: 9 },
  percussion: { program: 0, channel: 9 },
};

const SCALE = [48, 50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72, 74, 76];

const DRUM_NOTES: Record<string, number> = {
  maracas: 70,
  hihat: 42,
  rimshot: 37,
  percussion: 38,
};

const NOTE_DURATION = 600;

let synth: WorkletSynthesizer | undefined;
let initialized = false;
let programsSet = false;
let muted = false;

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
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
    s.connect(ctx.destination);

    synth = s;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Sound init failed:", e);
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

function progressToNote(progress: number): number {
  const idx = Math.floor(progress * (SCALE.length - 1));
  return SCALE[Math.max(0, Math.min(idx, SCALE.length - 1))];
}

export function playNote(position: TrainPosition): void {
  if (!synth || muted) return;
  ensurePrograms();

  const inst = INSTRUMENT_MIDI[position.instrument];
  if (!inst) return;

  const isDrum = inst.channel === 9;
  const note = isDrum ? (DRUM_NOTES[position.instrument] ?? 38) : progressToNote(position.progress);

  const velocity = 60 + Math.floor(Math.random() * 30);

  synth.noteOn(inst.channel, note, velocity);
  setTimeout(() => {
    synth?.noteOff(inst.channel, note);
  }, NOTE_DURATION);
}

export function stopSound(): void {
  if (!synth) return;
  Array.from({ length: 16 }, (_, i) => i).forEach((ch) => {
    synth!.noteOff(ch, 0);
  });
}
