import { useState } from "react";
import About from "./About";

type Props = {
  onOpenChange?: (open: boolean) => void;
};

export default function AboutContainer({ onOpenChange }: Props) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    onOpenChange?.(true);
  };

  const handleClose = () => {
    setOpen(false);
    onOpenChange?.(false);
  };

  return <About open={open} onOpen={handleOpen} onClose={handleClose} />;
}
