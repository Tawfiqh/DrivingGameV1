from django.urls import path

from .views import appstore_webhook

app_name = "appstore"

urlpatterns = [
    path("webhook/", appstore_webhook, name="webhook"),
]
