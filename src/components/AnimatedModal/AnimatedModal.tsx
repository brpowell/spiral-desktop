import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode, RefObject } from "react";

const backdropMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.14 },
};

const panelMotion = {
  initial: { opacity: 0, scale: 0.98, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, y: 6 },
  transition: { duration: 0.16, ease: [0.16, 1, 0.3, 1] as const },
};

interface AnimatedModalProps {
  open: boolean;
  backdropClassName: string;
  panelClassName: string;
  panelRef?: RefObject<HTMLDivElement | null>;
  labelledBy?: string;
  onBackdropClick: () => void;
  children: ReactNode;
}

export function AnimatedModal({
  open,
  backdropClassName,
  panelClassName,
  panelRef,
  labelledBy,
  onBackdropClick,
  children,
}: AnimatedModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={backdropClassName}
          onClick={onBackdropClick}
          {...backdropMotion}
        >
          <motion.div
            ref={panelRef}
            className={panelClassName}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            onClick={(e) => e.stopPropagation()}
            {...panelMotion}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
