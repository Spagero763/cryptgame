'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { Undo, Bot, User, Loader2 } from 'lucide-react';
import WinDialog from '../game/WinDialog';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';

type Player = 'red' | 'blue';
type Piece = 'r' | 'b' | 'R' | 'B' | null;
type Opponent = 'human' | 'ai';
type Difficulty = 'easy' | 'medium' | 'hard';


const initialBoard: Piece[] = [
  null, 'b', null, 'b', null, 'b', null, 'b',
  'b', null, 'b', null, 'b', null, 'b', null,
  null, 'b', null, 'b', null, 'b', null, 'b',
  null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null,
  'r', null, 'r', null, 'r', null, 'r', null,
  null, 'r', null, 'r', null, 'r', null, 'r',
  'r', null, 'r', null, 'r', null, 'r', null,
];

const PLAYER_PIECE = 'r';
const AI_PIECE = 'b';
const PLAYER_COLOR = 'red';
const AI_COLOR = 'blue';

export default function CheckersGame() {
  const [board, setBoard] = useState<Piece[]>(initialBoard);
  const [turn, setTurn] = useState<Player>(PLAYER_COLOR);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<number[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [opponent, setOpponent] = useState<Opponent>('ai');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [isAiTurn, setIsAiTurn] = useState(false);

  const difficultyMap: { [key in Difficulty]: number } = { easy: 0, medium: 1, hard: 2 };
  const difficultyLabels: Difficulty[] = ['easy', 'medium', 'hard'];
  const maxDepth: { [key in Difficulty]: number } = { easy: 1, medium: 3, hard: 5 };
  
  const resetGame = () => {
    setBoard(initialBoard);
    setSelectedPiece(null);
    setPossibleMoves([]);
    setWinner(null);
    setTurn(PLAYER_COLOR);
    setIsAiTurn(false);
  };

  const getWinner = (currentBoard: Piece[]): string | null => {
    const redCount = currentBoard.filter(p => p === 'r' || p === 'R').length;
    const blueCount = currentBoard.filter(p => p === 'b' || p === 'B').length;
    if (redCount === 0) return 'Blue';
    if (blueCount === 0) return 'Red';

    const redMoves = getAllMoves(currentBoard, 'red');
    if (turn === 'red' && redMoves.length === 0) return 'Blue';
    
    const blueMoves = getAllMoves(currentBoard, 'blue');
    if (turn === 'blue' && blueMoves.length === 0) return 'Red';

    return null;
  };

  const movePiece = (fromIndex: number, toIndex: number, currentBoard: Piece[], currentTurn: Player) => {
      let newBoard = [...currentBoard];
      const piece = newBoard[fromIndex];
      newBoard[toIndex] = piece;
      newBoard[fromIndex] = null;
      
      if (piece === 'r' && toIndex < 8) newBoard[toIndex] = 'R';
      if (piece === 'b' && toIndex > 55) newBoard[toIndex] = 'B';
      
      const distance = Math.abs(fromIndex - toIndex);
      if (distance > 9 && (Math.abs(fromIndex%8 - toIndex%8) === 2)) {
        const jumpedIndex = (fromIndex + toIndex) / 2;
        newBoard[jumpedIndex] = null;
      }

      const canJumpAgain = (piece: Piece, from: number, board: Piece[]) => {
        const jumps = getPossibleMovesForPiece(from, piece, board).filter(m => m.isJump);
        return jumps.length > 0;
      }
      
      const jumped = distance > 9 && (Math.abs(fromIndex%8 - toIndex%8) === 2);
      let nextTurn = currentTurn;
      if (jumped && canJumpAgain(newBoard[toIndex], toIndex, newBoard)) {
        nextTurn = currentTurn; // Same player's turn for multi-jump
      } else {
        nextTurn = currentTurn === 'red' ? 'blue' : 'red';
      }

      setBoard(newBoard);
      setTurn(nextTurn);
      setSelectedPiece(null);
      setPossibleMoves([]);
      
      const newWinner = getWinner(newBoard);
      if(newWinner) {
        setWinner(newWinner);
        return newBoard;
      }
      
      return newBoard;
  }

  const getPossibleMovesForPiece = (index: number, piece: Piece, currentBoard: Piece[]): {to: number, isJump: boolean}[] => {
    if (!piece) return [];
    const moves: {to: number, isJump: boolean}[] = [];
    const player = (piece === 'r' || piece === 'R') ? 'red' : 'blue';
    const forward = player === 'red' ? -1 : 1;
    const isKing = piece === 'R' || piece === 'B';

    const directions = isKing ? [forward, -forward] : [forward];

    for(const dir of directions) {
        const fromRow = Math.floor(index / 8);
        const fromCol = index % 8;

        // Regular moves
        const left = index + dir * 8 - 1;
        if(fromCol > 0 && Math.floor(left / 8) === fromRow + dir && currentBoard[left] === null) {
            moves.push({to: left, isJump: false});
        }
        const right = index + dir * 8 + 1;
        if (fromCol < 7 && Math.floor(right / 8) === fromRow + dir && currentBoard[right] === null) {
            if(currentBoard[right] === null) moves.push({to: right, isJump: false});
        }
        
        // Jumps
        const opponent = player === 'red' ? 'b' : 'r';
        const jumpLeft = index + dir * 16 - 2;
        const opponentPieceLeft = currentBoard[left];
        if(fromCol > 1 && Math.floor(jumpLeft/8) === fromRow + dir*2 && currentBoard[jumpLeft] === null) {
            if (opponentPieceLeft && opponentPieceLeft.toLowerCase() === opponent) moves.push({to: jumpLeft, isJump: true});
        }

        const jumpRight = index + dir * 16 + 2;
        const opponentPieceRight = currentBoard[right];
        if(fromCol < 6 && Math.floor(jumpRight/8) === fromRow + dir*2 && currentBoard[jumpRight] === null) {
            if (opponentPieceRight && opponentPieceRight.toLowerCase() === opponent) moves.push({to: jumpRight, isJump: true});
        }
    }
    return moves;
  };
  
  function getAllMoves(currentBoard: Piece[], player: Player) {
      const allMoves: {from: number, to: number, isJump: boolean}[] = [];
      
      for (let i = 0; i < currentBoard.length; i++) {
          const piece = currentBoard[i];
          if (piece && ((piece.toLowerCase() === 'r' && player === 'red') || (piece.toLowerCase() === 'b' && player === 'blue'))) {
              const pieceMoves = getPossibleMovesForPiece(i, piece, currentBoard);
              for (const move of pieceMoves) {
                allMoves.push({from: i, ...move});
              }
          }
      }

      const jumps = allMoves.filter(m => m.isJump);
      return jumps.length > 0 ? jumps : allMoves;
  }

  const onSquareClick = (index: number) => {
    if (winner) return;
    if (opponent === 'ai' && turn === AI_COLOR) return;
  
    const piece = board[index];
    const pieceColor = piece?.toLowerCase() === 'r' ? 'red' : (piece?.toLowerCase() === 'b' ? 'blue' : null);
  
    if (piece && pieceColor === turn) {
        const allPlayerMoves = getAllMoves(board, turn);
        const jumpsAvailable = allPlayerMoves.some(m => m.isJump);
        const movesForPiece = getPossibleMovesForPiece(index, piece, board);

        const validMoves = jumpsAvailable
          ? movesForPiece.filter(m => m.isJump)
          : movesForPiece;

        setPossibleMoves(validMoves.map(m => m.to));
        setSelectedPiece(index);

    } else if (selectedPiece !== null && possibleMoves.includes(index)) {
        movePiece(selectedPiece, index, board, turn);
    } else {
        setSelectedPiece(null);
        setPossibleMoves([]);
    }
  };

  const statusText = useMemo(() => {
    if (winner) return winner === 'draw' ? "It's a draw!" : `${winner} has won!`;
    const player = turn.charAt(0).toUpperCase() + turn.slice(1);
    return `${player}'s turn`;
  }, [winner, turn]);

  function evaluateBoard(board: Piece[]) {
    let score = 0;
    board.forEach(p => {
        if(p === 'r') score--;
        if(p === 'b') score++;
        if(p === 'R') score -= 2;
        if(p === 'B') score += 2;
    })
    return score;
  }

  function minimax(currentBoard: Piece[], depth: number, isMaximizingPlayer: boolean, alpha: number, beta: number): { score: number, move?: { from: number, to: number } } {
    const gameWinner = getWinner(currentBoard);
    if (depth === 0 || gameWinner) {
        if (gameWinner === 'Blue') return { score: 100 };
        if (gameWinner === 'Red') return { score: -100 };
        if (gameWinner === 'draw') return { score: 0 };
        return { score: evaluateBoard(currentBoard) };
    }

    const player = isMaximizingPlayer ? AI_COLOR : PLAYER_COLOR;
    const allMoves = getAllMoves(currentBoard, player);
    let bestMove;
    let bestScore = isMaximizingPlayer ? -Infinity : Infinity;

    for (const move of allMoves) {
        const tempBoard = [...currentBoard];
        movePiece(move.from, move.to, tempBoard, player);
        const { score } = minimax(tempBoard, depth - 1, !isMaximizingPlayer, alpha, beta);

        if (isMaximizingPlayer) {
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
            alpha = Math.max(alpha, score);
        } else {
            if (score < bestScore) {
                bestScore = score;
                bestMove = move;
            }
            beta = Math.min(beta, score);
        }
        if (beta <= alpha) {
            break; 
        }
    }
    
    return { score: bestScore, move: bestMove };
  }

  useEffect(() => {
    if (opponent === 'ai' && turn === AI_COLOR && !winner) {
        setIsAiTurn(true);
        setTimeout(() => {
            const allAiMoves = getAllMoves(board, AI_COLOR);
            if (allAiMoves.length > 0) {
              let chosenMove;
              if(difficulty === 'easy') {
                  chosenMove = allAiMoves[Math.floor(Math.random() * allAiMoves.length)];
              } else {
                  const { move } = minimax(board, maxDepth[difficulty], true, -Infinity, Infinity);
                  chosenMove = move || allAiMoves[Math.floor(Math.random() * allAiMoves.length)];
              }
              if (chosenMove) {
                movePiece(chosenMove.from, chosenMove.to, board, AI_COLOR);
              }
            }
            setIsAiTurn(false);
        }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, winner, opponent]);
  

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <Label className="text-center font-semibold">Opponent</Label>
        <RadioGroup
          value={opponent}
          onValueChange={(value: Opponent) => {
            setOpponent(value);
            resetGame();
          }}
          className="grid grid-cols-2 gap-4"
          disabled={isAiTurn}
        >
          <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
            <RadioGroupItem value="human" id="human-checkers" className="sr-only" />
            <User className="mb-3 h-6 w-6" />
            Human
          </Label>
          <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
            <RadioGroupItem value="ai" id="ai-checkers" className="sr-only" />
            <Bot className="mb-3 h-6 w-6" />
            AI
          </Label>
        </RadioGroup>
        
        {opponent === 'ai' && (
          <div className="flex flex-col gap-3 pt-2">
            <Label htmlFor="difficulty-slider-checkers" className="text-center font-semibold">
              Difficulty: <span className="capitalize text-primary">{difficulty}</span>
            </Label>
            <Slider
              id="difficulty-slider-checkers"
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

      <div className={cn("relative grid grid-cols-8 w-full aspect-square max-w-md mx-auto shadow-2xl rounded-lg overflow-hidden border border-border")}>
        {board.map((piece, i) => {
          const row = Math.floor(i / 8);
          const col = i % 8;
          const isBlackSquare = (row + col) % 2 === 1;

          return (
            <div
              key={i}
              onClick={() => isBlackSquare && onSquareClick(i)}
              className={cn("flex items-center justify-center", 
                isBlackSquare ? 'bg-black' : 'bg-white',
                isBlackSquare && 'cursor-pointer',
                selectedPiece === i && 'bg-primary/40',
              )}
            >
                {possibleMoves.includes(i) && <div className="w-1/2 h-1/2 bg-primary/30 rounded-full" />}
                {piece && (
                    <div className={cn("w-3/4 h-3/4 rounded-full flex items-center justify-center font-bold text-lg shadow-inner",
                        piece.toLowerCase() === 'b' ? 'bg-blue-500 text-blue-100' : 'bg-red-600 text-red-100'
                    )}>
                        { (piece === 'B' || piece === 'R') && 'K' }
                    </div>
                )}
            </div>
          )
        })}
      </div>
      
      <div className="flex justify-between items-center w-full max-w-md px-2">
        <div className="h-8 flex items-center">
             {isAiTurn ? (
               <div className="flex items-center text-lg font-semibold text-muted-foreground animate-pulse">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                AI is thinking...
               </div>
            ) : <p className="text-lg font-semibold text-muted-foreground">{statusText}</p> }
        </div>
        <Button onClick={resetGame} variant="outline"><Undo className="mr-2 h-4 w-4" />New Game</Button>
      </div>
      
      <WinDialog winner={winner} onReset={resetGame} open={!!winner} onOpenChange={(open) => !open && setWinner(null)} />
    </div>
  );
}
