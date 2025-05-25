import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function FAQ() {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">Frequently Asked Questions</h1>
        
        <Accordion type="single" collapsible className="w-full text-gray-900 dark:text-white">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-lg font-medium dark:text-white">
              What is SoundToken?
            </AccordionTrigger>
            <AccordionContent className="text-gray-900 dark:text-white">
              SoundToken is a decentralized music platform that creates non-tradeable ERC-20 tokens for your songs with on-chain play tracking. It allows artists to tokenize their music and have a transparent record of plays directly on the blockchain.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-lg font-medium dark:text-white">
              What blockchain does SoundToken use?
            </AccordionTrigger>
            <AccordionContent className="text-gray-900 dark:text-white">
              SoundToken is built on Base, an Ethereum Layer 2 blockchain that provides low fees and fast transactions while maintaining the security of Ethereum.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="text-lg font-medium dark:text-white">
              What does "non-tradeable" token mean?
            </AccordionTrigger>
            <AccordionContent className="text-gray-900 dark:text-white">
              Unlike regular cryptocurrencies, SoundTokens cannot be bought, sold, or transferred between wallets. They are designed specifically to track plays and engagement, not as financial assets.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="text-lg font-medium dark:text-white">
              How does on-chain play tracking work?
            </AccordionTrigger>
            <AccordionContent className="text-gray-900 dark:text-white">
              When someone plays your song, our platform records that play as a transaction on the Base blockchain. This creates a permanent, transparent record of each play that cannot be altered or deleted.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger className="text-lg font-medium dark:text-white">
              What file formats are supported?
            </AccordionTrigger>
            <AccordionContent className="text-gray-900 dark:text-white">
              SoundToken currently supports MP3, WAV, and FLAC audio formats. For artwork, we support JPEG, PNG, and WebP images.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger className="text-lg font-medium dark:text-white">
              What is Farcaster integration?
            </AccordionTrigger>
            <AccordionContent className="text-gray-900 dark:text-white">
              Farcaster is a decentralized social network. SoundToken integrates with Farcaster to allow you to share your tokenized songs with the Farcaster community through their frames feature, increasing your reach and engagement.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7">
            <AccordionTrigger className="text-lg font-medium dark:text-white">
              Do I need a crypto wallet to use SoundToken?
            </AccordionTrigger>
            <AccordionContent className="text-gray-900 dark:text-white">
              Yes, you need a crypto wallet compatible with the Base blockchain to create and manage your SoundTokens. We recommend using Coinbase Wallet or MetaMask.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8">
            <AccordionTrigger className="text-lg font-medium dark:text-white">
              Are there any fees for using SoundToken?
            </AccordionTrigger>
            <AccordionContent className="text-gray-900 dark:text-white">
              Creating a SoundToken requires a small amount of ETH on the Base blockchain to cover the gas fees for deploying your token contract. Once deployed, tracking plays is very inexpensive due to Base's low transaction costs.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-9">
            <AccordionTrigger className="text-lg font-medium dark:text-white">
              Who owns the rights to my music?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-300">
              You retain 100% of the rights to your music. SoundToken does not claim any ownership or rights to the content you upload. We simply provide the platform for you to tokenize and share your work.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-10">
            <AccordionTrigger className="text-lg font-medium dark:text-white">
              How do I get started?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-300">
              Connect your wallet, navigate to the Upload page, fill out the form with your song details, upload your audio file and artwork, and create your token. Once processed, your song will be available in the "My Songs" section.
              
              <div className="mt-4">
                <Button asChild>
                  <Link href="/upload">Upload Your First Song</Link>
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <div className="mt-12 text-center">
          <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">Still have questions?</h3>
          <p className="text-gray-900 dark:text-white mb-6">
            Reach out to our team and we'll get back to you as soon as possible.
          </p>
          <Button asChild variant="outline">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}