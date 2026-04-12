import { Info } from "lucide-solid";

type Props = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export function AboutText() {
  return (
    <>
      <p class="mb-6">
        ひとつひとつの点は、実際の電車です。およそ三千の列車が、ウォーキングベース、ピアノ、サックス、ヴィブラフォン、ドラム
        ──
        小さなジャズの合奏を組み、1872年に新橋から最初の汽車が走り出してからずっと、一度も止まることなく演奏を続けています。ホームでは正確で、容赦なく、儀式のように整然としている。これは、その静寂の内側にある音楽です。
      </p>
      <p class="mb-6">
        ハーモニーはゆっくりとしたコーラスのように進みます。音は、列車が路線上のちょうどその場所にいるところに置かれます。ラッシュアワーにはバンドが長い音で満たされ、終電を過ぎると夜明けまで沈黙が広がります。いま鳴っているものは、これまで鳴ったことがなく、二度と鳴ることもありません。
      </p>
      <p class="mb-6">
        位置情報を共有すると、あなたの近くの電車の音が大きくなります。この曲はあなたの身体を中心に再構成されます。あなたが立っている場所の肖像画を、あなたが立っている街が演奏しているのを、聴いているのです。
      </p>
      <p class="text-xs text-gray-400 dark:text-gray-500">
        Inspired by{" "}
        <a
          href="https://www.trainjazz.com/"
          target="_blank"
          rel="noopener noreferrer"
          class="underline"
        >
          trainjazz.com
        </a>
      </p>
    </>
  );
}

export default function About(props: Props) {
  return (
    <>
      <button
        type="button"
        onClick={() => (props.open ? props.onClose() : props.onOpen())}
        class="fixed bottom-4 right-24 z-50 rounded-full p-1.5 transition-colors duration-700"
        classList={{
          "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400": !props.open,
          "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900": props.open,
        }}
        aria-label="About"
      >
        <Info size={16} />
      </button>

      <div
        role="button"
        tabIndex={0}
        class="fixed inset-0 z-40 flex justify-center pt-16 bg-white transition-[opacity,background-color] duration-700 ease-in-out dark:bg-gray-950"
        classList={{
          "opacity-100 pointer-events-auto": props.open,
          "opacity-0 pointer-events-none": !props.open,
        }}
        onClick={props.onClose}
        onKeyDown={(e) => e.key === "Escape" && props.onClose()}
      >
        <div
          role="presentation"
          class="px-6 max-w-lg text-sm leading-relaxed text-gray-700 transition-colors duration-700 dark:text-gray-300"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <AboutText />
        </div>
      </div>
    </>
  );
}
