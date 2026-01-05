import os
import re

def transform_content(content, is_jsx):
    # Strip interfaces and types (multiline)
    # Using a better brace matching approach
    new_content = ""
    lines = content.split('\n')
    skip_mode = False
    brace_count = 0
    
    for line in lines:
        if not skip_mode:
            # Check for start of interface or type
            if re.match(r'^\s*(export\s+)?(interface|type)\s+\w+', line):
                if '{' in line:
                    skip_mode = True
                    brace_count = line.count('{') - line.count('}')
                    if brace_count <= 0: skip_mode = False
                elif '=' in line and ';' not in line:
                    skip_mode = True
                continue
            
            # 1. React.FC and generic types on the right side of :
            # Match ": Type" if it's not in quotes and looks like a type
            # This regex matches : followed by optional whitespace, then a word starting with Uppercase or a primitive, 
            # including generics like <...>, and ending before common JS separators.
            line = re.sub(r':\s*(string|number|boolean|any|void|unknown|never|ChatMessage|Mode|AppMode|GenerationPayload|HTML\w+Element|React\.\w+(<.*?>)?|[\w.]+(<.*?>)?(\[\])?)(?=[,;)\s}=]|$)', '', line)
            
            # 2. Generics in React calls: useState<Type>, useRef<Type>
            line = re.sub(r'useState<.*?>', 'useState', line)
            line = re.sub(r'useRef<.*?>', 'useRef', line)
            
            # 3. Type assertions "as Type" (case sensitive Uppercase type)
            if 'import ' not in line:
                line = re.sub(r'\s+as\s+[A-Z][\w<>\[\]\|]+', '', line)
            
            # 4. Generics in function definitions
            line = re.sub(r'<\s*[A-Z]\w*\s*>(?=\s*\()', '', line)
            
            # 5. JSX specific: <Link to= to <Link href=
            if is_jsx:
                line = line.replace('import { Link, useNavigate } from \'react-router-dom\';', 'import Link from \'next/link\'; import { useRouter } from \'next/navigation\';')
                line = line.replace('import { Link, useNavigate } from "react-router-dom";', 'import Link from "next/link"; import { useRouter } from "next/navigation";')
                line = line.replace('useNavigate()', 'useRouter()')
                line = re.sub(r'<Link\s+to=', '<Link href=', line)

            new_content += line + '\n'
        else:
            brace_count += line.count('{') - line.count('}')
            if brace_count <= 0 and (';' in line or '}' in line or not line.strip()):
                if brace_count <= 0:
                    skip_mode = False
            continue
            
    if is_jsx:
        return "'use client';\n" + new_content
    return new_content

src_dir = 'j:/antigravity/pdfx/src'
subdirs = ['components', 'hooks', 'services', 'store', 'utils']

# Recopy first for fresh start
import subprocess
for subdir in subdirs:
    dest = os.path.join(src_dir, subdir)
    if os.path.exists(dest): subprocess.run(['powershell', f'Remove-Item -Path {dest} -Recurse -Force'], shell=True)
    subprocess.run(['powershell', f'Copy-Item -Path j:/antigravity/pdfy/src/{subdir} -Destination {dest} -Recurse -Force'], shell=True)

for subdir in subdirs:
    target_path = os.path.join(src_dir, subdir)
    for root, dirs, files in os.walk(target_path):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                path = os.path.join(root, file)
                is_jsx = file.endswith('.tsx')
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                new_content = transform_content(content, is_jsx)
                new_ext = '.jsx' if is_jsx else '.js'
                new_path = os.path.splitext(path)[0] + new_ext
                with open(new_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                os.remove(path)
                print(f"Transformed {file} -> {os.path.basename(new_path)}")
