from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.db.models import Case, When, Value, CharField
from django.contrib.auth.models import User
from .models import UserProfile
from .forms import RegisterForm, LoginForm, ApplicationForm
from django.http import JsonResponse
from django.core.paginator import Paginator
from django.db.models import Q
from django.contrib.auth.decorators import login_required, user_passes_test
from .models import Review, Application




def home(request):
    return render(request, 'courses/home.html')


def register_view(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            # Создаём пользователя
            user = User.objects.create_user(
                username=form.cleaned_data['username'],
                password=form.cleaned_data['password'],
                email=form.cleaned_data['email']
            )
            # Создаём профиль
            UserProfile.objects.create(
                user=user,
                full_name=form.cleaned_data['full_name'],
                phone=form.cleaned_data['phone']
            )
            # Авторизуем после регистрации
            login(request, user)
            messages.success(request, 'Регистрация прошла успешно! Добро пожаловать!')
            return redirect('profile')
        else:
            # Если форма невалидна — ошибки отобразятся в шаблоне
            messages.error(request, 'Пожалуйста, исправьте ошибки в форме')
    else:
        form = RegisterForm()

    return render(request, 'courses/register.html', {'form': form})


def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)
                messages.success(request, f'Добро пожаловать, {username}!')

                # Проверяем, админ ли это
                if username == 'Admin26' and user.check_password('Demo20'):
                    return redirect('admin_panel')
                return redirect('profile')
            else:
                messages.error(request, 'Неверный логин или пароль')
        else:
            messages.error(request, 'Пожалуйста, исправьте ошибки в форме')
    else:
        form = LoginForm()

    return render(request, 'courses/login.html', {'form': form})


def logout_view(request):
    logout(request)
    messages.info(request, 'Вы вышли из системы')
    return redirect('home')


@login_required
def profile(request):
    applications = Application.objects.filter(user=request.user)
    return render(request, 'courses/profile.html', {'applications': applications})


@login_required
def create_application(request):
    if request.method == 'POST':
        form = ApplicationForm(request.POST)
        if form.is_valid():
            application = form.save(commit=False)
            application.user = request.user
            application.save()
            messages.success(request, 'Заявка успешно отправлена на рассмотрение!')
            return redirect('profile')
    else:
        form = ApplicationForm()
    return render(request, 'courses/create_application.html', {'form': form})


@login_required
def add_review(request, app_id):
    application = get_object_or_404(Application, pk=app_id, user=request.user)

    # Проверяем, что курс завершён
    if application.status != 'completed':
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'success': False, 'error': 'Отзыв можно оставить только после завершения обучения'})
        messages.error(request, 'Отзыв можно оставить только после завершения обучения')
        return redirect('profile')

    # Проверяем, что отзыв ещё не оставлен
    if hasattr(application, 'review'):
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'success': False, 'error': 'Вы уже оставили отзыв к этой заявке'})
        messages.error(request, 'Вы уже оставили отзыв к этой заявке')
        return redirect('profile')

    if request.method == 'POST':
        text = request.POST.get('text', '').strip()

        print(f"DEBUG: Получен текст отзыва: '{text}'")  # Отладочный вывод
        print(f"DEBUG: ID заявки: {app_id}")
        print(f"DEBUG: Пользователь: {request.user.username}")

        # Проверяем, что текст не пустой
        if not text or len(text) < 10:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'error': 'Текст отзыва должен содержать минимум 10 символов'})
            messages.error(request, 'Текст отзыва должен содержать минимум 10 символов')
            return redirect('profile')

        try:
            # СОЗДАЁМ ОТЗЫВ В БАЗЕ ДАННЫХ
            review = Review.objects.create(
                application=application,
                text=text
            )
            print(f"DEBUG: Отзыв создан! ID: {review.id}, Текст: {review.text}")  # Отладочный вывод

            # Проверяем, что отзыв действительно сохранился
            check_review = Review.objects.filter(application=application).first()
            print(f"DEBUG: Проверка - отзыв в БД: {check_review}")
            print(f"DEBUG: Текст в БД: '{check_review.text if check_review else 'НЕТ ОТЗЫВА'}'")

            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': True, 'message': 'Отзыв успешно сохранён'})

            messages.success(request, 'Спасибо за ваш отзыв!')
            return redirect('profile')

        except Exception as e:
            print(f"DEBUG: Ошибка при создании отзыва: {e}")
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'error': f'Ошибка сохранения: {str(e)}'})
            messages.error(request, 'Произошла ошибка при сохранении отзыва')
            return redirect('profile')

    return JsonResponse({'success': False, 'error': 'Метод не поддерживается'})


def admin_panel(request):
    if not request.user.is_authenticated or request.user.username != 'Admin26':
        messages.error(request, 'Доступ запрещён')
        return redirect('login')
    return render(request, 'courses/admin_panel.html')


def admin_applications_data(request):
    if not request.user.is_authenticated or request.user.username != 'Admin26':
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    status = request.GET.get('status')
    search = request.GET.get('search')
    sort = request.GET.get('sort', '-created_at')
    page = int(request.GET.get('page', 1))

    applications = Application.objects.all()

    if status and status != 'all':
        applications = applications.filter(status=status)

    if search:
        applications = applications.annotate(
            course_display=Case(
                When(course='qualification', then=Value('Курс по повышению квалификации')),
                When(course='retraining', then=Value('Курс по переподготовке')),
                When(course='safety', then=Value('Курс по охране труда')),
                output_field=CharField(),
            )
        ).filter(
            Q(user__username__icontains=search) |
            Q(course_display__icontains=search)
        )

    allowed_sorts = ['-created_at', 'created_at', 'user__username', 'course', 'status']
    if sort in allowed_sorts:
        applications = applications.order_by(sort)

    paginator = Paginator(applications, 4)  # ИЗМЕНИЛИ С 10 НА 4
    page_obj = paginator.get_page(page)

    data = {
        'applications': [
            {
                'id': app.id,
                'username': app.user.username,
                'course': app.get_course_display(),
                'start_date': app.start_date.strftime('%d.%m.%Y'),
                'payment_method': app.get_payment_method_display(),
                'status': app.get_status_display(),
                'status_code': app.status,
                'has_review': hasattr(app, 'review'),
            } for app in page_obj
        ],
        'has_previous': page_obj.has_previous(),
        'has_next': page_obj.has_next(),
        'previous_page': page_obj.previous_page_number() if page_obj.has_previous() else None,
        'next_page': page_obj.next_page_number() if page_obj.has_next() else None,
        'current_page': page_obj.number,
        'total_pages': paginator.num_pages,
    }
    return JsonResponse(data)


def admin_reviews_data(request):
    if not request.user.is_authenticated or request.user.username != 'Admin26':
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    search = request.GET.get('search', '')
    page = int(request.GET.get('page', 1))

    reviews = Review.objects.select_related('application__user').all()

    if search:
        reviews = reviews.filter(
            Q(application__user__username__icontains=search) |
            Q(application__course__icontains=search) |
            Q(text__icontains=search)
        )

    reviews = reviews.order_by('-created_at')

    paginator = Paginator(reviews, 4)  # ИЗМЕНИЛИ С 10 НА 4
    page_obj = paginator.get_page(page)

    data = {
        'reviews': [
            {
                'id': review.id,
                'username': review.application.user.username,
                'course': review.application.get_course_display(),
                'text': review.text,
                'created_at': review.created_at.strftime('%d.%m.%Y %H:%M'),
                'application_id': review.application.id,
            } for review in page_obj
        ],
        'has_previous': page_obj.has_previous(),
        'has_next': page_obj.has_next(),
        'previous_page': page_obj.previous_page_number() if page_obj.has_previous() else None,
        'next_page': page_obj.next_page_number() if page_obj.has_next() else None,
        'current_page': page_obj.number,
        'total_pages': paginator.num_pages,
    }
    return JsonResponse(data)

def admin_required(user):
    return user.is_authenticated and user.is_staff

@login_required
@user_passes_test(admin_required)
def admin_reviews_data(request):

    search = request.GET.get('search', '').strip()
    page_number = int(request.GET.get('page', 1))
    per_page = 10

    # 🔥 Важно: select_related для оптимизации запросов
    reviews = Review.objects.select_related(
        'application__user'
    ).order_by('-created_at')

    # Поиск
    if search:
        reviews = reviews.filter(
            Q(application__user__username__icontains=search) |
            Q(application__course__icontains=search) |
            Q(text__icontains=search)
        )

    # Пагинация
    paginator = Paginator(reviews, per_page)
    page_obj = paginator.get_page(page_number)

    # 🎯 Сериализация — поля должны точно совпадать с тем, что ждёт JS!
    reviews_data = []
    for r in page_obj:
        reviews_data.append({
            'id': r.id,
            'username': r.application.user.username,  # ← JS ждёт 'username'
            'course': r.application.get_course_display(),  # ← читаемое название курса
            'text': r.text,  # ← полный текст
            'created_at': r.created_at.strftime('%d.%m.%Y %H:%M'),  # ← формат даты
        })

    return JsonResponse({
        'reviews': reviews_data,
        'total_pages': paginator.num_pages,
        'current_page': page_obj.number,
        'has_previous': page_obj.has_previous(),
        'has_next': page_obj.has_next(),
        'previous_page': page_obj.previous_page_number() if page_obj.has_previous() else None,
        'next_page': page_obj.next_page_number() if page_obj.has_next() else None,
    })

@login_required
def change_status(request):
    if request.user.username != 'Admin26':
        return JsonResponse({'error': 'Forbidden'}, status=403)

    if request.method == 'POST':
        app_id = request.POST.get('app_id')
        new_status = request.POST.get('status')

        try:
            app = Application.objects.get(pk=app_id)
            app.status = new_status
            app.save()
            return JsonResponse({'success': True, 'new_status': app.get_status_display()})
        except Application.DoesNotExist:
            return JsonResponse({'error': 'Заявка не найдена'}, status=404)

    return JsonResponse({'error': 'Метод не поддерживается'}, status=400)