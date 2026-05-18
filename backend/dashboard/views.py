from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from core.mixins import VisibilityQuerysetMixin

from reports.models import Report
from documents.models import Document
from news.models import News
from vacancies.models import Vacancy


class DashboardOverviewView(VisibilityQuerysetMixin, APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # filter(archived=False) excludes soft-deleted items so counts match
        # exactly what each module page shows. Also apply visibility so users
        # only see counts for content they have permission to access.
        reports_qs   = self.filter_by_visibility(Report.objects.filter(archived=False))
        documents_qs = self.filter_by_visibility(Document.objects.filter(archived=False))
        news_qs      = self.filter_by_visibility(News.objects.filter(archived=False))
        vacancies_qs = self.filter_by_visibility(Vacancy.objects.filter(archived=False))

        data = {
            "totals": {
                "reports": reports_qs.count(),
                "documents": documents_qs.count(),
                "news": news_qs.count(),
                "vacancies": vacancies_qs.count(),
            },

            "latest_reports": list(
                reports_qs.order_by("-created_at").values(
                    "id", "title", "created_at"
                )[:5]
            ),

            "latest_documents": list(
                documents_qs.order_by("-created_at").values(
                    "id", "title", "created_at"
                )[:5]
            ),

            "latest_news": list(
                news_qs.order_by("-published_date").values(
                    "id", "title", "published_date"
                )[:5]
            ),

            "active_vacancies": list(
                vacancies_qs.order_by("-created_at").values(
                    "id", "title", "application_deadline"
                )[:5]
            )
        }

        return Response(data)