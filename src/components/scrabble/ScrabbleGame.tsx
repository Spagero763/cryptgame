'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shuffle, Send, Undo } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

const boardLayout = [
    ['TW', '', '', 'DL', '', '', '', 'TW', '', '', '', 'DL', '', '', 'TW'],
    ['', 'DW', '', '', '', 'TL', '', '', '', 'TL', '', '', '', 'DW', ''],
    ['', '', 'DW', '', '', '', 'DL', '', 'DL', '', '', '', 'DW', '', ''],
    ['DL', '', '', 'DW', '', '', '', 'DL', '', '', '', 'DW', '', '', 'DL'],
    ['', '', '', '', 'DW', '', '', '', '', '', 'DW', '', '', '', ''],
    ['', 'TL', '', '', '', 'TL', '', '', '', 'TL', '', '', '', 'TL', ''],
    ['', '', 'DL', '', '', '', 'DL', '', 'DL', '', '', '', 'DL', '', ''],
    ['TW', '', '', 'DL', '', '', '', 'STAR', '', '', '', 'DL', '', '', 'TW'],
    ['', '', 'DL', '', '', '', 'DL', '', 'DL', '', '', '', 'DL', '', ''],
    ['', 'TL', '', '', '', 'TL', '', '', '', 'TL', '', '', '', 'TL', ''],
    ['', '', '', '', 'DW', '', '', '', '', '', 'DW', '', '', '', ''],
    ['DL', '', '', 'DW', '', '', '', 'DL', '', '', '', 'DW', '', '', 'DL'],
    ['', '', 'DW', '', '', '', 'DL', '', 'DL', '', '', '', 'DW', '', ''],
    ['', 'DW', '', '', '', 'TL', '', '', '', 'TL', '', '', '', 'DW', ''],
    ['TW', '', '', 'DL', '', '', '', 'TW', '', '', '', 'DL', '', '', 'TW'],
];

const bonusClasses: { [key: string]: string } = {
    'TW': 'bg-red-500 text-white', 'DW': 'bg-pink-300 text-pink-800',
    'TL': 'bg-blue-500 text-white', 'DL': 'bg-sky-300 text-sky-800',
    'STAR': 'bg-primary text-primary-foreground', '': 'bg-secondary/30'
};

const tileValues: { [key: string]: number } = {
    'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1, 'F': 4, 'G': 2, 'H': 4, 'I': 1,
    'J': 8, 'K': 5, 'L': 1, 'M': 3, 'N': 1, 'O': 1, 'P': 3, 'Q': 10, 'R': 1,
    'S': 1, 'T': 1, 'U': 1, 'V': 4, 'W': 4, 'X': 8, 'Y': 4, 'Z': 10, ' ': 0
};

const initialTileBag = "EEEEEEEEEEEEAAAAAAAAAIIIIIIIIIOOOOOOOONNNNNNRRRRRRTTTTTTLLLLSSSSUUUUDDDDGGGBBCCMMPPFFHHVVWWYYKJXQZ".split('');

interface Tile { id: number; letter: string; }
interface BoardTile extends Tile { x: number; y: number; }
type PlacedTile = Tile | BoardTile;

function ScrabbleGameComponent() {
    const [boardState, setBoardState] = useState<(string | null)[]>(Array(225).fill(null));
    const [playerTiles, setPlayerTiles] = useState<Tile[]>([]);
    const [tileBag, setTileBag] = useState(initialTileBag);
    const [playerScore, setPlayerScore] = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);
    const [turn, setTurn] = useState<'player1' | 'player2'>('player1');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentMove, setCurrentMove] = useState<BoardTile[]>([]);
    const { toast } = useToast();
    const [passDialogOpen, setPassDialogOpen] = useState(false);
    const [selectedRackTile, setSelectedRackTile] = useState<Tile | null>(null);

    let tileIdCounter = 0;

    const drawTiles = useCallback((currentBag: string[], count: number) => {
        const drawnTiles: Tile[] = [];
        const remainingBag = [...currentBag];
        
        for (let i = 0; i < count; i++) {
            if (remainingBag.length > 0) {
                const randIndex = Math.floor(Math.random() * remainingBag.length);
                const letter = remainingBag.splice(randIndex, 1)[0];
                drawnTiles.push({ id: tileIdCounter++, letter });
            }
        }
        return { drawnTiles, newBag: remainingBag };
    }, [tileIdCounter]);

    useEffect(() => {
        const { drawnTiles, newBag } = drawTiles(initialTileBag, 7);
        setPlayerTiles(drawnTiles);
        setTileBag(newBag);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRackTileClick = (tile: Tile) => {
        if (isSubmitting) return;
        setSelectedRackTile(tile.id === selectedRackTile?.id ? null : tile);
    };

    const handleBoardClick = (x: number, y: number) => {
        if (isSubmitting) return;
        const boardIndex = y * 15 + x;
        const isOccupied = boardState[boardIndex] !== null || currentMove.some(m => m.x === x && m.y === y);

        if (selectedRackTile && !isOccupied) {
            const newMove: BoardTile = { ...selectedRackTile, x, y };
            setCurrentMove(prev => [...prev, newMove]);
            setPlayerTiles(prev => prev.filter(t => t.id !== selectedRackTile.id));
            setSelectedRackTile(null);
        } else if (!selectedRackTile) {
            const tileOnThisSquare = currentMove.find(m => m.x === x && m.y === y);
            if (tileOnThisSquare) {
                setCurrentMove(prev => prev.filter(m => m.id !== tileOnThisSquare.id));
                setPlayerTiles(prev => [...prev, {id: tileOnThisSquare.id, letter: tileOnThisSquare.letter}]);
            }
        }
    };
    
    const recallTiles = () => {
        const recalledTiles: Tile[] = currentMove.map(m => ({id: m.id, letter: m.letter}));
        setPlayerTiles(prev => [...prev, ...recalledTiles]);
        setCurrentMove([]);
        setSelectedRackTile(null);
    };

    const handleShuffle = () => {
        setPlayerTiles(prev => {
            const shuffled = [...prev];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        });
    };

    const handleSubmit = async () => {
        if(currentMove.length === 0) {
            toast({ title: "No move made", description: "Place some tiles on the board first.", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        // This is a simplified validation and scoring logic.
        let score = 0;
        let wordMultiplier = 1;
        
        currentMove.forEach(tile => {
            const { x, y } = tile;
            const bonus = boardLayout[y][x];
            let letterScore = tileValues[tile.letter];

            if (bonus === 'DL') letterScore *= 2;
            if (bonus === 'TL') letterScore *= 3;
            if (bonus === 'DW' || bonus === 'STAR') wordMultiplier *= 2;
            if (bonus === 'TW') wordMultiplier *= 3;
            score += letterScore;
        });

        score *= wordMultiplier;
        
        if(turn === 'player1') {
            setPlayerScore(s => s + score);
        } else {
            setOpponentScore(s => s + score);
        }

        const newBoardState = [...boardState];
        currentMove.forEach(t => { newBoardState[t.y * 15 + t.x] = t.letter; });
        setBoardState(newBoardState);
        
        const { drawnTiles, newBag } = drawTiles(tileBag, currentMove.length);
        setPlayerTiles(prev => [...prev, ...drawnTiles]);
        setTileBag(newBag);

        setCurrentMove([]);
        toast({ title: "Word Submitted!", description: `You scored ${score} points!` });
        setTurn(t => t === 'player1' ? 'player2' : 'player1');
        setIsSubmitting(false);
    };
    
    const handlePass = () => {
        setPassDialogOpen(false);
        setTurn(t => t === 'player1' ? 'player2' : 'player1');
        toast({ title: "Turn Passed", description: `It's now ${turn === 'player1' ? 'Player 2' : 'Player 1'}'s turn.` });
    };

    const TileDisplay = ({ tile, isSelected, onClick }: { tile: Tile, isSelected: boolean, onClick: (tile: Tile) => void }) => {
        const value = tileValues[tile.letter] || 0;
        return (
            <div 
                className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 bg-yellow-200 border-2 border-yellow-400 rounded-md flex items-center justify-center text-lg sm:text-xl font-bold text-gray-800 shadow-sm cursor-pointer relative transition-all",
                    isSelected ? "ring-2 ring-primary-foreground ring-offset-2 ring-offset-primary" : ""
                )}
                onClick={() => onClick(tile)}
            >
                {tile.letter}
                <span className="absolute bottom-0 right-1 text-xs font-semibold">{value}</span>
            </div>
        );
    };

    return (
        <div className="w-full max-w-4xl mt-4 flex flex-col items-center gap-4">
            <div className="w-full max-w-lg flex justify-between items-center px-2">
                <Card className={cn("text-center transition-all", turn === 'player1' && "border-primary ring-2 ring-primary")}>
                    <CardHeader className="p-2 pb-0"><CardTitle className="text-lg">Player 1</CardTitle></CardHeader>
                    <CardContent className="p-2 pt-0"><p className="text-2xl font-bold">{playerScore}</p></CardContent>
                </Card>
                <div className="text-center">
                    <h2 className="text-xl font-bold">
                        {turn === 'player1' ? "Player 1's Turn" : "Player 2's Turn"}
                    </h2>
                    {isSubmitting && <Loader2 className="h-6 w-6 animate-spin mx-auto" />}
                </div>
                <Card className={cn("text-center transition-all", turn === 'player2' && "border-primary ring-2 ring-primary")}>
                    <CardHeader className="p-2 pb-0"><CardTitle className="text-lg">Player 2</CardTitle></CardHeader>
                    <CardContent className="p-2 pt-0"><p className="text-2xl font-bold">{opponentScore}</p></CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-15 gap-px p-1 sm:p-2 bg-background/80 rounded-lg shadow-2xl w-full aspect-square max-w-lg mx-auto">
                {boardLayout.flat().map((bonus, index) => {
                    const x = index % 15;
                    const y = Math.floor(index / 15);
                    const placedTile = currentMove.find(t => t.x === x && t.y === y);
                    const permanentTileLetter = boardState[index];

                    return (
                        <div key={index} onClick={() => handleBoardClick(x, y)} className={cn("aspect-square flex items-center justify-center rounded-sm text-xs font-bold relative transition-all", bonusClasses[bonus], selectedRackTile && "cursor-pointer hover:bg-opacity-70")}>
                           {bonusText(bonus)}
                            <div className="w-full h-full p-px z-10">
                               {placedTile && <PlacedTileDisplay letter={placedTile.letter} />}
                               {permanentTileLetter && !placedTile && <PlacedTileDisplay letter={permanentTileLetter} isPermanent />}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <Card className="w-full max-w-lg bg-background/80">
                <CardHeader className="p-4">
                    <CardTitle>Your Tiles</CardTitle>
                    <CardDescription>Remaining in bag: {tileBag.length}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 p-4 pt-0">
                    <div className="flex justify-center items-center gap-1 sm:gap-2 p-2 bg-secondary/30 rounded-md min-h-[60px] sm:min-h-[68px] w-full">
                        {playerTiles.map((tile) => (
                           <TileDisplay 
                             key={tile.id}
                             tile={tile}
                             isSelected={selectedRackTile?.id === tile.id}
                             onClick={handleRackTileClick}
                           />
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send />}
                            Submit Word
                        </Button>
                        <Button variant="outline" onClick={handleShuffle} disabled={isSubmitting}><Shuffle />Shuffle</Button>
                        <Button variant="outline" onClick={recallTiles} disabled={currentMove.length === 0 || isSubmitting}><Undo />Recall</Button>
                        <Button variant="destructive" onClick={() => setPassDialogOpen(true)} disabled={isSubmitting}>Pass</Button>
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={passDialogOpen} onOpenChange={setPassDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to pass?</AlertDialogTitle>
                    <AlertDialogDescription>
                       Passing your turn will skip your move. Are you sure?
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePass} className="bg-destructive hover:bg-destructive/90">Yes, Pass Turn</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <style>{`.grid-cols-15 { grid-template-columns: repeat(15, minmax(0, 1fr)); }`}</style>
        </div>
    );
}

const PlacedTileDisplay = ({ letter, isPermanent = false }: { letter: string, isPermanent?: boolean }) => {
    const value = tileValues[letter] || 0;
    return (
        <div className={cn(
            "h-full w-full flex items-center justify-center text-lg sm:text-xl font-bold text-gray-800 shadow-inner rounded-sm relative",
            isPermanent ? "bg-yellow-300/80 border border-yellow-500" : "bg-yellow-200 border-2 border-yellow-400"
        )}>
            {letter}
            <span className="absolute bottom-0 right-1 text-xs font-semibold">{value}</span>
        </div>
    );
};

const bonusText = (bonus: string) => {
    if (!bonus) return null;
    const text = bonus === 'STAR' ? '★' : bonus?.replace('W', ' Word').replace('L', ' Letter');
    return <span className="absolute z-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center leading-none text-[8px] sm:text-[10px] font-bold uppercase whitespace-pre-wrap">{text}</span>;
}

export default function ScrabbleGame() {
    return <ScrabbleGameComponent />;
}
