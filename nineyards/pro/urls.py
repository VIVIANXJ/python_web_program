from django.urls import path
from .views import *


urlpatterns = [
    path('', Homepage, name='homepage'),
    path('register', Register, name='register'),
    path('login', Login, name='login'),
    path('logout', Logout, name='logout'),
    path('addjob', AddJob, name='addjob'),
    path('deletejob/<int:pk>', DeleteJob, name='deletejob'),
    path('jobdetail/<int:pk>', JobDetail, name='jobdetail'),
    path('dashboard', DashBoard, name='dashboard'),
    path('actiondetail/<int:pk>', ActionDetail, name='actiondetail'),
    path('actiondelete/<int:pk>', ActionDelete, name='actiondelete'),
    path('addcomment/<int:pk>', AddComment, name='addcomment'),
    path('deletecomment/<int:pk>', DeleteComment, name='deletecomment'),
    path('phasetemplate', PhaseTemplate, name='phasetemplate'),
    path('editaction/<int:pk>', ActionEdit, name='editaction')
]
