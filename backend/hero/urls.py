from rest_framework.routers import DefaultRouter
from .views import HeroSlideViewSet

router = DefaultRouter()
router.register(r"", HeroSlideViewSet, basename="hero")

urlpatterns = router.urls