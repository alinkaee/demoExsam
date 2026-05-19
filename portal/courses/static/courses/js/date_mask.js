document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('id_start_date');
    if (!dateInput) return;

    // Функция показа ошибки
    function showError(message) {
        const errorDiv = document.getElementById('date-error');
        if (errorDiv) {
            errorDiv.textContent = message;
        }
        if (message) {
            dateInput.classList.add('is-invalid');
            dateInput.classList.remove('is-valid');
        } else {
            dateInput.classList.remove('is-invalid');
            dateInput.classList.add('is-valid');
        }
    }

    // Проверка корректности даты
    function isValidDate(day, month, year) {
        // Проверяем диапазоны
        if (month < 1 || month > 12) return false;
        if (year < 2024 || year > 2100) return false;

        // Дни в месяце
        const daysInMonth = new Date(year, month, 0).getDate();
        if (day < 1 || day > daysInMonth) return false;

        // Проверяем что дата не в прошлом
        const inputDate = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (inputDate < today) {
            return false;
        }

        return true;
    }

    // Валидация полной даты
    function validateFullDate(value) {
        const clean = value.replace(/\D/g, '');

        if (clean.length === 0) {
            showError('');
            return;
        }

        if (clean.length < 8) {
            showError('❌ Введите дату полностью');
            return;
        }

        const day = parseInt(clean.substring(0, 2));
        const month = parseInt(clean.substring(2, 4));
        const year = parseInt(clean.substring(4, 8));

        if (!isValidDate(day, month, year)) {
            if (month > 12) {
                showError('❌ Месяц должен быть от 01 до 12');
            } else if (day > 31) {
                showError('❌ День должен быть от 01 до 31');
            } else if (year < 2024) {
                showError('❌ Год должен быть не ранее 2024');
            } else {
                showError('❌ Некорректная дата');
            }
            return;
        }

        // Дата корректна
        showError('');
    }

    // Основной обработчик ввода
    dateInput.addEventListener('input', function(e) {
        let value = this.value.replace(/\D/g, ''); // Только цифры
        let formatted = '';

        // Ограничиваем 8 цифрами (ДДММГГГГ)
        value = value.substring(0, 8);

        // Форматируем ДД.ММ.ГГГГ
        if (value.length > 0) {
            formatted += value.substring(0, 2); // ДД
        }
        if (value.length > 2) {
            formatted += '.' + value.substring(2, 4); // .ММ
        }
        if (value.length > 4) {
            formatted += '.' + value.substring(4, 8); // .ГГГГ
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

        // Валидация
        validateFullDate(formatted);
    });

    // При вставке
    dateInput.addEventListener('paste', function(e) {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData('text');
        const digits = pasted.replace(/\D/g, '').substring(0, 8);

        if (digits.length >= 8) {
            // Форматируем вставленную дату
            const day = digits.substring(0, 2);
            const month = digits.substring(2, 4);
            const year = digits.substring(4, 8);
            this.value = day + '.' + month + '.' + year;
        } else {
            this.value = digits;
        }

        this.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Разрешаем только цифры и управляющие клавиши
    dateInput.addEventListener('keydown', function(e) {
        const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
        if (allowed.includes(e.key)) return;
        if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
        if (!/\d/.test(e.key)) e.preventDefault();
    });

    // При потере фокуса — финальная проверка
    dateInput.addEventListener('blur', function() {
        const value = this.value;
        const clean = value.replace(/\D/g, '');

        if (value && clean.length < 8) {
            showError('❌ Введите полную дату (ДД.ММ.ГГГГ)');
        } else if (clean.length === 8) {
            validateFullDate(value);
        }
    });

    // При фокусе — показываем подсказку
    dateInput.addEventListener('focus', function() {
        if (!this.value) {
            this.placeholder = 'ДД.ММ.ГГГГ';
        }
    });

    // Автоматическая вставка точек
    dateInput.addEventListener('keyup', function(e) {
        const value = this.value.replace(/\D/g, '');

        // Авто-точка после дня
        if (value.length === 2 && e.key !== 'Backspace' && e.key !== 'Delete') {
            this.value = value.substring(0, 2) + '.';
        }
        // Авто-точка после месяца
        if (value.length === 4 && e.key !== 'Backspace' && e.key !== 'Delete') {
            this.value = value.substring(0, 2) + '.' + value.substring(2, 4) + '.';
        }
    });
});