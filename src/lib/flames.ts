export const FLAMES_MEANINGS = {
  F: { letter: "F", word: "Friends", icon: "👫", color: "hsl(200 70% 50%)" },
  L: { letter: "L", word: "Love", icon: "❤️", color: "hsl(350 80% 55%)" },
  A: { letter: "A", word: "Affection", icon: "💕", color: "hsl(330 70% 60%)" },
  M: { letter: "M", word: "Marriage", icon: "💍", color: "hsl(45 90% 55%)" },
  E: { letter: "E", word: "Enemy", icon: "⚔️", color: "hsl(0 70% 50%)" },
  S: { letter: "S", word: "Siblings", icon: "👨‍👩‍👧‍👦", color: "hsl(142 76% 50%)" },
} as const;

export type FlamesLetter = keyof typeof FLAMES_MEANINGS;

export interface EliminationRound {
  round: number;
  eliminated: FlamesLetter;
  remaining: FlamesLetter[];
}

export interface FlamesResult {
  name1: string;
  name2: string;
  letterCount: number;
  result: FlamesLetter;
  eliminationRounds: EliminationRound[];
}

export function calculateFlames(name1: string, name2: string): FlamesResult {
  // Normalize names: lowercase, remove spaces and special characters
  const n1 = name1.toLowerCase().replace(/[^a-z]/g, "");
  const n2 = name2.toLowerCase().replace(/[^a-z]/g, "");

  // Create letter arrays
  const letters1 = n1.split("");
  const letters2 = n2.split("");

  // Remove common letters
  const remaining1: (string | null)[] = [...letters1];
  const remaining2: (string | null)[] = [...letters2];

  for (let i = 0; i < remaining1.length; i++) {
    if (remaining1[i] === null) continue;
    for (let j = 0; j < remaining2.length; j++) {
      if (remaining2[j] === null) continue;
      if (remaining1[i] === remaining2[j]) {
        remaining1[i] = null;
        remaining2[j] = null;
        break;
      }
    }
  }

  // Count remaining letters
  const count1 = remaining1.filter((l) => l !== null).length;
  const count2 = remaining2.filter((l) => l !== null).length;
  const letterCount = count1 + count2;

  // FLAMES elimination
  let flames: FlamesLetter[] = ["F", "L", "A", "M", "E", "S"];
  const eliminationRounds: EliminationRound[] = [];
  let currentIndex = 0;

  while (flames.length > 1) {
    // Count through the remaining letters
    currentIndex = (currentIndex + letterCount - 1) % flames.length;
    const eliminated = flames[currentIndex];
    flames = flames.filter((_, i) => i !== currentIndex);

    eliminationRounds.push({
      round: eliminationRounds.length + 1,
      eliminated,
      remaining: [...flames],
    });

    // Adjust index if we removed an element before current position
    if (currentIndex >= flames.length) {
      currentIndex = 0;
    }
  }

  return {
    name1: n1,
    name2: n2,
    letterCount,
    result: flames[0],
    eliminationRounds,
  };
}
