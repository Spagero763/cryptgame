'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import WinDialog from '@/components/game/WinDialog';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Timer, Undo } from 'lucide-react';

type Difficulty = 'easy' | 'medium' | 'hard';

const difficultySettings = {
    easy: { gridSize: 3, moves: 100 },
    medium: { gridSize: 4, moves: 500 },
    hard: { gridSize: 5, moves: 1000 },
};

interface SlidingPuzzleProps {
  imageUrl: string;
}

export default function SlidingPuzzle({ imageUrl }: SlidingPuzzleProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gridSize, setGridSize] = useState(difficultySettings.medium.gridSize);
  const [tileCount, setTileCount] = useState(gridSize * gridSize);
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const newGridSize = difficultySettings[difficulty].gridSize;
    setGridSize(newGridSize);
    setTileCount(newGridSize * newGridSize);
  }, [difficulty]);

  useEffect(() => {
    shuffleTiles();
  }, [imageUrl, gridSize]);

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

  const shuffleTiles = () => {
    const { moves: shuffleMoves } = difficultySettings[difficulty];
    let newTiles = Array.from({ length: tileCount }, (_, i) => (i + 1) % tileCount); 

    let emptyIndex = newTiles.indexOf(0);
    for (let i = 0; i < shuffleMoves; i++) {
        const neighbors = [];
        const row = Math.floor(emptyIndex / gridSize);
        const col = emptyIndex % gridSize;
        if (row > 0) neighbors.push(emptyIndex - gridSize); 
        if (row < gridSize - 1) neighbors.push(emptyIndex + gridSize); 
        if (col > 0) neighbors.push(emptyIndex - 1); 
        if (col < gridSize - 1) neighbors.push(emptyIndex + 1); 
        
        const randomNeighborIndex = neighbors[Math.floor(Math.random() * neighbors.length)];
        
        [newTiles[emptyIndex], newTiles[randomNeighborIndex]] = [newTiles[randomNeighborIndex], newTiles[emptyIndex]];
        emptyIndex = randomNeighborIndex;
    }
    
    setTiles(newTiles);
    setMoves(0);
    setIsWon(false);
    setTimer(0);
    setIsGameActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const checkWin = (currentTiles: number[]) => {
    for (let i = 0; i < tileCount - 1; i++) {
      if (currentTiles[i] !== i + 1) return false;
    }
    return currentTiles[tileCount - 1] === 0;
  };
  
  const moveTile = (tileIndex: number) => {
    if (isWon) return;
    if (!isGameActive) {
      setIsGameActive(true);
    }
    
    const emptyIndex = tiles.indexOf(0);
    const tile = tiles[tileIndex];
    if (tile === 0) return;
    
    const isAdjacent = 
      (Math.abs(tileIndex - emptyIndex) === 1 && Math.floor(tileIndex / gridSize) === Math.floor(emptyIndex / gridSize)) || 
      (Math.abs(tileIndex - emptyIndex) === gridSize); 

    if (isAdjacent) {
      const newTiles = [...tiles];
      [newTiles[tileIndex], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[tileIndex]];
      setTiles(newTiles);
      setMoves(moves + 1);
      
      if (checkWin(newTiles)) {
        setIsWon(true);
        setIsGameActive(false);
      }
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <RadioGroup
          value={difficulty}
          className="flex space-x-4"
          onValueChange={(value: Difficulty) => setDifficulty(value)}
          disabled={isGameActive}
      >
          <div className="flex items-center space-x-2">
              <RadioGroupItem value="easy" id="easy" />
              <Label htmlFor="easy">Easy (3x3)</Label>
          </div>
          <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium">Medium (4x4)</Label>
          </div>
          <div className="flex items-center space-x-2">
              <RadioGroupItem value="hard" id="hard" />
              <Label htmlFor="hard">Hard (5x5)</Label>
          </div>
      </RadioGroup>

      <Card className="p-1 sm:p-2 shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-none">
        <CardContent className="p-0">
          <div
            className="grid gap-1 bg-background"
            style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
          >
            {tiles.map((tileValue, index) => {
              const isEmpty = tileValue === 0;
              const correctRow = Math.floor((tileValue - 1) / gridSize);
              const correctCol = (tileValue - 1) % gridSize;
              
              return (
                <div
                  key={index}
                  onClick={() => moveTile(index)}
                  className={cn(
                    'relative select-none w-full aspect-square rounded-md transition-all duration-300 ease-in-out',
                    isEmpty ? 'bg-secondary/50' : 'cursor-pointer bg-cover bg-no-repeat shadow-lg',
                  )}
                  style={!isEmpty ? {
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                    backgroundPosition: `${correctCol * (100 / (gridSize - 1))}% ${correctRow * (100 / (gridSize - 1))}%`,
                  } : {}}
                >
                  {!isEmpty && (
                     <div className="absolute inset-0 flex items-center justify-center text-white text-3xl font-bold opacity-0 hover:opacity-100 bg-black/40 transition-opacity">
                     </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-none">
        <div className="flex items-center gap-4 text-lg font-semibold">
            <p>Moves: <span className="text-primary font-bold">{moves}</span></p>
            <div className="flex items-center gap-2">
                <Timer className="h-6 w-6 text-primary" />
                <span className="font-bold">{formatTime(timer)}</span>
            </div>
        </div>
        <Button onClick={shuffleTiles} variant="outline"><Undo className="mr-2 h-4 w-4" />New Puzzle</Button>
      </div>
      
      <WinDialog
        winner="You"
        onReset={shuffleTiles}
        open={isWon}
        onOpenChange={(open) => !open && setIsWon(false)}
      />
    </div>
  );
}
