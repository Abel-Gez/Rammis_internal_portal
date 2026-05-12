from django.db.models import Q


class VisibilityQuerysetMixin:

    def filter_by_visibility(self, queryset):
        user = self.request.user

        if user.is_superuser:
            return queryset

        # Unauthenticated guests: only content explicitly marked Public
        if not user.is_authenticated:
            return queryset.filter(visibility_level__name__iexact="public")

        # Authenticated users with no role assigned: see nothing
        if not user.role or not user.role.visibility_level:
            return queryset.none()

        user_order = user.role.visibility_level.order

        # Show content whose visibility order is within the user's level,
        # plus any content that has no visibility set (treated as Internal)
        return queryset.filter(
            Q(visibility_level__order__lte=user_order) |
            Q(visibility_level__isnull=True)
        )
