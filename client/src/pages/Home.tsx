import { Link } from "wouter";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl dark:text-white">
              <span className="block">Turn Your Music into</span>
              <span className="block text-primary dark:text-blue-400">On-Chain Tokens</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl dark:text-gray-400">
              Create non-tradeable ERC-20 tokens for your songs on Base blockchain. Track plays on-chain and share your music with the Farcaster community.
            </p>
            <div className="mt-10 max-w-sm mx-auto sm:flex sm:justify-center md:mt-12">
              <div className="rounded-md shadow">
                <Link href="/upload" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 dark:bg-indigo-600 dark:hover:bg-indigo-700">
                  Upload Your Song
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link href="/my-songs" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700">
                  My Songs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-12 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase dark:text-blue-400">How It Works</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
              Music on the blockchain, simplified
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto dark:text-gray-400">
              Create your own non-tradeable ERC-20 tokens that track plays on-chain.
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <dt>
                  <div className="icon-container">
                    <i className="fas fa-upload text-xl"></i>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">1. Upload Your Song</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
                  Upload your song file and artwork. Add metadata like title, description, and genre.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="icon-container">
                    <i className="fas fa-coins text-xl"></i>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">2. Create Token</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
                  Deploy a non-tradeable ERC-20 token on Base blockchain linked to your song.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="icon-container">
                    <i className="fas fa-share-nodes text-xl"></i>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">3. Share & Track</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
                  Share your song on Farcaster and track on-chain plays automatically.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
