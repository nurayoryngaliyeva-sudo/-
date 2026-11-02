const form = document.getElementById('auth-form');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const repeatWrap = document.getElementById('repeat-wrap');
const message = document.getElementById('message');
const submitBtn = document.getElementById('submit');
const passInput = document.getElementById('password');

let mode = 'login';

// Уже вошли — сразу на вторую страницу
if (localStorage.getItem('currentUser')) location.replace('empty.html');

function setMode(next) {
  mode = next;
  const isLogin = next === 'login';
  tabLogin.classList.toggle('active', isLogin);
  tabRegister.classList.toggle('active', !isLogin);
  repeatWrap.hidden = isLogin;
  submitBtn.textContent = isLogin ? 'Войти' : 'Создать аккаунт';
  passInput.autocomplete = isLogin ? 'current-password' : 'new-password';
  message.textContent = '';
}
tabLogin.addEventListener('click', () => setMode('login'));
tabRegister.addEventListener('click', () => setMode('register'));

// Демо-хранилище. Настоящая безопасность требует сервера.
const getUsers = () => JSON.parse(localStorage.getItem('users') || '{}');

async function hash(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = passInput.value;
  const password2 = document.getElementById('password2').value;

  if (!/^\S+@\S+\.\S+$/.test(email)) return (message.textContent = 'Введите корректную почту.');
  if (password.length < 6) return (message.textContent = 'Пароль должен быть не короче 6 символов.');

  const users = getUsers();
  const passHash = await hash(password);

  if (mode === 'register') {
    if (password !== password2) return (message.textContent = 'Пароли не совпадают.');
    if (users[email]) return (message.textContent = 'Эта почта уже зарегистрирована. Перейдите на вкладку «Вход».');
    users[email] = passHash;
    localStorage.setItem('users', JSON.stringify(users));
  } else if (users[email] !== passHash) {
    return (message.textContent = 'Неверная почта или пароль.');
  }

  localStorage.setItem('currentUser', email);
  location.href = 'empty.html';
});
