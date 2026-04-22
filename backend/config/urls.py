from django.conf import settings
from django.contrib import admin
from django.urls import path
from django.urls import include
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path("api/reports/", include("reports.urls")),
    path("api/documents/", include("documents.urls")),
    path("api/news/", include("news.urls")),
    path("api/vacancies/", include("vacancies.urls")),
    path("api/files/", include("core.urls")),
    path("api/", include("core.urls")),
    path("api/dashboard/", include("dashboard.urls")),
    path("api/search/", include("search.urls")),
    path("api/quick-links/", include("quick_links.urls")),
    path("api/departments/", include("departments.urls")),
    path("api/access-control/", include("access_control.urls")),
    path("api/hero/", include("hero.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)