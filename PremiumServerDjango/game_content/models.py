from django.db import models


class GameContent(models.Model):
    name = models.SlugField(max_length=100, unique=True)
    display_name = models.CharField(max_length=255)
    json_config = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Game Content'
        verbose_name_plural = 'Game Content'

    def __str__(self):
        return self.display_name
