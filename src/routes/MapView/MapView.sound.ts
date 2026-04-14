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

// Cm7 - Fm7 - Bb7 - Ebmaj7 のジャズ進行に基づく音階
// 楽器ごとに音域と使う音を変える
const INSTRUMENT_SCALES: Record<Instrument, number[]> = {
  // ベース: 低音域、ルート・5度・7度中心のウォーキングベースライン
  bass: [36, 39, 41, 43, 46, 48, 51, 53],
  // ピアノ: 中音域、Cm9 / Fm9 コードトーン
  piano: [60, 63, 65, 67, 70, 72, 74, 75],
  // ヴィブラフォン: 中高音域、ペンタトニック的
  vibraphone: [67, 70, 72, 75, 77, 79, 82],
  // トロンボーン: 中低音域、ブルーノート含む
  trombone: [48, 51, 53, 54, 55, 58, 60, 63],
  // サックス: 中高音域、ブルーススケール
  saxophone: [58, 60, 63, 65, 66, 67, 70, 72, 75],
  // チェレスタ: 高音域、澄んだ音
  celesta: [72, 75, 77, 79, 82, 84, 87],
  // ギター: 中音域、コードトーン
  guitar: [55, 58, 60, 63, 65, 67, 70, 72],
  // ドラム系は別処理
  maracas: [],
  hihat: [],
  rimshot: [],
  percussion: [],
};

const DRUM_NOTES: Record<string, number> = {
  maracas: 70,
  hihat: 42,
  rimshot: 37,
  percussion: 38,
};

// 楽器ごとのノート長（ジャズらしいリズム感）
const INSTRUMENT_DURATION: Record<Instrument, number> = {
  bass: 800,
  piano: 1200,
  vibraphone: 1500,
  trombone: 1000,
  saxophone: 900,
  celesta: 1800,
  guitar: 600,
  maracas: 100,
  hihat: 80,
  rimshot: 50,
  percussion: 100,
};

let synth: WorkletSynthesizer | undefined;
let initialized = false;
let programsSet = false;
let muted = false;
let soloLine: string | null = null;

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
}

export function setSoloLine(line: string | null): void {
  soloLine = line;
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

function progressToNote(progress: number, instrument: Instrument): number {
  const scale = INSTRUMENT_SCALES[instrument];
  if (scale.length === 0) return 60;
  // progress をハッシュして音階内で散らす（単調に上がらない）
  const hash = Math.sin(progress * 9999.7) * 10000;
  const idx = Math.abs(Math.floor(hash)) % scale.length;
  return scale[idx];
}

export function playNote(position: TrainPosition): void {
  if (!synth || muted) return;
  if (soloLine && position.line !== soloLine) return;
  ensurePrograms();

  const inst = INSTRUMENT_MIDI[position.instrument];
  if (!inst) return;

  const isDrum = inst.channel === 9;
  const note = isDrum
    ? (DRUM_NOTES[position.instrument] ?? 38)
    : progressToNote(position.progress, position.instrument);

  const velocity = 40 + Math.floor(Math.random() * 35);
  const duration = INSTRUMENT_DURATION[position.instrument];

  synth.noteOn(inst.channel, note, velocity);
  setTimeout(() => {
    synth?.noteOff(inst.channel, note);
  }, duration);
}

export function stopSound(): void {
  if (!synth) return;
  Array.from({ length: 16 }, (_, i) => i).forEach((ch) => {
    synth!.noteOff(ch, 0);
  });
}
