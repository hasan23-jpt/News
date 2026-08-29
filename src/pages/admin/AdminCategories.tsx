import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Category } from '@/lib/types';
import { slugify } from '@/lib/slug';
import { Link } from '@/context/RouterContext';
import { ArrowLeft, Plus, Trash2, Tag } from 'lucide-react';

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data ?? []);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    const slug = slugify(name);
    const { error } = await supabase.from('categories').insert({ name: name.trim(), slug });
    if (error) {
      setError(error.message);
    } else {
      setName('');
      loadCategories();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Articles in it will become uncategorized.')) return;
    await supabase.from('categories').delete().eq('id', id);
    loadCategories();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2 text-slate-300 hover:text-white">
            <ArrowLeft size={18} /> Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Categories</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add category */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Plus size={20} className="text-rose-600" /> Add New Category
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 mb-3">
                {error}
              </div>
            )}

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Technology"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Slug (auto-generated)</label>
                <input
                  type="text"
                  value={slugify(name)}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-mono bg-slate-50 text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition-colors"
              >
                Add Category
              </button>
            </form>
          </div>

          {/* Category list */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Tag size={20} className="text-slate-600" /> All Categories
            </h2>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No categories yet. Add one to get started.</p>
            ) : (
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center">
                        <Tag size={16} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{cat.name}</p>
                        <p className="text-xs text-slate-400 font-mono">/{cat.slug}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
