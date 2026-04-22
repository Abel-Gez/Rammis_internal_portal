from django.contrib import admin

from vacancies.models import Vacancy, EmploymentType

# Register your models here.
admin.site.register(Vacancy)
admin.site.register(EmploymentType)