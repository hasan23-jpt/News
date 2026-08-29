import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Category, ArticleInput } from '@/lib/types';
import { slugify } from '@/lib/slug';
import { Link, useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Save, Eye, Star, Image as ImageIcon, X } from 'lucide-react';

export function ArticleEditor({ articleId }: { articleId: string | null }) {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageSearch, setImageSearch] = useState('');


  const [form, setForm] = useState<ArticleInput>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image_url: '',
    category_id: null,
    status: 'draft',
    is_featured: false,
    published_at: null,
  });

  const isEditing = articleId !== null;

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      if (data) setCategories(data);
    });

    if (articleId) {
      supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setForm({
              title: data.title,
              slug: data.slug,
              excerpt: data.excerpt ?? '',
              content: data.content ?? '',
              image_url: data.image_url ?? '',
              category_id: data.category_id,
              status: data.status,
              is_featured: data.is_featured,
              published_at: data.published_at,
            });
          }
        });
    }
  }, [articleId]);

  const handleTitleChange = (title: string) => {
    setForm({ ...form, title, slug: isEditing ? form.slug : slugify(title) });
  };

  const handleSave = async (publishNow = false) => {
    setError(null);
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!form.slug.trim()) {
      setError('Slug is required');
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      status: publishNow ? 'published' as const : form.status,
      published_at: publishNow || form.status === 'published' ? form.published_at ?? new Date().toISOString() : form.published_at,
    };

    if (articleId) {
      const { error } = await supabase.from('articles').update(payload).eq('id', articleId);
      if (error) setError(error.message);
      else navigate('/admin');
    } else {
      const { error } = await supabase.from('articles').insert(payload);
      if (error) setError(error.message);
      else navigate('/admin');
    }
    setSaving(false);
  };

  const searchImages = async () => {
    if (!imageSearch.trim()) return;
    setError(null);
    setForm({ ...form, image_url: imageSearch.trim() });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <Link to="/admin" className="flex items-center gap-1 text-slate-300 hover:text-white text-sm min-w-0">
            <ArrowLeft size={18} className="flex-shrink-0" />
            <span className="truncate">Dashboard</span>
          </Link>
          <span className="text-slate-400 text-xs sm:text-sm truncate flex-shrink-0">{user?.email}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 sm:mb-6">
          {isEditing ? 'Edit Article' : 'New Article'}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter article title..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-lg font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">URL Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                  placeholder="url-friendly-slug"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Excerpt</label>
                <textarea
                  value={form.excerpt ?? ''}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Short summary that appears in listings..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Content (HTML)</label>
                <textarea
                  value={form.content ?? ''}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="<p>Write your article content here...</p>"
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-y"
                />
                <p className="text-xs text-slate-400 mt-1">Supports HTML tags: &lt;p&gt;, &lt;h2&gt;, &lt;h3&gt;, &lt;strong&gt;, &lt;a&gt;, &lt;img&gt;, &lt;blockquote&gt;, etc.</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Publish box */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-slate-900 mb-4">Publish</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as 'draft' | 'published' })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-sm text-slate-700 flex items-center gap-1">
                    <Star size={14} className="text-amber-500" /> Featured article
                  </span>
                </label>

                <div className="pt-3 space-y-2">
                  <button
                    onClick={() => handleSave(false)}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    <Save size={16} /> Save as {form.status === 'published' ? 'Published' : 'Draft'}
                  </button>
                  <button
                    onClick={() => handleSave(true)}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50"
                  >
                    <Eye size={16} /> Publish Now
                  </button>
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-slate-900 mb-4">Category</h3>
              <select
                value={form.category_id ?? ''}
                onChange={(e) => setForm({ ...form, category_id: e.target.value || null })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Featured image */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-slate-900 mb-4">Featured Image</h3>

              {form.image_url ? (
                <div className="relative group mb-3">
                  <img src={form.image_url} alt="Featured" className="w-full h-40 object-cover rounded-lg" />
                  <button
                    onClick={() => setForm({ ...form, image_url: '' })}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-24 bg-slate-50 rounded-lg mb-3 text-slate-300">
                  <ImageIcon size={32} />
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageSearch}
                  onChange={(e) => setImageSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchImages())}
                  placeholder="Paste image URL or search term..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
                <button
                  onClick={searchImages}
                  className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200"
                >
                  Set
                </button>
              </div>

              <div className="mt-3">
                <label className="block text-xs text-slate-500 mb-1">Image URL:</label>
                <input
                  type="text"
                  value={form.image_url ?? ''}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
