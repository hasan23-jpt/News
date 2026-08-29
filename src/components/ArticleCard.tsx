import { Link } from '@/context/RouterContext';
import { Article } from '@/lib/types';
import { Clock, Eye } from 'lucide-react';

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

export function ArticleCardLarge({ article }: { article: Article }) {
  return (
    <Link to={`/article/${article.slug}`} className="group block relative overflow-hidden rounded-2xl bg-slate-900 shadow-lg">
      <div className="aspect-[16/10] overflow-hidden">
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900" />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        {article.category && (
          <span className="inline-block bg-rose-600 text-white text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded mb-3">
            {article.category.name}
          </span>
        )}
        <h2 className="text-white text-2xl md:text-3xl font-bold leading-tight mb-2 group-hover:text-rose-200 transition-colors">
          {article.title}
        </h2>
        {article.excerpt && (
          <p className="text-slate-200 text-sm md:text-base line-clamp-2 mb-3">{article.excerpt}</p>
        )}
        <div className="flex items-center gap-4 text-slate-300 text-xs">
          <span className="flex items-center gap-1"><Clock size={12} /> {timeAgo(article.published_at)}</span>
          <span className="flex items-center gap-1"><Eye size={12} /> {article.views.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
}

export function ArticleCardMedium({ article }: { article: Article }) {
  return (
    <Link to={`/article/${article.slug}`} className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="aspect-[16/9] overflow-hidden">
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300" />
        )}
      </div>
      <div className="p-4">
        {article.category && (
          <span className="text-rose-600 text-xs font-semibold uppercase tracking-wider mb-2 block">
            {article.category.name}
          </span>
        )}
        <h3 className="text-slate-900 font-bold text-base leading-snug mb-2 group-hover:text-rose-600 transition-colors line-clamp-2">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-slate-500 text-sm line-clamp-2 mb-3">{article.excerpt}</p>
        )}
        <div className="flex items-center gap-3 text-slate-400 text-xs">
          <span className="flex items-center gap-1"><Clock size={12} /> {timeAgo(article.published_at)}</span>
          <span className="flex items-center gap-1"><Eye size={12} /> {article.views.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
}

export function ArticleCardSmall({ article }: { article: Article }) {
  return (
    <Link to={`/article/${article.slug}`} className="group flex gap-3 items-start py-3">
      <div className="w-24 h-20 flex-shrink-0 overflow-hidden rounded-lg">
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        {article.category && (
          <span className="text-rose-600 text-[10px] font-semibold uppercase tracking-wider">
            {article.category.name}
          </span>
        )}
        <h4 className="text-slate-900 text-sm font-semibold leading-snug group-hover:text-rose-600 transition-colors line-clamp-2">
          {article.title}
        </h4>
        <span className="text-slate-400 text-xs mt-1 block">{timeAgo(article.published_at)}</span>
      </div>
    </Link>
  );
}

export function ArticleCardList({ article, index }: { article: Article; index: number }) {
  return (
    <Link to={`/article/${article.slug}`} className="group flex gap-4 items-start py-4 border-b border-gray-100 last:border-0">
      {article.image_url && (
        <div className="w-28 h-24 md:w-40 md:h-28 flex-shrink-0 overflow-hidden rounded-lg">
          <img
            src={article.image_url}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {article.category && (
          <span className="text-rose-600 text-xs font-semibold uppercase tracking-wider">
            {article.category.name}
          </span>
        )}
        <h3 className="text-slate-900 font-bold text-base md:text-lg leading-snug mt-1 group-hover:text-rose-600 transition-colors line-clamp-2">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-slate-500 text-sm line-clamp-2 mt-1 hidden md:block">{article.excerpt}</p>
        )}
        <div className="flex items-center gap-3 text-slate-400 text-xs mt-2">
          <span className="flex items-center gap-1"><Clock size={12} /> {timeAgo(article.published_at)}</span>
          <span className="flex items-center gap-1"><Eye size={12} /> {article.views.toLocaleString()}</span>
        </div>
        {index >= 0 && <span className="text-3xl font-extrabold text-gray-200 absolute -left-8 top-2 hidden md:block">{index + 1}</span>}
      </div>
    </Link>
  );
}
