from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from django.db.models import Q

from core.mixins import VisibilityQuerysetMixin

from documents.models import Document
from reports.models import Report
from news.models import News
from vacancies.models import Vacancy


class GlobalSearchView(VisibilityQuerysetMixin, APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.GET.get("q")

        if not query:
            return Response({"results": []})

        # Apply visibility filtering
        documents = self.filter_by_visibility(
            Document.objects.filter(
                Q(title__icontains=query)
            )
        )[:10]

        reports = self.filter_by_visibility(
            Report.objects.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query)
            )
        )[:10]

        news = self.filter_by_visibility(
            News.objects.filter(
                Q(title__icontains=query) |
                Q(content__icontains=query)
            )
        )[:10]

        vacancies = Vacancy.objects.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query),
            archived=False
        )[:10]

        data = {
            "documents": list(
                documents.values("id", "title", "created_at")
            ),
            "reports": list(
                reports.values("id", "title", "created_at")
            ),
            "news": list(
                news.values("id", "title", "published_date")
            ),
            "vacancies": list(
                vacancies.values("id", "title", "application_deadline")
            ),
        }

        return Response(data)