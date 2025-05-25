import type { Song } from "@shared/schema";
import { IpfsClient } from "./ipfs";

// Real implementation for Farcaster Frame integration
const APP_URL = window.location.origin;

export interface FrameMetadata {
  title: string;
  description: string;
  image: string;
  url: string;
}

export const OnchainKitClient = {
  // Generate Farcaster Frame metadata for a song
  generateFrameMetadata: (song: Song): FrameMetadata => {
    const songUrl = `${APP_URL}/songs/${song.id}`;
    const imageUrl = song.artworkUrl;
    const title = `Listen to ${song.title}`;
    const description = song.description || `${song.title} by ${song.tokenSymbol}`;
    
    return {
      title,
      description,
      image: imageUrl,
      url: songUrl,
    };
  },
  
  // Generate Frame HTML for embedding in a Farcaster post
  generateFrameHtml: (song: Song): string => {
    const metadata = OnchainKitClient.generateFrameMetadata(song);
    const songUrl = `${APP_URL}/songs/${song.id}`;
    
    // Manually create Farcaster Frame metadata tags
    // This follows the Farcaster Frames spec directly
    const frameMetadataTags = `
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content="${metadata.image}" />
      <meta property="fc:frame:image:aspect_ratio" content="1:1" />
      <meta property="fc:frame:button:1" content="Play Song" />
      <meta property="fc:frame:button:1:action" content="post" />
      <meta property="fc:frame:button:2" content="View Details" />
      <meta property="fc:frame:button:2:action" content="link" />
      <meta property="fc:frame:button:2:target" content="${songUrl}" />
      <meta property="fc:frame:post_url" content="${APP_URL}/api/frame/action?songId=${song.id}" />
      <meta property="fc:frame:input:text" content="Leave a comment about this song..." />
    `;
    
    // Return the HTML with proper metadata tags
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${metadata.title}</title>
          <meta property="og:title" content="${metadata.title}" />
          <meta property="og:description" content="${metadata.description}" />
          <meta property="og:image" content="${metadata.image}" />
          ${frameMetadataTags}
        </head>
        <body>
          <h1>${metadata.title}</h1>
          <p>${metadata.description}</p>
          <img src="${metadata.image}" alt="${song.title}" />
        </body>
      </html>
    `;
  },
  
  // Create a shareable link for Farcaster
  createShareableLink: (song: Song): string => {
    const encodedTitle = encodeURIComponent(song.title);
    const encodedArtist = encodeURIComponent(song.tokenSymbol);
    const songUrl = `${APP_URL}/songs/${song.id}`;
    
    // Create a proper Warpcast frame URL with the song details
    return `https://warpcast.com/~/compose?text=Check%20out%20${encodedTitle}%20by%20${encodedArtist}%20on%20SoundToken!&embeds[]=${encodeURIComponent(
      songUrl
    )}`;
  },
  
  // Share a song to Farcaster
  shareSong: (song: Song): void => {
    const shareUrl = OnchainKitClient.createShareableLink(song);
    window.open(shareUrl, "_blank");
  },
  
  // Generate a frame URL for this song that can be embedded
  generateFrameUrl: (song: Song): string => {
    return `${APP_URL}/frame/${song.id}`;
  }
};
