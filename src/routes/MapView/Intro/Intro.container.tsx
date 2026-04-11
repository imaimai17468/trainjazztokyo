import { createSignal } from "solid-js";
import Intro from "./Intro";

export default function IntroContainer() {
  const [open, setOpen] = createSignal(true);

  return <Intro open={open()} onClose={() => setOpen(false)} />;
}
