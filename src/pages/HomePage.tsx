import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Article, Category } from '@/lib/types';
import { ArticleCardLarge, ArticleCardMedium, ArticleCardList } from '@/components/ArticleCard';
import { AdUnit } from '@/components/AdUnit';
import { Link } from '@/context/RouterContext';
import { TrendingUp, Flame, ArrowRight } from 'lucide-react';
import { useHomeSEO } from '@/lib/seo';

export function HomePage() {
  useHomeSEO();
  const [featured, setFeatured] = useState<Article[]>([]);
  const [latest, setLatest] = useState<Article[]>([]);
  const [trending, setTrending] = useState<Article[]>([]);
  const [byCategory, setByCategory] = useState<{ category: Category; articles: Article[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: featData } = await supabase
        .from('articles')
        .select('*, category:categories(*)')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(5);

      setFeatured(featData ?? []);

      const { data: latestData } = await supabase
        .from('articles')
        .select('*, category:categories(*)')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(7);

      setLatest(latestData ?? []);

      const { data: trendingData } = await supabase
        .from('articles')
        .select('*, category:categories(*)')
        .eq('status', 'published')
        .order('views', { ascending: false })
        .limit(5);

      setTrending(trendingData ?? []);

      const { data: cats } = await supabase.from('categories').select('*').order('name');

      if (cats) {
        const sections: { category: Category; articles: Article[] }[] = [];
        for (const cat of cats.slice(0, 4)) {
          const { data: catArticles } = await supabase
            .from('articles')
            .select('*, category:categories(*)')
            .eq('status', 'published')
            .eq('category_id', cat.id)
            .order('published_at', { ascending: false })
            .limit(4);
          if (catArticles && catArticles.length > 0) {
            sections.push({ category: cat, articles: catArticles });
          }
        }
        setByCategory(sections);
      }

      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="animate-pulse space-y-6">
          <div className="h-96 bg-gray-200 rounded-2xl" />
          <div className="grid grid-cols-3 gap-6">
            <div className="h-64 bg-gray-200 rounded-xl" />
            <div className="h-64 bg-gray-200 rounded-xl" />
            <div className="h-64 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const heroArticle = featured[0];
  const secondaryArticles = featured.slice(1, 5);

  return (
    <div>
      {/* Hero section */}
      {heroArticle && (
        <section className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ArticleCardLarge article={heroArticle} />
            </div>
            <div className="space-y-4">
              {secondaryArticles.slice(0, 2).map((a) => (
                <ArticleCardMedium key={a.id} article={a} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top banner ad */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <AdUnit label="Monetag — 728x90 Banner" className="h-[90px] rounded-lg" />
      </div>

      {/* Trending + Latest */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Latest news */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <Flame className="text-rose-600" size={26} />
                Latest News
              </h2>
              <Link to="/category/all" className="text-sm text-rose-600 font-semibold hover:text-rose-700 flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-1">
              {latest.map((a, i) => (
                <ArticleCardList key={a.id} article={a} index={i} />
              ))}
            </div>
          </div>

          {/* Trending sidebar */}
          <div>
            <div className="bg-slate-50 rounded-2xl p-5 sticky top-32">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 mb-4">
                <TrendingUp className="text-rose-600" size={22} />
                Trending Now
              </h2>
              <div className="divide-y divide-gray-200">
                {trending.map((a, i) => (
                  <div key={a.id} className="flex gap-3 py-3 first:pt-0">
                    <span className="text-2xl font-extrabold text-rose-600/30 w-8 flex-shrink-0">{i + 1}</span>
                    <Link to={`/article/${a.slug}`} className="group">
                      <h4 className="text-slate-900 text-sm font-semibold leading-snug group-hover:text-rose-600 transition-colors line-clamp-3">
                        {a.title}
                      </h4>
                      <span className="text-slate-400 text-xs mt-1 block">
                        {a.views.toLocaleString()} views
                      </span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar ad */}
            <div className="mt-6">
              <AdUnit label="Monetag — 300x250 Sidebar" className="h-[250px] rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* In-feed native ad */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <AdUnit label="Monetag — Native In-Feed Ad" className="h-[120px] rounded-xl" />
      </div>

      {/* Category sections */}
      {byCategory.map((section, idx) => (
        <section key={section.category.id} className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6 border-b-2 border-slate-900 pb-3">
            <h2 className="text-2xl font-extrabold text-slate-900">{section.category.name}</h2>
            <Link
              to={`/category/${section.category.slug}`}
              className="text-sm text-rose-600 font-semibold hover:text-rose-700 flex items-center gap-1"
            >
              More {section.category.name} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {section.articles.map((a) => (
              <ArticleCardMedium key={a.id} article={a} />
            ))}
          </div>
          {idx === 0 && (
            <div className="mt-8">
              <AdUnit label="Monetag — 970x250 Billboard" className="h-[120px] rounded-lg" />
            </div>
          )}
        </section>
      ))}

      {/* No content state */}
      {featured.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Welcome to ThePulse</h2>
          <p className="text-slate-500 max-w-lg mx-auto">
            No articles have been published yet. Check back soon for the latest news.
          </p>
        </div>
      )}
    </div>
  );
}
