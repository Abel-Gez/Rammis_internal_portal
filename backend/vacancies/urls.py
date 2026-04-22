from rest_framework.routers import DefaultRouter
from .views import EmploymentTypeViewSet, VacancyViewSet

router = DefaultRouter()
router.register(r"vacancies", VacancyViewSet, basename="vacancies")
router.register(r"employment-types", EmploymentTypeViewSet, basename="employment-types")

urlpatterns = router.urls