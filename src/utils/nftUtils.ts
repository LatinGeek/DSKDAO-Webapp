import { type Address } from 'viem';
import { readContract } from 'wagmi/actions';
import { NFTABI } from '../../contracts/membership_pass';
import { mainnet } from 'wagmi/chains';
import { type Config } from 'wagmi';

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

        // Get token URI for token ID 1 (since each address can only mint one)
        try {
          const tokenUri = await readContract(config, {
            address: contractAddress,
            abi: NFTABI,
            functionName: 'tokenURI',
            args: [BigInt(1)],
            chainId: mainnet.id,
          }) as string;

          console.log("Token URI:", tokenUri);

          if (tokenUri) {
            const metadata = await fetchNFTMetadata(tokenUri);
            ownedNFTs.push({
              tokenId: '1',
              contractAddress,
              metadata,
            });
          }
        } catch (uriError) {
          console.error('Error fetching URI:', uriError);
          // Add with default metadata if URI fetch fails
          ownedNFTs.push({
            tokenId: '1',
            contractAddress,
            metadata: {
              name: 'Membership Pass',
              description: 'Metadata temporarily unavailable',
              image: '/placeholder.png'
            }
          });
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