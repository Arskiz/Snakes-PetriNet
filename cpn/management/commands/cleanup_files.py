from django.core.management.base import BaseCommand
from django.contrib.sessions.models import Session
from django.utils import timezone
import os

class Command(BaseCommand):
    help = 'Cleans up files from expired sessions'
    
    def handle(self, *args, **options):
        # Get all expired sessions
        expired_sessions = Session.objects.filter(expire_date__lt=timezone.now())
        
        file_count = 0
        for session in expired_sessions:
            try:
                # Load session data
                session_data = session.get_decoded()
                # Check if there are tracked files in this session
                if 'petri_net_files' in session_data:
                    for file_path in session_data['petri_net_files']:
                        if os.path.exists(file_path):
                            try:
                                os.remove(file_path)
                                file_count += 1
                                self.stdout.write(f"Deleted file: {file_path}")
                            except Exception as e:
                                self.stdout.write(self.style.ERROR(f"Error deleting file {file_path}: {e}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error processing session {session.session_key}: {e}"))
        
        # Delete expired sessions
        count = expired_sessions.count()
        expired_sessions.delete()
        
        self.stdout.write(self.style.SUCCESS(f"Successfully removed {count} expired sessions and {file_count} files"))