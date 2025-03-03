from django.contrib import messages
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.template import engines
from django.shortcuts import redirect
from django.urls import reverse
from snakes.nets import PetriNet
import os, json

import snakes
from snakes.nets import Place, Transition, Value, Expression
from .netdata import places, transitions, upload, extract_net_data

UPLOAD_DIR = "media/uploads/"  # Määritä polku, minne tallennetaan

# Create your views here.
jinja_env = engines["jinja2"]

def home(request):
    return render(request, "home.html")

def about(request):
    return render(request, "webInfo.html")

def net_view(request):
    context = {
        'places': places,
        'transitions': transitions,
    }
    print(engines.all())
    return render(request, "home.html", context)

def test(request):
    return render("test.html")  # 🔥 ANNA SE STRINGINÄ HTTP-VASTAUKSENA

import os
import time
import uuid  # For generating unique filenames

@csrf_exempt
def upload_file(request):
    if request.method == 'POST' and request.FILES.get('file'):
        uploaded_file = request.FILES['file']
        
        # Generate a unique filename
        unique_filename = f"{uuid.uuid4().hex}_{uploaded_file.name}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        try:
            # Save the file
            with open(file_path, 'wb+') as destination:
                for chunk in uploaded_file.chunks():
                    destination.write(chunk)
            
            # Read the file content
            file_content = None
            with open(file_path, 'r') as file:
                file_content = file.read()
            
            # Set up execution context
            exec_context = {
                'PetriNet': snakes.nets.PetriNet,  # Use original PetriNet
                'Place': Place,
                'Transition': Transition,
                'Value': Value,
                'Expression': Expression,
            }
            
            # Execute the code
            exec(file_content, exec_context)
            
            # Process results with original code for fallback analysis
            from cpn.netdata import upload
            result = upload(exec_context, request, file_content)
            
            # Clean up
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
                    print(f"Deleted original file: {file_path}")
            except Exception as e:
                print(f"Could not delete file: {e}")
            
            # Return the result
            if result.get('redirect_url'):
                return JsonResponse(result)
            elif result.get('success') and 'file_path' in result:
                # Add redirect URL to the result
                filename = os.path.basename(result['file_path'])
                result['redirect_url'] = request.build_absolute_uri(
                    reverse('display_petri_net', kwargs={'filename': filename})
                )
                return JsonResponse(result)
            else:
                return JsonResponse(result)
                
        except Exception as e:
            print(f"Error processing file: {str(e)}")
            import traceback
            traceback.print_exc()
            
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
            except:
                pass
                
            return JsonResponse({
                'success': False,
                'message': f"Error processing file: {str(e)}"
            })
    else:
        return JsonResponse({
            'success': False,
            'error': 'Invalid request or no file provided'
        })



def none(request):
    return render(request, "redirect.html")

from django.shortcuts import render, redirect
from django.contrib import messages

def display_petri_net(request, filename):
    # Construct the full path to the JSON file
    file_path = os.path.join('media', 'extracted_nets', filename)
    
    # Check if the file exists
    if not os.path.exists(file_path):
        # Add an error message that will be displayed on the next page
        messages.error(request, f"PetriNet file not found: {filename}")
        
        # Redirect to home or another appropriate page
        return redirect('home')  # or 'cpn:index' depending on your URL configuration
    
    # Read the JSON data
    with open(file_path, 'r') as f:
        petri_net_data = json.load(f)
    
    # Render a template with the PetriNet data
    return render(request, 'display_petri_net.html', {
        'petri_net_data': petri_net_data,
        'filename': filename
    })
    
def delete_petri_net_data(request, filename):
    # Construct the full path to the JSON file
    file_path = os.path.join('media', 'extracted_nets', filename)
    
    # Check if the file exists
    if os.path.exists(file_path):
        try:
            # Delete the file
            os.remove(file_path)
            messages.success(request, f"PetriNet data file '{filename}' has been deleted.")
            none();
        except Exception as e:
            messages.error(request, f"Error deleting file: {str(e)}")
    else:
        messages.warning(request, f"File '{filename}' not found.")
    
    # Use an absolute URL instead of a named URL
    from django.http import HttpResponseRedirect
    return HttpResponseRedirect('/cpn')  # Redirect to root URL

def end_session(request):
    # Clean up files in this session
    if 'petri_net_files' in request.session:
        for file_path in request.session['petri_net_files']:
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    print(f"Deleted session file {file_path}")
                except Exception as e:
                    print(f"Error deleting file {file_path}: {e}")
        
        # Clear the session
        request.session.flush()
    
    return redirect('home')  # Redirect to home page