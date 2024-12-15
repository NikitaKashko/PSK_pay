from django.contrib.auth.models import User
from rest_framework import generics, views
from .serializers import UserSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .serializers import PasswordResetSerializer, UserProfileSerializer, BillsSerializer, MeterSerializer, CardsSerializer
from .models import Bill, Profile, Meter, CreditCard, Tarif
from django.utils import timezone
from datetime import datetime
from rest_framework import status
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
import os


def generate_pdf(bill):
    # Здесь создайте HTML-контент для вашего PDF
    html_content = f"<h1>Счет #{bill.id}</h1><p>Сумма: {bill.amount}</p>"
    
    pdf_file_path = f"media/bills/bill_{bill.id}.pdf"  # Путь к файлу PDF
    HTML(string=html_content).write_pdf(pdf_file_path)
    
    return pdf_file_path


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
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        month = request.query_params.get('month')
        account_number = Profile.objects.get(pk=user.id).account_number
        

        if month:
            year, month = map(int, month.split('-')) 
            start_date = datetime(year, month, 1) 
            end_date = start_date.replace(day=28) + timezone.timedelta(days=4) 
            end_date = end_date - timezone.timedelta(days=end_date.day) 

            bills = Bill.objects.filter(date__range=[start_date, end_date])

        if account_number:
            bills = bills.filter(accountNumber=account_number)

        serializer = BillsSerializer(bills, many=True)
        return Response(serializer.data)


class BillsUnpaidListView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        bills = Bill.objects.filter(accountNumber=Profile.objects.get(user_id=user).account_number, isPaid=False)

        serializer = BillsSerializer(bills, many=True)
        return Response(serializer.data)


class BillsUnpaidView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        bill = Bill.objects.get(pk=pk)

        serializer = BillsSerializer(bill)
        return Response(serializer.data)


class MeterView(views.APIView):
    permission_classes = [IsAuthenticated]

    def generate_pdf(self, bill):
        pdf_directory = "media/bills/"
        if not os.path.exists(pdf_directory):
            os.makedirs(pdf_directory)
        # Создание PDF-файла в указанной директории
        pdf_file_path = f"media/bills/bill_{bill.id}.pdf"  # Укажите путь к файлу
        font_path = 'fonts/LG_Display.ttf'

        pdfmetrics.registerFont(TTFont('LG_Display', font_path))

        p = canvas.Canvas(pdf_file_path, pagesize=letter)
        p.setFont("LG_Display", 12)
        p.drawString(100, 750, f"Счет ID: {bill.id}")
        p.drawString(100, 730, f"Дата: {bill.date.strftime('%Y-%m-%d')}")
        p.drawString(100, 710, f"Сумма: {bill.amount}")
        p.drawString(100, 690, f"Оплачено: {'Да' if bill.isPaid else 'Нет'}")
        p.showPage()
        p.save()

        return 'http://127.0.0.1:8000/' + pdf_file_path

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
        tarif = Tarif.objects.get(pk=1)
        day_tarif = tarif.day_tarif
        day_night = tarif.night_tarif
        
        # Получаем данные из запроса и добавляем необходимые поля
        data = {
            'date': request.data.get('date'),
            'dayMeter': request.data.get('dayMeter'),
            'nightMeter': request.data.get('nightMeter'),
            'accountNumber': account_number
        }

        serializer_meter = MeterSerializer(data=data)
        if serializer_meter.is_valid():
            data_bill = {
                'date': data['date'],
                'accountNumber': account_number,
                'amount': 0,
                'onPay': False,
            }
            data_day = int(data['dayMeter'])
            data_night = int(data['nightMeter'])
            try:
                last_meter = Meter.objects.get(accountNumber=account_number)

            except Meter.DoesNotExist:
                data_bill['amount'] = data_day * day_tarif + data_night * day_night
                serializer_bill = BillsSerializer(data=data_bill)
                serializer_bill.is_valid(raise_exception=True)
                bill_instance = serializer_bill.save()
                pdf_url = self.generate_pdf(bill_instance)
                bill_instance.pdUrl = pdf_url
                bill_instance.save()
            except Meter.MultipleObjectsReturned:
                latest_meter = Meter.objects.filter(accountNumber=account_number).latest('date')
                day = latest_meter.dayMeter
                night = latest_meter.nightMeter
                if not (data_day < day or data_night < night):
                    data_bill['amount'] = (data_day - day) * day_tarif + (data_night - night) * day_night
                    serializer_bill = BillsSerializer(data=data_bill)
                    serializer_bill.is_valid(raise_exception=True)
                    bill_instance = serializer_bill.save()
                    pdf_url = self.generate_pdf(bill_instance)
                    bill_instance.pdUrl = pdf_url
                    bill_instance.save()
                else:
                    return Response(serializer_meter.data, status=status.HTTP_400_BAD_REQUEST)
            else:
                day = last_meter.dayMeter
                night = last_meter.nightMeter
                if not (data_day < day or data_night < night):
                    data_bill['amount'] = (data_day - day) * day_tarif + (data_night - night) * day_night
                    serializer_bill = BillsSerializer(data=data_bill)
                    serializer_bill.is_valid(raise_exception=True)
                    bill_instance = serializer_bill.save()
                    pdf_url = self.generate_pdf(bill_instance)
                    bill_instance.pdUrl = pdf_url
                    bill_instance.save()
                else:
                    return Response(serializer_meter.data, status=status.HTTP_400_BAD_REQUEST)

            serializer_meter.save()

            return Response(serializer_meter.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer_meter.errors, status=status.HTTP_400_BAD_REQUEST)


class CreditsView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        cards = CreditCard.objects.filter(user_id=user)
        serializer = CardsSerializer(cards, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = request.user
        print(user)
        data = {
            'card_number': request.data['method'],
            'user_id': user.id
        }
        serializer = CardsSerializer(data=data)
        serializer.is_valid()
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request, pk):
        card_to_delete = CreditCard.objects.get(pk=pk)
        card_to_delete.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PaymentView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        print(data)
        bill = Bill.objects.get(pk=data['billId'])
        card = CreditCard.objects.get(card_number=data['method'])
        if card.balance >= bill.amount:
            card.balance = card.balance - bill.amount
            bill.isPaid = True
            card.save()
            bill.save()
            return Response(status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class PaymentQRView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        bill = Bill.objects.get(pk=data['billId'])
        bill.isPaid = True
        bill.save()
        return Response(status=status.HTTP_200_OK)
