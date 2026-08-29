import { useState, useEffect } from 'react';
import { Link, useRouter } from '@/context/RouterContext';
import { Newspaper, Menu, X, Search, Twitter, Facebook, Instagram, Youtube } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Category } from '@/lib/types';

export function Header() {
  const { path } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.history.pushState({}, '', `/search?q=${encodeURIComponent(searchQuery)}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
      setSearchOpen(false);
      setMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top bar */}
      <div className="bg-slate-900 text-slate-300 text-xs">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <span className="hidden sm:block">{today}</span>
          <div className="flex items-center gap-3 ml-auto">
            <a href="#" className="hover:text-white transition-colors"><Twitter size={14} /></a>
            <a href="#" className="hover:text-white transition-colors"><Facebook size={14} /></a>
            <a href="#" className="hover:text-white transition-colors"><Instagram size={14} /></a>
            <a href="#" className="hover:text-white transition-colors"><Youtube size={14} /></a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            className="lg:hidden p-2 -ml-2 text-slate-700"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link to="/" className="flex items-center gap-2 mx-auto lg:mx-0">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-600 to-red-700 rounded-lg flex items-center justify-center">
              <Newspaper size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none">
                The<span className="text-rose-600">Pulse</span>
              </h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none mt-0.5">
                News That Matters
              </p>
            </div>
          </Link>

          <button
            className="p-2 text-slate-700 hover:text-rose-600 transition-colors"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search size={22} />
          </button>
        </div>

        {searchOpen && (
          <div className="border-t border-gray-100 bg-white">
            <div className="max-w-7xl mx-auto px-4 py-3">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  autoFocus
                />
                <button type="submit" className="px-6 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors">
                  Search
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={`border-b border-gray-100 ${menuOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex flex-col lg:flex-row lg:items-center gap-0 lg:gap-1 py-0">
            <li>
              <Link
                to="/"
                className={`block px-4 py-3 text-sm font-semibold transition-colors ${path === '/' ? 'text-rose-600 border-b-2 border-rose-600' : 'text-slate-700 hover:text-rose-600'}`}
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  to={`/category/${cat.slug}`}
                  className={`block px-4 py-3 text-sm font-semibold transition-colors ${path === `/category/${cat.slug}` ? 'text-rose-600 border-b-2 border-rose-600' : 'text-slate-700 hover:text-rose-600'}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
