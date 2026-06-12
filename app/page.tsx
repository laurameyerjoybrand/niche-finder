"use client";
import { useUtmParams } from "@/hooks/useUtmParams";
import { appendUtms } from "@/lib/appendUtms";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AppState = "landing" | "quiz" | "loading" | "result";

interface QuestionOption {
  value: string; // full text sent to Claude
  label: string; // bold short label for display
  sub: string;   // italic subtitle for display
}

interface Question {
  id: number;
  heading: string;       // uppercase part of the heading
  headingItalic: string; // italic part of the heading
  help: string;
  options: QuestionOption[];
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
    heading: "What did colleagues always",
    headingItalic: "bring to you?",
    help: "The problem you were known for solving before anyone even asked.",
    options: [
      {
        value: "Broken processes, systems, or operations that needed untangling",
        label: "Operations & process",
        sub: "Untangling broken systems",
      },
      {
        value: "People dynamics — team conflicts, culture issues, or leadership struggles",
        label: "People & culture",
        sub: "Conflicts, culture, leadership",
      },
      {
        value: "Big decisions that needed strategic thinking and a clear outside perspective",
        label: "Strategy & decisions",
        sub: "Clear thinking under pressure",
      },
      {
        value: "Client or stakeholder relationships that were fraying or needed rebuilding",
        label: "Relationships",
        sub: "Fraying ties, rebuilt trust",
      },
      {
        value: "Growth challenges — scaling the business, driving revenue, or entering new markets",
        label: "Growth & revenue",
        sub: "Scale, pipeline, new markets",
      },
    ],
  },
  {
    id: 2,
    heading: "In every room, you were",
    headingItalic: "the person who...",
    help: "The role you fell into without trying.",
    options: [
      {
        value: "Diagnosed what was really wrong — not just the surface symptoms",
        label: "The Diagnostician",
        sub: "Found the real problem",
      },
      {
        value: "Built the system or framework that made everything run more smoothly",
        label: "The Builder",
        sub: "Systems that actually stuck",
      },
      {
        value: "Got the people in the room aligned and moving in the same direction",
        label: "The Aligner",
        sub: "Moving teams forward together",
      },
      {
        value: "Asked the uncomfortable questions nobody else would ask",
        label: "The Truth-Teller",
        sub: "Questions others avoided",
      },
      {
        value: "Translated high-level strategy into something teams could actually execute",
        label: "The Translator",
        sub: "Strategy made actionable",
      },
    ],
  },
  {
    id: 3,
    heading: "Your work most reliably",
    headingItalic: "delivered...",
    help: "The outcome that followed you from job to job.",
    options: [
      {
        value: "Things ran faster, leaner, or with significantly less chaos",
        label: "Speed & efficiency",
        sub: "Less chaos, more output",
      },
      {
        value: "The right people ended up in the right roles doing the right work",
        label: "Right people, right seats",
        sub: "Talent in its place",
      },
      {
        value: "A costly crisis was prevented or contained before it escalated",
        label: "Crisis prevention",
        sub: "Stopped before it started",
      },
      {
        value: "Revenue grew, deals closed, or clients stayed and spent more",
        label: "Revenue & retention",
        sub: "Deals closed, clients stayed",
      },
      {
        value: "Plans that actually got implemented — not just presented and filed away",
        label: "Execution",
        sub: "Plans that actually happened",
      },
    ],
  },
  {
    id: 4,
    heading: "Your ideal consulting",
    headingItalic: "client looks like...",
    help: "The type of company that gets the most from working with you.",
    options: [
      {
        value: "Founders or CEOs who've outgrown their own ability to manage everything",
        label: "Overwhelmed founders",
        sub: "Outgrown their own capacity",
      },
      {
        value: "Growing companies that need corporate-level thinking without a full-time hire",
        label: "Growing companies",
        sub: "Corporate thinking, no FTE",
      },
      {
        value: "Leadership teams navigating a major transition, merger, or restructure",
        label: "Teams in transition",
        sub: "Mergers, pivots, restructures",
      },
      {
        value: "Profitable businesses that are operationally messy or quietly plateauing",
        label: "Messy mid-market",
        sub: "Profitable but stuck",
      },
      {
        value: "Organizations where people problems are costing real money",
        label: "People-cost problems",
        sub: "Culture issues eating margin",
      },
    ],
  },
  {
    id: 5,
    heading: "You're most energized",
    headingItalic: "working this way...",
    help: "The kind of engagement that leaves you feeling alive, not drained.",
    options: [
      {
        value: "Diagnosing the real problem and handing over a recommendation they can act on immediately",
        label: "Diagnosis & advice",
        sub: "Find it, fix it, move on",
      },
      {
        value: "Building systems and processes they'll still be using long after you're gone",
        label: "Building systems",
        sub: "Infrastructure that outlasts you",
      },
      {
        value: "Coaching a leader one-on-one through a hard season or pivotal decision",
        label: "1:1 leadership coaching",
        sub: "Hard seasons, big decisions",
      },
      {
        value: "Facilitating a team through a stuck point or a conversation they've been avoiding",
        label: "Team facilitation",
        sub: "Unstuck, together",
      },
      {
        value: "Being the strategic advisor in the room — the thinking partner, not the implementer",
        label: "Strategic advisor",
        sub: "The thinking partner",
      },
    ],
  },
];

// ─── Root Component ────────────────────────────────────────────────────────────

export default function NicheFinder() {
  const utms = useUtmParams();
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

  const handleSelectOption = (value: string) => {
    setSelectedOption(value);
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      const prev = currentQuestion - 1;
      setCurrentQuestion(prev);
      setSelectedOption(answers[prev] ?? null);
      setAnswers(answers.slice(0, prev));
    } else {
      setAppState("landing");
    }
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
          throw new Error((err as { error?: string }).error || "Failed to generate niche");
        }

        const data: NicheResult = await response.json();
        setResult(data);
        setAppState("result");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong. Please try again."
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
    <div className="ef-page">
      <header className="ef-top">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-plum.png" alt="Expert Freedom" style={{ height: 28, width: "auto" }} />
      </header>

      <main className="ef-stage" key={appState + currentQuestion}>
        {appState === "landing" && <LandingView onStart={handleStart} />}
        {appState === "quiz" && (
          <QuizView
            question={QUESTIONS[currentQuestion]}
            questionIndex={currentQuestion}
            totalQuestions={QUESTIONS.length}
            selectedOption={selectedOption}
            onSelectOption={handleSelectOption}
            onNext={handleNext}
            onBack={handleBack}
            error={error}
          />
        )}
        {appState === "loading" && <LoadingView />}
        {appState === "result" && result && (
  <ResultView result={result} answers={answers} onRestart={handleRestart} utms={utms} />
)}
      </main>

      <footer className="ef-foot">
        <div className="ef-foot-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-plum.png" alt="Expert Freedom" style={{ height: 22, width: "auto" }} />
          <nav className="ef-foot-links">
            <a href="https://joybrandcreative.com/privacy-policy">Privacy</a>
            <a href="https://joybrandcreative.com/terms">Terms</a>
            <a href="mailto:hello@joybrandcreative.com">Contact</a>
          </nav>
        </div>
        <div className="ef-foot-disclaimer">
          <strong style={{ color: "var(--plum)" }}>IMPORTANT — Earnings Disclaimer.</strong>{" "}
          All testimonials are from real clients; results are not typical. Your results depend on
          your skills, experience, motivation, and other factors. Joybrand Creative is a marketing
          education company. We do not sell a business opportunity or &ldquo;get rich quick&rdquo;
          system. We make no earnings claims. &copy; 2026 Joybrand Creative.
        </div>
      </footer>
    </div>
  );
}

// ─── Landing ───────────────────────────────────────────────────────────────────

function LandingView({ onStart }: { onStart: () => void }) {
  return (
    <div className="ef-stage-inner">
      <div className="ef-eyebrow">Free Niche Finder</div>
      <h1 className="ef-hero-h1">
        <span className="row">You&apos;ve been waiting</span>
        <span className="emph">to know your niche.</span>
      </h1>
      <p className="ef-hook">That wait is costing you clients.</p>
      <p className="ef-body-copy">
        Answer <strong>5 questions</strong>{" "}about what you&apos;ve spent 20 years doing — and we&apos;ll name the consulting focus that&apos;s been hiding in plain sight.
      </p>
      <div className="ef-cta-wrap">
        <button className="ef-btn ef-btn-primary ef-btn-arrow" onClick={onStart}>
          Find My Niche Now
        </button>
      </div>
      <div className="ef-stat-row">
        <div className="ef-stat">
          <div className="n">5</div>
          <div className="l">Questions</div>
        </div>
        <div className="ef-stat">
          <div className="n">
            3<span className="unit">min</span>
          </div>
          <div className="l">To complete</div>
        </div>
        <div className="ef-stat">
          <div className="n">∞</div>
          <div className="l">Clarity</div>
        </div>
      </div>
    </div>
  );
}

// ─── Quiz ──────────────────────────────────────────────────────────────────────

function QuizView({
  question,
  questionIndex,
  totalQuestions,
  selectedOption,
  onSelectOption,
  onNext,
  onBack,
  error,
}: {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  selectedOption: string | null;
  onSelectOption: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  error: string | null;
}) {
  const isLast = questionIndex === totalQuestions - 1;

  return (
    <div className="ef-stage-inner">
      <div className="ef-quiz-card">
        {/* Progress */}
        <div className="ef-progress">
          <div className="bars">
            {Array.from({ length: totalQuestions }).map((_, i) => (
              <div
                key={i}
                className={`ef-bar${i < questionIndex ? " done" : i === questionIndex ? " current" : ""}`}
              />
            ))}
          </div>
          <div className="ef-step-label">
            {String(questionIndex + 1).padStart(2, "0")} /{" "}
            {String(totalQuestions).padStart(2, "0")}
          </div>
        </div>

        {/* Question */}
        <span className="ef-q-num">Question {questionIndex + 1}</span>
        <h2 className="ef-q-title">
          {question.heading} <em>{question.headingItalic}</em>
        </h2>
        <p className="ef-q-help">{question.help}</p>

        {/* Options */}
        <div className="ef-options">
          {question.options.map((opt) => {
            const isSelected = selectedOption === opt.value;
            return (
              <button
                key={opt.value}
                className={`ef-option${isSelected ? " selected" : ""}`}
                onClick={() => onSelectOption(opt.value)}
                type="button"
              >
                <span className="ef-dot" />
                <span className="ef-lbl">
                  <b>{opt.label}</b>
                  <span>{opt.sub}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && <p className="ef-error">{error}</p>}

        {/* Nav */}
        <div className="ef-quiz-nav">
          <button className="ef-btn ef-btn-ghost" onClick={onBack} type="button">
            ← Back
          </button>
          <div className="right">
            <button
              className={`ef-btn ef-btn-primary ef-btn-arrow${!selectedOption ? " ef-btn-disabled" : ""}`}
              onClick={onNext}
              type="button"
              aria-disabled={!selectedOption}
            >
              {isLast ? "See My Niche" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Loading ───────────────────────────────────────────────────────────────────

function LoadingView() {
  return (
    <div className="ef-stage-inner">
      <div className="ef-loading">
        <div className="ef-spinner" />
        <h2 className="ef-loading-title">Finding your niche</h2>
        <p className="ef-loading-sub">Analyzing 20 years of expertise&hellip;</p>
      </div>
    </div>
  );
}

// ─── Result ────────────────────────────────────────────────────────────────────

// Short axis label for each quiz dimension
const RADAR_AXIS_LABELS = ["Problem", "Archetype", "Outcome", "Client", "Style"] as const;

// Pre-assigned radial values (0–1) per option per question.
// Higher = more differentiated/distinctive on that axis.
const RADAR_AXIS_VALUES: readonly (readonly number[])[] = [
  [0.60, 0.75, 0.85, 0.65, 0.90], // Q0: problem area
  [0.90, 0.70, 0.75, 0.85, 0.80], // Q1: archetype
  [0.70, 0.80, 0.65, 0.95, 0.85], // Q2: outcome
  [0.85, 0.70, 0.75, 0.90, 0.80], // Q3: client type
  [0.80, 0.70, 0.90, 0.75, 0.95], // Q4: work style
] as const;

function NicheProfileVisual({ answers }: { answers: string[] }) {
  const N = 5;
  const W = 440, H = 385;
  const cx = 220, cy = 200;
  const maxR = 120;
  const LEVELS = 4;
  const LABEL_R = maxR + 36;

  // Angle for axis i, starting at top (–90°) going clockwise
  const ang = (i: number) => (i / N) * 2 * Math.PI - Math.PI / 2;

  const ptAt = (i: number, r: number) => ({
    x: cx + r * Math.cos(ang(i)),
    y: cy + r * Math.sin(ang(i)),
  });

  const ptsStr = (pts: { x: number; y: number }[]) =>
    pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");

  // Which option was selected per question (index 0–4)
  const optionIndices = answers.map((answer, qi) =>
    QUESTIONS[qi].options.findIndex((o) => o.value === answer)
  );

  // Radial value for each axis based on selection
  const axisVals = optionIndices.map((idx, qi) =>
    idx >= 0 && idx < RADAR_AXIS_VALUES[qi].length
      ? RADAR_AXIS_VALUES[qi][idx]
      : 0.6
  );

  const ringAt = (t: number) =>
    ptsStr(Array.from({ length: N }, (_, i) => ptAt(i, t * maxR)));

  const userShape = ptsStr(axisVals.map((v, i) => ptAt(i, v * maxR)));

  return (
    <div className="ef-profile-visual">
      <div className="ef-profile-eyebrow">Your Niche Positioning</div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", maxWidth: W, display: "block", margin: "0 auto" }}
        aria-hidden="true"
      >
        {/* Grid rings */}
        {Array.from({ length: LEVELS }, (_, li) => (
          <polygon
            key={`ring-${li}`}
            points={ringAt((li + 1) / LEVELS)}
            fill="none"
            stroke="rgba(54,31,54,0.09)"
            strokeWidth={li === LEVELS - 1 ? 1.5 : 1}
          />
        ))}

        {/* Axis spokes */}
        {Array.from({ length: N }, (_, i) => {
          const tip = ptAt(i, maxR);
          return (
            <line
              key={`ax-${i}`}
              x1={cx} y1={cy}
              x2={tip.x.toFixed(2)} y2={tip.y.toFixed(2)}
              stroke="rgba(54,31,54,0.09)"
              strokeWidth={1}
            />
          );
        })}

        {/* User's authority polygon */}
        <polygon
          points={userShape}
          fill="rgba(184,153,104,0.18)"
          stroke="#B89968"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Champagne dot at each axis's selected point */}
        {axisVals.map((v, i) => {
          const p = ptAt(i, v * maxR);
          return (
            <circle
              key={`dot-${i}`}
              cx={p.x.toFixed(2)}
              cy={p.y.toFixed(2)}
              r={5}
              fill="#B89968"
            />
          );
        })}

        {/* Center mark */}
        <circle cx={cx} cy={cy} r={3} fill="rgba(54,31,54,0.14)" />

        {/* Axis labels */}
        {Array.from({ length: N }, (_, i) => {
          const lp = ptAt(i, LABEL_R);
          const xOff = lp.x - cx;
          const anchor =
            Math.abs(xOff) < 14 ? "middle" : xOff < 0 ? "end" : "start";
          return (
            <text
              key={`lbl-${i}`}
              x={lp.x.toFixed(2)}
              y={lp.y.toFixed(2)}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontFamily="Montserrat, sans-serif"
              fontSize={8}
              fontWeight={700}
              letterSpacing={1.8}
              fill="rgba(54,31,54,0.42)"
            >
              {RADAR_AXIS_LABELS[i].toUpperCase()}
            </text>
          );
        })}
      </svg>

      {/* Legend: dimension → selected value */}
      <div className="ef-radar-legend">
        {optionIndices.map((idx, qi) => (
          <div key={qi} className="ef-legend-item">
            <span className="ef-legend-axis">{RADAR_AXIS_LABELS[qi]}</span>
            <span className="ef-legend-val">
              {idx >= 0 ? QUESTIONS[qi].options[idx].label : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultView({
  result,
  answers,
  onRestart,
  utms,
}: {
  result: NicheResult;
  answers: string[];
  onRestart: () => void;
  utms: UtmParams;
}) {
  const handleCta = () => {
    const url = appendUtms("https://go.getexpertfreedom.com/apply");
    window.open(url, "_blank");
  };
  return (
    <div className="ef-stage-inner">
      <div className="ef-results">
        <div className="ef-res-eyebrow">Your Consulting Niche</div>
        <h1 className="ef-res-h1">
          Here&apos;s your <em>direction.</em>
        </h1>
        <p className="ef-res-pitch">
          Built from what you already know — not invented from scratch.
        </p>

        <NicheProfileVisual answers={answers} />

        <div className="ef-res-card">
          <span className="ef-card-label">Your Positioning</span>
          <div className="ef-blockquote">{result.nicheStatement}</div>

          <h4>Your Ideal Client</h4>
          <p className="ef-client-text">{result.idealClient}</p>

          <h4>Say This to Someone This Week</h4>
          <div className="ef-blockquote">
            &ldquo;{result.conversationStarter}&rdquo;
          </div>

          <h4>Your Next 3 Moves</h4>
          <ol className="ef-steps">
            <li>
              <span className="ef-step-num">1</span>
              <span>
                <b>Refine the language.</b> Read your positioning out loud. Replace anything that
                doesn&apos;t sound like you.
              </span>
            </li>
            <li>
              <span className="ef-step-num">2</span>
              <span>
                <b>List your &ldquo;Warm 50.&rdquo;</b> Past colleagues, clients, and contacts who
                already trust you in this space.
              </span>
            </li>
            <li>
              <span className="ef-step-num">3</span>
              <span>
                <b>Book one conversation this week.</b> Not a pitch — a question. Test this niche
                on a real human.
              </span>
            </li>
          </ol>
        </div>

        <div className="ef-res-cta">
          <div className="row">
            <button
      onClick={handleCta}
      className="ef-btn ef-btn-primary ef-btn-arrow"
    >
      Turn This Into Your First Client
    </button>
            <button className="ef-btn ef-btn-ghost" onClick={onRestart} type="button">
              Try a different angle
            </button>
          </div>
          <p className="micro">
            Copy your positioning somewhere safe — you&apos;ll come back to it as your practice
            grows.
          </p>
        </div>
      </div>
    </div>
  );
}
