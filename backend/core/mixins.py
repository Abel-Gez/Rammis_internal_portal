class VisibilityQuerysetMixin:

    def filter_by_visibility(self, queryset):
        user = self.request.user

        if user.is_superuser:
            return queryset

        if not user.role or not user.role.visibility_level:
            return queryset.none()

        user_order = user.role.visibility_level.order

        return queryset.filter(
            visibility_level__order__lte=user_order
        )