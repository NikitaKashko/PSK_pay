from django.contrib import admin
from django.urls import path, include
from api.views import CreateUserView, PasswordResetView, UserProfileView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api-auth/", include("rest_framework.urls")),
    path('api/password_reset/', PasswordResetView.as_view(), name='password_reset'),
    path('api/profile/', UserProfileView.as_view(), name='profile'),
]
