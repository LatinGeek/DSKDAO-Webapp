import { type Address } from 'viem';
import { readContract } from 'wagmi/actions';
import { NFTABI } from '../../contracts/membership_pass';
import { mainnet } from 'wagmi/chains';
import { type Config } from 'wagmi';
// Imports the Alchemy SDK
import { Alchemy, Network } from "alchemy-sdk";

// Configures the Alchemy SDK
const alchemyConfig = {
  apiKey: "BM6e8QFjpTFFqr7QAWMqH3lRcILx85rv", // Replace with your API key
  network: Network.ETH_MAINNET, // Replace with your network
};

// Add your NFT contract addresses here
export const NFT_CONTRACTS: Address[] = [
  '0x720dc668FBD733889C12966473DC17b0E6A2a0D3',
];

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
}

export interface NFTData {
  tokenId: string;
  contractAddress: Address;
  metadata: NFTMetadata;
}

export async function fetchNFTMetadata(uri: string): Promise<NFTMetadata> {
  // Handle IPFS URLs
  const url = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const metadata = await response.json();
    
    // Ensure image URL is properly formatted
    if (metadata.image?.startsWith('ipfs://')) {
      metadata.image = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
    
    return metadata;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return {
      name: 'Unknown NFT',
      description: 'Metadata unavailable',
      image: '/placeholder.png'
    };
  }
}

export async function fetchOwnedNFTs(
  config: Config,
  address: Address
): Promise<NFTData[]> {
  try {
    const ownedNFTs: NFTData[] = [];
    const alchemy = new Alchemy(alchemyConfig);

    // Get all NFTs owned by the address using Alchemy
    const alchemyResponse = await alchemy.nft.getNftsForOwner(address);

    // Filter NFTs to only include ones from our contract addresses
    for (const nft of alchemyResponse.ownedNfts) {
      const contractAddress = nft.contract.address.toLowerCase();
      if (NFT_CONTRACTS.some(addr => addr.toLowerCase() === contractAddress) && nft.tokenUri) {
        try {
          const metadata = await fetchNFTMetadata(nft.tokenUri);
          ownedNFTs.push({
            tokenId: nft.tokenId,
            contractAddress: nft.contract.address as Address,
            metadata,
          });
        } catch (error) {
          console.error(`Error processing NFT ${nft.tokenId}:`, error);
        }
      }
    }

    return ownedNFTs;
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return [];
  }
} 