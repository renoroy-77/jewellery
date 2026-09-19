import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  Calendar,
  Clock,
  ChevronRight,
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { BLOG_POSTS, BlogPost } from '@/data/blog';
import { PRODUCTS } from '@/data/products';
import { constructMetadata, getBreadcrumbSchema } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import BackButton from '@/components/BackButton';
import BlogLikeButton from './BlogLikeButton';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return constructMetadata({
      title: 'Article Not Found',
      description: 'The requested sacred journal article could not be found.',
    });
  }

  return constructMetadata({
    title: `${post.title} | Aamadappetti Sacred Journal`,
    description: post.excerpt,
    image: post.image,
    canonicalUrl: `/blog/${post.slug}`,
    keywords: [
      post.tag,
      post.category,
      'Panchaloham jewellery',
      'temple jewellery guide',
      'sacred jewellery traditions',
    ],
  });
}

export default async function BlogPostDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Blog & Journal', url: '/blog' },
    { name: post.title, url: `/blog/${post.slug}` },
  ];

  // Related products mentioned in this article
  const featuredProducts = PRODUCTS.filter((p) =>
    post.content.relatedProductSlugs?.includes(p.slug)
  );

  // Other stories to explore
  const otherPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  // JSON-LD Article Schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: `https://jewellery-gamma-eight.vercel.app${post.image}`,
    datePublished: '2026-09-01T00:00:00Z',
    dateModified: '2026-09-15T00:00:00Z',
    author: {
      '@type': 'Person',
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Aamadappetti Panchaloham Jewellery',
      logo: {
        '@type': 'ImageObject',
        url: 'https://jewellery-gamma-eight.vercel.app/assets/brand_logo_gold.png',
      },
    },
  };

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={getBreadcrumbSchema(breadcrumbs)} />

      <article className="blog-post-root">
        <div className="container">
          {/* Top Bar with Back Button & Breadcrumbs */}
          <div className="pdp-top-bar" style={{ marginBottom: '28px' }}>
            <BackButton fallbackUrl="/blog" label="Back to Journal" />

            <nav className="breadcrumb-nav pdp-breadcrumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <ChevronRight size={14} className="breadcrumb-separator" />
              <Link href="/blog">Blog &amp; Journal</Link>
              <ChevronRight size={14} className="breadcrumb-separator" />
              <span style={{ color: 'var(--gold-light)' }}>{post.tag}</span>
            </nav>
          </div>

          {/* Article Header Container */}
          <header className="blog-post-header">
            <div className="blog-post-category-badge">{post.tag}</div>
            <h1 className="blog-post-h1">{post.title}</h1>
            <p className="blog-post-subtitle">{post.subtitle}</p>

            {/* Author & Meta Row */}
            <div className="blog-post-author-bar">
              <div className="blog-post-author-info">
                <div className="blog-post-author-avatar">
                  {post.author.name.charAt(0)}
                </div>
                <div>
                  <div className="blog-post-author-name">{post.author.name}</div>
                  <div className="blog-post-author-role">{post.author.role}</div>
                </div>
              </div>

              <div className="blog-post-meta-details">
                <div className="blog-post-meta-item">
                  <Calendar size={14} />
                  <span>{post.date}</span>
                </div>
                <div className="blog-post-meta-item">
                  <Clock size={14} />
                  <span>{post.readTime} read</span>
                </div>
              </div>
            </div>

            {/* Like & Share Action Bar */}
            <BlogLikeButton initialLikes={post.likes} postTitle={post.title} />
          </header>

          {/* Hero Featured Image */}
          <div className="blog-post-hero-image-wrap">
            <img
              src={post.image}
              alt={post.title}
              className="blog-post-hero-image"
            />
          </div>

          {/* Article Body Content */}
          <div className="blog-post-body-container">
            {/* Lead Intro Paragraph */}
            <div className="blog-post-lead-box">
              <p className="blog-post-lead-text">{post.content.lead}</p>
            </div>

            {/* Detailed Body Sections */}
            {post.content.sections.map((section, idx) => (
              <section key={idx} className="blog-post-section">
                <h2 className="blog-post-h2">{section.heading}</h2>
                {section.body.map((p, pIdx) => (
                  <p key={pIdx} className="blog-post-paragraph">{p}</p>
                ))}

                {section.highlight && (
                  <blockquote className="blog-post-quote">
                    <Sparkles size={20} className="blog-post-quote-icon" />
                    <p>{section.highlight}</p>
                  </blockquote>
                )}
              </section>
            ))}

            {/* Sacred Shloka Verse Box (if present) */}
            {post.content.sacredVerse && (
              <div className="blog-post-verse-box">
                <div className="verse-kicker">ANCIENT AGAMIC TREATISE</div>
                <div className="verse-sanskrit">{post.content.sacredVerse.shloka}</div>
                <div className="verse-translation">
                  &ldquo;{post.content.sacredVerse.meaning}&rdquo;
                </div>
                <div className="verse-source">— {post.content.sacredVerse.source}</div>
              </div>
            )}

            {/* Key Takeaways Box */}
            <div className="blog-post-takeaways-card">
              <div className="takeaways-header">
                <BookOpen size={18} color="#d4af37" />
                <h3>Sacred Wisdom Takeaways</h3>
              </div>
              <ul className="takeaways-list">
                {post.content.takeaways.map((item, i) => (
                  <li key={i}>
                    <CheckCircle2 size={16} className="takeaway-check-icon" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Like & Share Banner */}
            <div className="blog-post-bottom-actions">
              <div className="bottom-actions-title">Found this sacred wisdom meaningful?</div>
              <BlogLikeButton initialLikes={post.likes} postTitle={post.title} />
            </div>

            {/* Featured Jewellery in this Article */}
            {featuredProducts.length > 0 && (
              <div className="blog-related-products-section">
                <div className="section-kicker">CONSECRATED HEIRLOOMS</div>
                <h3 className="section-title" style={{ fontSize: '1.8rem', marginBottom: '20px' }}>
                  Sacred Jewellery Featured in this Story
                </h3>
                <div className="blog-products-grid">
                  {featuredProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="blog-product-card"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="blog-product-img"
                      />
                      <div className="blog-product-info">
                        <div className="blog-product-name">{product.name}</div>
                        <div className="blog-product-price">
                          ₹{product.price.toLocaleString('en-IN')}
                        </div>
                        <span className="blog-product-cta">
                          <span>View Consecrated Piece</span>
                          <ArrowRight size={14} />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* More Sacred Stories Grid */}
          <div className="blog-more-stories-section">
            <div className="section-kicker">EXPLORE FURTHER</div>
            <h3 className="section-title" style={{ fontSize: '1.8rem', marginBottom: '28px' }}>
              More Sacred Stories &amp; Wisdom
            </h3>

            <div className="blog-more-grid">
              {otherPosts.map((other) => (
                <Link
                  key={other.id}
                  href={`/blog/${other.slug}`}
                  className="blog-more-card"
                >
                  <div className="blog-more-img-wrap">
                    <img src={other.image} alt={other.title} />
                    <span className="blog-more-tag">{other.tag}</span>
                  </div>
                  <div className="blog-more-body">
                    <div className="blog-more-meta">
                      <Clock size={12} />
                      <span>{other.readTime} read</span>
                      <span>•</span>
                      <span>{other.date}</span>
                    </div>
                    <h4 className="blog-more-title">{other.title}</h4>
                    <span className="blog-more-read-link">
                      <span>Read Story</span>
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
