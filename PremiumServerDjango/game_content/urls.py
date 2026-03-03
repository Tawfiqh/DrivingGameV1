from django.urls import path

from .views import game_content_detail, game_content_list

app_name = "game_content"

urlpatterns = [
    path(
        "game-content/",
        game_content_list,
        name="game-content-list",
    ),
    path(
        "game-content/<slug:slug>/",
        game_content_detail,
        name="game-content-detail",
    ),
]


