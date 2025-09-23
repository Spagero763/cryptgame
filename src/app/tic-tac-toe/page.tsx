
import TicTacToeGame from "@/components/tic-tac-toe/TicTacToeGame";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TicTacToePage() {
  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative flex flex-col items-center">
        <Link href="/" passHref className="absolute left-0 top-0 sm:top-2">
            <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Menu
            </Button>
        </Link>
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-center mt-16 sm:mt-0">
          Tic Tac <span className="gradient-text">Toe</span>
        </h1>
        <p className="mt-4 max-w-xl text-center text-lg text-muted-foreground">
          Challenge the unbeatable AI or play against a friend. The first to get three in a row wins.
        </p>
        <Card className="w-full max-w-md mt-8 shadow-2xl shadow-primary/10 border-primary/20 border">
            <CardContent className="p-4 sm:p-6">
                 <TicTacToeGame />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
