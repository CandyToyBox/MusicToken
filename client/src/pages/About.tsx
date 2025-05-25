import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 dark:text-white">About SoundToken</h1>
        
        <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
          <p className="lead text-lg font-medium text-gray-900 dark:text-gray-100">
            SoundToken is a decentralized music platform that creates non-tradeable ERC-20 tokens for songs with on-chain play tracking.
          </p>
          
          <h2>Our Mission</h2>
          <p>
            We believe that music should be shared and enjoyed by everyone, while still giving artists the recognition they deserve. 
            By tokenizing songs on the blockchain, we provide a transparent and immutable record of a song's popularity 
            and impact in the music community.
          </p>
          
          <h2>How It Works</h2>
          <ol>
            <li>
              <strong>Upload Your Song</strong>: Artists upload their song files and artwork to create a unique token.
            </li>
            <li>
              <strong>Deploy to Blockchain</strong>: Each song is represented by a non-tradeable ERC-20 token on the Base blockchain.
            </li>
            <li>
              <strong>Track Plays On-Chain</strong>: Every play is recorded on the blockchain, creating a permanent record of the song's popularity.
            </li>
            <li>
              <strong>Share with Farcaster</strong>: Easily share your songs with the Farcaster community using our integrated frame support.
            </li>
          </ol>
          
          <h2>Built on Base</h2>
          <p>
            SoundToken is built on Base, a secure, low-cost, developer-friendly Ethereum L2 built to bring the next billion users on-chain.
            Base provides the ideal infrastructure for our application, combining the security of Ethereum with the scalability needed for a music platform.
          </p>
          
          <h2>Non-Tradeable Tokens</h2>
          <p>
            Unlike typical crypto tokens, SoundTokens are non-tradeable. This means they cannot be bought, sold, or transferred.
            Their sole purpose is to track plays and popularity, not to serve as financial instruments. This design choice ensures that
            the focus remains on the music itself, not on speculation.
          </p>
          
          <h2>Get Started</h2>
          <p>
            Ready to create your own SoundToken? Upload your first song and join our growing community of artists tracking their music on-chain.
          </p>
          
          <div className="flex justify-center mt-8">
            <Button asChild className="mr-4">
              <Link href="/upload">Upload Your Song</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/my-songs">View Your Songs</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}