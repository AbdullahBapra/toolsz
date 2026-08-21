"use client";

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

export default function StickyMobileCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past the hero (roughly 400px)
      setVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-30 md:hidden transition-transform duration-300 ease-out ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="bg-white/95 backdrop-blur-md border-t border-border px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <a
          href="#tools"
          className="btn btn-primary w-full text-base"
          onClick={() => setVisible(false)}
        >
          Explore 219 Free Tools
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
