import Header4Auth from '@/components/layout/Header4Auth';
import AuthTabs from './AuthTabs';
import styles from './Auth.module.css';
import Divider from '@/components/common/Divider';
import kakaoLogo from '@/assets/imgs/kakao-logo.png';
import { useState } from 'react';

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: authApi.login(email, pw)
    };

    return (
        <div>
            <Header4Auth />
            <div className={styles.container}>
                <AuthTabs />

                {/* 카드 전체 */}
                <form onSubmit={onSubmit} className={styles.card}>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="email">이메일</label>
                        <input
                            id="email"
                            className={styles.input}
                            type="email"
                            placeholder="이메일을 입력하세요"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="pw">비밀번호</label>
                        <input
                            id="pw"
                            className={styles.input}
                            type="password"
                            placeholder="비밀번호를 입력하세요"
                            value={pw}
                            onChange={(e) => setPw(e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button className={styles.submit} type="submit">
                        로그인
                    </button>
                </form>
                <Divider />

                {/* 카카오 버튼 */}
                <button className={styles.kakaoButton}>
                    <img src={kakaoLogo} alt="카카오 로고" className={styles.kakaoImg} />
                    <span className={styles.kakaoText}>카카오로 시작하기</span>
                </button>
            </div>
        </div>
    );
}

