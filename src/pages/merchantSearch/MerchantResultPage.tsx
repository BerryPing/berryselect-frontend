import { useEffect, useState } from 'react';
import { merchantApi } from '@/api/merchantApi';
import type { Merchant } from '@/api/merchantApi'; // ✅ named import
import { SearchHeader } from '@/components/merchants/SearchHeader'; // ✅ named import
import { MerchantList } from '@/components/merchants/MerchantList'; // ✅ default import

const MerchantResultPage = () => {
  const [keyword, setKeyword] = useState('스타벅스');
  const [merchants, setMerchants] = useState<Merchant[]>([]);

  const fetchMerchants = async () => {
    try {
      const res = await merchantApi.search(keyword);
      if (res.data && res.data.merchants) {
        setMerchants(res.data.merchants);
      }
    } catch (err) {
      console.error('❌ 가맹점 불러오기 실패:', err);
    }
  };

  useEffect(() => {
    fetchMerchants();
  });

  return (
    <div>
      <SearchHeader
        keyword={keyword}
        setKeyword={setKeyword}
        onSearch={fetchMerchants}
      />
      <MerchantList merchants={merchants} />
    </div>
  );
};

export default MerchantResultPage;
