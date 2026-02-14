import { useState, useRef, useEffect } from "react";
import { Fireflies } from "@/components/Fireflies";
import { FlamesInput } from "@/components/FlamesInput";
import { FlamesAnimation } from "@/components/FlamesAnimation";
import { FlamesResultDisplay } from "@/components/FlamesResult";
import { BrandingBanner } from "@/components/BrandingBanner";
import { FeedbackSection } from "@/components/FeedbackSection";
import { calculateFlames, FlamesResult } from "@/lib/flames";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
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
     🎵 MUTE BUTTON STATE
  =========================== */
  const [isThemeMuted, setIsThemeMuted] = useState(false);

  /* ===========================
     🎵 MUSIC LOGIC
  =========================== */

  const themeAudioRef = useRef<HTMLAudioElement | null>(null);
  const requestAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Store theme position
  const themeCurrentTimeRef = useRef<number>(0);

  // ✅ Songs audio with Spotify-style features
  const songsAudioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSong, setCurrentSong] = useState<string | null>(null);
  const [isSongPlaying, setIsSongPlaying] = useState(false);
  
  // Store progress for each song separately
  const [songProgress, setSongProgress] = useState<Record<string, number>>({});
  const [songDuration, setSongDuration] = useState<Record<string, number>>({});
  const [songCurrentTime, setSongCurrentTime] = useState<Record<string, number>>({});
  
  // Store song position for each song separately
  const songPositions = useRef<Map<string, number>>(new Map());

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleThemeMute = () => {
    if (themeAudioRef.current) {
      const newMutedState = !isThemeMuted;
      themeAudioRef.current.muted = newMutedState;
      setIsThemeMuted(newMutedState);
      
      // If unmuting and conditions are right, play theme
      if (!newMutedState && !isSongPlaying && (gameState === "animating" || gameState === "result")) {
        themeAudioRef.current.currentTime = themeCurrentTimeRef.current;
        themeAudioRef.current.play().catch(() => {});
      }
      // If muting, save position and pause
      else if (newMutedState && themeAudioRef.current) {
        themeCurrentTimeRef.current = themeAudioRef.current.currentTime;
        themeAudioRef.current.pause();
      }
    }
  };

  const playSong = (src: string, title: string) => {
    // Save theme position before pausing
    if (themeAudioRef.current) {
      themeCurrentTimeRef.current = themeAudioRef.current.currentTime;
      themeAudioRef.current.pause();
    }

    // If clicking the same song that's playing -> pause it
    if (currentSong === title && songsAudioRef.current) {
      // Save position before pausing
      songPositions.current.set(title, songsAudioRef.current.currentTime);
      
      songsAudioRef.current.pause();
      setCurrentSong(null);
      setIsSongPlaying(false);
      
      // Resume theme from where it left off
      if (themeAudioRef.current && (gameState === "animating" || gameState === "result") && !isThemeMuted) {
        themeAudioRef.current.currentTime = themeCurrentTimeRef.current;
        themeAudioRef.current.play().catch(() => {});
      }
      return;
    }

    // Stop any other song that might be playing
    if (songsAudioRef.current) {
      // Save position of current song before switching
      if (currentSong) {
        songPositions.current.set(currentSong, songsAudioRef.current.currentTime);
      }
      
      // 🔥 CRITICAL FIX: detach old listeners to prevent ghost updates
      songsAudioRef.current.ontimeupdate = null;
      songsAudioRef.current.onloadedmetadata = null;
      songsAudioRef.current.onended = null;
      
      songsAudioRef.current.pause();
    }

    // Create and play new song
    const audio = new Audio(src);
    audio.preload = "metadata"; // Optional improvement
    
    // Get saved position for this song (if any)
    const savedPosition = songPositions.current.get(title) || 0;

    audio.onloadedmetadata = () => {
      setSongDuration(prev => ({ ...prev, [title]: audio.duration }));

      if (savedPosition > 0) {
        audio.currentTime = savedPosition;
      }
    };

    audio.ontimeupdate = () => {
      if (!audio.duration || isNaN(audio.duration)) return;

      const percent = (audio.currentTime / audio.duration) * 100;

      setSongProgress(prev => ({ ...prev, [title]: percent || 0 }));
      setSongCurrentTime(prev => ({ ...prev, [title]: audio.currentTime }));
      // Update saved position
      songPositions.current.set(title, audio.currentTime);
    };

    audio.onended = () => {
      // Clear saved position when song ends naturally
      songPositions.current.delete(title);
      setSongProgress(prev => ({ ...prev, [title]: 0 }));
      setSongCurrentTime(prev => ({ ...prev, [title]: 0 }));
      setCurrentSong(null);
      setIsSongPlaying(false);
      
      // Resume theme from where it left off when song ends
      if (themeAudioRef.current && (gameState === "animating" || gameState === "result") && !isThemeMuted) {
        themeAudioRef.current.currentTime = themeCurrentTimeRef.current;
        themeAudioRef.current.play().catch(() => {});
      }
    };

    audio.play().catch(() => {});
    songsAudioRef.current = audio;
    setCurrentSong(title);
    setIsSongPlaying(true);
  };

  // Initialize theme audio
  useEffect(() => {
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

    // Cleanup on unmount
    return () => {
      if (themeAudioRef.current) {
        themeAudioRef.current.pause();
      }
      if (requestAudioRef.current) {
        requestAudioRef.current.pause();
      }
      if (songsAudioRef.current) {
        songsAudioRef.current.pause();
      }
    };
  }, []);

  // 🔥 FIXED: Handle theme music based on game state (no restart on result)
  useEffect(() => {
    if (!themeAudioRef.current) return;

    // play only when animation starts
    if (gameState === "animating" && !isSongPlaying && !isThemeMuted) {
      themeAudioRef.current.currentTime = themeCurrentTimeRef.current;
      themeAudioRef.current.play().catch(() => {});
    }

    // pause when returning to input
    if (gameState === "input") {
      themeAudioRef.current.pause();
    }

  }, [gameState, isSongPlaying, isThemeMuted]);

  const handleCalculate = async (name1: string, name2: string) => {
    // Stop any playing song from the playlist
    if (songsAudioRef.current) {
      if (currentSong) {
        songPositions.current.set(currentSong, songsAudioRef.current.currentTime);
      }
      
      // 🔥 CRITICAL FIX: detach listeners when stopping songs during calculation
      songsAudioRef.current.ontimeupdate = null;
      songsAudioRef.current.onloadedmetadata = null;
      songsAudioRef.current.onended = null;
      
      songsAudioRef.current.pause();
      songsAudioRef.current = null;
      setCurrentSong(null);
      setIsSongPlaying(false);
    }

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
    
    // Theme will play via useEffect when gameState becomes "animating"
    setGameState("animating");
  };

  const handleAnimationComplete = () => {
    setGameState("result");
  };

  const handleReset = () => {
    // Stop all audio
    if (themeAudioRef.current) {
      themeAudioRef.current.pause();
      themeAudioRef.current.currentTime = 0;
      themeCurrentTimeRef.current = 0;
    }

    if (requestAudioRef.current) {
      requestAudioRef.current.pause();
      requestAudioRef.current.currentTime = 0;
    }

    if (songsAudioRef.current) {
      if (currentSong) {
        songPositions.current.set(currentSong, songsAudioRef.current.currentTime);
      }
      
      // 🔥 CRITICAL FIX: detach listeners on reset
      songsAudioRef.current.ontimeupdate = null;
      songsAudioRef.current.onloadedmetadata = null;
      songsAudioRef.current.onended = null;
      
      songsAudioRef.current.pause();
      songsAudioRef.current = null;
      setCurrentSong(null);
      setIsSongPlaying(false);
    }

    setResult(null);
    setRestricted(false);
    setGameState("input");
  };

  // Handle seeking on progress bar
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>, songTitle: string) => {
    if (currentSong !== songTitle || !songsAudioRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = x / width;
    const newTime = percentage * songsAudioRef.current.duration;
    
    songsAudioRef.current.currentTime = newTime;
    songPositions.current.set(songTitle, newTime);
    setSongProgress(prev => ({ ...prev, [songTitle]: percentage * 100 }));
    setSongCurrentTime(prev => ({ ...prev, [songTitle]: newTime }));
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
            <div className="mt-4 flex justify-center">
  <button
    onClick={toggleThemeMute}
    className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition"
    title={isThemeMuted ? "Unmute theme music" : "Mute theme music"}
  >
    {isThemeMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
    <span className="text-sm font-medium">
      {isThemeMuted ? "Unmute music" : "Mute music"}
    </span>
  </button>
</div>

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
      {/* OUR SONGS SECTION - 4 TRACKS with Spotify-style slider */}
      {/* =========================== */}
      <div className="mt-16 sm:mt-20 md:mt-24 px-4">
        <div className="max-w-3xl mx-auto glass-card rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-foreground">
            Our Songs 🎵
          </h2>

          {/* Song 1: Crush to Rush (Tamil) */}
          <div className="mb-6">
            <div className="flex items-center gap-4">
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
              </div>
            </div>
            
            {/* Progress Bar with Time Display - Spotify Style */}
            {isSongPlaying && currentSong === "Crush to Rush" && (
              <div className="mt-2 pl-16">
                <div 
                  className="w-full h-2 bg-muted rounded-full cursor-pointer relative group"
                  onClick={(e) => handleSeek(e, "Crush to Rush")}
                >
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all relative"
                    style={{ width: `${songProgress["Crush to Rush"] || 0}%` }}
                  >
                    {/* Hover handle */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                
                {/* Time display */}
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{formatTime(songCurrentTime["Crush to Rush"] || 0)}</span>
                  <span>{formatTime(songDuration["Crush to Rush"] || 0)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Song 2: Nuvve Naa Beat (Telugu) */}
          <div className="mb-6">
            <div className="flex items-center gap-4">
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
              </div>
            </div>
            
            {isSongPlaying && currentSong === "Nuvve Naa Beat" && (
              <div className="mt-2 pl-16">
                <div 
                  className="w-full h-2 bg-muted rounded-full cursor-pointer relative group"
                  onClick={(e) => handleSeek(e, "Nuvve Naa Beat")}
                >
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all relative"
                    style={{ width: `${songProgress["Nuvve Naa Beat"] || 0}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{formatTime(songCurrentTime["Nuvve Naa Beat"] || 0)}</span>
                  <span>{formatTime(songDuration["Nuvve Naa Beat"] || 0)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Song 3: Bleeding Fire (English) */}
          <div className="mb-6">
            <div className="flex items-center gap-4">
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
              </div>
            </div>
            
            {isSongPlaying && currentSong === "Bleeding Fire" && (
              <div className="mt-2 pl-16">
                <div 
                  className="w-full h-2 bg-muted rounded-full cursor-pointer relative group"
                  onClick={(e) => handleSeek(e, "Bleeding Fire")}
                >
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all relative"
                    style={{ width: `${songProgress["Bleeding Fire"] || 0}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{formatTime(songCurrentTime["Bleeding Fire"] || 0)}</span>
                  <span>{formatTime(songDuration["Bleeding Fire"] || 0)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Song 4: Na Lokam (Telugu) */}
          <div className="mb-6">
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
              </div>
            </div>
            
            {isSongPlaying && currentSong === "Na Lokam" && (
              <div className="mt-2 pl-16">
                <div 
                  className="w-full h-2 bg-muted rounded-full cursor-pointer relative group"
                  onClick={(e) => handleSeek(e, "Na Lokam")}
                >
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all relative"
                    style={{ width: `${songProgress["Na Lokam"] || 0}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{formatTime(songCurrentTime["Na Lokam"] || 0)}</span>
                  <span>{formatTime(songDuration["Na Lokam"] || 0)}</span>
                </div>
              </div>
            )}
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