from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os
import uuid
from PIL import Image

image_bp = Blueprint("image", __name__, url_prefix="/api/image")

ALLOWED_EXTENSIONS={"png", "jpg", "jpeg", "webp"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@image_bp.route("/upload", methods=["POST"])
def upload_image():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400
    file= request.files["image"]
    if file.filename == "":
        return jsonify({"error": "Invalid file type"}), 400
    filename= secure_filename(file.filename)
    unique_name=f"{uuid.uuid4()}_{filename}"

    if current_app.config["STORAGE_TYPE"] == "local":
        upload_folder = current_app.config["UPLOAD_FOLDER"]
        os.makedirs(upload_folder, exist_ok=True)
        filepath= os.path.join(upload_folder, unique_name)

        image_file = Image.open(file)
        webp_path = filepath.rsplit(".",)[0] + ".webp"

        image_file.save(webp_path, "WEBP", quality=85)
        image_url = f"/uploads/{os.path.basename(webp_path)}"
        return jsonify({"message": "Image uploaded", "url": image_url})
    else:
        import cloudinary.uploader
        result = cloudinary.uploader.upload(file, folder="fablenest_images",
                                            format="webp")
        return jsonify({"message": "Image uploaded", "url": result["secure_url"]})