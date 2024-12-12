from django.contrib.auth.models import User
from rest_framework import generics, views
from .serializers import UserSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .serializers import PasswordResetSerializer, UserProfileSerializer, BillsSerializer, MeterSerializer
from .models import Bill, Profile, Meter
from django.utils import timezone
from datetime import datetime
from rest_framework import status


# Create your views here.
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class PasswordResetView(generics.GenericAPIView):
    serializer_class = PasswordResetSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Новый пароль отправлен на ваш email."})


class UserProfileView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        serializer = UserProfileSerializer(data=request.data, instance=request.user)
        serializer.is_valid(raise_exception=True)
        serializer.save()
 
        return Response({"post": serializer.data})


class BillsListView(views.APIView):

    def get(self, request):
        user = request.user
        month = request.query_params.get('month')
        account_number = request.query_params.get('accountNumber')

        if month:
            year, month = map(int, month.split('-')) 
            start_date = datetime(year, month, 1) 
            end_date = start_date.replace(day=28) + timezone.timedelta(days=4) 
            end_date = end_date - timezone.timedelta(days=end_date.day) 

            bills = Bill.objects.filter(userId=user, date__range=[start_date, end_date])
        else:
            bills = Bill.objects.filter(userId=user)

        if account_number:
            bills = bills.filter(accountNumber=account_number)

        serializer = BillsSerializer(bills, many=True)
        return Response(serializer.data)


class BillsUnpaidListView(views.APIView):

    def get(self, request):
        user = request.user
        bills = Bill.objects.filter(userId=user, isPaid=False)

        serializer = BillsSerializer(bills, many=True)
        return Response(serializer.data)


class MeterView(views.APIView):

    def get(self, request):
        user = request.user
        month = request.query_params.get('month')
        account_number = Profile.objects.get(user=user).account_number

        if month:
            year, month = map(int, month.split('-')) 
            start_date = datetime(year, month, 1) 
            end_date = start_date.replace(day=28) + timezone.timedelta(days=4) 
            end_date = end_date - timezone.timedelta(days=end_date.day) 

            meters = Meter.objects.filter(userId=user, date__range=[start_date, end_date])

        if account_number:
            meters = meters.filter(accountNumber=account_number)

        serializer = MeterSerializer(meters, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = request.user
        account_number = Profile.objects.get(user=user).account_number
        
        # Получаем данные из запроса и добавляем необходимые поля
        data = {
            'date': request.data.get('date'),
            'dayMeter': request.data.get('dayMeter'),
            'nightMeter': request.data.get('nightMeter'),
            'accountNumber': account_number
        }

        serializer = MeterSerializer(data=data)
        
        if serializer.is_valid():
            serializer.save()  # Сохраняем новую запись в базе данных
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)