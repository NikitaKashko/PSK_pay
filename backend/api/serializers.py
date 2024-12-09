from django.contrib.auth.models import User
from rest_framework import serializers
from django.core.mail import send_mail
import random
import string


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        return user


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def save(self):
        email = self.validated_data['email']
        try:
            user = User.objects.get(username=email)
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
        """Отправка email с новым паролем."""
        subject = "Ваш новый пароль"
        message = f"Ваш новый пароль: {new_password}"
        from_email = 'psk_pay@mail.ru'
        send_mail(
            subject,
            message,
            from_email,
            [email],
            fail_silently=False
        )
