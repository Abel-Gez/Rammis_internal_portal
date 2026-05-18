from django.db.models import Q


class VisibilityQuerysetMixin:

    def filter_by_visibility(self, queryset):
        user = self.request.user

        if user.is_superuser:
            return queryset

        # Unauthenticated guests: only explicitly Public content, no dept filter
        if not user.is_authenticated:
            return queryset.filter(visibility_level__name__iexact="public")

        # ── Authenticated staff ─────────────────────────────────────────────
        #
        # Visibility rules:
        #   Public   → always visible to all logged-in staff (regardless of dept)
        #   Internal → visible to staff whose department matches, or "All Depts" content
        #   NULL vis → treated the same as Internal
        #
        # Department rules:
        #   content.department = NULL  → "All Departments" — no restriction
        #   content.department = X     → only visible to users whose department = X
        #   user with no department    → only sees "All Departments" Internal content

        user_dept_id = user.department_id  # use _id to avoid an extra query

        # Public: always visible regardless of department
        public_q = Q(visibility_level__name__iexact="public")

        # Internal / unset visibility level
        internal_q = (
            Q(visibility_level__name__iexact="internal") |
            Q(visibility_level__isnull=True)
        )

        # Department gate for internal content
        if user_dept_id:
            # User has a department: see "All Depts" content + their own dept's content
            dept_q = Q(department__isnull=True) | Q(department_id=user_dept_id)
        else:
            # User has no department: see only "All Depts" internal content
            dept_q = Q(department__isnull=True)

        return queryset.filter(public_q | (internal_q & dept_q))
