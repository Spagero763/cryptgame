'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import WinDialog from '@/components/game/WinDialog';
import * as LucideIcons from 'lucide-react';
import { Timer, Undo } from 'lucide-react';

type Difficulty = 'easy' | 'medium' | 'hard';
type Card = {
  id: number;
  icon: keyof typeof LucideIcons;
  isFlipped: boolean;
  isMatched: boolean;
};

const icons = [
    'Anchor', 'Award', 'Axe', 'Banana', 'Bell', 'Bike', 'Bomb', 'Bone',
    'Book', 'Brain', 'Brush', 'Bug', 'Cake', 'Camera', 'Car', 'Cat', 'Cloud',
    'Crown', 'Diamond', 'Feather', 'Fish', 'Flag', 'Flower', 'Gift', 'Grape', 'Heart',
    'Home', 'Key', 'Leaf', 'Lightbulb', 'Lock', 'Moon', 'Mouse', 'Mushroom', 'Pizza', 'Plane',
    'Rocket', 'Shell', 'Ship', 'Smile', 'Star', 'Sun', 'Train', 'Tree', 'Umbrella', 'Watch',
    'Apple', 'Beer', 'Gamepad2', 'Gem', 'Ghost'
] as const;


const difficultySettings = {
    easy: { pairCount: 6, grid: 'grid-cols-4' },
    medium: { pairCount: 10, grid: 'grid-cols-5' },
    hard: { pairCount: 15, grid: 'grid-cols-6' },
};

export default function MemoryGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const createBoard = () => {
    const { pairCount } = difficultySettings[difficulty];
    const selectedIcons = [...icons].sort(() => 0.5 - Math.random()).slice(0, pairCount);
    const gameCards = [...selectedIcons, ...selectedIcons]
      .sort(() => 0.5 - Math.random())
      .map((icon, index) => ({
        id: index,
        icon,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(gameCards);
    setMoves(0);
    setIsWon(false);
    setFlippedCards([]);
    setTimer(0);
    setIsGameActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    createBoard();
  }, [difficulty]);

  useEffect(() => {
    if (isGameActive && !isWon) {
      timerRef.current = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGameActive, isWon]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      setIsChecking(true);
      const [firstCardIndex, secondCardIndex] = flippedCards;
      const firstCard = cards[firstCardIndex];
      const secondCard = cards[secondCardIndex];

      if (firstCard.icon === secondCard.icon) {
        setCards(prevCards => prevCards.map(card => 
            card.icon === firstCard.icon ? { ...card, isMatched: true } : card
        ));
        setFlippedCards([]);
        setIsChecking(false);
      } else {
        setTimeout(() => {
          setCards(prevCards => prevCards.map((card, index) => 
            index === firstCardIndex || index === secondCardIndex ? { ...card, isFlipped: false } : card
          ));
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  }, [flippedCards, cards]);

  useEffect(() => {
    if (cards.length > 0 && cards.every(card => card.isMatched)) {
      setIsWon(true);
      setIsGameActive(false);
    }
  }, [cards]);


  const handleCardClick = (index: number) => {
    if (!isGameActive) {
      setIsGameActive(true);
    }
    if (isChecking || cards[index].isFlipped || flippedCards.length === 2) return;

    setCards(prevCards => prevCards.map((card, i) => 
        i === index ? { ...card, isFlipped: true } : card
    ));

    setFlippedCards(prev => [...prev, index]);

    if(flippedCards.length === 0) {
        setMoves(m => m + 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const CardComponent = ({ card, index }: { card: Card, index: number }) => {
    const IconComponent = LucideIcons[card.icon] as React.ElementType;
    const isClickable = !card.isFlipped && !isWon && !isChecking;

    return (
      <button
        onClick={() => handleCardClick(index)}
        disabled={!isClickable}
        className={cn(
          "aspect-square w-full rounded-lg shadow-md transition-transform duration-300",
          "transform-style-3d",
           isClickable ? "cursor-pointer" : "cursor-not-allowed",
           card.isFlipped || card.isMatched ? "rotate-y-180" : ""
        )}
      >
        <div className={cn("relative w-full h-full flex items-center justify-center transition-transform duration-300 rounded-lg",
          card.isFlipped || card.isMatched ? "bg-card" : "bg-primary hover:bg-primary/90",
        )}>
            <div className={cn("backface-hidden absolute w-full h-full", card.isFlipped || card.isMatched ? "hidden" : "block")}>
            </div>
             <div className={cn("absolute w-full h-full flex items-center justify-center", card.isFlipped || card.isMatched ? "block" : "hidden", {"rotate-y-180": card.isFlipped || card.isMatched})}>
                {IconComponent && <IconComponent className={cn("h-1/2 w-1/2", card.isMatched ? "text-accent" : "text-foreground")} />}
            </div>
        </div>
      </button>
    );
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
       <style>{`
        .transform-style-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
      <RadioGroup
          value={difficulty}
          className="flex space-x-4"
          onValueChange={(value: Difficulty) => setDifficulty(value)}
          disabled={isChecking || isGameActive}
      >
          <div className="flex items-center space-x-2">
              <RadioGroupItem value="easy" id="easy" />
              <Label htmlFor="easy">Easy</Label>
          </div>
          <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium">Medium</Label>
          </div>
          <div className="flex items-center space-x-2">
              <RadioGroupItem value="hard" id="hard" />
              <Label htmlFor="hard">Hard</Label>
          </div>
      </RadioGroup>
      
      <div className={cn("grid gap-2 sm:gap-3 w-full", difficultySettings[difficulty].grid)}>
        {cards.map((card, index) => (
          <CardComponent key={card.id} card={card} index={index} />
        ))}
      </div>

      <div className="flex justify-between items-center w-full px-2">
        <div className="flex items-center gap-4 text-lg font-semibold">
          <p>Moves: <span className="text-primary font-bold">{moves}</span></p>
          <div className="flex items-center gap-2">
            <Timer className="h-6 w-6 text-primary" />
            <span className="font-bold">{formatTime(timer)}</span>
          </div>
        </div>
        <Button onClick={createBoard} variant="outline" disabled={isChecking}>
            <Undo className="mr-2 h-4 w-4" />
            New Game
        </Button>
      </div>

      <WinDialog
        winner="You"
        onReset={createBoard}
        open={isWon}
        onOpenChange={(open) => !open && setIsWon(false)}
      />
    </div>
  );
}
