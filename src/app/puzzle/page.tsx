import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PuzzleSelectionPage() {
  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-center">
          Choose Your <span className="gradient-text">Puzzle</span>
        </h1>
        <p className="mt-4 max-w-2xl text-center text-lg text-muted-foreground">
          Select an image below to start solving your sliding puzzle.
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {PlaceHolderImages.map((puzzle) => (
           <Card key={puzzle.id} className="flex flex-col overflow-hidden rounded-xl border-2 bg-gradient-to-br from-card to-secondary/30 border-transparent transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2">
            <CardHeader className="p-0">
                <div className="aspect-square overflow-hidden">
                    <Image
                        src={puzzle.imageUrl}
                        alt={puzzle.description}
                        data-ai-hint={puzzle.imageHint}
                        width={400}
                        height={400}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col p-6">
                <CardTitle className="text-xl font-bold">{puzzle.description}</CardTitle>
            </CardContent>
            <CardFooter className="p-6 pt-0">
                <Link href={`/puzzle/${puzzle.id}`} passHref className="w-full">
                    <Button className="w-full" size="lg">Play Now</Button>
                </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
