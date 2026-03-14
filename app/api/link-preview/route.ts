import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "No URL" }, { status: 400 });

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RealTalk/1.0)" },
    });
    const html = await res.text();

    const getMetaContent = (name: string): string | null => {
      const patterns = [
        new RegExp('<meta[^>]+(?:name|property)=[' + '"' + "'" + ']' + name + '[' + '"' + "'" + '][^>]+content=[' + '"' + "'" + ']([^' + '"' + "'" + ']*)[' + '"' + "'" + ']', 'i'),
        new RegExp('<meta[^>]+content=[' + '"' + "'" + ']([^' + '"' + "'" + ']*)[' + '"' + "'" + '][^>]+(?:name|property)=[' + '"' + "'" + ']' + name + '[' + '"' + "'" + ']', 'i'),
      ];
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) return match[1];
      }
      return null;
    };

    const titleMatch = html.match(/<title[^>]*>([^<]*)<[/]title>/i);

    return NextResponse.json({
      title: getMetaContent("og:title") || (titleMatch ? titleMatch[1] : url),
      description: getMetaContent("og:description") || getMetaContent("description") || "",
      image: getMetaContent("og:image") || "",
      url,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
