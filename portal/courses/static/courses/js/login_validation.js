document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('id_username');
    const passwordInput = document.getElementById('id_password');

    if (!loginForm) return;

    // Очистка ошибок при вводе
    if (usernameInput) {
        usernameInput.addEventListener('input', function() {
            this.classList.remove('is-invalid');
            const errorDiv = this.parentNode.querySelector('.invalid-feedback');
            if (errorDiv) {
                errorDiv.remove();
            }
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            this.classList.remove('is-invalid');
            const errorDiv = this.parentNode.querySelector('.invalid-feedback');
            if (errorDiv) {
                errorDiv.remove();
            }
        });
    }

    // Валидация перед отправкой
    loginForm.addEventListener('submit', function(e) {
        let hasError = false;

        // Проверка логина
        if (usernameInput && !usernameInput.value.trim()) {
            e.preventDefault();
            showFieldError(usernameInput, 'Введите логин');
            hasError = true;
        }

        // Проверка пароля
        if (passwordInput && !passwordInput.value.trim()) {
            e.preventDefault();
            showFieldError(passwordInput, 'Введите пароль');
            hasError = true;
        }

        if (hasError) {
            e.preventDefault();
        }
    });

    // Функция показа ошибки для поля
    function showFieldError(input, message) {
        input.classList.add('is-invalid');

        // Удаляем старую ошибку
        const oldError = input.parentNode.querySelector('.invalid-feedback');
        if (oldError) oldError.remove();

        // Создаём новую
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback d-block';
        errorDiv.textContent = '❌ ' + message;
        input.parentNode.appendChild(errorDiv);

        // Фокус на первое ошибочное поле
        input.focus();
    }
});