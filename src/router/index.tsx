import { createBrowserRouter } from 'react-router-dom';

// 레이아웃 (스마트폰 프레임 + Outlet)
import DefaultLayout from '@/components/layout/DefaultLayout'; // 경로는 프로젝트에 맞게

// 페이지
import HomePage from '@/pages/Home/HomePage';
import BerryPickPage from '@/pages/BerryPick/BerryPickPage';
import WalletPage from '@/pages/Wallet/WalletPage';
import MyBerryPage from '@/pages/MyBerry/MyBerryPage';
import NotFoundPage from '@/pages/NotFoundPage';
import LoginPage from '@/pages/Auth/LoginPage';
import RegisterPage from '@/pages/Auth/RegisterPage';
import AuthCallback from "@/pages/Auth/AuthCallback.tsx";
import ReportPage from "@/pages/Report/ReportPage.tsx";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <DefaultLayout />,            // 공통 프레임
        children: [
            { index: true, element: <HomePage /> },          // '/'
            { path: 'berrypick', element: <BerryPickPage /> }, // '/berrypick'
            { path: 'wallet', element: <WalletPage /> },       // '/wallet'
            { path: 'myberry', element: <MyBerryPage /> },     // '/myberry'
            { path: 'auth/login', element: <LoginPage /> },
            { path: 'auth/register', element: <RegisterPage /> },
            { path: 'auth/callback', element:<AuthCallback />},
            { path: '*', element: <NotFoundPage /> },
            { path: 'report', element: <ReportPage />},
        ],
    },
]);