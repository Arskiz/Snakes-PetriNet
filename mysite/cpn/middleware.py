import os
from django.contrib.sessions.models import Session
from django.utils import timezone

class SessionFileCleanupMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Clean up expired sessions periodically
        # This runs before the view is called
        if not hasattr(request, 'session') or not request.session.exists(request.session.session_key):
            self.cleanup_expired_sessions()
            
        response = self.get_response(request)
        return response
    
    def cleanup_expired_sessions(self):
        # Randomly perform cleanup (don't do this on every request)
        import random
        if random.random() < 0.01:  # 1% chance of running cleanup
            # Get all expired sessions
            expired_sessions = Session.objects.filter(expire_date__lt=timezone.now())
            
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
                                    print(f"Cleanup: Deleted session file {file_path}")
                                except Exception as e:
                                    print(f"Cleanup: Error deleting file {file_path}: {e}")
                except Exception as e:
                    print(f"Cleanup: Error processing session {session.session_key}: {e}")
            
            # Delete expired sessions
            expired_sessions.delete()
            print(f"Cleanup: Removed {expired_sessions.count()} expired sessions")