'use client';

import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Grid, Typography, Skeleton } from '@mui/material';
import { useAccount, useConfig } from 'wagmi';
import { fetchOwnedNFTs, NFTData } from '@/utils/nftUtils';
import Image from 'next/image';

export default function NFTGallery() {
  const { address, isConnected } = useAccount();
  const wagmiConfig = useConfig();
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadNFTs() {
      if (isConnected && address) {
        setLoading(true);
        try {
          const ownedNFTs = await fetchOwnedNFTs(wagmiConfig, address);
          setNfts(ownedNFTs);
        } catch (error) {
          console.error('Error loading NFTs:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    if (mounted) {
      loadNFTs();
    }
  }, [address, isConnected, mounted, wagmiConfig]);

  // Don't render anything until mounted to prevent hydration errors
  if (!mounted) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Loading...
          </Typography>
          <Grid container spacing={3}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ height: '100%' }}>
                  <Skeleton
                    variant="rectangular"
                    sx={{ paddingTop: '100%', width: '100%' }}
                  />
                  <CardContent>
                    <Skeleton width="60%" />
                    <Skeleton width="40%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">
            Please connect your wallet to view your NFTs.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>

        
        <Grid container spacing={3}>
          {loading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ height: '100%' }}>
                  <Skeleton
                    variant="rectangular"
                    sx={{ paddingTop: '100%', width: '100%' }}
                  />
                  <CardContent>
                    <Skeleton width="60%" />
                    <Skeleton width="40%" />
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : nfts.length > 0 ? (
            nfts.map((nft) => (
              <Grid item xs={12} sm={6} md={3} key={`${nft.contractAddress}-${nft.tokenId}`}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <Box sx={{ position: 'relative', paddingTop: '100%' }}>
                    <Image
                      src={nft.metadata.image}
                      alt={nft.metadata.name}
                      fill
                      style={{
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {nft.metadata.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      Token ID: {nft.tokenId}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography color="text.secondary" align="center">
                No NFTs found in your wallet.
              </Typography>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
} 