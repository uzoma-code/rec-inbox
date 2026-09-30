import type { RecType } from "./types";

export type SimilarPick = {
  title: string;
  type: RecType;
  reason: string;
};

type OpenAIChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

async function completeSimilarPicks(userContent: string): Promise<SimilarPick[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return [];
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You recommend real, streamable movies and TV shows. Reply with JSON only: {\"suggestions\":[{\"title\":\"...\",\"type\":\"movie\"|\"show\",\"reason\":\"one short sentence\"}]}. Match tone and genre. No spoilers. Do not repeat titles the user already named.",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    }),
  });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as OpenAIChatResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    return [];
  }

  return parseSimilarPicks(content);
}

export async function fetchSimilarPicksFromOpenAI(
  title: string,
  type: RecType,
): Promise<SimilarPick[]> {
  return completeSimilarPicks(
    `Suggest 3 titles similar to the ${type} "${title}".`,
  );
}

export function formatTastePrompt(
  sources: Array<{ title: string; type: RecType }>,
): string {
  const list = sources
    .map((source) => `${source.title} (${source.type})`)
    .join(", ");
  return `These titles are on the user's New Faves list (5-star watched recs): ${list}. Suggest 5 similar real, streamable movies or shows. Do not repeat any of those titles.`;
}

export async function fetchSimilarPicksForTaste(
  sources: Array<{ title: string; type: RecType }>,
): Promise<SimilarPick[]> {
  if (sources.length === 0) {
    return [];
  }

  return completeSimilarPicks(formatTastePrompt(sources));
}

export function parseSimilarPicks(content: string): SimilarPick[] {
  try {
    const parsed = JSON.parse(content) as {
      suggestions?: Array<{
        title?: string;
        type?: string;
        reason?: string;
      }>;
    };

    return (parsed.suggestions ?? [])
      .map((item) => {
        const title = item.title?.trim() ?? "";
        const type: RecType = item.type === "show" ? "show" : "movie";
        const reason = item.reason?.trim() ?? "";
        if (!title) {
          return null;
        }
        return {
          title,
          type,
          reason: reason || `Similar to ${title}.`,
        };
      })
      .filter((item): item is SimilarPick => item !== null);
  } catch {
    return [];
  }
}
