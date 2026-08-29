import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Article } from '@/lib/types';
import { Link, useRouter } from '@/context/RouterContext';
import { ArticleCardSmall } from '@/components/ArticleCard';
import { AdUnit } from '@/components/AdUnit';
import { Clock, Eye, Share2, ChevronLeft, Tag, Twitter, Facebook } from 'lucide-react';
import { useArticleSEO } from '@/lib/seo';

export function ArticlePage({ slug }: { slug: string }) {
  const { navigate } = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useArticleSEO(article);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('articles')
        .select('*, category:categories(*)')
        .eq('slug', slug)
        .maybeSingle();

      if (data) {
        setArticle(data);

        if (data.status === 'published') {
          supabase
            .from('articles')
            .update({ views: data.views + 1 })
            .eq('id', data.id)
            .then(() => {});
        }

        if (data.category_id) {
          const { data: relData } = await supabase
            .from('articles')
            .select('*, category:categories(*)')
            .eq('status', 'published')
            .eq('category_id', data.category_id)
            .neq('id', data.id)
            .order('published_at', { ascending: false })
            .limit(4);
          setRelated(relData ?? []);
        }
      } else {
        setArticle(null);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-12 bg-gray-200 rounded" />
          <div className="h-80 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Article Not Found</h1>
        <p className="text-slate-500 mb-6">The article you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <article>
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate(article.category ? `/category/${article.category.slug}` : '/')}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-rose-600 transition-colors mb-4"
        >
          <ChevronLeft size={16} /> {article.category ? article.category.name : 'Home'}
        </button>

        {/* Category tag */}
        {article.category && (
          <Link to={`/category/${article.category.slug}`} className="inline-flex items-center gap-1 text-rose-600 text-sm font-semibold uppercase tracking-wider mb-3 hover:text-rose-700">
            <Tag size={14} /> {article.category.name}
          </Link>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
          {article.title}
        </h1>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-lg text-slate-600 leading-relaxed mb-4">{article.excerpt}</p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between border-y border-gray-100 py-3 mb-6">
          <div className="flex items-center gap-4 text-slate-500 text-sm">
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {new Date(article.published_at ?? article.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={14} /> {article.views.toLocaleString()} views
            </span>
          </div>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: article.title, url: window.location.href });
              }
            }}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-rose-600 transition-colors"
          >
            <Share2 size={14} /> Share
          </button>
        </div>

        {/* Hero image */}
        {article.image_url && (
          <div className="rounded-2xl overflow-hidden mb-6 shadow-lg">
            <img src={article.image_url} alt={article.title} className="w-full" loading="lazy" />
          </div>
        )}

        {/* Top ad */}
        <AdUnit label="Monetag — In-Article Ad" className="h-[90px] rounded-lg mb-6" />
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4">
        {article.content ? (
          <div
            className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-a:text-rose-600 prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        ) : (
          <p className="text-slate-400 italic">No content available.</p>
        )}

        {/* Mid-article ad */}
        <div className="my-8">
          <AdUnit label="Monetag — In-Article Ad" className="h-[250px] rounded-lg" />
        </div>

        {/* Share buttons bottom */}
        <div className="border-t border-gray-100 pt-6 mt-8 flex items-center gap-3">
          <span className="text-sm text-slate-500 font-medium">Share this article:</span>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center hover:bg-rose-600 hover:text-white transition-colors text-slate-600"
          >
            <Twitter size={16} />
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center hover:bg-rose-600 hover:text-white transition-colors text-slate-600"
          >
            <Facebook size={16} />
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center hover:bg-rose-600 hover:text-white transition-colors text-slate-600"
          >
            <Share2 size={16} />
          </a>
        </div>
      </div>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 mt-8 border-t border-gray-100">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Related Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((a) => (
              <ArticleCardSmall key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
