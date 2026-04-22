from rest_framework.routers import DefaultRouter
from .views import VisibilityLevelViewSet

router = DefaultRouter()
router.register(r"visibility-levels", VisibilityLevelViewSet, basename="visibility-levels")

urlpatterns = router.urls