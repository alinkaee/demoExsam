from django import forms
from django.contrib.auth.models import User
from django.core.validators import RegexValidator, MinLengthValidator
from .models import  Application, Review

class RegisterForm(forms.ModelForm):
    username = forms.CharField(
        label='Логин',
        validators=[
            RegexValidator(r'^[a-zA-Z0-9]+$', 'Только латиница и цифры'),
            MinLengthValidator(6, 'Минимум 6 символов')
        ],
        widget=forms.TextInput(attrs={'placeholder': 'Введите логин'})
    )
    password = forms.CharField(
        label='Пароль',
        widget=forms.PasswordInput(attrs={'placeholder': 'Минимум 8 символов'}),
        validators=[MinLengthValidator(8, 'Минимум 8 символов')]
    )
    password2 = forms.CharField(
        label='Повторите пароль',
        widget=forms.PasswordInput(attrs={'placeholder': 'Повторите пароль'})
    )
    full_name = forms.CharField(
        label='ФИО',
        validators=[RegexValidator(r'^[а-яёА-ЯЁ\s]+$', 'Только кириллица и пробелы')],
        widget=forms.TextInput(attrs={'placeholder': 'Иванов Иван Иванович'})
    )
    phone = forms.CharField(
        label='Телефон',
        validators=[RegexValidator(r'^8\(\d{3}\)\d{3}-\d{2}-\d{2}$', 'Формат: 8(XXX)XXX-XX-XX')],
        widget=forms.TextInput(attrs={
            'placeholder': '8(___)-__-__',
            'data-mask': '8(XXX)XXX-XX-XX'
        })
    )
    email = forms.EmailField(
        label='Адрес электронной почты',
        widget=forms.EmailInput(attrs={'placeholder': 'example@mail.ru'})
    )

    class Meta:
        model = User
        fields = ['username', 'password', 'email']

    def clean_username(self):
        username = self.cleaned_data['username']
        if User.objects.filter(username=username).exists():
            raise forms.ValidationError('Пользователь с таким логином уже существует')
        return username

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        password2 = cleaned_data.get('password2')

        if password and password2 and password != password2:
            raise forms.ValidationError('Пароли не совпадают')

        return cleaned_data

class LoginForm(forms.Form):
    username = forms.CharField(
        label='Логин',
        widget=forms.TextInput(attrs={'placeholder': 'Введите логин'})
    )
    password = forms.CharField(
        label='Пароль',
        widget=forms.PasswordInput(attrs={'placeholder': 'Введите пароль'})
    )

class ApplicationForm(forms.ModelForm):
    course = forms.ChoiceField(
        label='Наименование курса',
        choices=Application.COURSE_CHOICES,
        widget=forms.Select(attrs={'class': 'course-select'})
    )
    start_date = forms.DateField(
        label='Желаемая дата начала обучения',
        input_formats=['%d.%m.%Y'],
        widget=forms.DateInput(
            format='%d.%m.%Y',
            attrs={
                'placeholder': 'ДД.ММ.ГГГГ',
                'class': 'date-input'
            }
        )
    )
    payment_method = forms.ChoiceField(
        label='Способ оплаты',
        choices=Application.PAYMENT_CHOICES,
        widget=forms.Select(attrs={'class': 'payment-select'})
    )

    class Meta:
        model = Application
        fields = ['course', 'start_date', 'payment_method']

class ReviewForm(forms.ModelForm):
    class Meta:
        model = Review
        fields = ['text']
        labels = {
            'text': 'Текст отзыва',
        }
        widgets = {
            'text': forms.Textarea(attrs={
                'rows': 3,
                'placeholder': 'Опишите ваше впечатление о курсе...'
            })
        }