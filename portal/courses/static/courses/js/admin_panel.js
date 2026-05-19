document.addEventListener('DOMContentLoaded', function() {
    // Элементы заявок
    const tableBody = document.querySelector('#applications-table tbody');
    const paginationDiv = document.getElementById('pagination-applications');
    const statusFilter = document.getElementById('status-filter');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');

    // Элементы отзывов
    const reviewsTableBody = document.querySelector('#reviews-table tbody');
    const reviewsPagination = document.getElementById('pagination-reviews');
    const reviewsSearch = document.getElementById('reviews-search');

    let currentPage = 1;
    let currentReviewsPage = 1;

    // Переключение вкладок
    window.switchTab = function(tabName) {
        // Скрываем все вкладки
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        // Убираем активный класс у кнопок
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Показываем нужную вкладку
        const targetTab = document.getElementById('tab-' + tabName);
        if (targetTab) {
            targetTab.classList.add('active');
        }

        // Находим нажатую кнопку и делаем её активной
        const buttons = document.querySelectorAll('.tab-btn');
        buttons.forEach(btn => {
            if (btn.textContent.trim().toLowerCase().includes(tabName)) {
                btn.classList.add('active');
            }
        });

        // Загружаем данные для отзывов при переключении
        if (tabName === 'reviews') {
            console.log('Переключаемся на вкладку отзывов');
            currentReviewsPage = 1;
            fetchReviews(1);
        }
    };

    // Загрузка заявок
    function fetchData(page = 1) {
        const status = statusFilter ? statusFilter.value : 'all';
        const search = searchInput ? searchInput.value : '';
        const sort = sortSelect ? sortSelect.value : '-created_at';

        const url = `/admin-panel/data/?status=${status}&search=${encodeURIComponent(search)}&sort=${sort}&page=${page}`;
        console.log('Загрузка заявок:', url);

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ошибка сервера: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log('Данные заявок получены:', data);
                renderTable(data.applications);
                renderPagination(data, 'applications');
            })
            .catch(error => {
                console.error('Ошибка загрузки заявок:', error);
                if (tableBody) {
                    tableBody.innerHTML = '<tr><td colspan="8" class="empty-message">Ошибка загрузки данных</td></tr>';
                }
            });
    }

    // Загрузка отзывов
    function fetchReviews(page = 1) {
        const search = reviewsSearch ? reviewsSearch.value : '';
        const url = `/admin-panel/reviews/?search=${encodeURIComponent(search)}&page=${page}`;

        console.log('Загрузка отзывов:', url);

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ошибка сервера: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log('Данные отзывов получены:', data);
                renderReviewsTable(data.reviews);
                renderPagination(data, 'reviews');
            })
            .catch(error => {
                console.error('Ошибка загрузки отзывов:', error);
                if (reviewsTableBody) {
                    reviewsTableBody.innerHTML = '<tr><td colspan="5" class="empty-message">Ошибка загрузки отзывов</td></tr>';
                }
            });
    }

    // Отображение таблицы заявок
    function renderTable(apps) {
        if (!tableBody) return;
        tableBody.innerHTML = '';

        if (!apps || apps.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="empty-message">Заявки не найдены</td></tr>';
            return;
        }

        apps.forEach(app => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${app.id}</td>
                <td>${escapeHtml(app.username)}</td>
                <td>${escapeHtml(app.course)}</td>
                <td>${escapeHtml(app.start_date)}</td>
                <td>${escapeHtml(app.payment_method)}</td>
                <td><span class="status-badge status-${app.status_code}">${escapeHtml(app.status)}</span></td>
                <td>
                    <select class="status-change" data-id="${app.id}">
                        <option value="new" ${app.status_code === 'new' ? 'selected' : ''}>Новая</option>
                        <option value="in_progress" ${app.status_code === 'in_progress' ? 'selected' : ''}>Идёт обучение</option>
                        <option value="completed" ${app.status_code === 'completed' ? 'selected' : ''}>Завершено</option>
                    </select>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Обработчики изменения статуса
        document.querySelectorAll('.status-change').forEach(select => {
            select.addEventListener('change', function() {
                const appId = this.dataset.id;
                const newStatus = this.value;

                fetch('/admin-panel/change-status/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: `app_id=${appId}&status=${newStatus}`
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        showNotification('Статус обновлён', 'success');
                        fetchData(currentPage);
                    } else {
                        showNotification('Ошибка обновления', 'error');
                    }
                });
            });
        });
    }

    // Отображение таблицы отзывов
    function renderReviewsTable(reviews) {
        if (!reviewsTableBody) {
            console.error('reviewsTableBody не найден');
            return;
        }

        reviewsTableBody.innerHTML = '';

        if (!reviews || reviews.length === 0) {
            reviewsTableBody.innerHTML = '<tr><td colspan="5" class="empty-message">Отзывы не найдены</td></tr>';
            return;
        }

        reviews.forEach(review => {
            const row = document.createElement('tr');
            const shortText = review.text.length > 150
                ? review.text.substring(0, 150) + '...'
                : review.text;

            row.innerHTML = `
                <td>${review.id}</td>
                <td>${escapeHtml(review.username)}</td>
                <td>${escapeHtml(review.course)}</td>
                <td>
                    <div class="review-text">${escapeHtml(shortText)}</div>
                    ${review.text.length > 150
                        ? `<button class="btn-show-more" onclick="showFullReview('${escapeHtml(review.text).replace(/'/g, "\\'")}')">Читать полностью</button>`
                        : ''}
                </td>
                <td>${escapeHtml(review.created_at)}</td>
            `;
            reviewsTableBody.appendChild(row);
        });
    }

    // Показать полный отзыв
    window.showFullReview = function(text) {
        const existingModal = document.getElementById('reviewDetailModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'reviewDetailModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Полный текст отзыва</h3>
                    <button class="close-modal" onclick="closeReviewDetailModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <p class="full-review-text">${text}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeReviewDetailModal()">Закрыть</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeReviewDetailModal();
            }
        });

        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 10);
        document.body.style.overflow = 'hidden';
    };

    window.closeReviewDetailModal = function() {
        const modal = document.getElementById('reviewDetailModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = 'auto';
            }, 200);
        }
    };

    // Пагинация
    function renderPagination(data, type) {
        const container = type === 'applications' ? paginationDiv : reviewsPagination;
        if (!container) return;

        container.innerHTML = '';

        if (data.total_pages > 1) {
            const pag = document.createElement('div');
            pag.className = 'pagination-controls';

            if (data.has_previous) {
                const prevBtn = document.createElement('button');
                prevBtn.className = 'page-btn';
                prevBtn.textContent = '«';
                prevBtn.addEventListener('click', () => {
                    if (type === 'applications') {
                        currentPage = data.previous_page;
                        fetchData(currentPage);
                    } else {
                        currentReviewsPage = data.previous_page;
                        fetchReviews(currentReviewsPage);
                    }
                });
                pag.appendChild(prevBtn);
            }

            for (let i = 1; i <= data.total_pages; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.className = 'page-btn';
                if (i === data.current_page) {
                    pageBtn.classList.add('active');
                }
                pageBtn.textContent = i;
                pageBtn.addEventListener('click', () => {
                    if (type === 'applications') {
                        currentPage = i;
                        fetchData(currentPage);
                    } else {
                        currentReviewsPage = i;
                        fetchReviews(currentReviewsPage);
                    }
                });
                pag.appendChild(pageBtn);
            }

            if (data.has_next) {
                const nextBtn = document.createElement('button');
                nextBtn.className = 'page-btn';
                nextBtn.textContent = '»';
                nextBtn.addEventListener('click', () => {
                    if (type === 'applications') {
                        currentPage = data.next_page;
                        fetchData(currentPage);
                    } else {
                        currentReviewsPage = data.next_page;
                        fetchReviews(currentReviewsPage);
                    }
                });
                pag.appendChild(nextBtn);
            }

            container.appendChild(pag);
        }
    }

    // Экранирование HTML
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // CSRF токен
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Уведомления
    function showNotification(message, type = 'success') {
        const oldNotifications = document.querySelectorAll('.notification');
        oldNotifications.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // Debounce
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Обработчики событий для заявок
    if (statusFilter) statusFilter.addEventListener('change', () => { currentPage = 1; fetchData(1); });
    if (searchInput) searchInput.addEventListener('input', debounce(() => { currentPage = 1; fetchData(1); }, 300));
    if (sortSelect) sortSelect.addEventListener('change', () => { currentPage = 1; fetchData(1); });

    // Обработчики событий для отзывов
    if (reviewsSearch) {
        reviewsSearch.addEventListener('input', debounce(() => {
            currentReviewsPage = 1;
            fetchReviews(1);
        }, 300));
    }

    // Закрытие по Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeReviewDetailModal();
        }
    });

    // Начальная загрузка
    fetchData(1);
});