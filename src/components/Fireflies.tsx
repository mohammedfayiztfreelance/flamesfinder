import { useEffect, useState } from "react";

interface Firefly {
  id: number;
  left: number;
  top: number;
  delay: number;
  duration: number;
  size: number;
}

export const Fireflies = () => {
  const [fireflies, setFireflies] = useState<Firefly[]>([]);

  useEffect(() => {
    const flies: Firefly[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 5,
      size: 2 + Math.random() * 4,
    }));
    setFireflies(flies);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {fireflies.map((fly) => (
        <div
          key={fly.id}
          className="absolute rounded-full bg-primary"
          style={{
            left: `${fly.left}%`,
            top: `${fly.top}%`,
            width: `${fly.size}px`,
            height: `${fly.size}px`,
            boxShadow: `0 0 ${fly.size * 3}px hsl(var(--primary)), 0 0 ${fly.size * 6}px hsl(var(--primary))`,
            animation: `firefly-float ${fly.duration}s ease-in-out infinite`,
            animationDelay: `${fly.delay}s`,
          }}
        />
      ))}
    </div>
  );
};
