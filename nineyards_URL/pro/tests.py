from django.test import TestCase

# Create your tests here.

class ModelTest(TestCase):

	def setUp(self):
		# UserProfile
		UserProfile.objects.create(id=1, user_id=1, firstname="Test", lastname="1", usertype="Manager")
		UserProfile.objects.create(id=2, user_id=2, fisrtname="Test", lastname="3", usertype="Team Member")
		UserProfile.objects.create(id=3, user_id=3, firstname="Test", lastname="3", usertype="Client")

		#Job
		Job.objects.create(name="TestJob", manager=1, client=3)

		#JobManager
		JobManager.objects.create(job="TestJob", manager=1)

		#JobClient
		JobClient.objects.create(job="TestJob", client=3)

		#Phase
		Phase.objects.create(name="TestPhase")

		#Category
		Category.objects.create(name="TestCategory")

		#Action
		Action.objects.create(name="TestAction", description="Lets Test", phase="TestPahse",
			person_in_charge=2, start_date="2021/01/01", due_date="2022/01/01",
			category="TestCategory",status="Blue", job="TestJob", milestone="TestMS")

		#ActionMember
		ActionMember.objects.create(action="TestAction", person_in_charge=2)

		#TemplateAction
		TemplateAction.objects.create(name="TestTemp", phase="TestPhase", person_in_charge=2,
			due_date="2022/01/01", category="TestCategory")

		#Comment
		Comment.objects.create(action="TestAction", content="Lets Test",
			user=3, date="2021/03/04")

	def test_userprofile_models(self):
		result_1 = UserProfile.objects.get(user_1=1)
		result_2 = UserProfile.objects.get(user_2=2)
		result_3 = UserProfile.objects.get(user_3=3)

		self.assertEqual(result_1.fisrtname, "Test")
		self.assertEqual(result_2.usertype, "Team Member")
		self.assertEqual(result_3.lastname, "3")

	def test_job_models(self):
		result = Job.objects.get(name="TestJob")

		self.assertEqual(result.manager, 1)
		self.assertEqual(result.client, 3)

	def test_jobmanager_models(self):
		result = JobManager.objects.get(job="TestJob")

		self.assertEqual(result.manager, 1)

	def test_jobclient_models(self):
		result = JobClient.objects.get(job="TestJob")

		self.assertEqual(result.client, 3)

	def test_phase_models(self):
		result = Phase.objects.get(name="TestPhase")

		self.assertEqual(result.id, 1)

	def test_category_models(self):
		result = Category.objects.get(name="TestCategory")

		self.assertEqual(result.id, 1)

	def test_action_models(self):
		result = Action.objects.get(name="TestAction")

		self.assertEqual(result.phase, "TestPhase")
		self.assertEqual(result.person_in_charge, 2)
		self.assertEqual(result.start_date, "2021/01/01")
		self.assertEqual(result.due_date, "2022/01/01")
		self.assertEqual(result.category, "TestCategory")
		self.assertEqual(result.status, "Blue")
		self.assertEqual(result.job, "TestJob")
		self.assertEqual(result.milestone, "TestMS")

	def test_actionmember_models(self):
		result = ActionMember.objects.get(name="TestAction")

		self.assertEqual(result.person_in_charge, 2)

	def test_templateaction_models(self):
		result = TemplateAction.objects.get(name="TestTemp")

		self.assertEqual(result.phase, "TestPhase")
		self.assertEqual(result.person_in_charge, 2)
		self.assertEqual(result.due_date, "2022/01/01")
		self.assertEqual(result.category, "TestCategory")

	def test_comment_models(self):
		result = Comment.objects.get(action="TestAction")

		self.assertEqual(result.content, "Lets Test")
		self.assertEqual(result.user, 3)
		self.assertEqual(result.date, "2021/03/04")
