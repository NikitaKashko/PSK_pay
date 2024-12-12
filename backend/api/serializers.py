from django.contrib.auth.models import User
from rest_framework import serializers
from django.core.mail import send_mail
from django.conf import settings
from .models import Profile, Bill, Meter, CreditCard
import random
import string


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {
            "password": {"write_only": True},
        }

    def create(self, validated_data):
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        user.email = validated_data['username']
        user.save()
        Profile.objects.create(user=user)
        try:
            subject = "Регистрация"
            message = 'Регистрация прошла успешно'
            from_email = settings.EMAIL_HOST_USER
            print(send_mail(
                subject,
                message,
                from_email,
                [user.email],
                fail_silently=False
            ))
        except Exception as e:
            print(f"Ошибка при отправке письма: {e}")
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    birth_date = serializers.DateField(source='profile.birth_date')
    account_number = serializers.IntegerField(source='profile.account_number')

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'birth_date', 'account_number']

    def update(self, instance, validated_data):
        print("Validated data:", validated_data)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)

        instance.save()

        profile_instance = instance.profile
        profile_instance.birth_date = validated_data['profile'].get('birth_date', profile_instance.birth_date)
        profile_instance.account_number = validated_data['profile'].get('account_number', profile_instance.account_number)
        
        profile_instance.save()

        return instance


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def save(self):
        email = self.validated_data['email']
        try:
            user = User.objects.get(email=email)
            new_password = self.generate_random_password()
            user.set_password(new_password)
            user.save()

            # Отправка нового пароля на электронную почту
            self.send_email(user.email, new_password)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                "Пользователь с таким email не найден."
            )

    def generate_random_password(self, length=8):
        """Генерация случайного пароля."""
        characters = string.ascii_letters + string.digits + string.punctuation
        return ''.join(random.choice(characters) for i in range(length))

    def send_email(self, email, new_password):
        try:
            subject = "Ваш новый пароль."
            message = (
                'Драсьте, вы просили эт самое, пароль поменять.'
                'Ну так вот держите получайте.'
                f'Ваш новый пароль: {new_password}'
            )
            from_email = settings.EMAIL_HOST_USER
            print(send_mail(
                subject,
                message,
                from_email,
                [email],
                fail_silently=False
            ))
        except Exception as e:
            print(f"Ошибка при отправке письма: {e}")


class BillsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bill
        fields = ['id', 'date', 'accountNumber', 'amount', 'pdUrl', 'isPaid', 'onPay']


class MeterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meter
        fields = ['date', 'dayMeter', 'nightMeter', 'accountNumber']


class CardsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditCard
        fields = ['id', 'card_number', 'user_id']