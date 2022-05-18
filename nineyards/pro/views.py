from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponseRedirect, JsonResponse
from django.urls import reverse
from django.db.models import Max, Count, Q
import json

from .models import *


def actionDetailInfo():
    actions = Action.objects.all()
    adet = []
    from datetime import datetime
    for action in actions:
        start_pos = action.start_date
        end_pos = action.due_date
        start_ss = int((datetime(start_pos.year, start_pos.month, start_pos.day).timestamp() + 10) / 24 / 3600)
        end_ss = int((datetime(end_pos.year, end_pos.month, end_pos.day).timestamp() + 10) / 24 / 3600)
        adet.append({
            'start': start_ss,
            'end': end_ss
        })
    return adet


@csrf_exempt
def Homepage(request):
    """
    Homepage
    """
    if request.method == 'GET':
        jobs = Job.objects.annotate(
            due=Max('action__due_date'),
            red_cnt=Count('action', filter=Q(action__status=Action.RED)),
            yellow_cnt=Count('action', filter=Q(action__status=Action.YELLOW)),
        ).values()
        if 'data' in request.GET:
            return JsonResponse({
                'jobs': [dict(v) for v in jobs],
                'jobmanagers': [dict(v) for v in JobManager.objects.values()],
                'jobclients': [dict(v) for v in JobClient.objects.values()],
                'actions': [dict(v) for v in Action.objects.values()],
                'actionmembers': [dict(v) for v in ActionMember.objects.values()],
                'phases': [dict(v) for v in Phase.objects.values()],
                'action_details': actionDetailInfo(),
                'users': [dict(v) for v in User.objects.values()],
                'profiles': [dict(v) for v in UserProfile.objects.values()]
            })
        return render(request, 'pro/homepage_new.html', {})
        return render(request, 'pro/homepage.html', {
            'jobs': jobs,
            'jobmanagers': JobManager.objects.all(),
            'jobclients': JobClient.objects.all(),
            'actions': Action.objects.all(),
            'actionmembers': ActionMember.objects.all(),
            'phases': Phase.objects.all(),
            'action_details': actionDetailInfo()
        })
    else: # milestone
        action = Action.objects.get(pk=request.POST.get('pk'))
        action.milestone = request.POST.get('milestone')
        action.save()
        return JsonResponse({ 'status': 'OK' })


@csrf_exempt
def Register(request):
    """
   Register page
    """
    if request.method == "GET":
        return render(request, 'pro/register.html', {})
    else:
        if 'check' in request.POST: # heck there is the same account or not
            t = User.objects.filter(username=request.POST.get('check'))
            return JsonResponse({ 'status': 'OK' if len(t) == 0 else 'exist' })
        account = request.POST.get("account")
        firstname = request.POST.get("firstname")
        lastname = request.POST.get("lastname")
        usertype = request.POST.get("usertype")
        if usertype == 'Client':
            usertype = UserProfile.CLIENT
        elif usertype == 'Manager':
            usertype = UserProfile.MANAGER
        else:
            usertype = UserProfile.TEAM_MEMBER
        password = request.POST.get("password")
        # Ensure that it does not crash when an error is reported
        try:
            user = User(username=account)
            user.set_password(password)
            user.save()
            userprofile = UserProfile(
                user=user,
                firstname=firstname,
                lastname=lastname,
                usertype=usertype
            )
            userprofile.save()
        except:
            return render(request, 'pro/register.html', {
                'account': account,
                'firstname': firstname,
                'lastname': lastname
            })
        return HttpResponseRedirect(reverse('login'))


@csrf_exempt
def Login(request):
    """
    Login page
    """
    if request.method == 'GET':
        return render(request, 'pro/login.html', {})
    else:
        account = request.POST.get('account')
        password = request.POST.get('password')
        user = authenticate(request, username=account, password=password)
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse('homepage'))
        else:
            context = {
                'account': account,
                'password': password,
            }
            return render(request, 'pro/login.html', context)


@csrf_exempt
def Logout(request):
    """
    Logout
    """
    logout(request)
    return HttpResponseRedirect(reverse('login'))


@csrf_exempt
def JobDetail(request, pk):
    """
    JobDetail page
    """
    if request.method == 'GET':
        jobs = Job.objects.all()
        job = Job.objects.get(pk=pk)
        actions = Action.objects.filter(job=job)
        return render(request, 'pro/jobdetail.html', {
            'jobs': jobs,
            'job': job,
            'actions': actions,
            'fullactions': Action.objects.all(),
            'jobmanagers': JobManager.objects.filter(job=job),
            'fulljobmans': JobManager.objects.all(),
            'fulljobclts': JobClient.objects.all(),
            'phases': Phase.objects.all(),
            'categories': Category.objects.all(),
            'actionmembers': ActionMember.objects.all(),
        })
    else:
        # edit phase and category
        if 'phase' in request.POST:
            lst = Phase.objects.all()
            dat = json.loads(request.POST.get('phase'))
        else:
            lst = Category.objects.all()
            dat = json.loads(request.POST.get('category'))
        itm_ids = {}
        new_itms = []
        for v in dat:
            if int(v['pk']):
                itm_ids[int(v['pk'])] = v['name']
            else:
                new_itms.append(v['name'])
        # delete
        for itm in lst:
            if itm.pk not in itm_ids:
                itm.delete()
            else:
                itm.name = itm_ids[itm.pk]
                itm.save()
        # add
        for v in new_itms:
            ni = Phase(name=v) if 'phase' in request.POST else Category(name=v)
            ni.save()
        return JsonResponse({ 'staus': 'OK' })


@csrf_exempt
def AddJob(request):
    """
    Add Job page
    """
    if request.method == 'GET':
        if 'data' in request.GET:
            return JsonResponse({
                'managers': [dict(v) for v in User.objects.filter(userprofile__usertype=UserProfile.MANAGER).values()],
                'team_members': [dict(v) for v in User.objects.filter(userprofile__usertype=UserProfile.TEAM_MEMBER).values()],
                'clients': [dict(v) for v in User.objects.filter(userprofile__usertype=UserProfile.CLIENT).values()],
                'phases': [dict(v) for v in Phase.objects.all().values()],
                'categories': [dict(v) for v in Category.objects.all().values()],
                'actions': [dict(v) for v in TemplateAction.objects.all().values()],
                'profiles': [dict(v) for v in UserProfile.objects.values()]
            })
        return render(request, 'pro/addjob_new.html', {
            'managers': User.objects.filter(userprofile__usertype=UserProfile.MANAGER),
            'team_members': User.objects.filter(userprofile__usertype=UserProfile.TEAM_MEMBER),
            'clients': User.objects.filter(userprofile__usertype=UserProfile.CLIENT),
            'phases': Phase.objects.all(),
            'categories': Category.objects.all(),
            'actions': TemplateAction.objects.all()
        })
    else:
        if 'phase' in request.POST or 'category' in request.POST:
            if 'phase' in request.POST:
                lst = Phase.objects.all()
                dat = json.loads(request.POST.get('phase'))
            else:
                lst = Category.objects.all()
                dat = json.loads(request.POST.get('category'))
            itm_ids = {}
            new_itms = []
            for v in dat:
                if int(v['pk']):
                    itm_ids[int(v['pk'])] = v['name']
                else:
                    new_itms.append(v['name'])
            # delete
            for itm in lst:
                if itm.pk not in itm_ids:
                    itm.delete()
                else:
                    itm.name = itm_ids[itm.pk]
                    itm.save()
            # add
            for v in new_itms:
                ni = Phase(name=v) if 'phase' in request.POST else Category(name=v)
                ni.save()
            return JsonResponse({ 'staus': 'OK' })
        dat = json.loads(request.POST['info'])
        print(dat['name'])
        print(dat['managers'])
        print(dat['clients'])
        for v in dat['actions']:
            print(v)
        j = Job(name=dat['name'])
        j.save()
        for v in dat['managers']:
            u = User.objects.get(pk=v)
            jm = JobManager(job=j, manager=u)
            jm.save()
        for v in dat['clients']:
            u = User.objects.get(pk=v)
            jc = JobClient(job=j, client=u)
            jc.save()
        for v in dat['actions']:
            cat = Category.objects.get(pk=v['category'])
            ph = Phase.objects.get(pk=v['phase'])
            act = Action(
                name=v['name'],
                description=v['description'],
                start_date=v['startDate'],
                due_date=v['dueDate'],
                category=cat,
                phase=ph,
                job=j,
                status=Action.RED
            )
            act.save()
            for m in v['personInCharge']:
                m = User.objects.get(pk=m)
                am = ActionMember(action=act, person_in_charge=m)
                am.save()
        return JsonResponse({ 'url': reverse('jobdetail', kwargs={ 'pk': j.pk })})


def DeleteJob(request, pk):
    job = Job.objects.get(pk=pk)
    job.delete()
    return JsonResponse({ 'status': 'OK' })


def DashBoard(request):
    """
    DashBoard Page
    """
    from datetime import date, datetime, timedelta
    today = date.today()
    ts = int((datetime(today.year, today.month, today.day).timestamp() + 10) / 24 / 3600)
    from datetime import date, timedelta
    return render(request, 'pro/dashboard.html', {
        'jobs': Job.objects.all(),
        'jobmanagers': JobManager.objects.all(),
        'jobclients': JobClient.objects.all(),
        'actions': Action.objects.all(),
        'actionmembers': ActionMember.objects.all(),
        'action_details': actionDetailInfo(),
        'today': date.today().isoformat(),
        'tomorrow': (date.today() + timedelta(days=1)).isoformat(),
        'week_start': (today - timedelta(days=(ts+4)%7)).isoformat(),
        'week_start_ts': ts - (ts + 4) % 7
    })


def ActionDetail(request, pk):
    """
    Action Detail Page
    """
    action = Action.objects.get(pk=pk)
    return render(request, 'pro/actiondetail.html', {
        'action': action,
        'members': ActionMember.objects.filter(action=action)
    })


@csrf_exempt
def ActionEdit(request, pk):
    """
    Edit Action Page
    """
    action = Action.objects.get(pk=pk)
    if request.method == 'GET':
        return render(request, 'pro/actionedit.html', {
            'action': action,
            'team_members': User.objects.filter(userprofile__usertype=UserProfile.TEAM_MEMBER),
            'categories': Category.objects.all(),
            'phases': Phase.objects.all(),
            'persons': ActionMember.objects.filter(action=action)
        })
    else:
        print(request.POST)
        action = Action.objects.get(pk=pk)
        status = request.POST.get('status')
        if status == 'Red':
            action.status = Action.RED
        elif status == 'Yellow':
            action.status = Action.YELLOW
        else:
            action.status = Action.BLUE
        action.name = request.POST.get("name")
        action.description = request.POST.get("description")
        ActionMember.objects.filter(action=action).delete()
        for v in request.POST.getlist('person_in_charge'):
            am = ActionMember(action=action, person_in_charge=User.objects.get(pk=v))
            am.save()
        action.category = Category.objects.get(pk=request.POST.get("category"))
        action.phase = Phase.objects.get(pk=request.POST.get("phase"))
        action.start_date = request.POST.get("start_date")
        action.due_date = request.POST.get("due_date")
        action.save()
        return HttpResponseRedirect(reverse('actiondetail', kwargs={ 'pk': pk }))


def ActionDelete(request, pk):
    """
    Delete Action No page
    """
    action = Action.objects.get(pk=pk)
    action.delete()
    return JsonResponse({ 'status': 'OK' })


@csrf_exempt
def PhaseTemplate(request):
    """
    Phase Template page
    Use ajax to process data
    """
    from datetime import date
    if 'id' in request.POST:
        nd = TemplateAction(phase=Phase.objects.get(pk=request.POST['id']))
        nd.save()
        return JsonResponse({ 'id': nd.pk })
    actions = TemplateAction.objects.all()
    print(request.POST)
    for action in actions:
        if 'action_name_%d' % action.pk not in request.POST:
            action.delete()
            continue
        name = request.POST.get('action_name_%d' % action.pk)
        print(request.POST.get('action_category_%d' % action.pk))
        category = request.POST.get('action_category_%d' % action.pk)
        person = request.POST.get('action_person_%d' % action.pk)
        due_date = request.POST.get('action_due_date_%d' % action.pk)
        action.name = name
        action.due_date = date.fromisoformat(due_date) if due_date else None
        action.category = Category.objects.get(pk=int(category)) if category else None
        action.person_in_charge = User.objects.get(pk=int(person)) if person else None
        action.save()
    return JsonResponse({ 'staus': 'OK' })


@csrf_exempt
def AddComment(request, pk):
    """
    Comment Page
    """
    action = Action.objects.get(pk=pk)
    if request.method == 'POST':
        if 'pk' in request.POST: # 编辑评论
            comment = Comment.objects.get(pk=request.POST.get('pk'))
            comment.content = request.POST.get('content')
            comment.save()
            return JsonResponse({ 'status': 'OK' })
        else: # add comment
            comment = Comment(
                content=request.POST.get('content'),
                action=action,
                user=request.user
            )
            comment.save()
    comments = Comment.objects.filter(action=action)
    return render(request, 'pro/addcomment.html', {
        'comments': comments,
        'action': action
    })


def DeleteComment(request, pk):
    """
    Delete Comment, No page
    """
    comment = Comment.objects.filter(pk=pk)
    comment.delete()
    return JsonResponse({ 'status': 'OK' })
