import { Address, erc721ABI } from 'wagmi';
import { readContracts } from '@wagmi/core';

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
  const response = await fetch(url);
  const metadata = await response.json();
  
  // Ensure image URL is properly formatted
  if (metadata.image && metadata.image.startsWith('ipfs://')) {
    metadata.image = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  
  return metadata;
}

export async function fetchOwnedNFTs(address: Address): Promise<NFTData[]> {
  try {
    const balanceContracts = NFT_CONTRACTS.map(contractAddress => ({
      address: contractAddress,
      abi: erc721ABI,
      functionName: 'balanceOf',
      args: [address] as const,
    }));

    const balances = await readContracts({
      contracts: balanceContracts,
    });

    const ownedNFTs: NFTData[] = [];

    for (let i = 0; i < NFT_CONTRACTS.length; i++) {
      const balance = Number(balances[i].result || 0);
      if (balance > 0) {
        const tokenIndexContracts = Array.from({ length: balance }, (_, index) => ({
          address: NFT_CONTRACTS[i],
          abi: erc721ABI,
          functionName: 'tokenOfOwnerByIndex',
          args: [address, BigInt(index)] as const,
        }));

        const tokenIds = await readContracts({
          contracts: tokenIndexContracts,
        });

        const tokenURIContracts = tokenIds.map(token => ({
          address: NFT_CONTRACTS[i],
          abi: erc721ABI,
          functionName: 'tokenURI',
          args: [token.result!] as const,
        }));

        const tokenURIs = await readContracts({
          contracts: tokenURIContracts,
        });

        for (let j = 0; j < tokenIds.length; j++) {
          const tokenId = tokenIds[j].result?.toString();
          const uri = tokenURIs[j].result?.toString();
          
          if (tokenId && uri) {
            const metadata = await fetchNFTMetadata(uri);
            ownedNFTs.push({
              tokenId,
              contractAddress: NFT_CONTRACTS[i],
              metadata,
            });
          }
        }
      }
    }

    return ownedNFTs;
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return [];
  }
} 