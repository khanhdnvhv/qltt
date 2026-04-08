import { createContext, useContext, type ReactNode } from "react";
import { useReducedMotion } from "../utils/hooks";

const ReducedMotionContext = createContext<boolean>(false);

export function ReducedMotionProvider({ children }: { children: ReactNode }) {
  const prefersReduced = useReducedMotion();
  return (
    <ReducedMotionContext.Provider value={prefersReduced}>
      {children}
    </ReducedMotionContext.Provider>
  );
}

/**
 * Returns true when user prefers reduced motion.
 * Use to conditionally disable/simplify animations.
 */
export function useAppReducedMotion(): boolean {
  return useContext(ReducedMotionContext);
}

