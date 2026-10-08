import { useEffect, useRef } from "react";

export default function SmoothReveal({ children, revealKey }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      containerRef.current?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [revealKey]);

  return <div ref={containerRef} className="form-reveal">{children}</div>;
}
