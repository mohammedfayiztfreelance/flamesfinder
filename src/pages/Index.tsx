import { useState, useRef } from "react";
import { Fireflies } from "@/components/Fireflies";
import { FlamesInput } from "@/components/FlamesInput";
import { FlamesAnimation } from "@/components/FlamesAnimation";
import { FlamesResultDisplay } from "@/components/FlamesResult";
import { BrandingBanner } from "@/components/BrandingBanner";
import { FeedbackSection } from "@/components/FeedbackSection";
import { calculateFlames, FlamesResult } from "@/lib/flames";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";

type GameState = "input" | "animating" | "result";

/* ===========================
   🔒 RESTRICTED PAIR LOGIC
=========================== */

const normalize = (name: string) =>
  name.toLowerCase().replace(/\s+/g, "").trim();

const masterNames = ["mohammedfayizt", "mohammedfayiz", "fayiz"];
const partnerNames = ["fathimafarhanakp", "fathimafarhana", "farhana", "fafa"];

const isRestrictedPair = (name1: string, name2: string) => {
  const n1 = normalize(name1);
  const n2 = normalize(name2);

  const direct =
    masterNames.includes(n1) && partnerNames.includes(n2);

  const reverse =
    masterNames.includes(n2) && partnerNames.includes(n1);

  return direct || reverse;
};

/* ===========================
   COMPONENT
=========================== */

const Index = () => {
  const [gameState, setGameState] = useState<GameState>("input");
  const [result, setResult] = useState<FlamesResult | null>(null);
  const [restricted, setRestricted] = useState(false);

  /* ===========================
     🎵 MUSIC LOGIC
  =========================== */

  const themeAudioRef = useRef<HTMLAudioElement | null>(null);
  const requestAudioRef = useRef<HTMLAudioElement | null>(null);

  if (!themeAudioRef.current) {
    themeAudioRef.current = new Audio("/theme.mp3");
    themeAudioRef.current.loop = true;
    themeAudioRef.current.volume = 0.6;
  }

  if (!requestAudioRef.current) {
    requestAudioRef.current = new Audio("/restricted.mp3");
    requestAudioRef.current.loop = false;
    requestAudioRef.current.volume = 0.7;
  }

  const handleCalculate = async (name1: string, name2: string) => {
    const flamesResult = calculateFlames(name1, name2);

    // Save to database (unchanged)
    supabase
      .from("flames_calculations")
      .insert({
        name1: flamesResult.name1,
        name2: flamesResult.name2,
        letter_count: flamesResult.letterCount,
        result: flamesResult.result,
      })
      .then(({ error }) => {
        if (error) console.error("Failed to save calculation:", error);
      });

    // 🔒 Restriction check (only pairs, not single names)
    if (isRestrictedPair(name1, name2)) {
      setRestricted(true);

      // 🎵 Play restricted audio
      requestAudioRef.current?.play().catch(() => {});

      setGameState("result");
      return;
    }

    setResult(flamesResult);

    // 🎵 Play normal theme
    themeAudioRef.current?.play().catch(() => {});

    setGameState("animating");
  };

  const handleAnimationComplete = () => {
    setGameState("result");
  };

  const handleReset = () => {
    // 🎵 Stop both audios safely
    if (themeAudioRef.current) {
      themeAudioRef.current.pause();
      themeAudioRef.current.currentTime = 0;
    }

    if (requestAudioRef.current) {
      requestAudioRef.current.pause();
      requestAudioRef.current.currentTime = 0;
    }

    setResult(null);
    setRestricted(false);
    setGameState("input");
  };
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">

      <Fireflies />
      <AppHeader />

<div className="flex-1 relative z-10">
      {/* Gradient overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, hsl(142 76% 50% / 0.08) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 container mx-auto px-3 sm:px-4 py-6 sm:py-12 md:py-20">
        {/* Hero Section */}
        <div
          className="text-center mb-6 sm:mb-8 md:mb-12 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0s", animationFillMode: "forwards" }}
        >
          <BrandingBanner />
          <p className="text-sm sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mt-2 sm:mt-4 px-2">
            A playful way to explore your connection. Type two names and watch
            the firefly guide you to the result.
          </p>
        </div>

        {/* Game Area */}
        <div className="max-w-4xl mx-auto px-1 sm:px-0">
          {gameState === "input" && (
            <FlamesInput onCalculate={handleCalculate} isCalculating={false} />
          )}

          {gameState === "animating" && result && (
            <FlamesAnimation
              result={result}
              onComplete={handleAnimationComplete}
            />
          )}

          {gameState === "result" && (
            <>
              {restricted ? (
                <div className="glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-xl mx-auto text-center animate-reveal">
                  <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">
                    Sorry buddy… I can’t continue with this one ☺️
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    My master still carries her in his heart.
                    <br />
                    Some flames don’t fade… even if they burn alone.
                  </p>

                  <Button
                    onClick={handleReset}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Check another match
                  </Button>
                </div>
              ) : (
                result && (
                  <>
                    <FlamesResultDisplay result={result} onReset={handleReset} />
                    <FeedbackSection />
                  </>
                )
              )}
            </>
          )}
        </div>

        {/* FLAMES Legend */}
        {gameState === "input" && (
          <div
            className="mt-8 sm:mt-12 md:mt-16 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
          >
            <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-2xl mx-auto">
              <h3 className="text-center text-sm sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
                What does FLAMES stand for?
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-xl">👫</span>
                  <span>
                    <strong className="text-primary">F</strong> - Friends
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-xl">❤️</span>
                  <span>
                    <strong className="text-primary">L</strong> - Love
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-xl">💕</span>
                  <span>
                    <strong className="text-primary">A</strong> - Affection
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-xl">💍</span>
                  <span>
                    <strong className="text-primary">M</strong> - Marriage
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-xl">⚔️</span>
                  <span>
                    <strong className="text-primary">E</strong> - Enemy
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-xl">👨‍👩‍👧‍👦</span>
                  <span>
                    <strong className="text-primary">S</strong> - Siblings
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
      <AppFooter />

    </div>
  );
};

export default Index;
