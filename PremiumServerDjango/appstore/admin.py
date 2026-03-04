from django.contrib import admin

from .models import AppStoreSubscription


@admin.register(AppStoreSubscription)
class AppStoreSubscriptionAdmin(admin.ModelAdmin):
    list_display = [
        'original_transaction_id',
        'product_id',
        'is_active',
        'environment',
        'expires_date',
        'last_notification_type',
        'updated_at',
    ]
    list_filter = ['is_active', 'environment', 'product_id']
    search_fields = ['original_transaction_id', 'transaction_id', 'product_id']
    readonly_fields = ['created_at', 'updated_at']
