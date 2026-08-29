import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const CATEGORIES = [
  { name: "World", slug: "world", query: "world news", categoryId: "6398d18a-4db8-41ee-8b7a-0d2f9ecf73e4" },
  { name: "Politics", slug: "politics", query: "politics", categoryId: "54320121-3507-426b-b95a-2aa4d3688784" },
  { name: "Business", slug: "business", query: "business finance", categoryId: "b77294fa-d4da-49f9-a592-452e9e490ccf" },
  { name: "Technology", slug: "technology", query: "technology AI", categoryId: "73802dec-3acf-47bb-b480-ae80bef132b3" },
  { name: "Sports", slug: "sports", query: "sports", categoryId: "62f33753-bbdf-427a-85d9-4f84d9bc3993" },
];

interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

function extractImageFromDescription(html: string): string | null {
  const match = html.match(/<img[^>]+src="([^"]+)"/);
  return match ? match[1] : null;
}

async function fetchGoogleNews(query: string): Promise<RSSItem[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
  const resp = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; ThePulseBot/1.0)" },
  });
  if (!resp.ok) return [];
  const xml = await resp.text();

  const items: RSSItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(xml)) !== null && items.length < 3) {
    const block = match[1];
    const titleM = block.match(/<title>([\s\S]*?)<\/title>/);
    const linkM = block.match(/<link>([\s\S]*?)<\/link>/);
    const dateM = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    const descM = block.match(/<description>([\s\S]*?)<\/description>/);
    const sourceM = block.match(/<source[^>]*>([\s\S]*?)<\/source>/);

    const title = titleM ? stripHtml(titleM[1]) : "";
    const description = descM ? descM[1] : "";
    if (!title) continue;

    items.push({
      title,
      link: linkM ? linkM[1].trim() : "",
      pubDate: dateM ? dateM[1].trim() : "",
      description: stripHtml(description).slice(0, 300),
      source: sourceM ? stripHtml(sourceM[1]) : "Google News",
    });
  }
  return items;
}

async function fetchPexelsImage(query: string): Promise<string | null> {
  // Try extracting image from Google News description first
  // (handled separately in the caller via extractImageFromDescription)

  // Use a curated set of fallback images per category keyword
  const fallbackImages: Record<string, string> = {
    "world news": "https://images.pexels.com/photos/5186837/pexels-photo-5186837.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "politics": "https://images.pexels.com/photos/32266769/pexels-photo-32266769.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "business finance": "https://images.pexels.com/photos/35118208/pexels-photo-35118208.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "technology AI": "https://images.pexels.com/photos/8566534/pexels-photo-8566534.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "sports": "https://images.pexels.com/photos/33210166/pexels-photo-33210166.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  };

  if (fallbackImages[query]) return fallbackImages[query];

  // Try Pexels API
  try {
    const resp = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`, {
      headers: { Authorization: "563492ad6f917000010000014afb29f5f9d04c6ab18b938ceae4f4e3" },
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data.photos && data.photos.length > 0) {
        return data.photos[0].src.large2x;
      }
    }
  } catch { /* fall through */ }

  // Generic fallback — world news image
  return "https://images.pexels.com/photos/26560462/pexels-photo-26560462.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";
}

function generateArticleContent(item: RSSItem, categoryName: string): string {
  const description = item.description || "The latest details are still developing. Check back for verified updates.";
  const paragraphs = description
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => sentence.length > 20)
    .slice(0, 4);
  const body = paragraphs.length > 0 ? paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n") : `<p>${escapeHtml(description)}</p>`;
  const sourceName = item.source ? `<p><em>Source: ${escapeHtml(item.source)}</em></p>` : "";

  return `
<p><strong>${escapeHtml(categoryName)}:</strong> ${escapeHtml(item.title)}</p>
<h2>What happened</h2>
${body}
<h2>Why it matters</h2>
<p>This story is developing. Our newsroom will continue tracking the latest verified information and publish updates as they become available.</p>
${sourceName}
  `.trim();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const posted: { title: string; slug: string; category: string }[] = [];
    let skipped = 0;

    const { data: existingSlugs } = await adminClient
      .from("articles")
      .select("slug")
      .gte("created_at", new Date(Date.now() - 12 * 3600 * 1000).toISOString());

    const recentSlugs = new Set((existingSlugs ?? []).map((r: { slug: string }) => r.slug));

    for (const cat of CATEGORIES) {
      const items = await fetchGoogleNews(cat.query);
      let postedForCat = 0;

      for (const item of items) {
        if (postedForCat >= 1) break;

        const slug = slugify(item.title);
        if (!slug || recentSlugs.has(slug)) {
          skipped++;
          continue;
        }

        const rssImage = extractImageFromDescription(item.description);
        const imageUrl = rssImage ?? await fetchPexelsImage(cat.query);

        const articleData = {
          title: item.title.slice(0, 200),
          slug,
          excerpt: item.description.slice(0, 180) || `${cat.name} news update`,
          content: generateArticleContent(item, cat.name),
          image_url: imageUrl,
          category_id: cat.categoryId,
          status: "published",
          is_featured: false,
          published_at: new Date().toISOString(),
        };

        const { error } = await adminClient.from("articles").insert(articleData);
        if (!error) {
          posted.push({ title: item.title, slug, category: cat.name });
          recentSlugs.add(slug);
          postedForCat++;
        } else if (error.code === "23505") {
          skipped++;
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, posted: posted.length, skipped, articles: posted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
