# Generated by Django 5.1.4 on 2024-12-12 19:09

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_alter_bill_userid'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='bill',
            name='userId',
        ),
    ]
