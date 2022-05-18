from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """
    user imformation
    """
    MANAGER = 'Manager'
    TEAM_MEMBER = 'Team Member'
    CLIENT = 'Client'
    USERTYPE_CHOICES = [
        (MANAGER, MANAGER),
        (TEAM_MEMBER, TEAM_MEMBER),
        (CLIENT, CLIENT)
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    firstname = models.CharField(max_length=100)
    lastname = models.CharField(max_length=100)
    usertype = models.CharField(max_length=20, choices=USERTYPE_CHOICES)


class Job(models.Model):
    """
    Job Model
    """
    name = models.CharField(max_length=100)
    manager = models.ManyToManyField(User, through='JobManager', through_fields=('job', 'manager'), related_name='m')
    client = models.ManyToManyField(User, through='JobClient', through_fields=('job', 'client'))
    # manager = models.ForeignKey(User, on_delete=models.CASCADE, related_name='+')
    # client = models.ForeignKey(User, on_delete=models.CASCADE)


class JobManager(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    manager = models.ForeignKey(User, on_delete=models.CASCADE)


class JobClient(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    client = models.ForeignKey(User, on_delete=models.CASCADE)


class Phase(models.Model):
    """
    Phase Model
    """
    name = models.CharField(max_length=100)


class Category(models.Model):
    """
    Category Model
    """
    name = models.CharField(max_length=100)


class Action(models.Model):
    """
    Action Model
    """
    BLUE = 'Blue'
    YELLOW = 'Yellow'
    RED = 'Red'
    STATUS_CHOICES = [
        (BLUE, BLUE),
        (YELLOW, YELLOW),
        (RED, RED)
    ]
    name = models.CharField(max_length=100)
    description = models.TextField()
    phase = models.ForeignKey(Phase, on_delete=models.CASCADE)
    # person_in_charge = models.ForeignKey(User, on_delete=models.CASCADE, related_name='+')
    person_in_charge = models.ManyToManyField(User, through='ActionMember')
    start_date = models.DateField()
    due_date = models.DateField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    milestone = models.CharField(max_length=100, null=True, blank=True)


class ActionMember(models.Model):
    action = models.ForeignKey(Action, on_delete=models.CASCADE)
    person_in_charge = models.ForeignKey(User, on_delete=models.CASCADE)


class TemplateAction(models.Model):
    """
    Phase Template
    """
    name = models.CharField(max_length=100)
    phase = models.ForeignKey(Phase, on_delete=models.CASCADE)
    person_in_charge = models.ForeignKey(User, on_delete=models.CASCADE, related_name='+', null=True)
    due_date = models.DateField(null=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=True)


class Comment(models.Model):
    """
    Comment Model
    """
    action = models.ForeignKey(Action, on_delete=models.CASCADE)
    content = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='+')
    date = models.DateField(auto_now_add=True)


def add_sample_data():
    """
    Test data
    """
    for t in [UserProfile.MANAGER, UserProfile.TEAM_MEMBER, UserProfile.CLIENT]:
        for i in range(3):
            try:
                user = User(username="%s%d" % (t, i))
                user.set_password("pass")
                user.save()
                user_profile = UserProfile(user=user, firstname="F%d" % i, lastname="L%d" % i, usertype=t)
                user_profile.save()
            except:
                pass
    for i in range(4):
        try:
            phase = Phase(name="Phase%d" % i)
            phase.save()
        except:
            pass
    for i in range(4):
        try:
            category = Category(name="Category%d" % i)
            category.save()
        except:
            pass
