import { NextResponse } from 'next/server';
import { URLSearchParams } from 'url';
import path from 'path';
import fs from 'fs/promises';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the structure of a flower (align with flowers.json)
interface Flower {
  FlowerID: string;
  Name: string;
  Description: string;
  FlowerLanguage: string;
  PriceRange: '低' | '中' | '高'; // Assuming these are the only valid values
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

// Helper function to read flower data
async function getFlowerData(): Promise<Flower[]> {
  // Construct the absolute path to the JSON file
  const jsonPath = path.join(process.cwd(), 'src', 'data', 'flowers.json');
  try {
    const jsonData = await fs.readFile(jsonPath, 'utf-8');
    return JSON.parse(jsonData) as Flower[];
  } catch (error) {
    console.error("Error reading flowers.json:", error);
    throw new Error("Could not load flower data.");
  }
}

// Basic budget matching logic
function budgetMatch(selection: string, itemPrice: '低' | '中' | '高'): boolean {
    if (selection === '指定なし') return true;
    if (selection === '低') return itemPrice === '低';
    if (selection === '中') return itemPrice === '低' || itemPrice === '中';
    if (selection === '高') return true; // High budget includes all price ranges
    return false;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const purpose = searchParams.get('purpose') || '指定なし';
    const taste = searchParams.get('taste') || '指定なし';
    const color = searchParams.get('color') || '指定なし';
    const budget = searchParams.get('budget') || '指定なし';
    const useOpenAI = searchParams.get('openai') === 'true'; // Add a flag to control OpenAI usage

    console.log("API Request Params:", { purpose, taste, color, budget, useOpenAI });

    const allFlowers = await getFlowerData();

    // --- Static Recommendation Logic (Level 1) ---
    const filteredFlowers = allFlowers.filter(flower => {
      let match = true;
      if (purpose !== '指定なし' && !flower.Purpose.includes(purpose)) match = false;
      if (taste !== '指定なし' && !flower.Taste.includes(taste)) match = false;
      if (color !== '指定なし' && color !== 'おまかせ' && !flower.Color.includes(color)) match = false;
      if (!budgetMatch(budget, flower.PriceRange)) match = false;
      return match;
    });

    let recommendations: Flower[] = [];
    let message = "";
    let mode: \'static\' | \'openai\' = \'static\';
    let level: 1 | 2 = 1; // Still Level 1 (no inventory)

    if (useOpenAI && process.env.OPENAI_API_KEY) {
      try {
        console.log("Attempting OpenAI recommendation...");
        const prompt = `
あなたは親切な花屋の店員です。
お客様が以下の条件でお花を探しています:
- 用途: ${purpose}
- 雰囲気・テイスト: ${taste}
- メインの色: ${color}
- 予算感: ${budget}

以下の花の中から、お客様の条件に最も合うものを最大3つまで選び、その理由（花言葉や用途、雰囲気など）を含めた、パーソナルで温かい推薦メッセージを作成してください。

利用可能な花リスト:
${JSON.stringify(filteredFlowers.length > 0 ? filteredFlowers : allFlowers, null, 2)}

出力は以下のJSON形式でお願いします:
{
  "recommendedFlowerIDs": ["花のID", ...],
  "message": "お客様への推薦メッセージ"
}
`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o", // Or another suitable model
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.7,
        });

        const content = completion.choices[0]?.message?.content;
        if (content) {
          console.log("OpenAI Response Content:", content);
          const aiResponse = JSON.parse(content);
          const recommendedIDs = aiResponse.recommendedFlowerIDs as string[];
          recommendations = allFlowers.filter(f => recommendedIDs.includes(f.FlowerID))
                                      .sort((a, b) => recommendedIDs.indexOf(a.FlowerID) - recommendedIDs.indexOf(b.FlowerID)); // Preserve OpenAI order
          message = aiResponse.message;
          mode = \'openai\';
          console.log("OpenAI Recommendation Successful:", { recommendedIDs, message });
        } else {
          throw new Error("OpenAI returned empty content.");
        }

      } catch (aiError) {
        console.error("OpenAI Recommendation Failed, falling back to static:", aiError);
        // Fallback to static logic if OpenAI fails
        recommendations = filteredFlowers.slice(0, 3);
        message = "AIによるおすすめ生成中にエラーが発生しました。代わりにこちらのおすすめをご提案します。";
        mode = \'static\';
      }
    } else {
      // Use static logic if OpenAI is not requested or API key is missing
      recommendations = filteredFlowers.slice(0, 3);
      mode = \'static\';
      console.log("Using Static Recommendation Logic.");
    }

    // Handle cases where no recommendations are found even after fallback
    if (recommendations.length === 0) {
        recommendations.push(...allFlowers.filter(f => f.Tags?.includes(\'定番\')).slice(0, 1));
        if (recommendations.length === 0 && allFlowers.length > 0) {
            recommendations.push(allFlowers[0]);
        }
        // Set message only if it wasn\'t set by OpenAI or fallback error
        if (!message) {
            message = "完全に一致するお花が見つかりませんでした。代わりにこちらはいかがでしょうか？";
        }
    } else if (!message) {
        // Set default static message if OpenAI wasn\'t used and no error occurred
        message = "あなたへのおすすめはこちらです！";
    }

    const response: RecommendationResponse = {
      recommendations,
      mode,
      level,
      message,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : \'Failed to get recommendations\' }, { status: 500 });
  }
}