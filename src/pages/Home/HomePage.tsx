// src/pages/Home/HomePage.tsx
import { useState } from 'react';
import HomeSearchBar from "@/components/home/HomeSearchBar.tsx";

const HomePage = () => {
    const [searchValue, setSearchValue] = useState('');

    return (
        <>
            <HomeSearchBar
                searchPlaceholder="위치/가맹점 검색"
                searchValue={searchValue}
                onSearchChange={setSearchValue}
            />
            {/* 헤더 높이만큼 여백 */}
            <div style={{ marginTop: '133px' }}>
                홈페이지 콘텐츠
            </div>
        </>
    );
};

export default HomePage;
