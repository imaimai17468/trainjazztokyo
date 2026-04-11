import { createSignal } from "solid-js";
import About from "./About";

type Props = {
  onOpenChange?: (open: boolean) => void;
};

export default function AboutContainer(props: Props) {
  const [open, setOpen] = createSignal(false);

  const handleOpen = () => {
    setOpen(true);
    props.onOpenChange?.(true);
  };

  const handleClose = () => {
    setOpen(false);
    props.onOpenChange?.(false);
  };

  return <About open={open()} onOpen={handleOpen} onClose={handleClose} />;
}
