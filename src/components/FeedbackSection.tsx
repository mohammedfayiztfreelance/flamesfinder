import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const FeedbackSection = () => {
  const [experience, setExperience] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!experience.trim()) return;

    setLoading(true);

    const { error } = await supabase.from("feedback").insert([
      {
        experience,
        suggestion,
      },
    ]);

    setLoading(false);

    if (!error) {
      setSubmitted(true);
      setExperience("");
      setSuggestion("");
    } else {
      console.error("Feedback error:", error);
    }
  };

  return (
    <div className="glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto mt-8 animate-fade-in-up">
      <h3 className="text-xl sm:text-2xl font-bold text-primary mb-4">
        We'd Love Your Feedback🥰!
      </h3>

      {submitted ? (
        <p className="text-green-500 font-medium">
          Thank you for your feedback ❤️
        </p>
      ) : (
        <>
          <textarea
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="Tell us about your experience with FLAMES Finder..."
            className="w-full mb-4 p-3 rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none"
          />

          <input
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="Any suggestions for improvement?"
            className="w-full mb-4 p-3 rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none"
          />

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </Button>
        </>
      )}
    </div>
  );
};
