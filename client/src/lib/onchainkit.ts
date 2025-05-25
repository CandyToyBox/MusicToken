import type { Song } from "@shared/schema";
import { IpfsClient } from "./ipfs";
import { getFrame } from "@coinbase/onchainkit";

// Real implementation for Farcaster Frame integration
const APP_URL = window.location.origin;

export interface FrameMetadata {
  title: string;
  description: string;
  image: string;
  url: string;
}

export const OnchainKitClient = {
  // Generate Farcaster Frame metadata for a song using OnchainKit
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
    
    // Use OnchainKit to generate proper frame metadata tags
    const frameMetadata = getFrame({
      buttons: [
        {
          label: "Play Song",
          action: "post"
        },
        {
          label: "View Details",
          action: "link",
          target: `${APP_URL}/songs/${song.id}`
        }
      ],
      image: {
        src: metadata.image,
        aspectRatio: "1:1"
      },
      input: {
        text: "Leave a comment about this song...",
      },
      postUrl: `${APP_URL}/api/frame/action?songId=${song.id}`,
    });
    
    // Return the HTML with proper metadata tags
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${metadata.title}</title>
          <meta property="og:title" content="${metadata.title}" />
          <meta property="og:description" content="${metadata.description}" />
          <meta property="og:image" content="${metadata.image}" />
          ${frameMetadata}
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
