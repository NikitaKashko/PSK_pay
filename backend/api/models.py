from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    birth_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.user.username


class Bill(models.Model):
    date = models.DateField()
    userId = models.ForeignKey(User, on_delete=models.CASCADE, default=1)
    accountNumber = models.PositiveIntegerField(default=228)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    pdUrl = models.URLField(default='https://vk.com/pechebka')
    isPaid = models.BooleanField(default=False)
    onPay = models.BooleanField(default=False)
