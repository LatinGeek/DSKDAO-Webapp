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
    if (metadata.image && metadata.image.startsWith('ipfs://')) {
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

    for (const contractAddress of NFT_CONTRACTS) {
      try {
        console.log("Processing contract:", contractAddress);
        console.log("Checking address:", address);

        // Check if the user has minted an NFT
        const hasMinted = await readContract(config, {
          address: contractAddress,
          abi: NFTABI,
          functionName: 'isNftMinted',
          args: [address],
          chainId: mainnet.id,
        }) as boolean;

        console.log("Has minted:", hasMinted);

        if (!hasMinted) {
          console.log("No NFT minted by this address");
          continue;
        }

        // Get total supply to know how many tokens to check
        const totalSupply = await readContract(config, {
          address: contractAddress,
          abi: NFTABI,
          functionName: 'totalSupply',
          args: [],
          chainId: mainnet.id,
        }) as bigint;

        console.log("Total supply:", totalSupply.toString());

        const alchemy = new Alchemy(alchemyConfig);


         //Call the method to get the nfts owned by this address
        let alchemyResponse = await alchemy.nft.getNftsForOwner(address);

        console.log("NFTs owned by this address:", alchemyResponse);
        
        if (alchemyResponse.ownedNfts.length > 0) {
          for (const nft of alchemyResponse.ownedNfts) {
            if (nft.contract.address.toLowerCase() === contractAddress.toLowerCase() && nft.tokenUri) {
              const metadata = await fetchNFTMetadata(nft.tokenUri);
              ownedNFTs.push({
                tokenId: nft.tokenId,
                contractAddress,
                metadata,
              });
            }
          }
        }

      } catch (error) {
        console.error(`Error processing contract ${contractAddress}:`, error);
        continue;
      }
    }

    return ownedNFTs;
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return [];
  }
} 