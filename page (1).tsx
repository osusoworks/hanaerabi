
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Define the structure of a flower (align with flowers.json)
interface Flower {
  FlowerID: string;
  Name: string;
  Description: string;
  FlowerLanguage: string;
  PriceRange: string;
  Color: string[];
  Taste: string[];
  Purpose: string[];
  ImageUrl: string;
  Tags?: string[];
}

// Define the structure for API response
interface RecommendationResponse {
  recommendations: Flower[];
  mode: 'static' | 'openai'; // Indicate which logic was used
  level: 1 | 2; // Indicate if inventory was considered
  message?: string; // Optional message (e.g., about inventory status)
}

function ResultsDisplay() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFlower, setSelectedFlower] = useState<Flower | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      const query = searchParams.toString();
      console.log("Fetching results with query:", query);

      try {
        const response = await fetch(`/api/recommend?${query}`);
        console.log("API Response Status:", response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})); // Try to parse error body
          console.error("API Error Response Body:", errorData);
          throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
        }

        const data: RecommendationResponse = await response.json();
        console.log("API Response Data:", data);
        setResults(data);

      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching recommendations.');
      } finally {
        setLoading(false);
      }
    };

    // Ensure searchParams are available before fetching
    if (searchParams) {
        fetchResults();
    }

  }, [searchParams]); // Re-run effect when searchParams change

  if (loading) {
    return <div className="text-center p-10">おすすめを探しています...</div>;
  }

  if (error) {
    return (
        <div className="text-center p-10 text-red-600">
            <p>エラーが発生しました:</p>
            <p className="text-sm mt-2">{error}</p>
            <Link href="/select" passHref>
              <Button variant="outline" className="mt-4 border-pink-600 text-pink-600 hover:bg-pink-50">
                条件を変えて再試行
              </Button>
            </Link>
        </div>
    );
  }

  if (!results || results.recommendations.length === 0) {
    return (
        <div className="text-center p-10">
            <p>おすすめが見つかりませんでした。</p>
            <Link href="/select" passHref>
              <Button variant="outline" className="mt-4 border-pink-600 text-pink-600 hover:bg-pink-50">
                条件を変えて探し直す
              </Button>
            </Link>
        </div>
    );
  }

  return (
    <Dialog>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-white to-green-50 p-4 md:p-8">
        <Card className="w-full max-w-4xl shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl font-semibold text-center text-gray-800 font-serif">おすすめのお花</CardTitle>
            {results.message && <CardDescription className="text-center text-gray-600 pt-2">{results.message}</CardDescription>}
            {results.level === 1 && (
                 <CardDescription className="text-center text-xs text-orange-600 pt-1">※在庫状況は反映されていません。実際の在庫はお店にご確認ください。</CardDescription>
            )}
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.recommendations.map((flower) => (
              <DialogTrigger key={flower.FlowerID} asChild onClick={() => setSelectedFlower(flower)}>
                <Card className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
                  <div className="relative w-full h-48">
                    <Image 
                      src={flower.ImageUrl.replace('.jpg', '.webp')} 
                      alt={flower.Name} 
                      layout="fill" 
                      objectFit="cover" 
                      className="rounded-t-md" // Add rounding if desired
                    />
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg font-medium font-serif">{flower.Name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-sm text-gray-600">
                    <p className="line-clamp-2">{flower.Description}</p>
                  </CardContent>
                </Card>
              </DialogTrigger>
            ))}
          </CardContent>
        </Card>
        <Link href="/select" passHref>
          <Button variant="outline" className="border-pink-600 text-pink-600 hover:bg-pink-50">
            条件を変えて探し直す
          </Button>
        </Link>
      </div>

      {selectedFlower && (
        <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">{selectedFlower.Name}</DialogTitle>
            <DialogDescription>
              {selectedFlower.Description}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="relative w-full h-64 mb-4">
                <Image 
                  src={selectedFlower.ImageUrl.replace(".jpg", ".webp")} 
                  alt={selectedFlower.Name} 
                  layout="fill" 
                  objectFit="cover" 
                  className="rounded-md" // Add rounding if desired
                />
             </div>
            <p><strong>花言葉:</strong> {selectedFlower.FlowerLanguage}</p>
            <p><strong>色:</strong> {selectedFlower.Color.join(', ')}</p>
            <p><strong>雰囲気:</strong> {selectedFlower.Taste.join(', ')}</p>
            <p><strong>用途:</strong> {selectedFlower.Purpose.join(', ')}</p>
            <p><strong>価格帯:</strong> {selectedFlower.PriceRange}</p>
            {selectedFlower.Tags && <p><strong>タグ:</strong> {selectedFlower.Tags.join(', ')}</p>}
            {/* Add more details if needed */}
          </div>
          {/* Optional: Add action buttons like 'Add to cart' or 'Contact shop' */}
        </DialogContent>
      )}
    </Dialog>
  );
}

// Use Suspense to handle client-side data fetching triggered by searchParams
export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="text-center p-10">読み込み中...</div>}>
      <ResultsDisplay />
    </Suspense>
  );
}

