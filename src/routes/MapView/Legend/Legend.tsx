import { Music, Piano, Wind, Sparkle, Music3, Guitar, Drum } from "lucide-solid";
import type { Component } from "solid-js";
import type { Instrument } from "../MapView.timetable";

type InstrumentGroup = {
  instrument: Instrument;
  icon: Component<{ size: number }>;
  lines: string[];
};

const GROUPS: InstrumentGroup[] = [
  {
    instrument: "bass",
    icon: Music,
    lines: ["JY", "JC", "JK"],
  },
  {
    instrument: "piano",
    icon: Piano,
    lines: ["G", "M", "H", "T"],
  },
  {
    instrument: "saxophone",
    icon: Wind,
    lines: ["C", "Y", "Z", "N"],
  },
  {
    instrument: "vibraphone",
    icon: Sparkle,
    lines: ["F", "JB", "JA"],
  },
  {
    instrument: "trombone",
    icon: Music3,
    lines: ["A", "I", "S", "E"],
  },
  {
    instrument: "guitar",
    icon: Guitar,
    lines: ["TY", "DT", "OH", "KO"],
  },
  {
    instrument: "percussion",
    icon: Drum,
    lines: ["JS", "JU"],
  },
];

export default function Legend() {
  return (
    <div class="fixed bottom-4 left-4 z-50 flex flex-col gap-1.5">
      {GROUPS.map((group) => (
        <div class="flex items-center gap-1.5">
          <group.icon size={12} />
          <div class="flex gap-0.5">
            {group.lines.map((code) => (
              <img src={`/icons/lines/${code}.svg`} alt={code} class="h-4.5 w-4.5" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
