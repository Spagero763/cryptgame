'use client';

import { useState, useMemo, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { Undo, Bot, User, Loader2 } from 'lucide-react';
import WinDialog from '../game/WinDialog';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';

const chessPieces: { [key: string]: string } = {
  p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚',
  P: '♙', N: '♘', B: '♗', R: '♖', Q: '♕', K: '♔'
};

type Opponent = 'human' | 'ai';
type Difficulty = 'easy' | 'medium' | 'hard';

export default function ChessGame() {
  const [game, setGame] = useState(new Chess());
  const [board, setBoard] = useState(game.board());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [opponent, setOpponent] = useState<Opponent>('ai');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [isAiTurn, setIsAiTurn] = useState(false);

  const difficultyMap: { [key in Difficulty]: number } = { easy: 0, medium: 1, hard: 2 };
  const difficultyLabels: Difficulty[] = ['easy', 'medium', 'hard'];
  
  const handleReset = () => {
    const newGame = new Chess();
    setGame(newGame);
    setBoard(newGame.board());
    setSelectedSquare(null);
    setPossibleMoves([]);
    setWinner(null);
    setIsAiTurn(false);
  };

  const checkGameState = (currentGame: any) => {
    if (currentGame.isCheckmate()) {
      const winningPlayer = currentGame.turn() === 'w' ? 'Black' : 'White';
      setWinner(winningPlayer);
    } else if (currentGame.isDraw() || currentGame.isStalemate() || currentGame.isThreefoldRepetition() || currentGame.isInsufficientMaterial()) {
      setWinner('draw');
    }
  };

  const makeMove = (move: any) => {
    const newGame = new Chess(game.fen());
    const result = newGame.move(move);

    if (result) {
      setGame(newGame);
      setBoard(newGame.board());
      checkGameState(newGame);
      return newGame;
    }
    return null;
  }

  const getAiMove = (currentGame: Chess, currentDifficulty: Difficulty) => {
    const moves = currentGame.moves();
    
    if (moves.length === 0) return null;

    if (currentDifficulty === 'easy') {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    // Medium & Hard: Basic evaluation
    let bestMove = null;
    let bestValue = -9999;
    
    // A simple evaluation function
    const evaluateBoard = (board: (({ type: any; color: any; } | null)[])[]) => {
        let totalEvaluation = 0;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                totalEvaluation += getPieceValue(board[i][j]);
            }
        }
        return totalEvaluation;
    };

    const getPieceValue = (piece: { type: any; color: any; } | null) => {
        if (piece === null) return 0;
        const getAbsoluteValue = (pieceType: any) => {
            if (pieceType === 'p') return 10;
            if (pieceType === 'r') return 50;
            if (pieceType === 'n') return 30;
            if (pieceType === 'b') return 30;
            if (pieceType === 'q') return 90;
            if (pieceType === 'k') return 900;
            return 0;
        };

        const value = getAbsoluteValue(piece.type);
        return piece.color === 'w' ? value : -value;
    };
    
    for (const move of moves) {
        const tempGame = new Chess(currentGame.fen());
        tempGame.move(move);
        const boardValue = evaluateBoard(tempGame.board());

        // Simple logic for AI (black) to maximize its score (minimize white's)
        if (boardValue < bestValue) {
            bestValue = boardValue;
            bestMove = move;
        }
    }
    
    return bestMove || moves[Math.floor(Math.random() * moves.length)];
  }

  useEffect(() => {
    if (opponent === 'ai' && game.turn() === 'b' && !winner) {
      setIsAiTurn(true);
      setTimeout(() => {
        const move = getAiMove(game, difficulty);
        if(move){
          makeMove(move);
        }
        setIsAiTurn(false);
      }, 1000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, winner, opponent]);


  const onSquareClick = (square: Square) => {
    if (winner || isAiTurn) return;

    if (selectedSquare && possibleMoves.includes(square)) {
      const move = {
        from: selectedSquare,
        to: square,
        promotion: 'q'
      };
      
      const newGame = makeMove(move);
      if (newGame) {
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    } 
    else {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        const moves = game.moves({ square: square, verbose: true });
        setPossibleMoves(moves.map(m => m.to));
      } else {
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    }
  };

  const statusText = useMemo(() => {
    if (winner) {
        if(winner === 'draw') return "It's a draw!";
        return `${winner} has won!`;
    }
    
    const playerTurn = game.turn() === 'w' ? 'White' : 'Black';
    return `${playerTurn}'s turn`;
  }, [winner, game]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <Label className="text-center font-semibold">Opponent</Label>
        <RadioGroup
          value={opponent}
          onValueChange={(value: Opponent) => {
            setOpponent(value);
            handleReset();
          }}
          className="grid grid-cols-2 gap-4"
          disabled={isAiTurn}
        >
          <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
            <RadioGroupItem value="human" id="human-chess" className="sr-only" />
            <User className="mb-3 h-6 w-6" />
            Human
          </Label>
          <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
            <RadioGroupItem value="ai" id="ai-chess" className="sr-only" />
            <Bot className="mb-3 h-6 w-6" />
            AI
          </Label>
        </RadioGroup>
        
        {opponent === 'ai' && (
          <div className="flex flex-col gap-3 pt-2">
            <Label htmlFor="difficulty-slider-chess" className="text-center font-semibold">
              Difficulty: <span className="capitalize text-primary">{difficulty}</span>
            </Label>
            <Slider
              id="difficulty-slider-chess"
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
      <div className={cn("grid grid-cols-8 w-full aspect-square max-w-lg mx-auto shadow-2xl bg-card rounded-lg overflow-hidden border border-border")}>
        {[...Array(64).keys()].map(i => {
          const rank = Math.floor(i / 8);
          const file = i % 8;
          const squareName = (String.fromCharCode(97 + file) + (8 - rank)) as Square;
          const piece = board[rank][file];
          const isBlackSquare = (rank + file) % 2 === 1;

          return (
            <div
              key={i}
              onClick={() => onSquareClick(squareName)}
              className={cn("flex items-center justify-center text-4xl cursor-pointer",
                isBlackSquare ? 'bg-amber-800' : 'bg-amber-200',
                selectedSquare === squareName && 'bg-primary/40',
                possibleMoves.includes(squareName) && 'relative',
              )}
            >
              {possibleMoves.includes(squareName) && (
                <div className={cn("absolute w-1/3 h-1/3 bg-primary/50 rounded-full", game.get(squareName) && 'border-4 border-primary/70 bg-transparent' )} ></div>
              )}
              {piece && <span className={cn(piece.color === 'b' ? 'text-blue-900' : 'text-red-700')}>{chessPieces[piece.type]}</span>}
            </div>
          )
        })}
      </div>
      
      <div className="flex justify-between items-center w-full max-w-lg px-2">
        <div className="h-8 flex items-center">
            {isAiTurn ? (
               <div className="flex items-center text-lg font-semibold text-muted-foreground animate-pulse">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                AI is thinking...
               </div>
            ) : <p className="text-lg font-semibold text-muted-foreground">{statusText}</p>}
        </div>
        <Button onClick={handleReset} variant="outline"><Undo className="mr-2 h-4 w-4" />New Game</Button>
      </div>

      <WinDialog winner={winner} onReset={handleReset} open={!!winner} onOpenChange={(open) => !open && setWinner(null)} />
    </div>
  );
}
