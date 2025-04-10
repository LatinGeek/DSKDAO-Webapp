export interface Item {
  id: string;
  active: boolean;
  amount: number;
  createdAt: string;
  description: string;
  image: string;
  name: string;
  price: number;
  updatedAt: string;
}

export interface PurchaseRequest {
  itemId: string;
  quantity: number;
  userId: string;
}

export interface Purchase {
  id: string;
  itemId: string;
  userId: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
} 