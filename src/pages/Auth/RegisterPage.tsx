import Header4Auth from '@/components/layout/Header4Auth';
import AuthTabs from "@/pages/Auth/AuthTabs.tsx";

export default function RegisterPage(){
    return (
        <div>
            <Header4Auth />
            <AuthTabs />

            <div>회원가입 페이지</div>
        </div>
    );
}