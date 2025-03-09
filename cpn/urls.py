from django.urls import path
from . import views
from .views import upload_file

urlpatterns = [
    path("", views.none, name=""),
    path("snakes", views.net_view, name="home"),
    path("about", views.about, name="about"),
    path(
        "display_petri_net/<str:filename>/",
        views.display_petri_net,
        name="display_petri_net",
    ),
    path("upload/", upload_file, name="upload_file"),
    path("settings", views.settings, name="settings"),
    path(
        "delete_petri_net_data/<str:filename>/",
        views.delete_petri_net_data,
        name="delete_petri_net_data",
    ),
]
