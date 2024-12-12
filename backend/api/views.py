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

        meters = Meter.objects.filter(accountNumber=account_number)

        if month:
            year, month = map(int, month.split('-')) 
            start_date = datetime(year, month, 1) 
            end_date = start_date.replace(day=28) + timezone.timedelta(days=4) 
            end_date = end_date - timezone.timedelta(days=end_date.day) 

            meters = meters.filter(date__range=[start_date, end_date])

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

        serializer_meter = MeterSerializer(data=data)
        if serializer_meter.is_valid():
            serializer_meter.save()  # Сохраняем новую запись в базе данных
            serializer_bill = BillsSerializer()
            data_bill = {
                'accountNumber': account_number,
                'amount': 0,
                'onPay': False
            }
            data_day = data['dayMeter']
            data_night = data['nightMeter']
            try:
                last_meter = Meter.objects.get(accountNumber=account_number)

            except Meter.DoesNotExist:
                data_bill['amount'] = data_day * 10.5 + data_night * 15.5
                serializer_bill(data_bill)
                serializer_bill.save()
            except Meter.MultipleObjectsReturned:
                latest_meter = Meter.objects.filter(accountNumber=account_number).latest('date')
                day = latest_meter.dayMeter
                night = latest_meter.nightMeter
                if not (data_day < day or data_night < night):
                    data_bill['amount'] = (data_day - day) * 10.5 + (data_night - night) * 15.5
                    serializer_bill(data_bill)
                    serializer_bill.save()
                else:
                    return Response(serializer_meter.data, status=status.HTTP_400_BAD_REQUEST)
            else:
                day = last_meter.dayMeter
                night = last_meter.nightMeter
                if not (data_day < day or data_night < night):
                    data_bill['amount'] = (data_day - day) * 10.5 + (data_night - night) * 15.5
                    serializer_bill(data_bill)
                    serializer_bill.save()
                else:
                    return Response(serializer_meter.data, status=status.HTTP_400_BAD_REQUEST)

            return Response(serializer_meter.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer_meter.errors, status=status.HTTP_400_BAD_REQUEST)
