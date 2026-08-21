"use client";

import { useState } from "react";
import {
  FileText,
  Shield,
  Zap,
} from "lucide-react";
import ToolHero from "@/app/components/ToolHero";

interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  readingTime: string;
  speakingTime: string;
  avgWordLength: number;
  avgSentenceLength: number;
}

function analyzeText(text: string): TextStats {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sentences = text.trim() ? (text.match(/[.!?]+/g) || []).length || (words > 0 ? 1 : 0) : 0;
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter((p) => p.trim()).length || 1 : 0;
  const readingMin = words / 225;
  const speakingMin = words / 150;
  const wordArr = text.trim() ? text.trim().split(/\s+/) : [];
  const avgWordLength = wordArr.length > 0
    ? wordArr.reduce((sum, w) => sum + w.replace(/[^a-zA-Z]/g, "").length, 0) / wordArr.length
    : 0;
  const avgSentenceLength = sentences > 0 ? words / sentences : 0;

  const formatTime = (mins: number) => {
    if (mins < 1) return `${Math.round(mins * 60)} sec`;
    if (mins < 60) return `${Math.round(mins)} min`;
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return `${h} hr ${m} min`;
  };

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    readingTime: formatTime(readingMin),
    speakingTime: formatTime(speakingMin),
    avgWordLength: Math.round(avgWordLength * 10) / 10,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
  };
}

function getKeywordDensity(text: string): { word: string; count: number; percent: number }[] {
  const words = text.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter((w) => w.length > 3);
  const total = words.length || 1;
  const map: Record<string, number> = {};
  words.forEach((w) => { map[w] = (map[w] || 0) + 1; });
  return Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word, count]) => ({ word, count, percent: Math.round((count / total) * 1000) / 10 }));
}

const SAMPLE = `The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet at least once.

Pangrams are commonly used in font design and typography to display the appearance of all letters. They are also useful for testing purposes, such as checking keyboard layouts or verifying that a font renders all characters correctly.

In the digital age, word counting tools serve writers, students, editors, and SEO professionals alike. Whether crafting a tweet within character limits, writing a college essay with strict word counts, or optimizing web content for search engines — knowing your text metrics matters.

Reading speed averages about 225 words per minute for adult readers, while speaking rate is roughly 150 words per minute. These baselines help estimate how long content will take to consume.`;

export default function WordCounterPage() {
  const [text, setText] = useState(SAMPLE);
  const stats = analyzeText(text);
  const keywords = getKeywordDensity(text);

  const statCards: { label: string; value: string | number; sublabel?: string }[] = [
    { label: "Characters", value: stats.characters, sublabel: `${stats.charactersNoSpaces} without spaces` },
    { label: "Words", value: stats.words },
    { label: "Sentences", value: stats.sentences },
    { label: "Paragraphs", value: stats.paragraphs },
    { label: "Reading Time", value: stats.readingTime, sublabel: "~225 wpm" },
    { label: "Speaking Time", value: stats.speakingTime, sublabel: "~150 wpm" },
    { label: "Avg Word Length", value: `${stats.avgWordLength} chars` },
    { label: "Avg Sentence", value: `${stats.avgSentenceLength} words` },
  ];

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={FileText}
          title="Word Counter"
          description="Count words, characters, and sentences — check reading time, keyword density, and SEO metrics. Free, instant, and completely private."
          backHref="/dev-tools"
          backLabel="Back to Developer Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8 space-y-5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here…"
            className="w-full h-48 rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
          />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statCards.map((s) => (
              <div key={s.label} className="p-3 rounded-lg bg-surface-1 border border-border text-center">
                <div className="text-lg font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-foreground-muted">{s.label}</div>
                {s.sublabel && <div className="text-xs text-foreground-muted opacity-60">{s.sublabel}</div>}
              </div>
            ))}
          </div>

          {/* Keyword Density */}
          {keywords.length > 0 && (
            <div className="pt-2 border-t border-border">
              <h4 className="text-xs font-semibold text-foreground mb-3">Top Keywords (4+ letters)</h4>
              <div className="space-y-1">
                {keywords.map((kw) => (
                  <div key={kw.word} className="flex items-center gap-3 p-1.5 rounded hover:bg-surface-1 transition-colors">
                    <span className="text-xs font-mono text-foreground flex-1">{kw.word}</span>
                    <span className="text-xs text-foreground-muted">{kw.count}×</span>
                    <div className="w-24 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${kw.percent * 5}%` }} />
                    </div>
                    <span className="text-xs text-foreground-muted w-12 text-right">{kw.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">8 Text Metrics</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Characters (with/without spaces), words, sentences, paragraphs, reading time, speaking time, and averages.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Keyword Density Analysis</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                See your top 10 keywords with frequency and density percentage. Perfect for SEO content optimization.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
