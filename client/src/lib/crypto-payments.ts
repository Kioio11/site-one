import { QRCodeSVG } from 'qrcode.react';

export interface CryptoPaymentMethod {
  symbol: string;
  name: string;
  address: string;
  network?: string;
  minConfirmations?: number;
}

export const SUPPORTED_PAYMENTS: CryptoPaymentMethod[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    address: 'bc1q4drndl2n4edmagtkq5rj9uddg4mtn6jvr9rv2q',
    minConfirmations: 3
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0x9bE6dF74B1D92358cFF959f0E1a173488813F125',
    network: 'ERC20',
    minConfirmations: 12
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0x9bE6dF74B1D92358cFF959f0E1a173488813F125',
    network: 'ERC20',
    minConfirmations: 12
  }
];

export interface PaymentDetails {
  amount: number;
  currency: string;
  orderId: string;
  status: 'pending' | 'confirmed' | 'failed';
  transactionHash?: string;
}

export function generatePaymentLink(method: CryptoPaymentMethod, amount: string): string {
  switch (method.symbol) {
    case 'BTC':
      return `bitcoin:${method.address}?amount=${amount}`;
    case 'ETH':
    case 'USDT':
      return `ethereum:${method.address}`;
    default:
      return method.address;
  }
}