
import ScrabbleGame from "@/components/scrabble/ScrabbleGame";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ScrabblePage() {
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
          Scrabble <span className="gradient-text">Challenge</span>
        </h1>
        <p className="mt-4 max-w-2xl text-center text-lg text-muted-foreground">
          A prototype of the classic word game. The full game logic and AI are under development.
        </p>
        <ScrabbleGame />
      </div>
    </div>
  );
}
