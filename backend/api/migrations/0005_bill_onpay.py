# Generated by Django 5.1.4 on 2024-12-12 09:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_bill_pdurl'),
    ]

    operations = [
        migrations.AddField(
            model_name='bill',
            name='onPay',
            field=models.BooleanField(default=False),
        ),
    ]
