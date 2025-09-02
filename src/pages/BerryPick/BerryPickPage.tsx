// src/pages/BerryPick/BerryPickPage.tsx
import Header from '@/components/layout/Header.tsx';
import InputPanel from '@/components/berrypay/InputPanel.tsx';

const BerryPickPage = () => {
  return (
    <>
      <Header title="베리픽" showBackButton={false} showHomeButton={false} />
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="flex justify-center">
          <InputPanel />
        </div>
      </div>
    </>
  );
};

export default BerryPickPage;
