import { Info } from "lucide-solid";

type Props = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export default function About(props: Props) {
  return (
    <>
      <button
        type="button"
        onClick={() => (props.open ? props.onClose() : props.onOpen())}
        class="fixed bottom-4 right-24 z-50 rounded-full bg-gray-200 p-1.5 text-gray-500 transition-colors duration-700 dark:bg-gray-800 dark:text-gray-400"
        aria-label="About"
      >
        <Info size={16} />
      </button>

      <div
        class="fixed inset-0 z-40 flex justify-center bg-white transition-[opacity,background-color] duration-700 ease-in-out dark:bg-gray-950"
        classList={{
          "opacity-100 pointer-events-auto": props.open,
          "opacity-0 pointer-events-none": !props.open,
        }}
        onClick={props.onClose}
      >
        <div
          class="px-6 pt-16 max-w-lg text-sm leading-relaxed text-gray-700 transition-colors duration-700 dark:text-gray-300"
          onClick={(e) => e.stopPropagation()}
        >
          <p class="mb-6">
            ひとつひとつの点は、実際の電車です。およそ三千の列車が、ウォーキングベース、ピアノ、サックス、ヴィブラフォン、ドラム
            ──
            小さなジャズの合奏を組み、1872年に新橋から最初の汽車が走り出してからずっと、一度も止まることなく演奏を続けています。ホームでは正確で、容赦なく、儀式のように整然としている。これは、その静寂の内側にある音楽です。
          </p>
          <p class="mb-6">
            ハーモニーはゆっくりとしたコーラスのように進みます。音は、列車が路線上のちょうどその場所にいるところに置かれます。ラッシュアワーにはバンドが長い音で満たされ、終電を過ぎると夜明けまで沈黙が広がります。いま鳴っているものは、これまで鳴ったことがなく、二度と鳴ることもありません。
          </p>
          <p>
            位置情報を共有すると、あなたの近くの電車の音が大きくなります。この曲はあなたの身体を中心に再構成されます。あなたが立っている場所の肖像画を、あなたが立っている街が演奏しているのを、聴いているのです。
          </p>
        </div>
      </div>
    </>
  );
}
