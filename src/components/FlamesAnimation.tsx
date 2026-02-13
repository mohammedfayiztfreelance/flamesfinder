import { useState, useEffect } from "react";
import { FlamesResult, FLAMES_MEANINGS, FlamesLetter } from "@/lib/flames";

interface FlamesAnimationProps {
  result: FlamesResult;
  onComplete: () => void;
}

export const FlamesAnimation = ({ result, onComplete }: FlamesAnimationProps) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [counting, setCounting] = useState(false);
  const [countIndex, setCountIndex] = useState(0);
  const [eliminated, setEliminated] = useState<FlamesLetter[]>([]);

  const allLetters: FlamesLetter[] = ["F", "L", "A", "M", "E", "S"];
  const activeLetters = allLetters.filter((l) => !eliminated.includes(l));

  useEffect(() => {
    if (currentRound >= result.eliminationRounds.length) {
      setTimeout(onComplete, 500);
      return;
    }

    // Start counting animation
    setCounting(true);
    let count = 0;
    const targetCount = result.letterCount;
    let currentPos = 0;

    const countInterval = setInterval(() => {
      count++;
      currentPos = (count - 1) % activeLetters.length;
      setCountIndex(currentPos);

      if (count >= targetCount) {
        clearInterval(countInterval);
        setCounting(false);
        
        // Eliminate the letter
        const roundData = result.eliminationRounds[currentRound];
        setTimeout(() => {
          setEliminated((prev) => [...prev, roundData.eliminated]);
          setCurrentRound((prev) => prev + 1);
        }, 300);
      }
    }, 150);

    return () => clearInterval(countInterval);
  }, [currentRound, result, activeLetters.length]);

  const getLetterState = (letter: FlamesLetter): "active" | "eliminated" | "pending" | "counting" => {
    if (eliminated.includes(letter)) return "eliminated";
    if (!counting) return "pending";
    const letterIndex = activeLetters.indexOf(letter);
    if (letterIndex === countIndex) return "counting";
    return "pending";
  };

  return (
    <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-2xl mx-auto animate-scale-in">
      <div className="text-center mb-4 sm:mb-6 md:mb-8">
        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-muted-foreground mb-1 sm:mb-2">Counting through FLAMES...</h3>
        <p className="text-2xl sm:text-3xl font-bold text-primary glow-text">{result.letterCount} letters</p>
      </div>

      <div className="flex justify-center gap-1.5 sm:gap-2 md:gap-3 mb-4 sm:mb-6 md:mb-8 flex-wrap">
        {allLetters.map((letter) => {
          const state = getLetterState(letter);
          const meaning = FLAMES_MEANINGS[letter];
          
          return (
            <div
              key={letter}
              className={`
                flames-letter text-lg sm:text-xl md:text-2xl w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14
                ${state === "counting" ? "flames-letter-active animate-count scale-110" : ""}
                ${state === "eliminated" ? "flames-letter-eliminated" : ""}
                ${state === "pending" ? "flames-letter-pending" : ""}
                ${state === "active" ? "flames-letter-active" : ""}
              `}
              title={meaning.word}
            >
              {letter}
            </div>
          );
        })}
      </div>

      <div className="text-center text-muted-foreground text-sm sm:text-base">
        <p>Round {Math.min(currentRound + 1, result.eliminationRounds.length)} of {result.eliminationRounds.length}</p>
      </div>
    </div>
  );
};
