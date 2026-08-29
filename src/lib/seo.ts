import { useEffect } from 'react';
import { Article, Category } from '@/lib/types';

const SITE_NAME = 'ThePulse';
const SITE_DESCRIPTION = 'ThePulse delivers breaking news, in-depth analysis, and stories that shape our world. Journalism that matters, 24/7.';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(url: string) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', url);
}

function setJsonLd(data: object) {
  let el = document.head.querySelector('script[data-seo-jsonld]');
  if (!el) {
    el = document.createElement('script');
    el.setAttribute('type', 'application/ld+json');
    el.setAttribute('data-seo-jsonld', 'true');
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function removeJsonLd() {
  const el = document.head.querySelector('script[data-seo-jsonld]');
  if (el) el.remove();
}

function currentOrigin() {
  return window.location.origin;
}

export function useSEO(config: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedAt?: string;
  author?: string;
}) {
  useEffect(() => {
    const fullTitle = config.title
      ? `${config.title} | ${SITE_NAME}`
      : `${SITE_NAME} — News That Matters`;

    document.title = fullTitle;
    const desc = config.description ?? SITE_DESCRIPTION;
    const url = config.url ?? window.location.href;
    const img = config.image ?? '';

    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:type', config.type ?? 'website');
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:site_name', SITE_NAME);
    if (img) setMeta('property', 'og:image', img);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', desc);
    if (img) setMeta('name', 'twitter:image', img);
    setCanonical(url);

    if (config.type === 'article' && config.title) {
      setJsonLd({
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: config.title,
        description: desc,
        image: img ? [img] : undefined,
        datePublished: config.publishedAt,
        author: { '@type': 'Organization', name: config.author ?? SITE_NAME },
        publisher: { '@type': 'Organization', name: SITE_NAME },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      });
    } else if (config.type === 'website' || !config.type) {
      setJsonLd({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        url: currentOrigin(),
        potentialAction: {
          '@type': 'SearchAction',
          target: `${currentOrigin()}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      });
    }

    return () => removeJsonLd();
  }, [config.title, config.description, config.image, config.url, config.type, config.publishedAt, config.author]);
}

export function useArticleSEO(article: Article | null) {
  useSEO({
    title: article?.title,
    description: article?.excerpt ?? undefined,
    image: article?.image_url ?? undefined,
    type: 'article',
    publishedAt: article?.published_at ?? article?.created_at,
  });
}

export function useCategorySEO(category: Category | null) {
  useSEO({
    title: category ? `${category.name} News` : undefined,
    description: category ? `Latest ${category.name} news and updates from ${SITE_NAME}.` : undefined,
    type: 'website',
  });
}

export function useHomeSEO() {
  useSEO({
    title: undefined,
    description: SITE_DESCRIPTION,
    type: 'website',
  });
}
