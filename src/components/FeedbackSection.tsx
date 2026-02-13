import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const FeedbackSection = () => {
  const [feedback, setFeedback] = useState("");
  const [suggestion, setSuggestion] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim() && !suggestion.trim()) {
      toast.error("Please enter your feedback or suggestion");
      return;
    }
    // For now, just show a thank you message
    toast.success("Thank you for your feedback! 💚");
    setFeedback("");
    setSuggestion("");
  };

  return (
    <div className="mt-12 sm:mt-16 md:mt-20 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}>
      <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
          <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <h3 className="text-lg sm:text-xl font-semibold text-foreground">We'd Love Your Feedback!</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs sm:text-sm text-muted-foreground mb-1.5 block">
              How was your experience?
            </label>
            <Textarea
              placeholder="Tell us about your experience with FLAMES Finder..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="bg-secondary/50 border-border focus:border-primary min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
            />
          </div>
          
          <div>
            <label className="text-xs sm:text-sm text-muted-foreground mb-1.5 block">
              Any suggestions for improvement?
            </label>
            <Input
              placeholder="Share your ideas..."
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              className="bg-secondary/50 border-border focus:border-primary text-sm sm:text-base"
            />
          </div>
          
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 sm:h-11 text-sm sm:text-base"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Feedback
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
