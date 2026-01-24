"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Play, X } from "lucide-react";

interface LinkEmbedProps {
  content: string;
}

interface OEmbedData {
  title?: string;
  description?: string;
  thumbnail?: string;
  siteName?: string;
  url?: string;
  type?: string;
  videoId?: string;
}

// Extract URLs from message content
function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
  return text.match(urlRegex) || [];
}

// Parse YouTube URL and extract video ID
function parseYouTubeUrl(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Check if URL is from a known platform
function getUrlType(url: string): "youtube" | "twitter" | "generic" {
  if (/youtube\.com|youtu\.be/.test(url)) return "youtube";
  if (/twitter\.com|x\.com/.test(url)) return "twitter";
  return "generic";
}

function YouTubeEmbed({ videoId, url }: { videoId: string; url: string }) {
  const [showPlayer, setShowPlayer] = useState(false);
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const fallbackThumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  const [imgSrc, setImgSrc] = useState(thumbnailUrl);

  if (showPlayer) {
    return (
      <div className="mt-2 relative max-w-[480px] rounded-lg overflow-hidden bg-black">
        <button
          onClick={() => setShowPlayer(false)}
          className="absolute top-2 right-2 z-10 p-1 bg-black/70 hover:bg-black/90 rounded-full text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="mt-2 relative max-w-[480px] rounded-lg overflow-hidden cursor-pointer group"
      onClick={() => setShowPlayer(true)}
    >
      <img
        src={imgSrc}
        alt="YouTube thumbnail"
        className="w-full aspect-video object-cover"
        onError={() => setImgSrc(fallbackThumbnail)}
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
        <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <Play className="w-8 h-8 text-white ml-1" fill="white" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center gap-2 text-white text-sm">
          <span className="font-medium">YouTube</span>
          <ExternalLink className="w-3 h-3 opacity-70" />
        </div>
      </div>
    </div>
  );
}

function GenericEmbed({ url }: { url: string }) {
  const [data, setData] = useState<OEmbedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchOembed = async () => {
      try {
        // Use a simple meta tag extraction approach
        const response = await fetch(`/api/oembed?url=${encodeURIComponent(url)}`);
        if (response.ok) {
          const embedData = await response.json();
          setData(embedData);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOembed();
  }, [url]);

  if (loading || error || !data) return null;

  const hostname = new URL(url).hostname.replace(/^www\./, "");

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 block max-w-[400px] border-l-4 border-[#8B5CF6] bg-[#1a1a1a] rounded-r-lg overflow-hidden hover:bg-[#222222] transition-colors"
    >
      {data.thumbnail && (
        <img
          src={data.thumbnail}
          alt=""
          className="w-full h-32 object-cover"
        />
      )}
      <div className="p-3">
        <div className="text-xs text-[#8B5CF6] font-medium mb-1">
          {data.siteName || hostname}
        </div>
        {data.title && (
          <div className="text-white font-medium text-sm line-clamp-2 mb-1">
            {data.title}
          </div>
        )}
        {data.description && (
          <div className="text-[#888888] text-xs line-clamp-2">
            {data.description}
          </div>
        )}
      </div>
    </a>
  );
}

export function LinkEmbed({ content }: LinkEmbedProps) {
  const urls = extractUrls(content);
  
  if (urls.length === 0) return null;

  // Only show first URL to avoid spam
  const url = urls[0];
  const urlType = getUrlType(url);

  if (urlType === "youtube") {
    const videoId = parseYouTubeUrl(url);
    if (videoId) {
      return <YouTubeEmbed videoId={videoId} url={url} />;
    }
  }

  // For generic URLs, try to fetch oembed data
  return <GenericEmbed url={url} />;
}
