"""
Views for users app.
"""
from django.contrib.auth.views import LoginView, LogoutView


class UserLoginView(LoginView):
    template_name = 'registration/login.html'
    redirect_authenticated_user = True


class UserLogoutView(LogoutView):
    pass
