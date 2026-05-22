"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AppState = "landing" | "quiz" | "loading" | "result";

interface Question {
  id: number;
  question: string;
  options: string[];
}

interface NicheResult {
  nicheStatement: string;
  idealClient: string;
  conversationStarter: string;
}

// ─── Quiz Data ─────────────────────────────────────────────────────────────────

const QUESTIONS: Question[] = [
  {
    id: 1,
    question:
      "In your corporate career, what problems did people most reliably bring to you?",
    options: [
      "Broken processes, systems, or operations that needed untangling",
      "People dynamics — team conflicts, culture issues, or leadership struggles",
      "Big decisions that needed strategic thinking and a clear outside perspective",
      "Client or stakeholder relationships that were fraying or needed rebuilding",
      "Growth challenges — scaling the business, driving revenue, or entering new markets",
    ],
  },
  {
    id: 2,
    question:
      "In most projects or meetings, you naturally became the person who...",
    options: [
      "Diagnosed what was really wrong — not just the surface symptoms",
      "Built the system or framework that made everything run more smoothly",
      "Got the people in the room aligned and moving in the same direction",
      "Asked the uncomfortable questions nobody else would ask",
      "Translated high-level strategy into something teams could actually execute",
    ],
  },
  {
    id: 3,
    question: "The result your work most consistently delivered was...",
    options: [
      "Things ran faster, leaner, or with significantly less chaos",
      "The right people ended up in the right roles doing the right work",
      "A costly crisis was prevented or contained before it escalated",
      "Revenue grew, deals closed, or clients stayed and spent more",
      "Plans that actually got implemented — not just presented and filed away",
    ],
  },
  {
    id: 4,
    question: "If you could handpick your consulting clients, they would be...",
    options: [
      "Founders or CEOs who've outgrown their own ability to manage everything",
      "Growing companies that need corporate-level thinking without a full-time hire",
      "Leadership teams navigating a major transition, merger, or restructure",
      "Profitable businesses that are operationally messy or quietly plateauing",
      "Organizations where people problems are costing real money",
    ],
  },
  {
    id: 5,
    question:
      "When you imagine your consulting work, you're most energized by...",
    options: [
      "Diagnosing the real problem and handing over a recommendation they can act on immediately",
      "Building systems and processes they'll still be using long after you're gone",
      "Coaching a leader one-on-one through a hard season or pivotal decision",
      "Facilitating a team through a stuck point or a conversation they've been avoiding",
      "Being the strategic advisor in the room — the thinking partner, not the implementer",
    ],
  },
];

// ─── Root Component ─────────────────────────────────────────────────────────────

export default function NicheFinder() {
  const [appState, setAppState] = useState<AppState>("landing");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [result, setResult] = useState<NicheResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => {
    setAppState("quiz");
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedOption(null);
    setError(null);
  };

  const handleSelectOption = (option: string) => {
    setSelectedOption(option);
  };

  const handleNext = async () => {
    if (!selectedOption) return;

    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      setAppState("loading");
      try {
        const response = await fetch("/api/generate-niche", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: newAnswers }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || "Failed to generate niche");
        }

        const data: NicheResult = await response.json();
        setResult(data);
        setAppState("result");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
        );
        setAppState("quiz");
        setCurrentQuestion(QUESTIONS.length - 1);
        setSelectedOption(newAnswers[newAnswers.length - 1]);
        setAnswers(newAnswers.slice(0, -1));
      }
    }
  };

  const handleRestart = () => {
    setAppState("landing");
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedOption(null);
    setResult(null);
    setError(null);
  };

  return (
    <main className="min-h-screen">
      {appState === "landing" && <LandingView onStart={handleStart} />}
      {appState === "quiz" && (
        <QuizView
          question={QUESTIONS[currentQuestion]}
          questionNumber={currentQuestion + 1}
          totalQuestions={QUESTIONS.length}
          selectedOption={selectedOption}
          onSelectOption={handleSelectOption}
          onNext={handleNext}
          error={error}
        />
      )}
      {appState === "loading" && <LoadingView />}
      {appState === "result" && result && (
        <ResultView result={result} onRestart={handleRestart} />
      )}
    </main>
  );
}

// ─── Landing ───────────────────────────────────────────────────────────────────

function LandingView({ onStart }: { onStart: () => void }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-20"
      style={{ backgroundColor: "#1C3A6E" }}
    >
      <div className="max-w-xl w-full text-center">
        {/* Label */}
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-8"
          style={{ color: "#C9A84C" }}
        >
          Free Niche Finder
        </p>

        {/* Headline */}
        <h1 className="text-white text-4xl md:text-5xl font-bold leading-tight mb-5">
          You already have a niche.
          <br />
          You just can&apos;t see it yet.
        </h1>

        {/* Sub-headline */}
        <p className="text-lg md:text-xl leading-relaxed mb-10 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.72)" }}>
          Answer 5 questions about what you&apos;ve spent 20 years doing — and
          we&apos;ll name the consulting focus that&apos;s been hiding in plain
          sight.
        </p>

        {/* CTA */}
        <button
          onClick={onStart}
          className="text-white font-semibold text-lg px-10 py-4 rounded-lg transition-all duration-200 inline-flex items-center gap-2 hover:opacity-90 active:scale-95"
          style={{ backgroundColor: "#C9A84C" }}
        >
          Show Me My Niche
          <span>→</span>
        </button>

        {/* Trust line */}
        <p className="text-sm mt-6" style={{ color: "rgba(255,255,255,0.38)" }}>
          Takes 3 minutes · No email required
        </p>
      </div>
    </div>
  );
}

// ─── Quiz ──────────────────────────────────────────────────────────────────────

function QuizView({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  onSelectOption,
  onNext,
  error,
}: {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedOption: string | null;
  onSelectOption: (option: string) => void;
  onNext: () => void;
  error: string | null;
}) {
  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ backgroundColor: "#F8F6F1" }}
    >
      <div className="max-w-xl w-full">
        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex justify-between text-sm mb-2" style={{ color: "#9ca3af" }}>
            <span>Question {questionNumber} of {totalQuestions}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full rounded-full h-1.5" style={{ backgroundColor: "#e5e7eb" }}>
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: "#C9A84C" }}
            />
          </div>
        </div>

        {/* Question */}
        <h2
          className="text-2xl md:text-3xl font-bold leading-snug mb-8"
          style={{ color: "#1C3A6E" }}
        >
          {question.question}
        </h2>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {question.options.map((option) => {
            const isSelected = selectedOption === option;
            return (
              <button
                key={option}
                onClick={() => onSelectOption(option)}
                className="w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-150 text-base leading-snug"
                style={{
                  backgroundColor: "#ffffff",
                  borderColor: isSelected ? "#C9A84C" : "#e5e7eb",
                  color: isSelected ? "#1C3A6E" : "#374151",
                  fontWeight: isSelected ? 600 : 400,
                  boxShadow: isSelected
                    ? "0 2px 8px rgba(201,168,76,0.2)"
                    : "none",
                }}
              >
                <span
                  className="inline-block mr-2 text-sm"
                  style={{
                    color: "#C9A84C",
                    opacity: isSelected ? 1 : 0,
                    transition: "opacity 0.15s",
                  }}
                >
                  ✓
                </span>
                {option}
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        {/* Next */}
        <button
          onClick={onNext}
          disabled={!selectedOption}
          className="w-full text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all duration-200"
          style={{
            backgroundColor: selectedOption ? "#1C3A6E" : "#1C3A6E",
            opacity: selectedOption ? 1 : 0.35,
            cursor: selectedOption ? "pointer" : "not-allowed",
          }}
        >
          {questionNumber === totalQuestions
            ? "Find My Niche →"
            : "Next Question →"}
        </button>
      </div>
    </div>
  );
}

// ─── Loading ───────────────────────────────────────────────────────────────────

function LoadingView() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: "#1C3A6E" }}
    >
      <div className="text-center">
        {/* Spinner */}
        <div
          className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-6"
          style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }}
        />
        <p className="text-white text-xl font-semibold mb-2">
          Finding your niche...
        </p>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
          Analyzing 20 years of expertise
        </p>
      </div>
    </div>
  );
}

// ─── Result ────────────────────────────────────────────────────────────────────

function ResultView({
  result,
  onRestart,
}: {
  result: NicheResult;
  onRestart: () => void;
}) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start px-6 py-16"
      style={{ backgroundColor: "#F8F6F1" }}
    >
      <div className="max-w-xl w-full">
        {/* Label */}
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-6 text-center"
          style={{ color: "#C9A84C" }}
        >
          Your Consulting Niche
        </p>

        {/* Niche Statement */}
        <div
          className="rounded-2xl p-8 mb-5 text-center"
          style={{ backgroundColor: "#1C3A6E" }}
        >
          <p
            className="text-xs uppercase tracking-widest mb-3 font-medium"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Your Positioning
          </p>
          <h2 className="text-white text-2xl md:text-3xl font-bold leading-snug">
            {result.nicheStatement}
          </h2>
        </div>

        {/* Ideal Client */}
        <div
          className="rounded-2xl p-6 mb-4 border"
          style={{ backgroundColor: "#ffffff", borderColor: "#e5e7eb" }}
        >
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: "#C9A84C" }}
          >
            Your Ideal Client
          </p>
          <p className="text-base leading-relaxed" style={{ color: "#374151" }}>
            {result.idealClient}
          </p>
        </div>

        {/* Conversation Starter */}
        <div
          className="rounded-2xl p-6 mb-8 border"
          style={{ backgroundColor: "#ffffff", borderColor: "#e5e7eb" }}
        >
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: "#C9A84C" }}
          >
            Say This to Someone This Week
          </p>
          <p
            className="text-base font-medium leading-relaxed italic"
            style={{ color: "#1C3A6E" }}
          >
            &ldquo;{result.conversationStarter}&rdquo;
          </p>
        </div>

        {/* Expert Freedom CTA */}
        <div
          className="rounded-2xl p-8 text-center mb-6"
          style={{ backgroundColor: "#1C3A6E" }}
        >
          <h3 className="text-white text-xl font-bold mb-2">
            Ready to turn this into your first client?
          </h3>
          <p
            className="text-sm mb-6 leading-relaxed"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            Expert Freedom gives you the system to land your first $3–5K/month
            advisory client in 30 days — using the niche you just found.
          </p>
          <a
            href="https://expertfreedom.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white font-semibold px-8 py-4 rounded-xl inline-block transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: "#C9A84C" }}
          >
            Learn About Expert Freedom →
          </a>
        </div>

        {/* Restart */}
        <button
          onClick={onRestart}
          className="w-full py-3 text-sm transition-colors duration-150"
          style={{ color: "#9ca3af" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "#6b7280")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "#9ca3af")
          }
        >
          ← Start over
        </button>
      </div>
    </div>
  );
}
