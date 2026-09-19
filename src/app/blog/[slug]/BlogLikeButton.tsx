'use client';

import React, { useState } from 'react';
import { Heart, Sparkles, Share2, Check } from 'lucide-react';

interface Props {
  initialLikes: number;
  postTitle: string;
}

export default function BlogLikeButton({ initialLikes, postTitle }: Props) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLike = () => {
    if (!hasLiked) {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    } else {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    }
  };

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: postTitle,
          url,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="blog-interactions-bar">
      <button
        type="button"
        onClick={handleLike}
        className={`blog-like-btn ${hasLiked ? 'liked' : ''}`}
        aria-label={hasLiked ? 'Unlike article' : 'Bless & like this article'}
      >
        <Heart size={18} fill={hasLiked ? '#d4af37' : 'none'} color="#d4af37" />
        <span>{likes}</span>
        <span className="blog-like-label">{hasLiked ? 'Blessed' : 'Bless & Like'}</span>
      </button>

      <button
        type="button"
        onClick={handleShare}
        className="blog-share-btn"
        aria-label="Share article"
      >
        {copied ? <Check size={16} color="#34d399" /> : <Share2 size={16} />}
        <span>{copied ? 'Link Copied!' : 'Share'}</span>
      </button>
    </div>
  );
}
