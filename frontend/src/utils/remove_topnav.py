import os
import re

components_dir = r"e:\epicgroup-lab-app\frontend\src\components"

# Better regex to match JSX tags
regex = re.compile(r'<TopNavigation[^>]*/>', re.DOTALL)
regex2 = re.compile(r'<TopNavigation[^>]*>.*?</TopNavigation>', re.DOTALL)
import_regex = re.compile(r'import\s+TopNavigation\s+from\s+[\'"]\./TopNavigation[\'"];?\n?')

files_to_fix = [
    "AssignmentsScreen.tsx",
    "GradesScreen.tsx",
    "ProgressScreen.tsx",
    "QuotesScreen.tsx",
    "StudentsScreen.tsx"
]

for filename in files_to_fix:
    filepath = os.path.join(components_dir, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = content
        new_content = regex.sub('', new_content)
        new_content = regex2.sub('', new_content)
        new_content = import_regex.sub('', new_content)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Removed TopNavigation from {filename}")
        else:
            print(f"No changes in {filename}")
