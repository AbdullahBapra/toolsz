"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export default function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col divide-y divide-border">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={index}>
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between py-5 sm:py-6 text-left group cursor-pointer"
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${index}`}
            >
              <span
                id={`faq-q-${index}`}
                className="type-body font-semibold text-foreground pr-4 group-hover:text-primary transition-colors duration-150"
              >
                {item.question}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-foreground-muted flex-shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {/* CSS grid-rows accordion — no max-height, no JS measurement, no CLS */}
            <div
              id={`faq-answer-${index}`}
              role="region"
              aria-labelledby={`faq-q-${index}`}
              className="grid transition-[grid-template-rows] duration-200 ease-out"
              style={{
                gridTemplateRows: isOpen ? "1fr" : "0fr",
              }}
            >
              <div className="overflow-hidden">
                <p className="type-small text-foreground-secondary leading-relaxed pb-5 pr-8">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
