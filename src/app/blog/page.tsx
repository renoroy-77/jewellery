import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  ChevronRight,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  BookMarked,
  Flame,
  Heart,
  Sparkles,
} from 'lucide-react';
import { constructMetadata, getBreadcrumbSchema } from '@/lib/seo';
import { BLOG_POSTS } from '@/data/blog';
import JsonLd from '@/components/JsonLd';
import BackButton from '@/components/BackButton';
import BlogNewsletterBox from './BlogNewsletterBox';

export const metadata: Metadata = constructMetadata({
  title: 'Sacred Journal | Panchaloham Chronicles & Jewellery Insights',
  description:
    'Explore our sacred journal: authentic treatises on temple metallurgy, deity symbolism, Panchaloham care rituals, and the living heritage of divine adornment.',
  canonicalUrl: '/blog',
});

export default function BlogPage() {
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Blog & Journal', url: '/blog' },
  ];

  const featuredPost = BLOG_POSTS.find((p) => p.featured) || BLOG_POSTS[0];
  const sidePosts = BLOG_POSTS.filter((p) => p.slug !== featuredPost.slug).slice(0, 3);
  const quickReads = BLOG_POSTS.slice(3, 7);

  return (
    <>
      <JsonLd data={getBreadcrumbSchema(breadcrumbs)} />

      <div className="blog-page-root">
        {/* BLOG MASTHEAD HEADER */}
        <header className="blog-top-header">
          <div className="container">
            {/* Top Bar with Back Button & Breadcrumbs */}
            <div className="pdp-top-bar" style={{ marginBottom: '24px' }}>
              <BackButton fallbackUrl="/" label="Back to Home" />

              <nav className="breadcrumb-nav pdp-breadcrumbs" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <ChevronRight size={14} className="breadcrumb-separator" />
                <span style={{ color: 'var(--gold-light)', fontWeight: 500 }}>
                  Sacred Journal
                </span>
              </nav>
            </div>

            <div className="blog-header-content">
              <div className="blog-header-label">
                <Flame size={14} color="#ffd966" />
                <span>SACRED KNOWLEDGE HUB</span>
              </div>
              <h1 className="blog-main-title">Stories of Gold &amp; Devotion</h1>
              <p className="blog-main-subtitle">
                Insights on Panchaloham jewellery, Vedic traditions, temple goldsmithing, and the sacred art of divine adornment.
              </p>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT GRID */}
        <div className="container">
          <div className="blog-layout-grid">
            {/* LEFT COLUMN: FEATURED + QUICK READS */}
            <div className="blog-main-column">
              {/* FEATURED HERO ARTICLE */}
              <article className="blog-featured-card">
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="blog-featured-img-wrap"
                  title={featuredPost.title}
                >
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="blog-featured-img"
                  />
                  <div className="blog-featured-overlay">
                    {/* Top Tag Row - Clean natural flow, no collision */}
                    <div className="blog-featured-top-row">
                      <span className="blog-featured-badge">
                        <TrendingUp size={12} />
                        TOP STORY
                      </span>
                      <span className="blog-featured-tag">{featuredPost.tag}</span>
                      <span className="blog-featured-time">
                        <Clock size={12} /> {featuredPost.readTime} read
                      </span>
                    </div>

                    <h2 className="blog-featured-title">{featuredPost.title}</h2>
                    <p className="blog-featured-excerpt">{featuredPost.excerpt}</p>

                    <div className="blog-featured-footer-row">
                      <div className="blog-featured-author-row">
                        <div className="blog-author-dot" />
                        <span>{featuredPost.author.name}</span>
                        <span className="blog-sep">•</span>
                        <Calendar size={12} />
                        <span>{featuredPost.date}</span>
                      </div>

                      <div className="blog-featured-read-action">
                        <span className="blog-read-more-btn">
                          <span>Read Full Article</span>
                          <ArrowRight size={15} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>

              {/* QUICK READS SECTION */}
              <section className="blog-quick-reads" aria-labelledby="quick-reads-heading">
                <div className="blog-section-label">
                  <BookMarked size={15} />
                  <span id="quick-reads-heading">GUIDES &amp; SACRED COMPARISONS</span>
                </div>

                <div className="blog-quick-list">
                  {quickReads.map((item, index) => (
                    <Link
                      key={item.id}
                      href={`/blog/${item.slug}`}
                      className="blog-quick-item"
                    >
                      <div className="blog-quick-number">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div className="blog-quick-body">
                        <div className="blog-quick-tag-row">
                          <span className="blog-quick-tag">{item.tag}</span>
                          <span className="blog-quick-time">
                            <Clock size={11} /> {item.readTime} read
                          </span>
                        </div>
                        <h3 className="blog-quick-title">{item.title}</h3>
                        <p className="blog-quick-desc">{item.excerpt}</p>
                      </div>
                      <div className="blog-quick-arrow-wrap">
                        <ArrowRight size={16} className="blog-quick-arrow" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </div>

            {/* RIGHT SIDEBAR: RECENT STORIES & NEWSLETTER */}
            <aside className="blog-sidebar">
              <div className="blog-section-label">
                <Calendar size={15} />
                <span>RECENT STORIES</span>
              </div>

              <div className="blog-sidebar-cards">
                {sidePosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="blog-sidebar-card"
                  >
                    <div className="blog-sidebar-img-wrap">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="blog-sidebar-img"
                      />
                    </div>
                    <div className="blog-sidebar-info">
                      <span className="blog-sidebar-tag">{post.tag}</span>
                      <h3 className="blog-sidebar-title">{post.title}</h3>
                      <div className="blog-sidebar-meta">
                        <Calendar size={11} />
                        <span>{post.date}</span>
                        <span className="blog-sep">•</span>
                        <Clock size={11} />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Newsletter Box */}
              <BlogNewsletterBox />
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
