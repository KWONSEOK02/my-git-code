// Firebase 모듈 임포트
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getDatabase, ref, push, onValue, remove, update, get } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAXa9CfS82Y3nB8wa83CS7S8M3lPPoMGwA",
    authDomain: "my-first-firebase-9a545.firebaseapp.com",
    projectId: "my-first-firebase-9a545",
    storageBucket: "my-first-firebase-9a545.firebasestorage.app",
    messagingSenderId: "1066879828539",
    appId: "1:1066879828539:web:6acefa8d5e4e91be5cd21e",
    databaseURL: "https://my-first-firebase-9a545-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const todoList = document.getElementById('todoList');
    const clearAllBtn = document.getElementById('clearAll');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userEmail = document.getElementById('userEmail');

    let currentUser = null;
    let userTodosRef = null;

    // 인증 상태 관찰자
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // 로그인 상태
            currentUser = user;
            userTodosRef = ref(database, 'todos/' + user.uid);
            
            // 사용자의 유저네임 가져오기
            const userRef = ref(database, 'users/' + user.uid);
            try {
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    userEmail.textContent = `${userData.username}님 환영합니다`;
                    console.log('사용자 데이터:', userData); // 디버깅을 위한 로그
                } else {
                    userEmail.textContent = `${user.email}님 환영합니다`;
                    console.log('사용자 데이터가 없습니다.');
                }
            } catch (error) {
                console.error('유저네임을 가져오는 중 오류 발생:', error);
                userEmail.textContent = `${user.email}님 환영합니다`;
            }

            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
            enableTodoFeatures();
        } else {
            // 로그아웃 상태
            currentUser = null;
            userTodosRef = null;
            userEmail.textContent = '';
            loginBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
            disableTodoFeatures();
            window.location.href = 'login.html'; // 로그인 페이지로 리다이렉트
        }
    });

    // 로그아웃 기능
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            alert('로그아웃되었습니다.');
        }).catch((error) => {
            console.error('로그아웃 중 오류 발생:', error);
        });
    });

    function enableTodoFeatures() {
        // Firebase에서 실시간으로 할 일 목록 가져오기
        onValue(userTodosRef, (snapshot) => {
            todoList.innerHTML = '';
            snapshot.forEach((childSnapshot) => {
                const task = childSnapshot.val();
                const li = createTaskElement(task, childSnapshot.key);
                todoList.appendChild(li);
            });
        });

        // 입력 필드와 버튼 활성화
        taskInput.disabled = false;
        addBtn.disabled = false;
        clearAllBtn.disabled = false;
    }

    function disableTodoFeatures() {
        // 할 일 목록 초기화
        todoList.innerHTML = '';
        
        // 입력 필드와 버튼 비활성화
        taskInput.disabled = true;
        addBtn.disabled = true;
        clearAllBtn.disabled = true;
    }

    // 할 일 요소 생성
    function createTaskElement(task, key) {
        const li = document.createElement('li');
        li.className = 'todo-item' + (task.completed ? ' completed' : '');
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = task.completed;
        
        checkbox.addEventListener('change', () => {
            const taskRef = ref(database, `todos/${currentUser.uid}/${key}`);
            update(taskRef, { completed: !task.completed });
        });

        const span = document.createElement('span');
        span.className = 'todo-text';
        span.textContent = task.text;

        // 작성자 정보 표시
        const authorSpan = document.createElement('span');
        authorSpan.className = 'author-text';
        authorSpan.textContent = `작성자: ${task.author || '익명'}`;

        // 별 아이콘 버튼 추가
        const starBtn = document.createElement('button');
        starBtn.className = 'star-btn' + (task.important ? ' important' : '');
        starBtn.innerHTML = '<i class="fas fa-star"></i>';
        
        starBtn.addEventListener('click', () => {
            const taskRef = ref(database, `todos/${currentUser.uid}/${key}`);
            update(taskRef, { important: !task.important });
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        
        deleteBtn.addEventListener('click', () => {
            const taskRef = ref(database, `todos/${currentUser.uid}/${key}`);
            remove(taskRef);
        });

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(authorSpan);  // 작성자 정보 추가
        li.appendChild(starBtn);
        li.appendChild(deleteBtn);

        return li;
    }

    // 새로운 할 일 추가
    async function addTask(text) {
        if (text.trim() && currentUser) {
            // 현재 사용자의 username 가져오기
            let authorName = '익명';
            try {
                const userRef = ref(database, 'users/' + currentUser.uid);
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    authorName = userData.username || '익명';
                }
            } catch (error) {
                console.error('작성자 정보를 가져오는 중 오류 발생:', error);
            }

            // 할 일 추가
            push(userTodosRef, {
                text: text.trim(),
                completed: false,
                important: false,
                author: authorName,
                createdAt: new Date().toISOString()
            });
            taskInput.value = '';
        }
    }

    // 이벤트 리스너 수정
    addBtn.addEventListener('click', () => {
        const text = taskInput.value;
        if (text.trim()) {
            addTask(text);
        }
    });
    
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const text = taskInput.value;
            if (text.trim()) {
                addTask(text);
            }
        }
    });

    clearAllBtn.addEventListener('click', () => {
        if (currentUser) {
            remove(userTodosRef);
        }
    });
}); 