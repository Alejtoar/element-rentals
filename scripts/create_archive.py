import os
import zipfile

EXCLUDE_DIRS = {
    '.git',
    'node_modules',
    '__pycache__',
    '.venv',
    'venv',
    '.next',
    'dist',
    'build',
    '.pytest_cache',
}
EXCLUDE_EXTS = {'.pyc', '.pyo', '.zip'}

def create_archive(output_filename="element-rentals.zip"):
    project_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    zip_path = os.path.join(project_dir, output_filename)

    if os.path.exists(zip_path):
        os.remove(zip_path)

    total_added = 0
    with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(project_dir):
            # Prune excluded directories in-place so os.walk doesn't traverse them
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

            for f in files:
                if any(f.endswith(ext) for ext in EXCLUDE_EXTS):
                    continue

                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, project_dir)

                # Extra safety check against any path component matching exclusions
                parts = rel_path.replace('\\', '/').split('/')
                if any(part in EXCLUDE_DIRS for part in parts):
                    continue

                arcname = rel_path.replace('\\', '/')
                zipf.write(full_path, arcname)
                total_added += 1

    print(f"Created {output_filename} ({total_added} files, {os.path.getsize(zip_path) / 1024:.2f} KB)")

if __name__ == "__main__":
    create_archive()
