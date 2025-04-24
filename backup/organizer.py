import os
import sys
import shutil
import tempfile
import platform
import subprocess
from collections import defaultdict
import customtkinter as ctk
from tkinter import filedialog, messagebox
from PIL import Image, ImageTk
import re

# ---------- Appearance ---------- #
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("green")
sidebar_visible = False  # Initial state

def toggle_sidebar():
    global sidebar_visible
    if sidebar_visible:
        sidebar_frame.pack_forget()
    else:
        sidebar_frame.pack(side="left", fill="y")
    sidebar_visible = not sidebar_visible

# ---------- App Setup ---------- #
app = ctk.CTk()
app.configure(fg_color="#000000")  # Set your desired background here
app.geometry("600x500")
topbar_frame = ctk.CTkFrame(app, height=50, fg_color="#000000")
topbar_frame.pack(fill="x", side="top")

burger_button = ctk.CTkButton(
    topbar_frame,
    text="☰",
    width=40,
    height=40,
    fg_color="#000000",
    text_color="white",
    hover_color="#333333",
    command=toggle_sidebar,
    corner_radius=10
)
burger_button.pack(side="left", padx=10)



# ---------- Icon Setup (EXE-friendly) ---------- #
if getattr(sys, 'frozen', False):
    base_path = sys._MEIPASS
else:
    base_path = os.path.abspath(".")

icon_path = os.path.join(base_path, "o.ico")
try:
    app.iconbitmap(icon_path)
except Exception as e:
    print(f"Icon load failed: {e}")

# ---------- Logic ---------- #

def categorize_content(text):
    text = text.lower()
    categories = {
        "Resume": [
            "curriculum vitae", "cv", "resume", "objective", "skills", "experience", "education", "references", "summary"
        ],
        "Job_Application": [
            "cover letter", "application for", "dear hiring", "position of", "attached resume", "job application"
        ],
        "Others": []
    }

    score_map = {}
    for category, keywords in categories.items():
        score_map[category] = sum(1 for kw in keywords if re.search(rf"\b{re.escape(kw)}\b", text))

    best_category = max(score_map, key=score_map.get)
    return best_category if score_map[best_category] > 0 else "Others"

organized_folder_path = None
folder_path_var = ctk.StringVar()

def open_folder(path):
    system = platform.system()
    if system == "Windows":
        os.startfile(path)
    elif system == "Darwin":
        subprocess.Popen(["open", path])
    else:
        subprocess.Popen(["xdg-open", path])

def organize_copy(folder):
    try:
        base_name = os.path.basename(folder.rstrip("/\\"))
        temp_dir = tempfile.mkdtemp()
        copied_folder = os.path.join(temp_dir, base_name)
        shutil.copytree(folder, copied_folder)

        count_by_type = defaultdict(int)
        renamed_files = []

        for file in os.listdir(copied_folder):
            file_path = os.path.join(copied_folder, file)
            if os.path.isfile(file_path):
                try:
                    if "." not in file:
                        continue
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read(2048)
                    category = categorize_content(content)
                    print(f"{file} → {category}")

                    ext = file.split('.')[-1].lower()
                    if ext.isalnum():
                        count_by_type[ext] += 1
                        type_folder = os.path.join(copied_folder, ext.upper() + "_Files")
                        os.makedirs(type_folder, exist_ok=True)
                        new_path = os.path.join(type_folder, file)
                        shutil.move(file_path, new_path)

                    renamed_files.append(f"{file} → {file}")

                except Exception as e:
                    print(f"⚠️ Error processing {file}: {e}")

        summary_path = os.path.join(copied_folder, "summary.txt")
        with open(summary_path, "w", encoding="utf-8") as f:
            f.write("📄 Folder Organized Summary:\n\n")
            for ext, count in count_by_type.items():
                f.write(f"• {ext.upper()} Files: {count}\n")
            f.write("\n✅ Renamed Files:\n")
            for line in renamed_files:
                f.write(f"- {line}\n")

        global organized_folder_path
        organized_folder_path = copied_folder
        messagebox.showinfo("Organized", "✅ Folder organized. Now you can save it.")
        save_button.configure(state="normal")
        open_folder(copied_folder)

    except Exception as e:
        messagebox.showerror("Error", str(e))

def save_folder():
    try:
        if not organized_folder_path:
            raise Exception("No organized folder found.")
        destination = filedialog.askdirectory(title="Choose location to save")
        if not destination:
            return

        new_name = ctk.CTkInputDialog(text="Enter a name for the folder:", title="Folder Name").get_input()
        if not new_name:
            return

        final_path = os.path.join(destination, new_name)
        if os.path.exists(final_path):
            overwrite = messagebox.askyesno("Overwrite?", "That folder exists. Overwrite?")
            if not overwrite:
                return
            shutil.rmtree(final_path)

        shutil.copytree(organized_folder_path, final_path)
        messagebox.showinfo("Saved", f"📁 Folder saved to:\n{final_path}")
        open_folder(final_path)

    except Exception as e:
        messagebox.showerror("Error", str(e))

def choose_folder():
    folder = filedialog.askdirectory()
    if folder:
        folder_path_var.set(folder)

def start_organize():
    path = folder_path_var.get()
    if not path or not os.path.isdir(path):
        messagebox.showerror("Error", "Please select a valid folder.")
        return
    organize_copy(path)

# ---------- UI ---------- #
title_label = ctk.CTkLabel(
    app, text="Orgonizer.co",
    font=("Segoe UI", 24, "bold"),
    text_color="#FFFFFF"
)
title_label.pack(pady=(25, 15))

entry = ctk.CTkEntry(
    app, width=440, height=40,
    textvariable=folder_path_var,
    placeholder_text="Browse a folder",
    fg_color="#111111", border_color="#333333",
    border_width=1, corner_radius=8,
    text_color="#FFFFFF"
)
entry.pack(pady=8)

button_style = {
    "width": 200,
    "height": 40,
    "corner_radius": 10,
    "font": ("Segoe UI", 13),
    "fg_color": "#3A3A3A",
    "hover_color": "#4A4A4A",
}

browse_button = ctk.CTkButton(app, text="Browse Folder", command=choose_folder, **button_style)
browse_button.pack(pady=8)

organize_button = ctk.CTkButton(app, text="Organize Files", command=start_organize, **button_style)
organize_button.pack(pady=8)

save_button = ctk.CTkButton(app, text="Save Folder", command=save_folder, state="disabled", **button_style)
save_button.pack(pady=8)

sidebar_visible = False  # Track if sidebar is open or not

sidebar_frame = ctk.CTkFrame(
    app,
    width=160,
    fg_color="#000000",  # black background
    corner_radius=0
)

# Title at the top of sidebar
sidebar_title = ctk.CTkLabel(
    sidebar_frame,
    text="☰ Menu",
    font=("Segoe UI", 18, "bold"),
    text_color="#00FFAA"
)
sidebar_title.pack(pady=(20, 10))

# "How to Use" button inside the sidebar
how_to_use_btn = ctk.CTkButton(
    sidebar_frame,
    text="How to Use",
    width=160,
    command=lambda: messagebox.showinfo(
        "How to Use Orgonizer.co",
        "📁 Step-by-step:\n\n"
        "1. Click 'Browse Folder' to select a folder.\n"
        "2. Click 'Organize Files' to categorize them by type.\n"
        "3. Click 'Save Folder' to export the organized files.\n\n"
        "🎉 Your original folder is untouched!"
    )
)
how_to_use_btn.pack(pady=10)

def toggle_sidebar():
    global sidebar_visible
    if sidebar_visible:
        sidebar_frame.place_forget()  # Hide sidebar
        sidebar_visible = False
    else:
        sidebar_frame.place(x=0, y=0)  # Show sidebar on the left
        sidebar_visible = True


info_label = ctk.CTkLabel(
    app,
    text="Your original files remain untouched\nDeveloped & managed @jayesh_l.k 📷",
    font=("Segoe UI", 13, "italic"),
    text_color="#BBBBBB",
    justify="center"
)
info_label.pack(pady=(20, 10))

app.mainloop()
