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

  // ✅ Songs audio with Spotify-style features
  const songsAudioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSong, setCurrentSong] = useState<string | null>(null);
  const [isSongPlaying, setIsSongPlaying] = useState(false);
  const [songProgress, setSongProgress] = useState(0);

  const playSong = (src: string, title: string) => {
    if (themeAudioRef.current) {
      themeAudioRef.current.pause();
    }

    if (currentSong === title && songsAudioRef.current) {
      songsAudioRef.current.pause();
      songsAudioRef.current = null;
      setCurrentSong(null);
      setIsSongPlaying(false);
      setSongProgress(0);
      return;
    }

    if (songsAudioRef.current) {
      songsAudioRef.current.pause();
    }

    const audio = new Audio(src);

    audio.ontimeupdate = () => {
      const percent =
        (audio.currentTime / audio.duration) * 100;
      setSongProgress(percent || 0);
    };

    audio.onended = () => {
      setIsSongPlaying(false);
      setCurrentSong(null);
      setSongProgress(0);
    };

    audio.play().catch(() => {});
    songsAudioRef.current = audio;
    setCurrentSong(title);
    setIsSongPlaying(true);
  };

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

    if (isRestrictedPair(name1, name2)) {
      setRestricted(true);
      requestAudioRef.current?.play().catch(() => {});
      setGameState("result");
      return;
    }

    setResult(flamesResult);
    themeAudioRef.current?.play().catch(() => {});
    setGameState("animating");
  };

  const handleAnimationComplete = () => {
    setGameState("result");
  };

  const handleReset = () => {
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

        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, hsl(142 76% 50% / 0.08) 0%, transparent 50%)",
          }}
        />

        <div className="relative z-10 container mx-auto px-3 sm:px-4 py-6 sm:py-12 md:py-20">

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

      {/* =========================== */}
      {/* OUR SONGS SECTION - 4 TRACKS */}
      {/* =========================== */}
      <div className="mt-16 sm:mt-20 md:mt-24 px-4">
        <div className="max-w-3xl mx-auto glass-card rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-foreground">
            Our Songs 🎵
          </h2>

          {/* Song 1: Crush to Rush (Tamil) */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => playSong("/song1.mp3", "Crush to Rush")}
              className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-black font-bold hover:scale-105 transition shrink-0"
            >
              {isSongPlaying && currentSong === "Crush to Rush" ? "❚❚" : "▶"}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold truncate transition-colors ${
                isSongPlaying && currentSong === "Crush to Rush" ? "text-green-500" : "text-foreground"
              }`}>
                Crush to Rush
              </p>
              <p className="text-xs text-muted-foreground">
                Artist: Fzee • Language: Tamil
              </p>
              {isSongPlaying && currentSong === "Crush to Rush" && (
                <div className="w-full h-1 bg-muted rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-green-500 transition-all duration-100" style={{ width: `${songProgress}%` }} />
                </div>
              )}
            </div>
          </div>

          {/* Song 2: Nuvve Naa Beat (Telugu) */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => playSong("/song2.mp3", "Nuvve Naa Beat")}
              className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-black font-bold hover:scale-105 transition shrink-0"
            >
              {isSongPlaying && currentSong === "Nuvve Naa Beat" ? "❚❚" : "▶"}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold truncate transition-colors ${
                isSongPlaying && currentSong === "Nuvve Naa Beat" ? "text-green-500" : "text-foreground"
              }`}>
                Nuvve Naa Beat
              </p>
              <p className="text-xs text-muted-foreground">
                Artist: Fzee • Language: Telugu
              </p>
              {isSongPlaying && currentSong === "Nuvve Naa Beat" && (
                <div className="w-full h-1 bg-muted rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-green-500 transition-all duration-100" style={{ width: `${songProgress}%` }} />
                </div>
              )}
            </div>
          </div>

          {/* Song 3: Bleeding Fire (English) */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => playSong("/song3.mp3", "Bleeding Fire")}
              className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-black font-bold hover:scale-105 transition shrink-0"
            >
              {isSongPlaying && currentSong === "Bleeding Fire" ? "❚❚" : "▶"}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold truncate transition-colors ${
                isSongPlaying && currentSong === "Bleeding Fire" ? "text-green-500" : "text-foreground"
              }`}>
                Bleeding Fire
              </p>
              <p className="text-xs text-muted-foreground">
                Artist: Fzee • Language: English
              </p>
              {isSongPlaying && currentSong === "Bleeding Fire" && (
                <div className="w-full h-1 bg-muted rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-green-500 transition-all duration-100" style={{ width: `${songProgress}%` }} />
                </div>
              )}
            </div>
          </div>

          {/* Song 4: Na Lokam (Telugu) */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => playSong("/song4.mp3", "Na Lokam")}
              className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-black font-bold hover:scale-105 transition shrink-0"
            >
              {isSongPlaying && currentSong === "Na Lokam" ? "❚❚" : "▶"}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold truncate transition-colors ${
                isSongPlaying && currentSong === "Na Lokam" ? "text-green-500" : "text-foreground"
              }`}>
                Na Lokam
              </p>
              <p className="text-xs text-muted-foreground">
                Artist: Fzee • Language: Telugu
              </p>
              {isSongPlaying && currentSong === "Na Lokam" && (
                <div className="w-full h-1 bg-muted rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-green-500 transition-all duration-100" style={{ width: `${songProgress}%` }} />
                </div>
              )}
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-center text-xs text-muted-foreground mt-6 italic border-t border-border/50 pt-4">
            ✨ Each song tells a story • All originals by Fzee
          </p>
        </div>
      </div>

      <AppFooter />
    </div>
  );
};

export default Index;