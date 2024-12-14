from django.contrib import admin
from .models import Bill, Profile, Meter, CreditCard, Tarif

admin.site.register(Bill)
admin.site.register(Profile)
admin.site.register(Meter)
admin.site.register(CreditCard)
admin.site.register(Tarif)
