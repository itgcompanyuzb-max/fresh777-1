import React, { useRef, useState } from "react";

export default function ScrollHandle() {
  const startY = useRef<number | null>(null);
  const moved = useRef(false);
  const [pressed, setPressed] = useState(false);

  const threshold = 40; // px to trigger

  const onClick = () => {
    // toggle: if near top, scroll to bottom; else scroll to top
    const pos = window.scrollY || window.pageYOffset;
    const middle = document.body.scrollHeight / 2;
    if (pos < middle) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    moved.current = false;
    setPressed(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current == null) return;
    const delta = e.touches[0].clientY - startY.current;
    if (Math.abs(delta) > threshold) {
      moved.current = true;
      if (delta > 0) {
        // dragged down -> scroll down
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      } else {
        // dragged up -> scroll up
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      startY.current = null;
      setPressed(false);
    }
  };

  const onTouchEnd = () => {
    setPressed(false);
    if (!moved.current) {
      onClick();
    }
    startY.current = null;
    moved.current = false;
  };

  return (
    <div
      role="button"
      aria-label="Scroll handle"
      onClick={onClick}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className={`fixed right-3 top-1/2 z-50 flex items-center justify-center select-none transition-transform ${pressed ? "scale-95" : "scale-100"}`}
      style={{ transform: "translateY(-50%)" }}
    >
      <div className="w-11 h-28 rounded-full bg-white/80 dark:bg-black/70 shadow-md flex flex-col items-center justify-center gap-1 p-1">
        <div className="w-0.5 h-6 bg-muted-foreground/60 rounded" />
        <div className="w-0.5 h-6 bg-muted-foreground/60 rounded rotate-180" />
      </div>
    </div>
  );
}
