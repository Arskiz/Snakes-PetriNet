from django.contrib import admin
from django.http import HttpResponseRedirect
from django.urls import path
from django.shortcuts import render
from django.contrib import messages
import os
import glob

# Register your models here if you have any
# admin.site.register(YourModel)

@admin.register(admin.models.LogEntry)
class LogEntryAdmin(admin.ModelAdmin):
    # This just gives us access to the admin without needing a specific model
    list_display = ['action_time', 'user', 'content_type', 'object_repr', 'action_flag']
    readonly_fields = ['action_time', 'user', 'content_type', 'object_repr', 'action_flag', 'change_message', 'object_id']
    search_fields = ['object_repr', 'change_message']
    list_filter = ['action_flag', 'action_time', 'content_type']
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False
    
    # Add custom admin view for file cleanup
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('cleanup-files/', self.admin_site.admin_view(self.cleanup_files_view), name='cleanup-files'),
        ]
        return custom_urls + urls
    
    def cleanup_files_view(self, request):
        if request.method == 'POST':
            # Directory with PetriNet JSON files
            file_path = os.path.join('media', 'extracted_nets', '*.json')
            files = glob.glob(file_path)
            
            # Count files
            file_count = len(files)
            
            # Delete all files
            for file in files:
                try:
                    os.remove(file)
                except Exception as e:
                    messages.error(request, f"Error deleting {file}: {str(e)}")
            
            messages.success(request, f"Successfully removed {file_count} PetriNet files.")
            return HttpResponseRedirect("../")
        
        # If GET request, show confirmation page
        return render(request, 'admin/cleanup_confirmation.html', {
            'title': 'Confirm PetriNet File Cleanup',
        })