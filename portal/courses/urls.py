from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile, name='profile'),
    path('create/', views.create_application, name='create_application'),
    path('review/<int:app_id>/', views.add_review, name='add_review'),
    path('check-unique/', views.check_unique, name='check_unique'),
    path('admin-panel/', views.admin_panel, name='admin_panel'),
    path('admin-panel/data/', views.admin_applications_data, name='admin_data'),
    path('admin-panel/reviews/', views.admin_reviews_data, name='admin_reviews_data'),
    path('admin-panel/change-status/', views.change_status, name='change_status'),
]