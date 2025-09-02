import { NavLink } from "react-router-dom";
import styles from "./Auth.module.css";

export default function AuthTabs() {
    return (
        <div className={styles.tabs} role="tablist" aria-label="인증 탭">
            <NavLink
                to="/auth/login"
                className={({ isActive }) =>
                    [styles.tab, isActive ? styles.tabActive : styles.tabInactive].join(" ")
                }
                role="tab"
                aria-selected={location.pathname === "/auth/login"}
            >
                로그인
            </NavLink>

            <NavLink
                to="/auth/register"
                className={({ isActive }) =>
                    [styles.tab, isActive ? styles.tabActive : styles.tabInactive].join(" ")
                }
                role="tab"
            >
                회원가입
            </NavLink>
        </div>
    );
}