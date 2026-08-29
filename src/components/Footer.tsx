import { Link } from '@/context/RouterContext';
import { Newspaper, Twitter, Facebook, Instagram, Youtube } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Category } from '@/lib/types';
import { useEffect, useState } from 'react';

export function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-600 to-red-700 rounded-lg flex items-center justify-center">
                <Newspaper size={22} className="text-white" />
              </div>
              <span className="text-2xl font-extrabold text-white">
                The<span className="text-rose-500">Pulse</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-md">
              Your trusted source for breaking news, in-depth analysis, and stories that shape our world. 
              We deliver journalism that matters, 24/7.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a href="#" className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors">
                <Twitter size={16} className="text-white" />
              </a>
              <a href="#" className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors">
                <Facebook size={16} className="text-white" />
              </a>
              <a href="#" className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors">
                <Instagram size={16} className="text-white" />
              </a>
              <a href="#" className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors">
                <Youtube size={16} className="text-white" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.slug}`} className="text-sm hover:text-rose-400 transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm hover:text-rose-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-sm hover:text-rose-400 transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="text-sm hover:text-rose-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm hover:text-rose-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">© {new Date().getFullYear()} ThePulse News. All rights reserved.</p>
          <p className="text-xs">Delivering truth, one story at a time.</p>
        </div>
      </div>
    </footer>
  );
}
