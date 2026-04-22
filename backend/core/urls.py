from django.urls import path

from core.views import CSRFTokenView, CurrentUserView
from .file_views import SecureFileDownloadView

urlpatterns = [
    path(
        "download/<str:module>/<int:object_id>/",
        SecureFileDownloadView.as_view(),
        name="secure-download"
    ),
     path("auth/csrf/", CSRFTokenView.as_view()),
    path("me/", CurrentUserView.as_view(), name="current-user"),
]