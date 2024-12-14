from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    birth_date = models.DateField(null=True, blank=True)
    account_number = models.PositiveIntegerField(default=228)

    def __str__(self):
        return self.user.username


class Bill(models.Model):
    date = models.DateField()
    accountNumber = models.PositiveIntegerField(default=228)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    pdUrl = models.URLField(default='https://vk.com/pechebka')
    isPaid = models.BooleanField(default=False)
    onPay = models.BooleanField(default=False)


class Meter(models.Model):
    date = models.DateField()
    dayMeter = models.IntegerField()
    nightMeter = models.IntegerField()
    accountNumber = models.PositiveIntegerField()


def validate_fixed_length(value):
    if len(value) != 16:  # Замените 4 на нужное вам количество символов
        raise ValidationError(f'Длина строки должна быть ровно 16 символа, но получено {len(value)}.')


class CreditCard(models.Model):
    card_number = models.CharField(max_length=16, validators=[validate_fixed_length])
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=100000.00)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)


class Tarif(models.Model):
    day_tarif = models.IntegerField(default=10)
    night_tarif = models.IntegerField(default=15)