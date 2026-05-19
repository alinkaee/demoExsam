from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator, MinLengthValidator

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(
        max_length=255,
        validators=[RegexValidator(r'^[а-яёА-ЯЁ\s]+$', 'Только кириллица и пробелы')]
    )
    phone = models.CharField(
        max_length=20,
        validators=[RegexValidator(r'^8\(\d{3}\)\d{3}-\d{2}-\d{2}$', 'Формат: 8(XXX)XXX-XX-XX')]
    )

    def __str__(self):
        return self.full_name

class Application(models.Model):
    STATUS_CHOICES = [
        ('new', 'Новая'),
        ('in_progress', 'Идет обучение'),
        ('completed', 'Обучение завершено'),
    ]
    PAYMENT_CHOICES = [
        ('cash', 'Наличными'),
        ('transfer', 'Переводом по номеру телефона'),
    ]
    COURSE_CHOICES = [
        ('qualification', 'Курс по повышению квалификации'),
        ('retraining', 'Курс по переподготовке'),
        ('safety', 'Курс по охране труда'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.CharField(max_length=30, choices=COURSE_CHOICES)
    start_date = models.DateField()
    payment_method = models.CharField(max_length=10, choices=PAYMENT_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_course_display()} ({self.user.username})"

class Review(models.Model):
    application = models.OneToOneField(
        Application,
        on_delete=models.CASCADE,
        related_name='review',
        verbose_name='Заявка'
    )
    text = models.TextField(verbose_name='Текст отзыва')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')

    class Meta:
        verbose_name = 'Отзыв'
        verbose_name_plural = 'Отзывы'

    def __str__(self):
        return f"Отзыв к {self.application}"