'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import WinDialog from '@/components/game/WinDialog';
import { X, Circle, Bot, User, Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useGameContract } from '@/hooks/useGameContract';
import { useWallets } from '@privy-io/react-auth';
import StakeDialog from '../game/StakeDialog';

type Player = 'X' | 'O';
type Opponent = 'human' | 'ai';
type Difficulty = 'easy' | 'medium' | 'hard';

const PLAYER: Player = 'X';
const AI_PLAYER: Player = 'O';

export default function TicTacToeGame() {
  const [board, setBoard] = useState(Array(9).fill(''));
  const [currentPlayer, setCurrentPlayer] = useState<Player>(PLAYER);
  const [winner, setWinner] = useState<string | null>(null);
  const [opponent, setOpponent] = useState<Opponent>('ai');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [isAiTurn, setIsAiTurn] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);

  const { wallets } = useWallets();
  const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');

  const {
    stake,
    claimWinnings,
    hasActiveStake,
    stakeAmount,
    isStaking,
    isClaiming,
    gameResult,
    isReporting,
    reportLoss,
    reportDraw,
  } = useGameContract(embeddedWallet);

  useEffect(() => {
    if (opponent === 'human') {
        setIsGameActive(true);
    } else {
        setIsGameActive(hasActiveStake);
    }
  }, [hasActiveStake, opponent])


  const difficultyMap: { [key in Difficulty]: number } = {
    easy: 0,
    medium: 1,
    hard: 2,
  };
  const difficultyLabels: Difficulty[] = ['easy', 'medium', 'hard'];

  const checkWinner = (currentBoard: string[]) => {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return currentBoard[a];
      }
    }
    if (currentBoard.every(cell => cell !== '')) {
      return 'draw';
    }
    return null;
  };

  const handleReset = () => {
    setBoard(Array(9).fill(''));
    setCurrentPlayer(PLAYER);
    setWinner(null);
    setIsAiTurn(false);
    if(opponent === 'ai') {
        setIsGameActive(false);
    }
  };

  const makeMove = (index: number, player: Player) => {
    if (board[index] || winner || !isGameActive) {
      return;
    }
    const newBoard = [...board];
    newBoard[index] = player;
    setBoard(newBoard);

    const newWinner = checkWinner(newBoard);
    if (newWinner) {
      setWinner(newWinner);
      if (opponent === 'ai') {
        if(newWinner === PLAYER) {
            claimWinnings();
        } else if (newWinner === AI_PLAYER) {
            reportLoss();
        } else if (newWinner === 'draw') {
            reportDraw();
        }
      }
    } else {
      const nextPlayer = player === 'X' ? 'O' : 'X';
      setCurrentPlayer(nextPlayer);
    }
  };

  const handleHumanMove = (index: number) => {
    if (isAiTurn || currentPlayer !== PLAYER) return;
    makeMove(index, currentPlayer);
  };
  
  const getEmptyCells = (currentBoard: string[]) => {
    return currentBoard.map((c,i) => c === '' ? i : null).filter(c => c !== null) as number[];
  }
  
  const minimax = (newBoard: string[], player: Player): {score: number, index?: number} => {
    const emptyCells = getEmptyCells(newBoard);
    const result = checkWinner(newBoard);
    if (result === AI_PLAYER) return { score: 10 };
    if (result === PLAYER) return { score: -10 };
    if (emptyCells.length === 0) return { score: 0 };
    
    const moves: {index: number, score: number}[] = [];
    
    for (const index of emptyCells) {
      const move: {index: number, score: number} = { index, score: 0 };
      newBoard[index] = player;
      
      if (player === AI_PLAYER) {
        const { score } = minimax(newBoard, PLAYER);
        move.score = score;
      } else {
        const { score } = minimax(newBoard, AI_PLAYER);
        move.score = score;
      }
      
      newBoard[index] = '';
      moves.push(move);
    }
    
    let bestMove: number | undefined;
    let bestScore = player === AI_PLAYER ? -Infinity : Infinity;

    for(const move of moves) {
        if (player === AI_PLAYER) {
            if (move.score > bestScore) {
                bestScore = move.score;
                bestMove = move.index;
            }
        } else {
            if (move.score < bestScore) {
                bestScore = move.score;
                bestMove = move.index;
            }
        }
    }

    return { score: bestScore, index: bestMove };
  }


  const getAiMove = (currentBoard: string[], currentDifficulty: Difficulty) => {
    const emptyCells = getEmptyCells(currentBoard);

    if (currentDifficulty === 'easy' || (currentDifficulty === 'medium' && Math.random() > 0.5)) {
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        return emptyCells[randomIndex];
    }
    
    const { index } = minimax(currentBoard, AI_PLAYER);
    return index;
  };

  useEffect(() => {
    if (opponent === 'ai' && currentPlayer === AI_PLAYER && !winner && isGameActive) {
      setIsAiTurn(true);
      const aiThinkTime = Math.random() * 500 + 500;
      
      setTimeout(() => {
        const move = getAiMove([...board], difficulty);
        if (move !== undefined) {
          makeMove(move, AI_PLAYER);
        }
        setIsAiTurn(false);
      }, aiThinkTime);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer, winner, opponent, difficulty, isGameActive]);

  const handleClick = (index: number) => {
    if (opponent === 'human') {
      makeMove(index, currentPlayer);
    } else {
      handleHumanMove(index);
    }
  };

  const renderCell = (index: number) => {
    const value = board[index];
    const isClickable = !value && !winner && !isAiTurn && isGameActive;
    
    const winPatterns = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    const winningLine = winner && winner !== 'draw' ? winPatterns.find(p => p.every(i => board[i] === winner)) : null;

    return (
      <button
        key={index}
        className={cn(
          "flex items-center justify-center w-full aspect-square rounded-none shadow-inner transition-all duration-200",
          "bg-secondary/30 hover:bg-secondary/40",
          isClickable ? "cursor-pointer" : "cursor-not-allowed",
           winningLine?.includes(index) && "bg-primary/30"
        )}
        style={{borderTop: index > 2 ? '1px solid hsla(0,0%,100%,.2)' : 'none', borderLeft: index % 3 !== 0 ? '1px solid hsla(0,0%,100%,.2)' : 'none' }}
        onClick={() => handleClick(index)}
        aria-label={`Cell ${index + 1}`}
        disabled={!isClickable}
      >
        {value === 'X' && <X className="h-12 w-12 sm:h-16 sm:w-16 text-blue-500" strokeWidth={3} />}
        {value === 'O' && <Circle className="h-12 w-12 sm:h-16 sm:w-16 text-red-500" strokeWidth={3} />}
      </button>
    );
  };
  
  return (
    <div className="flex flex-col items-center gap-6 w-full">
        {!isGameActive && opponent === 'ai' ? (
            <StakeDialog 
                open={!isGameActive && opponent === 'ai'}
                onStake={stake}
                isStaking={isStaking}
                stakeAmount={stakeAmount}
            />
        ) : (
            <>
                <div className="w-full max-w-sm flex flex-col gap-4">
                    <Label className="text-center font-semibold">Opponent</Label>
                    <RadioGroup
                    value={opponent}
                    onValueChange={(value: Opponent) => {
                        setOpponent(value)
                        handleReset();
                    }}
                    className="grid grid-cols-2 gap-4"
                    >
                    <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                        <RadioGroupItem value="human" id="human" className="sr-only" />
                        <User className="mb-3 h-6 w-6" />
                        Human
                    </Label>
                    <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                        <RadioGroupItem value="ai" id="ai" className="sr-only" />
                        <Bot className="mb-3 h-6 w-6" />
                        AI
                    </Label>
                    </RadioGroup>
                    
                    {opponent === 'ai' && (
                    <div className="flex flex-col gap-3 pt-2">
                        <Label htmlFor="difficulty-slider" className="text-center font-semibold">
                        Difficulty: <span className="capitalize text-primary">{difficulty}</span>
                        </Label>
                        <Slider
                        id="difficulty-slider"
                        min={0}
                        max={2}
                        step={1}
                        value={[difficultyMap[difficulty]]}
                        onValueChange={([value]) => setDifficulty(difficultyLabels[value])}
                        disabled={isAiTurn}
                        />
                    </div>
                    )}
                </div>

                <div className={cn("grid grid-cols-3 w-full p-2 bg-card rounded-xl border border-border overflow-hidden")}>
                    {board.map((_, index) => renderCell(index))}
                </div>

                <div className="h-8">
                    {isAiTurn ? (
                    <div className="flex items-center text-lg font-semibold text-muted-foreground animate-pulse">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        AI is thinking...
                    </div>
                    ) : !winner && (
                    <p className="text-lg font-semibold text-muted-foreground">
                        {`Player ${currentPlayer}'s Turn`}
                    </p>
                    )}
                </div>

                <Button onClick={handleReset} variant="outline" className="w-full">
                    Reset Game
                </Button>

                <WinDialog
                    winner={winner}
                    onReset={handleReset}
                    open={!!winner}
                    onOpenChange={(open) => !open && setWinner(null)}
                    isClaiming={isClaiming}
                    isReporting={isReporting}
                    gameResult={gameResult}
                    opponent={opponent}
                />
            </>
        )}
    </div>
  );
}
