// components/TickProgressBar.tsx
"use client";

interface TickProgressBarProps {
  progressPercentage: number;
}

export function TickProgressBar({ progressPercentage }: TickProgressBarProps) {
  const totalBlocks = 5; // Exemplo: 5 blocos fixos para a barra
  const progressPerBlock = Array.from({ length: totalBlocks }, (_, i) => {
    const blockPercentage = (i + 1) * (100 / totalBlocks);
    if (progressPercentage >= blockPercentage) return 1;
    if (progressPercentage <= (i * (100 / totalBlocks))) return 0;
    return (progressPercentage - (i * (100 / totalBlocks))) / (100 / totalBlocks);
  });

  return (
    <div className="flex w-full gap-[4px] my-4">
      {progressPerBlock.map((p, i) => (
        <div
          key={i}
          className="relative h-5 flex-1 rounded-sm overflow-hidden border border-green-700/50 bg-gray-800"
        >
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${p * 100}%`,
              background: "linear-gradient(to right, #22c55e, #16a34a)",
            }}
          />
        </div>
      ))}
    </div>
  );
}