# Generated by Django 5.1.4 on 2024-12-12 12:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_bill_userid_alter_bill_accountnumber'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='account_number',
            field=models.PositiveIntegerField(default=228),
        ),
    ]