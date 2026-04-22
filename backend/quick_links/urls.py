from django.urls import path
from .views import QuickLinksView

urlpatterns = [
    path("", QuickLinksView.as_view(), name="quick_links"),
]