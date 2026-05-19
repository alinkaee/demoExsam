from django import forms
from django.contrib.auth.models import User
from django.core.validators import RegexValidator, MinLengthValidator
from .models import UserProfile, Application, Review

class RegisterForm(forms.ModelForm):
    username = forms.CharField(
        label='Логин',
        validators=[
            RegexValidator(r'^[a-zA-Z0-9]+$', 'Только латиница и цифры'),
            MinLengthValidator(6, 'Минимум 6 символов')
        ],
        widget=forms.TextInput(attrs={
            'placeholder': 'Введите логин',
            'class': 'form-control'
        })
    )
    password = forms.CharField(
        label='Пароль',
        widget=forms.PasswordInput(attrs={
            'placeholder': 'Минимум 8 символов',
            'class': 'form-control'
        }),
        validators=[MinLengthValidator(8, 'Минимум 8 символов')]
    )
    password2 = forms.CharField(
        label='Повторите пароль',
        widget=forms.PasswordInput(attrs={
            'placeholder': 'Повторите пароль',
            'class': 'form-control'
        })
    )
    full_name = forms.CharField(
        label='ФИО',
        validators=[RegexValidator(r'^[а-яёА-ЯЁ\s\-]+$', 'Только кириллица, пробелы и дефис')],
        widget=forms.TextInput(attrs={
            'placeholder': 'Иванов Иван Иванович',
            'class': 'form-control'
        })
    )
    phone = forms.CharField(
        label='Телефон',
        validators=[RegexValidator(r'^8\(\d{3}\)\d{3}-\d{2}-\d{2}$', 'Формат: 8(XXX)XXX-XX-XX')],
        widget=forms.TextInput(attrs={
            'placeholder': '8(___)___-__-__',
            'class': 'form-control',
            'data-mask': 'phone'
        })
    )
    email = forms.EmailField(
        label='Email',
        widget=forms.EmailInput(attrs={
            'placeholder': 'example@mail.ru',
            'class': 'form-control'
        })
    )

    class Meta:
        model = User
        fields = ['username', 'password', 'email']

    def clean_username(self):
        username = self.cleaned_data.get('username', '')
        if User.objects.filter(username=username).exists():
            raise forms.ValidationError('Пользователь с таким логином уже существует')
        if User.objects.filter(username__iexact=username).exists():
            raise forms.ValidationError('Логин уже занят (проверка без учёта регистра)')
        return username

    def clean_email(self):
        email = self.cleaned_data.get('email', '')
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError('Пользователь с таким email уже зарегистрирован')
        return email

    def clean_phone(self):
        phone = self.cleaned_data.get('phone', '')
        if UserProfile.objects.filter(phone=phone).exists():
            raise forms.ValidationError('Пользователь с таким телефоном уже зарегистрирован')
        return phone

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        password2 = cleaned_data.get('password2')

        if password and password2 and password != password2:
            self.add_error('password2', 'Пароли не совпадают')

        return cleaned_data


class LoginForm(forms.Form):
    username = forms.CharField(
        label='Логин',
        widget=forms.TextInput(attrs={
            'placeholder': 'Введите логин',
            'class': 'form-control'
        })
    )
    password = forms.CharField(
        label='Пароль',
        widget=forms.PasswordInput(attrs={
            'placeholder': 'Введите пароль',
            'class': 'form-control'
        })
    )


class ApplicationForm(forms.ModelForm):
    course = forms.ChoiceField(
        label='Наименование курса',
        choices=Application.COURSE_CHOICES,
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    start_date = forms.DateField(
        label='Желаемая дата начала обучения',
        input_formats=['%d.%m.%Y'],
        widget=forms.DateInput(
            format='%d.%m.%Y',
            attrs={
                'placeholder': 'ДД.ММ.ГГГГ',
                'class': 'form-control',
                'data-mask': 'date',
                'maxlenght': 10,
            }
        )
    )
    payment_method = forms.ChoiceField(
        label='Способ оплаты',
        choices=Application.PAYMENT_CHOICES,
        widget=forms.Select(attrs={'class': 'form-select'})
    )

    class Meta:
        model = Application
        fields = ['course', 'start_date', 'payment_method']


class ReviewForm(forms.ModelForm):
    class Meta:
        model = Review
        fields = ['text']
        labels = {'text': 'Текст отзыва'}
        widgets = {
            'text': forms.Textarea(attrs={
                'rows': 5,
                'class': 'form-control',
                'placeholder': 'Опишите ваше впечатление о курсе'
            })
        }