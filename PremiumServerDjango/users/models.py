"""
User models for DjangoTemplate26 project.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model extending AbstractUser.
    Can be extended with additional fields as needed for specific projects.
    """
    # Add custom fields here as needed
    # Example: profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    # Example: role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='user')
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return self.username
