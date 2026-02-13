import { FlamesResult as FlamesResultType, FLAMES_MEANINGS, FlamesLetter } from "@/lib/flames";
import { Button } from "@/components/ui/button";
import { RotateCcw, Share2 } from "lucide-react";

interface FlamesResultProps {
  result: FlamesResultType;
  onReset: () => void;
}

export const FlamesResultDisplay = ({ result, onReset }: FlamesResultProps) => {
  const meaning = FLAMES_MEANINGS[result.result];

  return (
    <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-3xl mx-auto animate-reveal">
      {/* Result Header */}
      <div className="flex flex-col items-center sm:items-start sm:flex-row sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="text-center sm:text-left">
          <p className="text-xs sm:text-sm font-medium text-primary mb-1 sm:mb-2">FLAMES Result</p>
          <div className="flex items-center gap-2 sm:gap-3 justify-center sm:justify-start">
            <span className="text-3xl sm:text-4xl">{meaning.icon}</span>
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl font-bold glow-text"
              style={{ color: meaning.color }}
            >
              {meaning.word}
            </h2>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={onReset}
            variant="outline"
            size="sm"
            className="border-border hover:border-primary hover:bg-primary/10 transition-all text-xs sm:text-sm"
          >
            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            Try another pair
          </Button>
          <Button
            onClick={() => {
              const message = `🔥 I just tried FLAMES Finder! ${result.name1} & ${result.name2} got "${meaning.word}" ${meaning.icon}! Try it yourself: ${window.location.href}`;
              const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
              window.open(whatsappUrl, '_blank');
            }}
            size="sm"
            className="bg-[#25D366] hover:bg-[#20BD5A] text-white transition-all text-xs sm:text-sm"
          >
            <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            Share to your friend
          </Button>
        </div>
      </div>

      {/* Names and Count */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-secondary/50 rounded-lg sm:rounded-xl p-2.5 sm:p-4">
          <p className="text-[10px] sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">First name</p>
          <p className="text-sm sm:text-lg font-semibold text-foreground truncate">{result.name1}</p>
        </div>
        <div className="bg-secondary/50 rounded-lg sm:rounded-xl p-2.5 sm:p-4">
          <p className="text-[10px] sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">Second name</p>
          <p className="text-sm sm:text-lg font-semibold text-foreground truncate">{result.name2}</p>
        </div>
        <div className="bg-secondary/50 rounded-lg sm:rounded-xl p-2.5 sm:p-4">
          <p className="text-[10px] sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">Letter count</p>
          <p className="text-sm sm:text-lg font-semibold text-primary">{result.letterCount}</p>
        </div>
      </div>

      {/* Elimination Rounds */}
      <div>
        <h3 className="text-sm sm:text-lg font-semibold text-foreground mb-2 sm:mb-4">Elimination rounds</h3>
        <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
          {result.eliminationRounds.map((round) => {
            const eliminatedMeaning = FLAMES_MEANINGS[round.eliminated];
            return (
              <div
                key={round.round}
                className="bg-secondary/30 rounded-lg sm:rounded-xl p-2.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 animate-fade-in-up"
                style={{ animationDelay: `${round.round * 0.1}s` }}
              >
                <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-base">
                  <span className="text-primary font-semibold">Round {round.round}</span>
                  <span className="text-muted-foreground">
                    Removed:{" "}
                    <span className="font-semibold text-foreground">{eliminatedMeaning.word}</span>
                  </span>
                </div>
                <span className="text-[10px] sm:text-sm text-muted-foreground">
                  Remaining:{" "}
                  {round.remaining.map((l, i) => (
                    <span key={l}>
                      {FLAMES_MEANINGS[l].word}
                      {i < round.remaining.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
