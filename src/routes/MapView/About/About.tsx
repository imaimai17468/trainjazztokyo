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
            Every dot is a real train. Over three thousand of them, give or take, form a small jazz
            combo — walking bass, piano, sax, vibes, brushes — that has been playing without pause
            since the first Ginza Line train ran in 1927. On the platforms they are precise,
            relentless, full of ceremony. This is the music inside the silence.
          </p>
          <p class="mb-6">
            The harmony moves through a slow chorus. A note is placed precisely where the train
            happens to be along its route. Rush hour fills the band with held tones; past the last
            train the silences stretch until dawn. Whatever is playing now has not played before and
            will not play again.
          </p>
          <p>
            Share your location and the trains nearest you grow louder. The piece rearranges itself
            around your body. You are listening to a portrait of where you stand, played by the city
            you are standing in.
          </p>
        </div>
      </div>
    </>
  );
}
