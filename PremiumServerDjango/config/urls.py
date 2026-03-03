"""
URL configuration for DjangoTemplate26 project.
"""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("accounts/", include("users.urls")),
    path("api/", include("game_content.urls")),
    path("", include("core.urls")),
]

