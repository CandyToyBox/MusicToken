export default function Privacy() {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">Privacy Policy</h1>
        
        <div className="prose dark:prose-invert max-w-none text-gray-900 dark:text-white">
          <p className="lead">
            At SoundToken, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
          </p>
          
          <h2>Information We Collect</h2>
          <p>
            We collect several types of information from and about users of our Service, including:
          </p>
          <ul>
            <li>
              <strong>Personal information</strong>: When you create an account, we collect your wallet address and, if you choose to provide it, your Farcaster username and FID.
            </li>
            <li>
              <strong>Content information</strong>: Information about the music you upload, including metadata such as song title, genre, and description.
            </li>
            <li>
              <strong>Usage information</strong>: How you use our Service, including play counts, timestamps, and interaction patterns.
            </li>
            <li>
              <strong>Blockchain information</strong>: Information stored on the Base blockchain related to your tokens and plays, which is publicly accessible.
            </li>
          </ul>
          
          <h2>How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul>
            <li>Provide, maintain, and improve our Service</li>
            <li>Process and record song plays on the blockchain</li>
            <li>Create and manage your non-tradeable song tokens</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Monitor and analyze trends, usage, and activities in connection with our Service</li>
            <li>Detect, prevent, and address technical issues</li>
          </ul>
          
          <h2>Blockchain Data</h2>
          <p>
            Please be aware that all data recorded on the Base blockchain is public and immutable. This includes token deployments and play records. The blockchain maintains a permanent record of these transactions which cannot be deleted.
          </p>
          
          <h2>Sharing Your Information</h2>
          <p>
            We may share information in the following situations:
          </p>
          <ul>
            <li>
              <strong>Public blockchain</strong>: Information recorded on the Base blockchain is publicly accessible.
            </li>
            <li>
              <strong>Third-party services</strong>: We may share information with service providers who perform services on our behalf, such as hosting providers and analytics services.
            </li>
            <li>
              <strong>Legal requirements</strong>: We may disclose information if required to do so by law or in response to valid requests by public authorities.
            </li>
          </ul>
          
          <h2>Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect the security of your personal information. However, please be aware that no method of transmission over the internet or electronic storage is 100% secure.
          </p>
          
          <h2>Your Rights</h2>
          <p>
            Depending on your location, you may have certain rights regarding your personal information, such as:
          </p>
          <ul>
            <li>The right to access and receive a copy of your personal information</li>
            <li>The right to rectify or update your personal information</li>
            <li>The right to erase your personal information (except blockchain data, which cannot be deleted)</li>
            <li>The right to restrict processing of your personal information</li>
            <li>The right to object to processing of your personal information</li>
          </ul>
          
          <h2>Children's Privacy</h2>
          <p>
            Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
          </p>
          
          <h2>Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
          
          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at privacy@soundtoken.com.
          </p>
          
          <p className="text-sm text-gray-500 mt-8">
            Last updated: May 24, 2025
          </p>
        </div>
      </div>
    </div>
  );
}