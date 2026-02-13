import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface FlamesInputProps {
  onCalculate: (name1: string, name2: string) => void;
  isCalculating: boolean;
}

export const FlamesInput = ({ onCalculate, isCalculating }: FlamesInputProps) => {
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name1.trim() && name2.trim()) {
      onCalculate(name1.trim(), name2.trim());
    }
  };

  return (
    <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <label htmlFor="name1" className="text-xs sm:text-sm font-medium text-muted-foreground">
              First name
            </label>
            <Input
              id="name1"
              value={name1}
              onChange={(e) => setName1(e.target.value.toUpperCase())}
              placeholder="Enter first name"
              className="h-11 sm:h-14 text-base sm:text-lg bg-secondary/50 border-border focus:border-primary focus:ring-primary uppercase tracking-wide"
              disabled={isCalculating}
            />
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <label htmlFor="name2" className="text-xs sm:text-sm font-medium text-muted-foreground">
              Second name
            </label>
            <Input
              id="name2"
              value={name2}
              onChange={(e) => setName2(e.target.value.toUpperCase())}
              placeholder="Enter second name"
              className="h-11 sm:h-14 text-base sm:text-lg bg-secondary/50 border-border focus:border-primary focus:ring-primary uppercase tracking-wide"
              disabled={isCalculating}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={!name1.trim() || !name2.trim() || isCalculating}
          className="w-full sm:w-auto h-11 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground glow-box hover:glow-box-strong transition-all duration-300"
        >
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          {isCalculating ? "Calculating..." : "Find FLAMES"}
        </Button>

        <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
          We use the traditional FLAMES method: remove common letters, count the rest, and circle through to reveal your connection.
        </p>
      </form>
    </div>
  );
};
