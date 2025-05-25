// IPFS integration using Infura API
const INFURA_API_KEY = import.meta.env.VITE_INFURA_API_KEY || '177a22cbf89e4f24ad9d387546044fd4';
const INFURA_IPFS_ENDPOINT = `https://ipfs.infura.io:5001/api/v0`;

export const IpfsClient = {
  // Upload a file to IPFS using Infura
  uploadFile: async (file: File): Promise<string> => {
    try {
      if (!file) {
        throw new Error("No file provided");
      }
      
      // For now, we'll use our backend to handle IPFS uploads
      // since it's more reliable than direct browser uploads
      
      const formData = new FormData();
      formData.append("file", file);
      
      // Use the appropriate endpoint based on file type
      const endpoint = file.type.startsWith("audio") 
        ? "/api/upload/song" 
        : "/api/upload/artwork";
      
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload to IPFS");
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      throw error;
    }
  },
  
  // Upload song metadata to IPFS
  uploadMetadata: async (metadata: Record<string, any>): Promise<string> => {
    try {
      // Convert metadata to JSON
      const metadataBlob = new Blob([JSON.stringify(metadata)], {
        type: "application/json",
      });
      
      // Create a File object from the Blob
      const metadataFile = new File([metadataBlob], "metadata.json", {
        type: "application/json",
      });
      
      // Use our uploadFile function to upload the metadata file
      const url = await IpfsClient.uploadFile(metadataFile);
      return url;
    } catch (error) {
      console.error("Error uploading metadata:", error);
      throw error;
    }
  },
  
  // Get IPFS gateway URL for displaying content
  getGatewayUrl: (ipfsUrl: string): string => {
    // If the URL is already a gateway URL, return it
    if (ipfsUrl.startsWith('http') && !ipfsUrl.includes('ipfs://')) {
      return ipfsUrl;
    }
    
    // Convert ipfs:// URLs to HTTP gateway URLs
    if (ipfsUrl.startsWith('ipfs://')) {
      const cid = ipfsUrl.substring(7);
      return `https://ipfs.io/ipfs/${cid}`;
    }
    
    // Handle CID directly
    if (ipfsUrl.match(/^[a-zA-Z0-9]{46}$/)) {
      return `https://ipfs.io/ipfs/${ipfsUrl}`;
    }
    
    // Default to returning the original URL
    return ipfsUrl;
  }
};
