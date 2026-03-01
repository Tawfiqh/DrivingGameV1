from django.contrib import admin
from .models import GameContent


@admin.register(GameContent)
class GameContentAdmin(admin.ModelAdmin):
    list_display = ['name', 'display_name', 'created_at', 'updated_at']
    search_fields = ['name', 'display_name']
    prepopulated_fields = {'name': ('display_name',)}
    readonly_fields = ['created_at', 'updated_at']
