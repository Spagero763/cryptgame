import SlidingPuzzle from "@/components/puzzle/SlidingPuzzle";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export default function PuzzlePage({ params }: { params: { id: string } }) {
  const puzzleId = params.id;
  const puzzleImage = PlaceHolderImages.find(img => img.id === puzzleId);

  if (!puzzleImage) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center">
        <div className="relative w-full text-center mb-8">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 flex gap-2">
              <Link href="/puzzle" passHref>
                  <Button variant="outline" size="icon">
                      <ArrowLeft className="h-4 w-4" />
                      <span className="sr-only">Back to puzzles</span>
                  </Button>
              </Link>
              <Link href="/" passHref>
                  <Button variant="outline">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Menu
                  </Button>
              </Link>
            </div>
            <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Sliding <span className="gradient-text">Puzzle</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Arrange the tiles to solve the puzzle.
            </p>
        </div>
        
        <div className="grid w-full max-w-6xl grid-cols-1 items-start gap-8 lg:grid-cols-2">
            <div className="flex flex-col items-center gap-4">
                <h2 className="text-2xl font-bold text-center">Reference Image</h2>
                <Card className="shadow-2xl shadow-primary/10 border-primary/20 border overflow-hidden w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-none">
                    <CardContent className="p-0">
                        <Image
                            src={puzzleImage.imageUrl}
                            alt={puzzleImage.description}
                            data-ai-hint={puzzleImage.imageHint}
                            width={500}
                            height={500}
                            className="object-cover w-full h-auto"
                        />
                    </CardContent>
                </Card>
            </div>
            <div className="flex flex-col items-center">
                <SlidingPuzzle imageUrl={puzzleImage.imageUrl} />
            </div>
        </div>

      </div>
    </div>
  );
}
