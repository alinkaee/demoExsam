document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('register-form');
    if (!form) return;

    const username = form.querySelector('#id_username');
    const password = form.querySelector('#id_password');
    const password2 = form.querySelector('#id_password2');
    const fullName = form.querySelector('#id_full_name');
    const phone = form.querySelector('#id_phone');
    const email = form.querySelector('#id_email');

    function showError(input, message) {
        if (!input) return;
        let errorDiv = input.parentNode.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
        }
    }

    // Валидация логина
    if (username) {
        username.addEventListener('input', () => {
            const val = username.value;
            if (val.length === 0) {
                showError(username, '');
            } else if (val.length < 6) {
                showError(username, 'Минимум 6 символов');
            } else if (!/^[a-zA-Z0-9]+$/.test(val)) {
                showError(username, 'Только латиница и цифры');
            } else {
                showError(username, '');
            }
        });
    }

    // Валидация пароля
    if (password) {
        password.addEventListener('input', () => {
            const val = password.value;
            if (val.length === 0) {
                showError(password, '');
            } else if (val.length < 8) {
                showError(password, 'Минимум 8 символов');
            } else {
                showError(password, '');
            }
            checkPasswordMatch();
        });
    }

    // Валидация повторного пароля
    if (password2) {
        password2.addEventListener('input', checkPasswordMatch);
    }

    function checkPasswordMatch() {
        if (!password || !password2) return;
        const pass1 = password.value;
        const pass2 = password2.value;

        if (pass2.length === 0) {
            showError(password2, '');
        } else if (pass1 !== pass2) {
            showError(password2, 'Пароли не совпадают');
        } else {
            showError(password2, '');
        }
    }

    // Валидация ФИО
    if (fullName) {
        fullName.addEventListener('input', () => {
            const val = fullName.value;
            if (val.length === 0) {
                showError(fullName, '');
            } else if (!/^[а-яёА-ЯЁ\s]+$/.test(val)) {
                showError(fullName, 'Только кириллица и пробелы');
            } else {
                showError(fullName, '');
            }
        });
    }

    // МАСКА ДЛЯ ТЕЛЕФОНА
    if (phone) {
        phone.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, ''); // Убираем всё кроме цифр

            // Если первая цифра не 8, добавляем 8
            if (value.length > 0 && value[0] !== '8') {
                value = '8' + value;
            }

            // Ограничиваем длину до 11 цифр
            value = value.substring(0, 11);

            // Форматируем номер
            let formatted = '';
            if (value.length > 0) {
                formatted = value[0]; // 8
            }
            if (value.length > 1) {
                formatted += '(' + value.substring(1, 4); // (XXX
            }
            if (value.length >= 4) {
                formatted += ')'; // (XXX)
            }
            if (value.length > 4) {
                formatted += value.substring(4, 7); // (XXX)XXX
            }
            if (value.length > 7) {
                formatted += '-' + value.substring(7, 9); // (XXX)XXX-XX
            }
            if (value.length > 9) {
                formatted += '-' + value.substring(9, 11); // (XXX)XXX-XX-XX
            }

            this.value = formatted;

            // Валидация
            if (formatted.length === 0) {
                showError(phone, '');
            } else if (formatted.length < 16) {
                showError(phone, 'Введите номер полностью');
            } else if (!/^8\(\d{3}\)\d{3}-\d{2}-\d{2}$/.test(formatted)) {
                showError(phone, 'Формат: 8(XXX)XXX-XX-XX');
            } else {
                showError(phone, '');
            }
        });

        // При потере фокуса проверяем полный формат
        phone.addEventListener('blur', function() {
            const val = this.value;
            if (val.length > 0 && val.length < 16) {
                showError(phone, 'Введите номер полностью');
            }
        });

        // Разрешаем только цифры и управляющие клавиши
        phone.addEventListener('keydown', function(e) {
            // Разрешаем: Backspace, Delete, стрелки, Tab
            const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
            if (allowedKeys.includes(e.key)) {
                return;
            }
            // Блокируем нецифровые символы
            if (!/\d/.test(e.key)) {
                e.preventDefault();
            }
        });
    }

    // МАСКА ДЛЯ EMAIL
    if (email) {
        email.addEventListener('input', function(e) {
            const val = this.value;

            // Заменяем запрещённые символы
            this.value = val.replace(/[^a-zA-Z0-9@._+\-]/g, '');

            // Валидация
            const cleanVal = this.value;
            if (cleanVal.length === 0) {
                showError(email, '');
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanVal)) {
                if (!cleanVal.includes('@')) {
                    showError(email, 'Добавьте символ @');
                } else if (!cleanVal.includes('.')) {
                    showError(email, 'Добавьте домен (например: .ru)');
                } else if (cleanVal.startsWith('@') || cleanVal.endsWith('@')) {
                    showError(email, 'Некорректная позиция @');
                } else {
                    showError(email, 'Некорректный формат email');
                }
            } else {
                showError(email, '');
            }
        });

        // Автоподстановка популярных доменов при вводе @
        email.addEventListener('keyup', function(e) {
            const val = this.value;
            const atIndex = val.indexOf('@');

            // Если после @ что-то введено и нет точки
            if (atIndex !== -1 && !val.substring(atIndex).includes('.') && val.substring(atIndex).length > 1) {
                const domain = val.substring(atIndex + 1).toLowerCase();
                const popularDomains = ['gmail.com', 'mail.ru', 'yandex.ru', 'bk.ru', 'inbox.ru', 'list.ru'];

                for (let d of popularDomains) {
                    if (d.startsWith(domain) && domain.length >= 2) {
                        // Показываем подсказку (опционально)
                        break;
                    }
                }
            }
        });
    }

    // Запрет пробелов в логине
    if (username) {
        username.addEventListener('keypress', function(e) {
            if (e.key === ' ') {
                e.preventDefault();
            }
        });
    }

    // Запрет пробелов в пароле
    if (password) {
        password.addEventListener('keypress', function(e) {
            if (e.key === ' ') {
                e.preventDefault();
            }
        });
    }
});