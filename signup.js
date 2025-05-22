// Firebase 모듈 임포트
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getDatabase, ref, set } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js';

// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyAXa9CfS82Y3nB8wa83CS7S8M3lPPoMGwA",
    authDomain: "my-first-firebase-9a545.firebaseapp.com",
    projectId: "my-first-firebase-9a545",
    storageBucket: "my-first-firebase-9a545.firebasestorage.app",
    messagingSenderId: "1066879828539",
    appId: "1:1066879828539:web:6acefa8d5e4e91be5cd21e",
    databaseURL: "https://my-first-firebase-9a545-default-rtdb.firebaseio.com/"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const passwordError = document.getElementById('passwordError');

    // 비밀번호 확인 실시간 체크
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('password-confirm');

    passwordConfirmInput.addEventListener('input', () => {
        if (passwordInput.value !== passwordConfirmInput.value) {
            passwordError.textContent = '비밀번호가 일치하지 않습니다.';
            passwordError.style.color = '#f44336';
            passwordConfirmInput.classList.add('mismatch');
            passwordConfirmInput.classList.remove('match');
        } else {
            passwordError.textContent = '비밀번호가 일치합니다.';
            passwordError.style.color = '#4CAF50';
            passwordConfirmInput.classList.add('match');
            passwordConfirmInput.classList.remove('mismatch');
        }
    });

    // 회원가입 폼 제출 처리
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = passwordInput.value;
        const passwordConfirm = passwordConfirmInput.value;

        // 비밀번호 확인
        if (password !== passwordConfirm) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            // Firebase Authentication으로 사용자 생성
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Realtime Database에 사용자 추가 정보 저장
            await set(ref(database, 'users/' + user.uid), {
                name: name,
                username: username,
                email: email,
                createdAt: new Date().toISOString()
            });

            alert('회원가입이 완료되었습니다!');
            window.location.href = 'login.html'; // 로그인 페이지로 이동
        } catch (error) {
            let errorMessage = '회원가입 중 오류가 발생했습니다.';
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = '이미 사용 중인 이메일입니다.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = '유효하지 않은 이메일 형식입니다.';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = '이메일/비밀번호 회원가입이 비활성화되어 있습니다.';
                    break;
                case 'auth/weak-password':
                    errorMessage = '비밀번호가 너무 약합니다.';
                    break;
            }
            
            alert(errorMessage);
            console.error(error);
        }
    });
}); 