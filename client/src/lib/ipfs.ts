// IPFS integration using Infura API
const INFURA_API_KEY = import.meta.env.VITE_INFURA_API_KEY || '177a22cbf89e4f24ad9d387546044fd4';
const INFURA_IPFS_ENDPOINT = `https://ipfs.infura.io:5001/api/v0`;
const IPFS_GATEWAY = 'https://soundtoken.infura-ipfs.io/ipfs/';

export const IpfsClient = {
  // Upload a file to IPFS using Infura
  uploadFile: async (file: File): Promise<string> => {
    try {
      if (!file) {
        throw new Error("No file provided");
      }
      
      // We'll use our backend to handle IPFS uploads
      // since it's more reliable than direct browser uploads
      
      const formData = new FormData();
      formData.append("file", file);
      
      // Include file metadata
      formData.append("filename", file.name);
      formData.append("filetype", file.type);
      
      // Use the appropriate endpoint based on file type
      const endpoint = file.type.startsWith("audio") 
        ? "/api/upload/song" 
        : "/api/upload/artwork";
      
      console.log(`Uploading ${file.type} file to ${endpoint}...`);
      
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData
      });
      
      if (!response.ok) {
        let errorMessage = "Failed to upload to IPFS";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If we can't parse the error response, use the status text
          errorMessage = `Upload failed: ${response.statusText} (${response.status})`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      if (!data.url) {
        throw new Error("No URL returned from upload");
      }
      
      console.log(`File uploaded successfully: ${data.url}`);
      return data.url;
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      throw error;
    }
  },
  
  // Upload song metadata to IPFS
  uploadMetadata: async (metadata: Record<string, any>): Promise<string> => {
    try {
      console.log("Preparing metadata for upload:", metadata);
      
      // Add timestamp to metadata
      const metadataWithTimestamp = {
        ...metadata,
        createdAt: new Date().toISOString(),
      };
      
      // Convert metadata to JSON
      const metadataBlob = new Blob([JSON.stringify(metadataWithTimestamp, null, 2)], {
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
      return `${IPFS_GATEWAY}${cid}`;
    }
    
    // Handle CID directly (Qm... or bafy... format)
    if (ipfsUrl.match(/^(Qm[1-9A-Za-z]{44}|bafy[1-9A-Za-z]{44})$/)) {
      return `${IPFS_GATEWAY}${ipfsUrl}`;
    }
    
    // Handle URLs from our backend that might contain the CID in a different format
    const cidMatch = ipfsUrl.match(/\/ipfs\/([1-9A-Za-z]+)/);
    if (cidMatch && cidMatch[1]) {
      return `${IPFS_GATEWAY}${cidMatch[1]}`;
    }
    
    // Default to returning the original URL
    return ipfsUrl;
  },
  
  // Check if a URL is an IPFS URL
  isIpfsUrl: (url: string): boolean => {
    return (
      url.startsWith('ipfs://') || 
      url.includes('/ipfs/') || 
      url.match(/^(Qm[1-9A-Za-z]{44}|bafy[1-9A-Za-z]{44})$/) !== null
    );
  },
  
  // Utility to create an IPFS URL from a CID
  cidToUrl: (cid: string): string => {
    if (!cid) return '';
    // Clean the CID if it has a path or query parameters
    const cleanCid = cid.split('/')[0].split('?')[0];
    return `ipfs://${cleanCid}`;
  }
};
