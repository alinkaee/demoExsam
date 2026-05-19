document.addEventListener('DOMContentLoaded', function() {
    // Слайдер
    const slides = document.querySelector('.slides');
    if (slides) {
        const images = slides.querySelectorAll('img');
        let current = 0;
        const total = images.length;
        const prevBtn = document.querySelector('.prev');
        const nextBtn = document.querySelector('.next');

        function showSlide(index) {
            slides.style.transform = `translateX(-${index * 100}%)`;
        }
        function nextSlide() {
            current = (current + 1) % total;
            showSlide(current);
        }
        function prevSlide() {
            current = (current - 1 + total) % total;
            showSlide(current);
        }
        // Автоматическая смена
        let interval = setInterval(nextSlide, 3000);
        // Остановка при наведении (опционально)
        document.querySelector('.slider').addEventListener('mouseenter', () => clearInterval(interval));
        document.querySelector('.slider').addEventListener('mouseleave', () => interval = setInterval(nextSlide, 3000));

        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);
    }

    // Микроанимация для кнопок (Ripple effect можно добавить)
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            let ripple = document.createElement('span');
            ripple.className = 'ripple';
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
});

// В конце review_modal.js или отдельным файлом
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
            this.setAttribute('aria-expanded',
                this.classList.contains('active') ? 'true' : 'false');
        });

        // Закрыть меню при клике на ссылку
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });

        // Закрыть при клике вне меню
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.navbar')) {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }
});