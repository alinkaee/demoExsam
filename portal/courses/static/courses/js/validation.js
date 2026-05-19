document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('register-form');
    if (!form) return;

    const username = form.querySelector('#id_username');
    const password = form.querySelector('#id_password');
    const password2 = form.querySelector('#id_password2');
    const fullName = form.querySelector('#id_full_name');
    const phone = form.querySelector('#id_phone');
    const email = form.querySelector('#id_email');

    // ========== ПОКАЗ ОШИБОК ==========
    function showError(input, message) {
        if (!input) return;
        let errorDiv = input.parentNode.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            input.parentNode.appendChild(errorDiv);
        }
        errorDiv.textContent = message;

        if (message) {
            input.classList.add('is-invalid');
            input.classList.remove('is-valid');
        } else {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
        }
    }

    // ========== AJAX ПРОВЕРКА УНИКАЛЬНОСТИ ==========
    function checkUnique(field, value, inputElement, fieldName) {
        if (!value) {
            showError(inputElement, '');
            return;
        }

        // Показываем статус проверки
        showError(inputElement, '⏳ Проверка...');

        fetch('/check-unique/?field=' + field + '&value=' + encodeURIComponent(value))
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                if (!data.valid) {
                    // Конкретное сообщение об ошибке
                    showError(inputElement, '❌ ' + data.message);
                } else {
                    // Успешно — поле свободно
                    showError(inputElement, '');
                }
            })
            .catch(function(error) {
                console.error('Ошибка проверки:', error);
                showError(inputElement, 'Ошибка соединения с сервером');
            });
    }

    // валидация логина
    if (username) {
        username.addEventListener('input', function() {
            const val = this.value.trim();

            // алкальная валидация
            if (val.length === 0) {
                showError(this, '');
                this.classList.remove('is-valid', 'is-invalid');
                return;
            }

            if (val.length < 6) {
                showError(this, '❌ Минимум 6 символов (сейчас ' + val.length + ')');
                return;
            }

            if (!/^[a-zA-Z0-9]+$/.test(val)) {
                showError(this, '❌ Только латиница и цифры');
                return;
            }

            clearTimeout(this._timeout);
            this._timeout = setTimeout(function() {
                checkUnique('username', val, username, 'Логин');
            }, 600);
        });


        username.addEventListener('blur', function() {
            const val = this.value.trim();
            if (val.length >= 6 && /^[a-zA-Z0-9]+$/.test(val)) {
                clearTimeout(this._timeout);
                checkUnique('username', val, username, 'Логин');
            }
        });

        username.addEventListener('keypress', function(e) {
            if (e.key === ' ') e.preventDefault();
        });
    }

    // валидация пароля
    if (password) {
        password.addEventListener('input', function() {
            const val = this.value;
            if (val.length === 0) {
                showError(this, '');
                this.classList.remove('is-valid', 'is-invalid');
            } else if (val.length < 8) {
                showError(this, '❌ Минимум 8 символов (сейчас ' + val.length + ')');
            } else {
                showError(this, '');
            }
            checkPasswordMatch();
        });

        password.addEventListener('keypress', function(e) {
            if (e.key === ' ') e.preventDefault();
        });
    }

    if (password2) {
        password2.addEventListener('input', checkPasswordMatch);

        password2.addEventListener('blur', function() {
            const pass1 = password.value;
            const pass2 = this.value;
            if (pass2 && pass1 !== pass2) {
                showError(this, '❌ Пароли не совпадают');
            }
        });
    }

    function checkPasswordMatch() {
        if (!password || !password2) return;
        const pass1 = password.value;
        const pass2 = password2.value;

        if (pass2.length === 0) {
            showError(password2, '');
            password2.classList.remove('is-valid', 'is-invalid');
        } else if (pass1 !== pass2) {
            showError(password2, '❌ Пароли не совпадают');
        } else {
            showError(password2, '✓ Пароли совпадают');
        }
    }

    if (fullName) {
        fullName.addEventListener('input', function() {
            const val = this.value.trim();
            if (val.length === 0) {
                showError(this, '');
                this.classList.remove('is-valid', 'is-invalid');
            } else if (!/^[а-яёА-ЯЁ\s\-]+$/.test(val)) {
                showError(this, '❌ Только кириллица, пробелы и дефис');
            } else if (val.split(/\s+/).length < 2) {
                showError(this, '❌ Введите фамилию и имя');
            } else if (val.length < 5) {
                showError(this, '❌ Слишком короткое имя');
            } else {
                showError(this, '');
            }
        });
    }

    if (phone) {
        phone.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, ''); // Только цифры

            // Если первая цифра не 8 — добавляем 8
            if (value.length > 0 && value[0] !== '8') {
                value = '8' + value;
            }

            // Ограничиваем 11 цифрами (8 + 10 цифр номера)
            value = value.substring(0, 11);

            // Форматируем
            let formatted = '';

            if (value.length > 0) {
                formatted += value[0]; // 8
            }
            if (value.length > 1) {
                formatted += '(' + value.substring(1, 4); // (XXX
            }
            if (value.length >= 4) {
                formatted += ')'; // )
            }
            if (value.length > 4) {
                formatted += value.substring(4, 7); // XXX
            }
            if (value.length > 7) {
                formatted += '-' + value.substring(7, 9); // -XX
            }
            if (value.length > 9) {
                formatted += '-' + value.substring(9, 11); // -XX
            }

            // Сохраняем позицию курсора
            const cursorPos = this.selectionStart;
            const oldLength = this.value.length;

            this.value = formatted;

            // Восстанавливаем позицию курсора
            const newLength = formatted.length;
            if (cursorPos < oldLength) {
                this.setSelectionRange(cursorPos, cursorPos);
            } else {
                this.setSelectionRange(newLength, newLength);
            }

            const digitsOnly = value; // Уже очищено от не-цифр
            const digitCount = digitsOnly.length;

            if (digitCount === 0) {
                showError(this, '');
                this.classList.remove('is-valid', 'is-invalid');
            } else if (digitCount < 11) {
                // Показываем сколько цифр осталось ввести
                const remaining = 11 - digitCount;
                showError(this, '❌ Введите номер полностью (осталось ' + remaining + ' цифр)');
            } else if (digitCount === 11) {
                // Номер полный — проверяем уникальность
                if (/^8\(\d{3}\)\d{3}-\d{2}-\d{2}$/.test(formatted)) {
                    showError(this, ''); // Очищаем ошибку
                    clearTimeout(this._timeout);
                    this._timeout = setTimeout(function() {
                        checkUnique('phone', formatted, phone, 'Телефон');
                    }, 500);
                } else {
                    showError(this, '❌ Неверный формат номера');
                }
            }
        });

        // При потере фокуса — проверяем сразу
        phone.addEventListener('blur', function() {
            const val = this.value;
            const digitsOnly = val.replace(/\D/g, '');

            if (digitsOnly.length === 11 && /^8\(\d{3}\)\d{3}-\d{2}-\d{2}$/.test(val)) {
                showError(this, '');
                clearTimeout(this._timeout);
                checkUnique('phone', val, phone, 'Телефон');
            } else if (digitsOnly.length > 0 && digitsOnly.length < 11) {
                showError(this, '❌ Номер должен содержать 11 цифр (сейчас ' + digitsOnly.length + ')');
            }
        });

        phone.addEventListener('paste', function(e) {
            e.preventDefault();
            const pasted = (e.clipboardData || window.clipboardData).getData('text');
            const digits = pasted.replace(/\D/g, '');

            if (digits.length > 0 && digits[0] !== '8') {
                this.value = '8' + digits.substring(0, 10);
            } else {
                this.value = digits.substring(0, 11);
            }

            // Триггерим событие input
            this.dispatchEvent(new Event('input', { bubbles: true }));
        });

        phone.addEventListener('keydown', function(e) {
            const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
            if (allowed.includes(e.key)) return;
            if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
            if (!/\d/.test(e.key)) e.preventDefault();
        });
    }

    // валидация почты
    if (email) {
        email.addEventListener('input', function() {
            let val = this.value.replace(/[^a-zA-Z0-9@._+\-]/g, '');

            const atIndex = val.indexOf('@');
            if (atIndex !== -1) {
                val = val.substring(0, atIndex + 1) + val.substring(atIndex + 1).replace(/@/g, '');
            }

            this.value = val;

            // Валидация
            if (val.length === 0) {
                showError(this, '');
                this.classList.remove('is-valid', 'is-invalid');
            } else if (!val.includes('@')) {
                showError(this, '❌ Добавьте символ @');
            } else if (val.indexOf('@') === 0) {
                showError(this, '❌ Введите часть до @');
            } else if (val.indexOf('@') === val.length - 1) {
                showError(this, '❌ Введите домен после @');
            } else if (!val.split('@')[1].includes('.')) {
                showError(this, '❌ Добавьте точку в домене (например .ru)');
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) {
                showError(this, '❌ Некорректный email');
            } else {
                // Проверка уникальности
                clearTimeout(this._timeout);
                this._timeout = setTimeout(function() {
                    checkUnique('email', val, email, 'Email');
                }, 500);
            }
        });

        // При потере фокуса
        email.addEventListener('blur', function() {
            const val = this.value.trim();
            if (val && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) {
                clearTimeout(this._timeout);
                checkUnique('email', val, email, 'Email');
            }
        });
    }
});