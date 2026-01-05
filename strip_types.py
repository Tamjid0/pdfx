import os
import re

def strip_types(content):
    # Remove 'use client' if it exists to avoid double
    content = content.replace("'use client';", "")
    content = content.replace('"use client";', "")
    
    # Remove interfaces/types (multiline)
    # Using a simple brace counter for interfaces/types
    new_content = ""
    lines = content.split('\n')
    skip_mode = False
    brace_count = 0
    
    for line in lines:
        if not skip_mode:
            if re.match(r'^\s*(export\s+)?(interface|type)\s+\w+', line):
                skip_mode = True
                brace_count += line.count('{') - line.count('}')
                if brace_count <= 0 and (';' in line or '}' in line):
                    skip_mode = False
                continue
            
            # Strip : Type but NOT inside JSX or objects
            # This is hard. Let's instead specifically target TS patterns.
            
            # React.FC
            line = re.sub(r':\s*React\.FC(<.*?>)?', '', line)
            # Other React types
            line = re.sub(r':\s*React\.\w+(<.*?>)?', '', line)
            # Simple types
            line = re.sub(r':\s*(string|number|boolean|any|void|ChatMessage|Mode|AppMode|GenerationPayload)(\[\])?(?=[,;)\s]|$)', '', line)
            # useState<Type> - specifically target useState
            line = re.sub(r'useState<.*?>', 'useState', line)
            # as Type - only if followed by space or end of line and starts with Uppercase
            line = re.sub(r'\s+as\s+[A-Z]\w+', '', line)
            # Generics in function definitions (e.g. const f = <T>(...))
            # But avoid matching JSX!
            # If it's <T> followed by ( it's likely a generic
            line = re.sub(r'<\s*[A-Z]\w*\s*>(?=\s*\()', '', line)
            
            new_content += line + '\n'
        else:
            brace_count += line.count('{') - line.count('}')
            if brace_count <= 0:
                skip_mode = False
            continue
            
    return "'use client';\n" + new_content

# Re-copy source from pdfy to get fresh files
import subprocess
subprocess.run(['powershell', 'Remove-Item -Path j:/antigravity/pdfx/src -Recurse -Force'], shell=True)
subprocess.run(['powershell', 'Copy-Item -Path j:/antigravity/pdfy/src -Destination j:/antigravity/pdfx/src -Recurse -Force'], shell=True)

src_dir = 'j:/antigravity/pdfx/src'
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            new_content = strip_types(content)
            
            new_ext = '.jsx' if file.endswith('.tsx') else '.js'
            new_path = os.path.splitext(path)[0] + new_ext
            
            with open(new_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            os.remove(path)
            print(f"Processed {file} -> {os.path.basename(new_path)}")
