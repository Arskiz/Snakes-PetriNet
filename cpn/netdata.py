from snakes.nets import PetriNet, Place, Transition, Value, Expression
import os
import time
import json
import re
import math

def create_place(place_id, name, tokens, top, left):
    return {
        "id": place_id,
        "name": name,
        "tokens": tokens,
        "top": top,
        "left": left,
    }

def create_transition(transition_id, name, from_places, to_places, top, left):
    return {
        "id": transition_id,
        "name": name,
        "from": from_places,
        "to": to_places,
        "top": top,
        "left": left,
    }

# Lists for Places and transitions are defined in this file
places = []
transitions = []

class PetriNetProxy(PetriNet):
    instances_created = 0
    last_instance = None

    def __init__(self, *args, **kwargs):
        PetriNetProxy.instances_created += 1
        super().__init__(*args, **kwargs)
        PetriNetProxy.last_instance = self

def build_petri_net_from_data(net_name="MyNet"):
    """Builds a PetriNet object from the places and transitions defined in this file."""
    net = PetriNet(net_name)
    
    # Add all places
    place_objects = {}
    for place_data in places:
        # Create tokens based on the count
        tokens = []
        if isinstance(place_data["tokens"], int):
            tokens = [1] * place_data["tokens"]
        elif isinstance(place_data["tokens"], list):
            tokens = place_data["tokens"]
            
        # Create and add the place
        place = Place(place_data["id"], tokens)
        net.add_place(place)
        place_objects[place_data["id"]] = place
    
    # Add all transitions
    for trans_data in transitions:
        # Create and add the transition
        trans = Transition(trans_data["id"], Expression("True"))
        net.add_transition(trans)
        
        # Add connections for this transition
        for from_place in trans_data["from"]:
            net.add_input(from_place, trans_data["id"], Value(1))
            
        for to_place in trans_data["to"]:
            net.add_output(to_place, trans_data["id"], Value(1))
    
    return net

def extract_arcs_from_code(code_str):
    """Extract arc information directly from the code."""
    arcs = []
    
    # Use flexible regex patterns to find add_input and add_output calls
    # IMPORTANT: The correct parameter order is (place, transition) for add_input
    # and (place, transition) for add_output in SNAKES
    input_pattern = r"net\.add_input\s*\(\s*['\"]([^'\"]+)['\"]\s*,\s*['\"]([^'\"]+)['\"]\s*,\s*(?:Value\s*\(\s*)?(\d+)(?:\s*\))?"
    output_pattern = r"net\.add_output\s*\(\s*['\"]([^'\"]+)['\"]\s*,\s*['\"]([^'\"]+)['\"]\s*,\s*(?:Value\s*\(\s*)?(\d+)(?:\s*\))?"
    
    # Find all add_input calls (place → transition)
    for match in re.finditer(input_pattern, code_str):
        place, trans, weight = match.groups()
        arcs.append({
            "source": place,  # source is the place
            "target": trans,  # target is the transition
            "type": "input",
            "weight": weight or "1"
        })
    
    # Find all add_output calls (transition → place)
    for match in re.finditer(output_pattern, code_str):
        place, trans, weight = match.groups()
        arcs.append({
            "source": trans,  # source is the transition
            "target": place,  # target is the place
            "type": "output",
            "weight": weight or "1"
        })
    
    return arcs

def extract_net_data(net):
    """Extracts data from a PetriNet object into the format used by this module."""
    extracted_places = []
    extracted_transitions = []
    
    # Extract places with reasonable positions
    try:
        place_count = len(list(net.place()))
        for i, place_obj in enumerate(net.place()):
            place_id = place_obj.name
            tokens_list = list(place_obj.tokens)
            
            # Calculate position in a circle
            angle = (i / max(place_count, 1)) * 2 * math.pi
            radius = 200
            top = 300 + int(radius * math.sin(angle))
            left = 400 + int(radius * math.cos(angle))
            
            place_data = create_place(
                place_id=place_id,
                name=place_id,
                tokens=len(tokens_list),
                top=top,
                left=left
            )
            extracted_places.append(place_data)
    except Exception as e:
        print(f"Error extracting places: {e}")
    
    # Extract transitions with reasonable positions
    try:
        trans_count = len(list(net.transition()))
        for i, trans_obj in enumerate(net.transition()):
            trans_id = trans_obj.name
            
            # Position transitions in the center
            top = 300 + (i - trans_count / 2) * 60
            left = 400
            
            # Create transition data with empty from/to lists
            trans_data = create_transition(
                transition_id=trans_id,
                name=trans_id,
                from_places=[],
                to_places=[],
                top=top,
                left=left
            )
            extracted_transitions.append(trans_data)
    except Exception as e:
        print(f"Error extracting transitions: {e}")
    
    return {
        "places": extracted_places,
        "transitions": extracted_transitions
    }

def upload(exec_context, request=None, original_code=None):
    """Process an uploaded PetriNet from an execution context."""
    print("Uploaded!")
    
    # Extract arcs from the code directly
    arcs = []
    if original_code:
        arcs = extract_arcs_from_code(original_code)
        print(f"Extracted {len(arcs)} arcs from code")
    
    try:
        # Look for PetriNet instances in the context
        for key, value in exec_context.items():
            if isinstance(value, PetriNet):
                print(f"PetriNet instance found: {key}")
                
                # Try to extract data safely
                try:
                    net_data = extract_net_data(value)
                    net_data["arcs"] = arcs
                    
                    # Update transition from/to lists based on arcs
                    for arc in arcs:
                        if arc["type"] == "input":
                            # Find the transition this arc goes to
                            for trans in net_data["transitions"]:
                                if trans["id"] == arc["target"]:
                                    if arc["source"] not in trans["from"]:
                                        trans["from"].append(arc["source"])
                                    break
                        elif arc["type"] == "output":
                            # Find the transition this arc comes from
                            for trans in net_data["transitions"]:
                                if trans["id"] == arc["source"]:
                                    if arc["target"] not in trans["to"]:
                                        trans["to"].append(arc["target"])
                                    break
                    
                    print(f"Extracted {len(net_data['places'])} places, {len(net_data['transitions'])} transitions, and {len(net_data['arcs'])} arcs")
                    
                    # Define output directory and create it if it doesn't exist
                    output_dir = os.path.join('media', 'extracted_nets')
                    os.makedirs(output_dir, exist_ok=True)
                    
                    # Define output file name
                    net_name = getattr(value, 'name', 'unnamed_net')
                    output_file = os.path.join(output_dir, f"{net_name}_{int(time.time())}.json")
                    
                    # Write the extracted data to the file
                    with open(output_file, 'w') as f:
                        json.dump(net_data, f, indent=2)
                    
                    print(f"Saved extracted PetriNet data to {output_file}")
                    
                    # Track file in session if request is provided
                    if request and request.session:
                        request.session.setdefault('petri_net_files', [])
                        request.session['petri_net_files'].append(output_file)
                        request.session.modified = True
                        print(f"Added file to session tracking: {output_file}")
                    
                    return {
                        "success": True,
                        "message": f"PetriNet found with name: {getattr(value, 'name', 'unnamed')}",
                        "data": net_data,
                        "file_path": output_file
                    }
                except Exception as e:
                    print(f"Error extracting net data: {e}")
                    import traceback
                    traceback.print_exc()
                    
                    # Return basic info even if detailed extraction fails
                    return {
                        "success": True,
                        "message": f"PetriNet found with name: {getattr(value, 'name', 'unnamed')}, but couldn't extract full structure.",
                        "petrinet": key
                    }
        
        # If we get here, no PetriNet was found
        print("No PetriNet instances found")
        return {
            "success": False,
            "message": "No PetriNet instances found."
        }
    except Exception as e:
        print(f"Error in upload function: {e}")
        import traceback
        traceback.print_exc()
        
        return {
            "success": False,
            "message": f"Error processing upload: {str(e)}"
        }