from django.contrib import admin
from django.urls import path, include
from api.views import CreateUserView, PasswordResetView, UserProfileView, BillsListView, BillsUnpaidListView, MeterView, CreditsView, BillsUnpaidView, PaymentView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api-auth/", include("rest_framework.urls")),
    path('api/password_reset/', PasswordResetView.as_view(), name='password_reset'),
    path('api/profile/', UserProfileView.as_view(), name='profile'),
    path('api/bills/history/', BillsListView.as_view(), name='bills_history'),
    path('api/bills/unpaid/', BillsUnpaidListView.as_view(), name='bills_unpaid'),
    path('api/bills/<int:pk>/', BillsUnpaidView.as_view(), name='bill_payment'),
    path('api/bills/pay/', PaymentView.as_view(), name='payment'),
    path('api/meters/history/', MeterView.as_view(), name='meter_history'),
    path('api/payment-methods/', CreditsView.as_view(), name='payment_methods_list'),
    path('api/payment-methods/<int:pk>/', CreditsView.as_view(), name='delete_payment_method'),
]
