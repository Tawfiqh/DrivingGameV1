from django.db import models


class AppStoreSubscription(models.Model):
    original_transaction_id = models.CharField(
        max_length=255, unique=True, db_index=True,
    )
    transaction_id = models.CharField(max_length=255)
    product_id = models.CharField(max_length=255, db_index=True)
    bundle_id = models.CharField(max_length=255)
    environment = models.CharField(max_length=20)
    expires_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    last_notification_type = models.CharField(max_length=100, blank=True)
    last_notification_subtype = models.CharField(max_length=100, blank=True)
    original_purchase_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'App Store Subscription'

    def __str__(self) -> str:
        status = "active" if self.is_active else "inactive"
        return f"{self.product_id} ({self.original_transaction_id}) [{status}]"
