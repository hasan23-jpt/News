import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Article } from '@/lib/types';
import { Link } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import { FileText, Eye, TrendingUp, Clock, Pencil, Trash2, Plus, Search } from 'lucide-react';

export function AdminDashboard() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    const { data } = await supabase
      .from('articles')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false });
    setArticles(data ?? []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article? This cannot be undone.')) return;
    await supabase.from('articles').delete().eq('id', id);
    loadArticles();
  };

  const stats = {
    total: articles.length,
    published: articles.filter((a) => a.status === 'published').length,
    drafts: articles.filter((a) => a.status === 'draft').length,
    views: articles.reduce((sum, a) => sum + a.views, 0),
  };

  const filtered = articles.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || a.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin top bar */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-600 to-red-700 rounded-lg flex items-center justify-center">
                <FileText size={18} className="text-white" />
              </div>
              <span className="font-bold text-lg">ThePulse Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/" className="text-slate-300 hover:text-white">View Site</Link>
            <span className="text-slate-400">{user?.email}</span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-rose-400 hover:text-rose-300 font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm font-medium">Total Articles</span>
              <FileText size={20} className="text-slate-400" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm font-medium">Published</span>
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-green-600">{stats.published}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm font-medium">Drafts</span>
              <Clock size={20} className="text-slate-400" />
            </div>
            <p className="text-3xl font-extrabold text-amber-500">{stats.drafts}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm font-medium">Total Views</span>
              <TrendingUp size={20} className="text-slate-400" />
            </div>
            <p className="text-3xl font-extrabold text-rose-600">{stats.views.toLocaleString()}</p>
          </div>
        </div>

        {/* Articles table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-xl font-bold text-slate-900">Articles</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search articles..."
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 w-48"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'published' | 'draft')}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              >
                <option value="all">All</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
              </select>
              <Link
                to="/admin/articles/new"
                className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition-colors"
              >
                <Plus size={16} /> New Article
              </Link>
              <Link
                to="/admin/categories"
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors"
              >
                Categories
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="p-8 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-slate-400 mb-4">No articles found.</p>
              <Link
                to="/admin/articles/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700"
              >
                <Plus size={16} /> Create your first article
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-3 font-semibold">Title</th>
                    <th className="px-6 py-3 font-semibold hidden md:table-cell">Category</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold hidden lg:table-cell">Views</th>
                    <th className="px-6 py-3 font-semibold hidden lg:table-cell">Date</th>
                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {a.image_url && (
                            <img src={a.image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 text-sm line-clamp-1">{a.title}</p>
                            {a.is_featured && <span className="text-[10px] text-rose-600 font-bold uppercase">Featured</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        {a.category && (
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium">
                            {a.category.name}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          a.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell text-sm text-slate-600">
                        <span className="flex items-center gap-1"><Eye size={14} /> {a.views.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell text-sm text-slate-500">
                        {new Date(a.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/admin/articles/${a.id}`}
                            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Pencil size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(a.id)}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
