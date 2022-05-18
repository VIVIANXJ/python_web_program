from django.http import HttpResponseRedirect
from django.urls import reverse


class DisAllowUnloggedIn:
    """
    user must log in
    """
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        if request.path != reverse('login') and request.path != reverse('register') and not request.user.is_authenticated:
            return HttpResponseRedirect(reverse('login'))

        response = self.get_response(request)
        return response
