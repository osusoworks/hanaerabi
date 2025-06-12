
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Define types for selection options (can be moved to a types file later)
type Purpose = 'お祝い' | '感謝' | '告白' | '記念日' | 'お供え' | '自宅用' | 'その他';
type Taste = 'キュート' | 'ゴージャス' | 'シンプル' | 'クラシック' | 'カジュアル' | 'フォーマル' | 'その他';
type Color = '赤' | 'ピンク' | 'オレンジ' | '黄' | '白' | '緑' | '青' | '紫' | 'ミックス' | 'おまかせ';
type Budget = '低' | '中' | '高' | '指定なし';

export default function SelectPage() {
  const router = useRouter();
  const [purpose, setPurpose] = useState<Purpose | ''>('');
  const [taste, setTaste] = useState<Taste | ''>('');
  const [color, setColor] = useState<Color | ''>('');
  const [budget, setBudget] = useState<Budget | ''>('');

  const handleSubmit = () => {
    // Basic validation (optional, can be enhanced)
    // if (!purpose || !taste || !color || !budget) {
    //   alert('すべての項目を選択してください。');
    //   return;
    // }

    const query = new URLSearchParams({
      purpose: purpose || '指定なし',
      taste: taste || '指定なし',
      color: color || '指定なし',
      budget: budget || '指定なし',
    }).toString();

    router.push(`/results?${query}`);
  };

  // Options (can be loaded from a config file or data source later)
  const purposeOptions: Purpose[] = ['お祝い', '感謝', '告白', '記念日', 'お供え', '自宅用', 'その他'];
  const tasteOptions: Taste[] = ['キュート', 'ゴージャス', 'シンプル', 'クラシック', 'カジュアル', 'フォーマル', 'その他'];
  const colorOptions: Color[] = ['赤', 'ピンク', 'オレンジ', '黄', '白', '緑', '青', '紫', 'ミックス', 'おまかせ'];
  const budgetOptions: Budget[] = ['低', '中', '高', '指定なし']; // Low: ~3000, Mid: ~5000, High: 8000+ (Example)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[hsl(var(--secondary))] via-[hsl(var(--background))] to-[hsl(var(--accent))] p-4 md:p-8">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-semibold text-center text-foreground font-sans">お花の条件を選んでください</CardTitle>
          <CardDescription className="text-center text-muted-foreground">あなたのイメージに合うお花を見つけましょう</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Purpose Selection */}
          <div>
            <Label className="text-lg font-medium text-foreground mb-2 block">1. ご用途は？</Label>
            <RadioGroup
              value={purpose}
              onValueChange={(value) => setPurpose(value as Purpose)}
              className="grid grid-cols-2 sm:grid-cols-3 gap-2"
            >
              {purposeOptions.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`purpose-${option}`} />
                  <Label htmlFor={`purpose-${option}`} className="font-normal">{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Taste Selection */}
          <div>
            <Label className="text-lg font-medium text-foreground mb-2 block">2. 雰囲気・テイストは？</Label>
            <RadioGroup
              value={taste}
              onValueChange={(value) => setTaste(value as Taste)}
              className="grid grid-cols-2 sm:grid-cols-3 gap-2"
            >
              {tasteOptions.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`taste-${option}`} />
                  <Label htmlFor={`taste-${option}`} className="font-normal">{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Color Selection */}
          <div>
            <Label htmlFor="color-select" className="text-lg font-medium text-foreground mb-2 block">3. メインの色は？</Label>
            <Select value={color} onValueChange={(value) => setColor(value as Color)}>
              <SelectTrigger id="color-select" className="w-full">
                <SelectValue placeholder="色を選択..." />
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Budget Selection */}
          <div>
            <Label htmlFor="budget-select" className="text-lg font-medium text-foreground mb-2 block">4. ご予算感は？</Label>
            <Select value={budget} onValueChange={(value) => setBudget(value as Budget)}>
              <SelectTrigger id="budget-select" className="w-full">
                <SelectValue placeholder="予算を選択..." />
              </SelectTrigger>
              <SelectContent>
                {budgetOptions.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">目安: 低(〜3千円), 中(〜5千円), 高(8千円〜)</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center mt-6">
          <Button
            size="lg"
            onClick={handleSubmit}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-10 py-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            結果を見る
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

