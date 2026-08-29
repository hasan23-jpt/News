import { AuthProvider, useAuth } from '@/context/AuthContext';
import { RouterProvider, useRouter } from '@/context/RouterContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HomePage } from '@/pages/HomePage';
import { ArticlePage } from '@/pages/ArticlePage';
import { CategoryPage } from '@/pages/CategoryPage';
import { SearchPage } from '@/pages/SearchPage';
import { AdminLogin } from '@/pages/admin/AdminLogin';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { ArticleEditor } from '@/pages/admin/ArticleEditor';
import { AdminCategories } from '@/pages/admin/AdminCategories';
import { NotificationManager } from '@/components/NotificationManager';
import { Loader2 } from 'lucide-react';

function AppRoutes() {
  const { path } = useRouter();
  const { user, loading } = useAuth();

  // Admin routes
  if (path.startsWith('/admin')) {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="animate-spin text-rose-600" size={32} />
        </div>
      );
    }

    if (!user) {
      return <AdminLogin />;
    }

    if (path === '/admin' || path === '/admin/') {
      return <AdminDashboard />;
    }
    if (path === '/admin/categories') {
      return <AdminCategories />;
    }
    if (path === '/admin/articles/new') {
      return <ArticleEditor articleId={null} />;
    }
    const editMatch = path.match(/^\/admin\/articles\/(.+)$/);
    if (editMatch) {
      return <ArticleEditor articleId={editMatch[1]} />;
    }
    return <AdminDashboard />;
  }

  // Public routes
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1">
        <PublicRoutes />
      </main>
      <Footer />
    </div>
  );
}

function PublicRoutes() {
  const { path } = useRouter();

  if (path === '/' || path === '') {
    return <HomePage />;
  }

  const articleMatch = path.match(/^\/article\/(.+)$/);
  if (articleMatch) {
    return <ArticlePage slug={articleMatch[1]} />;
  }

  const categoryMatch = path.match(/^\/category\/(.+)$/);
  if (categoryMatch) {
    return <CategoryPage slug={categoryMatch[1]} />;
  }

  if (path.startsWith('/search')) {
    const params = new URLSearchParams(path.split('?')[1] || '');
    return <SearchPage query={params.get('q') ?? ''} />;
  }

  // Static pages
  if (path === '/about' || path === '/contact' || path === '/privacy' || path === '/terms') {
    return <StaticPage page={path.slice(1)} />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-4">404</h1>
      <p className="text-slate-500 mb-6">The page you're looking for doesn't exist.</p>
      <a href="/" className="px-6 py-3 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700">Back to Home</a>
    </div>
  );
}

function StaticPage({ page }: { page: string }) {
  const titles: Record<string, string> = {
    about: 'About ThePulse',
    contact: 'Contact Us',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-6">{titles[page] ?? 'Page'}</h1>
      <div className="prose prose-slate max-w-none">
        {page === 'about' && (
          <>
            <p>ThePulse is a modern news platform dedicated to delivering accurate, timely, and impactful journalism. Our team of experienced reporters and editors work around the clock to bring you the stories that matter most.</p>
            <p>We believe in the power of information to shape opinions, drive change, and keep communities informed. From breaking news to in-depth analysis, ThePulse is your trusted source for news that matters.</p>
          </>
        )}
        {page === 'contact' && (
          <>
            <p>Have a story tip or question? We'd love to hear from you.</p>
            <p>Email: tips@thepulse.news</p>
            <p>For advertising inquiries: ads@thepulse.news</p>
          </>
        )}
        {page === 'privacy' && (
          <p>Your privacy is important to us. This privacy policy describes how we collect, use, and protect your information when you visit ThePulse. We use cookies and third-party advertising partners to deliver relevant ads. We do not sell your personal information.</p>
        )}
        {page === 'terms' && (
          <p>By accessing ThePulse, you agree to these terms of service. All content is owned by ThePulse and may not be reproduced without permission. Users are responsible for their comments and interactions on the platform.</p>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AppRoutes />
        <NotificationManager />
      </RouterProvider>
    </AuthProvider>
  );
}
