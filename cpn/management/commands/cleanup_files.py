# Base Django imports for custom management command
from django.core.management.base import BaseCommand
from django.contrib.sessions.models import Session
from django.utils import timezone
import os
import argparse
from django.conf import settings

class Command(BaseCommand):
    # Description of the management command
    help = 'Cleans up files from expired sessions or all junk files in the extracted_nets directory'
    
    def add_arguments(self, parser):
        # Add a flag to delete all files, ignoring session data
        parser.add_argument(
            '--all-files',
            action='store_true',
            help='Delete all files in extracted_nets directory regardless of session state',
        )
        # Specify the target directory (default: media/extracted_nets)
        parser.add_argument(
            '--directory',
            type=str,
            default=os.path.join(settings.MEDIA_ROOT, 'extracted_nets'),
            help='Directory to clean (defaults to media/extracted_nets)',
        )
        # Filter by file extensions
        parser.add_argument(
            '--extensions',
            type=str,
            help='Comma-separated list of file extensions to delete (e.g., ".pnml,.xml")',
        )
        # Delete files older than a certain number of days
        parser.add_argument(
            '--older-than',
            type=int,
            help='Delete files older than specified days',
        )
        # Simulate deletions without actually deleting files
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Only show what would be deleted without actually deleting',
        )
    
    def handle(self, *args, **options):
        # Decide which cleanup method to run based on --all-files option
        if options['all_files']:
            self._handle_all_files_cleanup(options)
        else:
            self._handle_session_cleanup(options)
    
    def _handle_session_cleanup(self, options):
        # Get sessions that have expired
        expired_sessions = Session.objects.filter(expire_date__lt=timezone.now())
        
        file_count = 0
        for session in expired_sessions:
            try:
                # Extract session data
                session_data = session.get_decoded()
                # Check if session tracks any files
                if 'petri_net_files' in session_data:
                    for file_path in session_data['petri_net_files']:
                        if os.path.exists(file_path):
                            if options['dry_run']:
                                # Show which files would be deleted
                                self.stdout.write(f"Would delete file: {file_path}")
                                file_count += 1
                            else:
                                try:
                                    # Delete file from disk
                                    os.remove(file_path)
                                    file_count += 1
                                    self.stdout.write(f"Deleted file: {file_path}")
                                except Exception as e:
                                    # Log deletion error
                                    self.stdout.write(self.style.ERROR(f"Error deleting file {file_path}: {e}"))
            except Exception as e:
                # Log session processing error
                self.stdout.write(self.style.ERROR(f"Error processing session {session.session_key}: {e}"))
        
        # Remove expired sessions from the database (unless dry-run)
        if not options['dry_run']:
            count = expired_sessions.count()
            expired_sessions.delete()
            self.stdout.write(self.style.SUCCESS(f"Successfully removed {count} expired sessions and {file_count} files"))
        else:
            count = expired_sessions.count()
            self.stdout.write(self.style.SUCCESS(f"Would remove {count} expired sessions and {file_count} files (dry run)"))
    
    def _handle_all_files_cleanup(self, options):
        directory = options['directory']
        self.stdout.write(f"Using directory: {directory}")
        
        if not os.path.exists(directory):
            # Abort if directory doesn't exist
            self.stdout.write(self.style.ERROR(f"Directory {directory} does not exist"))
            return
        
        # Parse file extensions if provided
        file_extensions = None
        if options['extensions']:
            file_extensions = [ext.strip() for ext in options['extensions'].split(',')]
        
        # Calculate timestamp threshold for file age filtering
        older_than_timestamp = None
        if options['older_than']:
            older_than_timestamp = timezone.now() - timezone.timedelta(days=options['older_than'])
        
        file_count = 0
        
        # Walk through all files in the directory and subdirectories
        for root, _, files in os.walk(directory):
            for file in files:
                file_path = os.path.join(root, file)
                
                # Skip files that don't match the extension filter
                if file_extensions and not any(file.endswith(ext) for ext in file_extensions):
                    continue
                
                # Skip files newer than the threshold date
                if older_than_timestamp:
                    file_mtime = timezone.datetime.fromtimestamp(os.path.getmtime(file_path))
                    if timezone.make_aware(file_mtime) > older_than_timestamp:
                        continue
                
                if options['dry_run']:
                    # Show which files would be deleted
                    self.stdout.write(f"Would delete file: {file_path}")
                    file_count += 1
                else:
                    try:
                        # Delete file from disk
                        os.remove(file_path)
                        file_count += 1
                        self.stdout.write(f"Deleted file: {file_path}")
                    except Exception as e:
                        # Log deletion error
                        self.stdout.write(self.style.ERROR(f"Error deleting file {file_path}: {e}"))
        
        # Summarize what was done or would be done
        action = "Would delete" if options['dry_run'] else "Deleted"
        self.stdout.write(self.style.SUCCESS(f"{action} {file_count} files"))
