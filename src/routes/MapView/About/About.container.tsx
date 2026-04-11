import { createSignal } from "solid-js";
import About from "./About";

export default function AboutContainer() {
  const [open, setOpen] = createSignal(false);

  return <About open={open()} onOpen={() => setOpen(true)} onClose={() => setOpen(false)} />;
}
