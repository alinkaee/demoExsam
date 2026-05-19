// Функция открытия модального окна
function openReviewModal(appId, courseName) {
    const modal = document.getElementById('reviewModal');
    const courseNameElement = document.getElementById('modalCourseName');
    const appIdInput = document.getElementById('appId');
    const reviewText = document.getElementById('reviewText');
    const reviewError = document.getElementById('reviewError');

    // Устанавливаем данные
    courseNameElement.textContent = 'Курс: ' + courseName;
    appIdInput.value = appId;

    // Очищаем поля
    reviewText.value = '';
    reviewError.textContent = '';

    // Сбрасываем звёзды
    const stars = document.querySelectorAll('input[name="rating"]');
    stars.forEach(star => star.checked = false);

    // Показываем модальное окно
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);

    // Блокируем скролл страницы
    document.body.style.overflow = 'hidden';

    // Фокус на поле ввода
    setTimeout(() => {
        reviewText.focus();
    }, 300);
}

// Функция закрытия модального окна
function closeReviewModal() {
    const modal = document.getElementById('reviewModal');
    modal.classList.remove('show');

    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
}

// Закрытие по клику на фон
document.addEventListener('click', function(event) {
    const modal = document.getElementById('reviewModal');
    if (event.target === modal) {
        closeReviewModal();
    }
});

// Закрытие по клавише Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('reviewModal');
        if (modal && modal.style.display === 'block') {
            closeReviewModal();
        }
    }
});

// Обработка отправки формы
document.addEventListener('DOMContentLoaded', function() {
    const reviewForm = document.getElementById('reviewForm');

    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const appId = document.getElementById('appId').value;
            const reviewText = document.getElementById('reviewText').value.trim();
            const reviewError = document.getElementById('reviewError');
            const submitBtn = this.querySelector('button[type="submit"]');

            console.log('Отправка отзыва:');
            console.log('appId:', appId);
            console.log('text:', reviewText);

            // Валидация
            if (!reviewText) {
                reviewError.textContent = 'Пожалуйста, напишите текст отзыва';
                document.getElementById('reviewText').focus();
                return;
            }

            if (reviewText.length < 10) {
                reviewError.textContent = 'Отзыв должен содержать минимум 10 символов';
                document.getElementById('reviewText').focus();
                return;
            }

            // Блокируем кнопку на время отправки
            submitBtn.disabled = true;
            submitBtn.textContent = 'Отправка...';

            // Формируем данные
            const formData = new FormData();
            formData.append('text', reviewText);
            formData.append('csrfmiddlewaretoken', getCsrfToken());

            // Отправляем AJAX запрос
            fetch('/review/' + appId + '/', {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: formData
            })
            .then(response => {
                console.log('Ответ сервера:', response.status);
                if (!response.ok) {
                    throw new Error('Ошибка сервера: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log('Данные ответа:', data);

                if (data.success) {
                    // Показываем уведомление об успехе
                    showNotification('Отзыв успешно отправлен!', 'success');
                    closeReviewModal();

                    // Перезагружаем страницу через 1.5 секунды
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    reviewError.textContent = data.error || 'Произошла ошибка при отправке отзыва';
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Отправить отзыв';
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
                reviewError.textContent = 'Ошибка соединения с сервером. Попробуйте позже.';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Отправить отзыв';
            });
        });
    }
});

// Получение CSRF токена
function getCsrfToken() {
    const tokenElement = document.querySelector('[name=csrfmiddlewaretoken]');
    if (tokenElement) {
        return tokenElement.value;
    }

    // Альтернативный способ
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith('csrftoken=')) {
            return cookie.substring('csrftoken='.length);
        }
    }
    return '';
}

// Функция показа уведомлений
function showNotification(message, type = 'success') {
    // Удаляем старые уведомления
    const oldNotifications = document.querySelectorAll('.notification');
    oldNotifications.forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = 'notification notification-' + type;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Анимация появления
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Удаляем через 3 секунды
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}