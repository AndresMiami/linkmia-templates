#!/usr/bin/env python3
"""
LinkMia Template Generator

Quickly generate customized link pages for restaurant clients.

Usage:
    python generate.py --interactive
    python generate.py --name "El Paisa Tacos" --layout hero --output elpaisa.html
"""

import argparse
import json
import os
import sys
from pathlib import Path

# Color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(text):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{text}{Colors.ENDC}")

def print_success(text):
    print(f"{Colors.OKGREEN}✓ {text}{Colors.ENDC}")

def print_error(text):
    print(f"{Colors.FAIL}✗ {text}{Colors.ENDC}")

def print_info(text):
    print(f"{Colors.OKCYAN}→ {text}{Colors.ENDC}")

def get_template_path(layout):
    """Get the path to the template file"""
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent
    template_path = repo_root / "templates" / layout / "index.html"
    
    if not template_path.exists():
        print_error(f"Template not found: {template_path}")
        sys.exit(1)
    
    return template_path

def read_template(layout):
    """Read the template file"""
    template_path = get_template_path(layout)
    with open(template_path, 'r', encoding='utf-8') as f:
        return f.read()

def generate_config(data):
    """Generate the JavaScript config object"""
    
    # Build buttons array
    buttons_js = []
    for btn in data['buttons']:
        btn_js = f"""        {{
            text: "{btn['text']}",
            url: "{btn['url']}",
            type: "{btn['type']}"
        }}"""
        buttons_js.append(btn_js)
    
    buttons_str = ",\n".join(buttons_js)
    
    # Build social object
    social_items = []
    for platform, url in data['social'].items():
        if url:
            social_items.append(f'        {platform}: "{url}"')
    social_str = ",\n".join(social_items) if social_items else ""
    
    # Generate full config
    config = f"""const RESTAURANT_CONFIG = {{
    // Basic Information
    name: "{data['name']}",
    tagline: "{data['tagline']}",
    location: "{data['location']}",
    hours: "{data['hours']}",
    
    // Layout & Design
    layout: {{
        // Layout style: "minimal", "hero", or "card"
        style: "{data['layout']['style']}",
        
        // Image configuration
        image: {{
            url: "{data['layout']['image']['url']}",
            heroBackground: "{data['layout']['image'].get('heroBackground', '')}"
        }},
        
        // Background configuration
        background: {{
            type: "{data['layout']['background']['type']}",
            value: "{data['layout']['background']['value']}",
            blur: {data['layout']['background']['blur']}
        }},
        
        // Color scheme
        colors: {{
            primary: "{data['layout']['colors']['primary']}",
            secondary: "{data['layout']['colors']['secondary']}",
            text: "{data['layout']['colors']['text']}",
            textMuted: "{data['layout']['colors']['textMuted']}",
            cardBackground: "{data['layout']['colors']['cardBackground']}"
        }},
        
        // Button spacing: "compact", "comfortable", "spacious"
        spacing: "{data['layout']['spacing']}"
    }},
    
    // Buttons
    buttons: [
{buttons_str}
    ],
    
    // Social Media Links
    social: {{
{social_str}
    }}
}};"""
    
    return config

def replace_config_in_template(template, config):
    """Replace the config section in the template"""
    
    # Find the config section
    start_marker = "const RESTAURANT_CONFIG = {"
    end_marker = "};\n\n        // ============================================"
    
    start_idx = template.find(start_marker)
    end_idx = template.find(end_marker, start_idx)
    
    if start_idx == -1 or end_idx == -1:
        print_error("Could not find config section in template")
        sys.exit(1)
    
    # Replace the config
    before = template[:start_idx]
    after = template[end_idx:]
    
    return before + config + "\n" + after

def interactive_mode():
    """Interactive mode - ask user for all details"""
    
    print_header("🌮 LinkMia Template Generator")
    print("Let's create a link page for your restaurant client!\n")
    
    # Basic info
    print_header("📋 Basic Information")
    name = input("Restaurant name: ").strip()
    tagline = input("Tagline (short description): ").strip()
    location = input("Location (city/neighborhood): ").strip()
    hours = input("Operating hours: ").strip() or "Open Daily"
    
    # Layout
    print_header("🎨 Layout & Design")
    print("Available layouts:")
    print("  1. minimal - Clean, simple (small logo, solid background)")
    print("  2. hero    - Bold, visual (large banner image)")
    print("  3. card    - Modern, professional (centered card)")
    
    layout_choice = input("Choose layout (1-3): ").strip()
    layout_map = {"1": "minimal", "2": "hero", "3": "card"}
    layout = layout_map.get(layout_choice, "minimal")
    
    # Images
    print_header("🖼️  Images")
    logo_url = input("Logo URL (or press Enter for placeholder): ").strip() or \
               "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=400&fit=crop"
    
    hero_bg = ""
    if layout == "hero":
        hero_bg = input("Hero background image URL: ").strip() or \
                  "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200&h=800&fit=crop"
    
    # Colors
    print_header("🎨 Colors")
    print("Enter hex codes (e.g., #FF6B35) or press Enter for defaults")
    primary = input("Primary color [#FF6B35]: ").strip() or "#FF6B35"
    secondary = input("Secondary color [#F7931E]: ").strip() or "#F7931E"
    
    # Buttons
    print_header("🔘 Buttons")
    print("Let's add some buttons. Type 'done' when finished.\n")
    
    buttons = []
    button_num = 1
    
    while True:
        print(f"\nButton #{button_num}")
        text = input("  Button text (or 'done'): ").strip()
        
        if text.lower() == 'done':
            break
        
        url = input("  Button URL: ").strip()
        btn_type = input("  Type (primary/secondary) [primary]: ").strip() or "primary"
        
        buttons.append({
            "text": text,
            "url": url,
            "type": btn_type
        })
        
        button_num += 1
    
    # Social media
    print_header("📱 Social Media")
    print("Enter URLs or press Enter to skip\n")
    
    social = {}
    for platform in ["instagram", "facebook", "tiktok"]:
        url = input(f"  {platform.capitalize()} URL: ").strip()
        if url:
            social[platform] = url
    
    # Output filename
    print_header("💾 Output")
    default_filename = name.lower().replace(" ", "").replace("'", "") + ".html"
    output = input(f"Output filename [{default_filename}]: ").strip() or default_filename
    
    # Build data structure
    data = {
        "name": name,
        "tagline": tagline,
        "location": location,
        "hours": hours,
        "layout": {
            "style": layout,
            "image": {
                "url": logo_url,
                "heroBackground": hero_bg
            },
            "background": {
                "type": "color" if layout != "card" else "image",
                "value": "#1a1a1a" if layout != "card" else logo_url,
                "blur": 0 if layout != "card" else 8
            },
            "colors": {
                "primary": primary,
                "secondary": secondary,
                "text": "#ffffff",
                "textMuted": "#888888",
                "cardBackground": "#2a2a2a"
            },
            "spacing": "comfortable"
        },
        "buttons": buttons,
        "social": social
    }
    
    return data, layout, output

def cli_mode(args):
    """CLI mode - use command line arguments"""
    
    # Required args
    if not args.name:
        print_error("--name is required")
        sys.exit(1)
    
    # Build basic data structure
    data = {
        "name": args.name,
        "tagline": args.tagline or "Delicious food",
        "location": args.location or "Miami, FL",
        "hours": args.hours or "Open Daily",
        "layout": {
            "style": args.layout,
            "image": {
                "url": args.logo or "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=400&fit=crop",
                "heroBackground": args.hero_bg or ""
            },
            "background": {
                "type": "color",
                "value": "#1a1a1a",
                "blur": 0
            },
            "colors": {
                "primary": args.primary or "#FF6B35",
                "secondary": args.secondary or "#F7931E",
                "text": "#ffffff",
                "textMuted": "#888888",
                "cardBackground": "#2a2a2a"
            },
            "spacing": "comfortable"
        },
        "buttons": [],
        "social": {}
    }
    
    # Add default buttons if none provided
    if not args.buttons:
        data["buttons"] = [
            {
                "text": "🛵 Order Delivery",
                "url": "https://order.doordash.com/",
                "type": "primary"
            },
            {
                "text": "📍 Get Directions",
                "url": "https://maps.google.com/",
                "type": "secondary"
            }
        ]
    
    output = args.output or f"{args.name.lower().replace(' ', '')}.html"
    
    return data, args.layout, output

def main():
    parser = argparse.ArgumentParser(description="Generate LinkMia restaurant link pages")
    parser.add_argument("--interactive", "-i", action="store_true", help="Interactive mode")
    parser.add_argument("--name", help="Restaurant name")
    parser.add_argument("--tagline", help="Restaurant tagline")
    parser.add_argument("--location", help="Location")
    parser.add_argument("--hours", help="Operating hours")
    parser.add_argument("--layout", choices=["minimal", "hero", "card"], default="hero", help="Layout style")
    parser.add_argument("--logo", help="Logo URL")
    parser.add_argument("--hero-bg", help="Hero background image URL")
    parser.add_argument("--primary", help="Primary color (hex)")
    parser.add_argument("--secondary", help="Secondary color (hex)")
    parser.add_argument("--buttons", help="Buttons JSON file")
    parser.add_argument("--output", "-o", help="Output filename")
    
    args = parser.parse_args()
    
    # Choose mode
    if args.interactive or len(sys.argv) == 1:
        data, layout, output = interactive_mode()
    else:
        data, layout, output = cli_mode(args)
    
    # Generate
    print_header("🔨 Generating...")
    
    try:
        # Read template
        print_info(f"Reading {layout} template...")
        template = read_template(layout)
        
        # Generate config
        print_info("Generating configuration...")
        config = generate_config(data)
        
        # Replace in template
        print_info("Applying configuration...")
        result = replace_config_in_template(template, config)
        
        # Write output
        output_path = Path(output)
        print_info(f"Writing to {output_path}...")
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(result)
        
        print_success(f"Generated: {output_path}")
        print_info(f"Open in browser: file://{output_path.absolute()}")
        
    except Exception as e:
        print_error(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
