import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Article } from '@/lib/types';
import { ArticleCardList } from '@/components/ArticleCard';
import { useRouter } from '@/context/RouterContext';
import { Search as SearchIcon } from 'lucide-react';
import { useSEO } from '@/lib/seo';

export function SearchPage({ query }: { query: string }) {
  const { navigate } = useRouter();
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useSEO({ title: `Search: ${query}`, description: `Search results for "${query}" on ThePulse` });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('articles')
        .select('*, category:categories(*)')
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
        .order('published_at', { ascending: false })
        .limit(20);
      setResults(data ?? []);
      setLoading(false);
    })();
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <SearchIcon className="text-rose-600" size={28} />
          Search Results
        </h1>
        <p className="text-slate-500 mt-2">
          {loading ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`}
        </p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-1">
          {results.map((a) => (
            <ArticleCardList key={a.id} article={a} index={-1} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-slate-400 text-lg mb-4">No articles found matching your search.</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700">
            Back to Home
          </button>
        </div>
      )}
    </div>
  );
}
