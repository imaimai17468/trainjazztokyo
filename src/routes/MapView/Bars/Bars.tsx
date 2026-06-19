import { useMemo } from "react";
import type { TrainPosition } from "../entity/train";

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
  visible: boolean;
  scanProgress: number;
  positions: TrainPosition[];
};

export default function Bars({ visible, scanProgress, positions }: Props) {
  const totalH = LINE_ORDER.length * ROW_HEIGHT;

  const countByLine = useMemo(
    () =>
      positions.reduce(
        (acc, p) => acc.set(p.line, (acc.get(p.line) ?? 0) + 1),
        new Map<string, number>(),
      ),
    [positions],
  );

  return (
    <div
      className={`fixed inset-0 z-35 flex items-center transition-opacity duration-300 ${
        visible ? "opacity-100 pointer-events-none" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className="relative flex flex-col"
        style={{
          height: `${totalH}px`,
          marginTop: "auto",
          marginBottom: "auto",
          paddingLeft: "3vw",
          paddingRight: "3vw",
          width: "100%",
        }}
      >
        {LINE_ORDER.map(({ code, name }) => (
          <div
            key={code}
            className="flex items-center justify-between"
            style={{ height: `${ROW_HEIGHT}px` }}
          >
            <img src={`/icons/lines/${code}.svg`} alt={name} className="h-3 w-3" />
            <span className="text-gray-500 dark:text-gray-600" style={{ fontSize: "8px" }}>
              {countByLine.get(name) ?? 0}
            </span>
          </div>
        ))}
        {visible && (
          <div
            className="absolute top-0 pointer-events-none"
            style={{
              left: `${6 + scanProgress * 88}vw`,
              height: `${totalH}px`,
              width: "1px",
              backgroundColor: "rgba(128, 128, 128, 0.4)",
            }}
          />
        )}
      </div>
    </div>
  );
}

export { LINE_ORDER, ROW_HEIGHT };
