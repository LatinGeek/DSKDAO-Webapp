interface PurchaseItemData {
  id: string;
  name: string;
  price: number;
}

export async function purchaseItem(userId: string, item: PurchaseItemData): Promise<void> {
  // TODO: Implement the actual purchase logic with your backend
  const response = await fetch('/api/shop/purchase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      itemId: item.id,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to purchase item');
  }
} 