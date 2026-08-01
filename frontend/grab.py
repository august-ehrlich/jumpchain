import os
import sys
import subprocess
import platform
from typing import List

def copy_to_clipboard(text:str):
    """Pipes text to the OS's native clipboard command."""
    command = None
    
    # Check if running inside WSL
    if sys.platform.startswith("linux") and ("microsoft" in platform.uname().release.lower() or "wsl" in platform.uname().release.lower()):
        command = ['clip.exe']
    # Standard Windows
    elif sys.platform == "win32":
        command = ['clip']
    # macOS
    elif sys.platform == "darwin":
        command = ['pbcopy']
    # Native Linux (requires xclip)
    elif sys.platform.startswith("linux"):
        command = ['xclip', '-selection', 'clipboard']
        
    if not command:
        print("Clipboard copy not supported natively on this OS.")
        return False

    try:
        # Pipe the text string as encoded bytes to the command
        process = subprocess.Popen(command, stdin=subprocess.PIPE, close_fds=True)
        process.communicate(input=text.encode('utf-8'))
        return True
    except FileNotFoundError:
        print(f"Failed to copy: The command '{command[0]}' is not installed on your system.")
        return False

def copy_typescript_files(target_dirs: List[str]):
    # Exact folder names to skip
    ignore_dirs = {'node_modules'}
    output_text: List[str]= []
    file_count = 0

    for target_dir in target_dirs:
        if not os.path.exists(target_dir):
            print(f"Warning: The path '{target_dir}' does not exist. Skipping.")
            continue

        # os.walk traverses the directory tree top-down
        for root, dirs, files in os.walk(target_dir):
            # Modify dirs in-place to prevent os.walk from even entering ignored folders
            dirs[:] = [d for d in dirs if d not in ignore_dirs]

            for file in files:
                if (file.endswith('.ts') or file.endswith('.tsx')) and file != os.path.basename(__file__):  # Exclude this script itself
                    file_path = os.path.join(root, file)
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            
                        # Normalize the path for a cleaner header
                        normalized_path = os.path.normpath(file_path)
                        output_text.append(f"### File: {normalized_path}\n")
                        output_text.append(content)
                        output_text.append("\n")
                        
                        file_count += 1
                    except Exception as e:
                        print(f"Skipping {file_path} due to error: {e}")
    
    if output_text:
        final_string = "\n".join(output_text)
        success = copy_to_clipboard(final_string)
        if success:
            print(f"Success! Copied {file_count} TypeScript files to clipboard.")
    else:
        print("No TypeScript files found.")

if __name__ == "__main__":
    # Grab all arguments passed after the script name
    args = sys.argv[1:]
    
    # If no arguments are provided, default to the current directory
    if not args:
        args = ['.']
        
    copy_typescript_files(args)