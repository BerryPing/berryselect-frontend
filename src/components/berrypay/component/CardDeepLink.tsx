// deepLinks.ts
import type { DeepLink } from '@/utils/deepLink';

export const CARD_DEEP_LINKS: Record<string, DeepLink> = {
  'KB국민카드 앱': {
    iosScheme: 'kbcardapp://',
    iosStore: 'https://apps.apple.com/kr/app/id369125087',
    androidScheme: 'kbcardapp://',
    androidIntent:
      'intent://kbcardapp#Intent;scheme=kbcardapp;package=com.kbcard.cxh.appcard;end',
    androidStore: 'market://details?id=com.kbcard.cxh.appcard',
    web: 'https://card.kbcard.com/',
  },
  'NH농협카드 앱': {
    iosScheme: 'nhallonepaycard://',
    iosStore: 'https://apps.apple.com/kr/app/id1177889176',
    androidScheme: 'nhallonepaycard://',
    androidIntent:
      'intent://nhallonepaycard#Intent;scheme=nhallonepaycard;package=com.nh.cashcard;end',
    androidStore: 'market://details?id=com.nh.cashcard',
    web: 'https://card.nonghyup.com/',
  },
  '현대카드 앱': {
    iosScheme: 'hyundaicardapp://',
    iosStore: 'https://apps.apple.com/kr/app/id335030960',
    androidScheme: 'hyundaicardapp://',
    androidIntent:
      'intent://hyundaicardapp#Intent;scheme=hyundaicardapp;package=com.hyundaicard.appcard;end',
    androidStore: 'market://details?id=com.hyundaicard.appcard',
    web: 'https://www.hyundaicard.com/',
  },
};
