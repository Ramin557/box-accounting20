import os
import re

def update_html_files():
    templates_dir = 'templates'
    for root, _, files in os.walk(templates_dir):
        for file in files:
            if file.endswith('.html'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Replace CSS and JS links
                content = re.sub(r'url_for\(\'static\',\s*filename=\s*[\'\'](.*?)[\'\']\)',
                                 lambda m: f'url_for(\'static\', filename=\'{m.group(1).replace("/static/", "")}\')',
                                 content)

                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)

if __name__ == '__main__':
    update_html_files()
    print("HTML files updated successfully!")
