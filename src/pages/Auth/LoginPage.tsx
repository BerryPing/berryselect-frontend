import Header4Auth from '@/components/layout/Header4Auth';
import AuthTabs from './AuthTabs';
import styles from './Auth.module.css';
import Button from '@/components/common/Button';
import { useState } from 'react';

export default function LoginPage(){
    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        //TODO : authApi.login(email,pw)
    };

    return (
        <div>
            <Header4Auth />
            <div className={styles.container}>
                <AuthTabs />

                <form onSubmit = {onSubmit} className={styles.form}>
                    <label className={styles.label}>이메일</label>
                    <input className = {styles.input}
                           type = "email"
                           placeholder = "이메일을 입력하세요"
                           value = {email}
                           onChange={(e) => setEmail(e.target.value)}
                           />

                    <label className={styles.label}> 비밀번호 </label>
                    <input
                        className={styles.input}
                        type="password"
                        placeholder="비밀번호를 입력하세요"
                        value = {pw}
                        onChange={(e) => setPw(e.target.value)}
                        />
                    <Button type="submit" fullWidth>로그인</Button>
                </form>

            </div>
        </div>
    );
}

