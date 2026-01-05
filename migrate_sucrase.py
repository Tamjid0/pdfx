import os
import subprocess

src_dir = 'j:/antigravity/pdfx/src'
pdfy_src = 'j:/antigravity/pdfy/src'
subdirs = ['components', 'hooks', 'services', 'store', 'utils']

# 1. Clean and Re-copy
for subdir in subdirs:
    target = os.path.join(src_dir, subdir)
    source = os.path.join(pdfy_src, subdir)
    if os.path.exists(target):
        subprocess.run(['powershell', f'Remove-Item -Path {target} -Recurse -Force'], shell=True)
    subprocess.run(['powershell', f'Copy-Item -Path {source} -Destination {target} -Recurse -Force'], shell=True)

# 2. Run sucrase
for subdir in subdirs:
    target = os.path.join(src_dir, subdir)
    # sucrase will transpile in-place or to same dir if we use -d
    # But sucrase prefers directory to directory
    # We can just run it on the subdir
    subprocess.run(['npx', '-y', 'sucrase', target, '-d', target, '--transforms', 'typescript,jsx'], shell=True)

# 3. Rename and Fix
for subdir in subdirs:
    target = os.path.join(src_dir, subdir)
    for root, dirs, files in os.walk(target):
        for file in files:
            path = os.path.join(root, file)
            # sucrase outputs .js for everything
            # We want .jsx for components
            if subdir == 'components' and file.endswith('.js'):
                new_path = path + 'x' # .js -> .jsx
                if os.path.exists(new_path): os.remove(new_path)
                os.rename(path, new_path)
                path = new_path
            
            # Clean up original TS files
            if file.endswith('.ts') or file.endswith('.tsx'):
                os.remove(path)
                continue
            
            # Fix content
            if path.endswith('.js') or path.endswith('.jsx'):
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Add 'use client' to components
                if subdir == 'components':
                    content = "'use client';\n" + content
                
                # Fix navigation
                content = content.replace('useNavigate()', 'useRouter()')
                content = content.replace('const navigate = useRouter();', 'const router = useRouter();')
                content = content.replace('navigate(', 'router.push(')
                content = content.replace('import { Link, useNavigate } from "react-router-dom";', 'import Link from "next/link"; import { useRouter } from "next/navigation";')
                content = content.replace('import { Link, useNavigate } from \'react-router-dom\';', 'import Link from "next/link"; import { useRouter } from "next/navigation";')
                content = content.replace('<Link to=', '<Link href=')
                
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)

print("Done!")
