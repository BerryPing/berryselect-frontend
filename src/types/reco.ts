// src/types/reco.ts

export interface OptionItem {
  itemId: number;
  componentType: 'CARD' | 'MEMBERSHIP' | 'GIFTICON';
  componentRefId: number;
  ruleId: number;
  title: string;
  subtitle: string;
  appliedValue: number;
  sortOrder: number;
}

export interface Option {
  optionId: number;
  expectedPay: number;
  expectedSave: number;
  rankOrder: number;
  items: OptionItem[];
}

export interface SessionResponse {
  sessionId: number;
  inputAmount: number;
  useGifticon: boolean;
  options: Option[];
}

export interface TransactionResult {
  transactionId: number;
  status: string;
}
