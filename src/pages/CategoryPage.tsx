import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Article, Category } from '@/lib/types';
import { ArticleCardMedium, ArticleCardList } from '@/components/ArticleCard';
import { AdUnit } from '@/components/AdUnit';
import { useRouter } from '@/context/RouterContext';
import { useCategorySEO } from '@/lib/seo';

export function CategoryPage({ slug }: { slug: string }) {
  const { navigate } = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useCategorySEO(category);

  useEffect(() => {
    (async () => {
      setLoading(true);

      if (slug === 'all') {
        setCategory({ id: 'all', name: 'All News', slug: 'all', created_at: '' });
        const { data } = await supabase
          .from('articles')
          .select('*, category:categories(*)')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(30);
        setArticles(data ?? []);
      } else {
        const { data: cat } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (cat) {
          setCategory(cat);
          const { data: arts } = await supabase
            .from('articles')
            .select('*, category:categories(*)')
            .eq('status', 'published')
            .eq('category_id', cat.id)
            .order('published_at', { ascending: false })
            .limit(30);
          setArticles(arts ?? []);
        } else {
          setCategory(null);
        }
      }

      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-3 gap-6">
            <div className="h-64 bg-gray-200 rounded-xl" />
            <div className="h-64 bg-gray-200 rounded-xl" />
            <div className="h-64 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Category Not Found</h1>
        <button onClick={() => navigate('/')} className="px-6 py-3 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700">
          Back to Home
        </button>
      </div>
    );
  }

  const lead = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Category header */}
      <div className="mb-8 border-b-2 border-slate-900 pb-4">
        <h1 className="text-4xl font-extrabold text-slate-900">{category.name}</h1>
        <p className="text-slate-500 mt-2">{articles.length} article{articles.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Lead article */}
          {lead && (
            <div className="mb-6">
              <ArticleCardMedium article={lead} />
            </div>
          )}

          {/* Article list */}
          <div className="space-y-1">
            {rest.map((a) => (
              <ArticleCardList key={a.id} article={a} index={-1} />
            ))}
          </div>

          {articles.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-400 text-lg">No articles in this category yet.</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <AdUnit label="Monetag — 300x600 Sidebar" className="h-[600px] rounded-lg sticky top-32" />
        </div>
      </div>
    </div>
  );
}
