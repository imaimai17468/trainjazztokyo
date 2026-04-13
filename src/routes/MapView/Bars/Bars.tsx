import type { TrainPosition } from "../entity/train";
import { LINE_COLORS, RAILWAY_COLOR } from "../MapView.lines";

const LINE_ORDER: { name: string; code: string }[] = [
  { name: "山手線", code: "JY" },
  { name: "中央線快速", code: "JC" },
  { name: "京浜東北線", code: "JK" },
  { name: "中央・総武緩行線", code: "JB" },
  { name: "東京メトロ銀座線", code: "G" },
  { name: "東京メトロ丸ノ内線", code: "M" },
  { name: "東京メトロ日比谷線", code: "H" },
  { name: "東京メトロ東西線", code: "T" },
  { name: "都営浅草線", code: "A" },
  { name: "都営新宿線", code: "S" },
  { name: "都営大江戸線", code: "E" },
  { name: "東京メトロ千代田線", code: "C" },
  { name: "東京メトロ有楽町線", code: "Y" },
  { name: "東京メトロ半蔵門線", code: "Z" },
  { name: "東京メトロ南北線", code: "N" },
  { name: "東京メトロ副都心線", code: "F" },
  { name: "埼京線", code: "JA" },
  { name: "都営三田線", code: "I" },
  { name: "東急東横線", code: "TY" },
  { name: "東急田園都市線", code: "DT" },
  { name: "小田急小田原線", code: "OH" },
  { name: "京王線", code: "KO" },
  { name: "湘南新宿ライン", code: "JS" },
  { name: "上野東京ライン", code: "JU" },
];

const ROW_HEIGHT = 16;

type Props = {
  positions: TrainPosition[];
  visible: boolean;
};

export default function Bars(props: Props) {
  const trainsByLine = () =>
    props.positions.reduce((acc, p) => {
      const arr = acc.get(p.line) ?? [];
      arr.push(p);
      return acc.set(p.line, arr);
    }, new Map<string, TrainPosition[]>());

  return (
    <div
      class="fixed inset-0 z-30 flex items-center justify-center transition-opacity duration-700"
      classList={{
        "opacity-100 pointer-events-auto": props.visible,
        "opacity-0 pointer-events-none": !props.visible,
      }}
    >
      <div class="w-full px-12" style={{ height: `${LINE_ORDER.length * ROW_HEIGHT}px` }}>
        {LINE_ORDER.map(({ name, code }) => {
          const color = LINE_COLORS[name] ?? RAILWAY_COLOR;
          return (
            <div class="relative flex items-center" style={{ height: `${ROW_HEIGHT}px` }}>
              <img src={`/icons/lines/${code}.svg`} alt={name} class="h-3 w-3 shrink-0" />
              <div class="relative ml-1.5 flex-1 h-full">
                <div
                  class="absolute top-1/2 left-0 right-0 -translate-y-1/2"
                  style={{
                    height: "1px",
                    "background-color": color,
                    opacity: "0.3",
                  }}
                />
                {(trainsByLine().get(name) ?? []).map((train) => (
                  <div
                    class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      left: `${train.progress * 100}%`,
                      width: "5px",
                      height: "5px",
                      "background-color": RAILWAY_COLOR,
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
