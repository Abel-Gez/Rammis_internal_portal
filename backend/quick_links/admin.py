from django.contrib import admin

from .models import QuickLink

# Register your models here.
@admin.register(QuickLink)
class QuickLinkAdmin(admin.ModelAdmin):
    list_display = ('name', 'url', 'order', 'active')
    ordering = ('order',)