
from dotenv import load_dotenv
import os

load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

# Your Flask code continues below...


from flask import (
    Flask,
    request,
    jsonify,
    session,
    send_from_directory,
)
from flask_cors import CORS

from werkzeug.security import (
    generate_password_hash,
    check_password_hash,
)

import os
import uuid

from database import (
    search_services,
    get_all_services,
    get_service_by_id,
    add_service,
    update_service,
    delete_service,
    create_user,
    get_user_by_email,
    get_user_by_id,
    create_inquiry,
)


# =========================================================
# APP
# =========================================================

app = Flask(__name__)

app.secret_key = (
    "CHANGE_THIS_TO_A_LONG_RANDOM_SECRET"
)


# =========================================================
# SESSION
# =========================================================

app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = False


# =========================================================
# CORS
# =========================================================

CORS(
    app,
    supports_credentials=True,
    origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
)


# =========================================================
# UPLOADS
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

UPLOAD_FOLDER = os.path.join(
    BASE_DIR,
    "uploads"
)

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)

ALLOWED_EXTENSIONS = {
    "png",
    "jpg",
    "jpeg",
    "webp",
    "gif",
}


def allowed_file(filename):

    return (
        "." in filename
        and filename.rsplit(
            ".",
            1
        )[1].lower()
        in ALLOWED_EXTENSIONS
    )


def save_uploaded_image(file):

    if not file:
        return None

    if not file.filename:
        return None

    if not allowed_file(
        file.filename
    ):
        raise ValueError(
            "Only PNG, JPG, JPEG, WEBP and GIF images are allowed."
        )

    extension = (
        file.filename
        .rsplit(".", 1)[1]
        .lower()
    )

    filename = (
        f"{uuid.uuid4().hex}.{extension}"
    )

    filepath = os.path.join(
        UPLOAD_FOLDER,
        filename
    )

    file.save(filepath)

    return f"/uploads/{filename}"


# =========================================================
# SERVE UPLOADED IMAGES
# =========================================================

@app.route(
    "/uploads/<path:filename>",
    methods=["GET"]
)
def uploaded_file(filename):

    return send_from_directory(
        UPLOAD_FOLDER,
        filename
    )


# =========================================================
# HOME
# =========================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "message": "MySearch API is running"
    })


# =========================================================
# SERVICES
# =========================================================

@app.route(
    "/api/services",
    methods=["GET"]
)
def services():

    try:

        return jsonify(
            get_all_services()
        )

    except Exception as error:

        print(
            "Services error:",
            error
        )

        return jsonify({
            "error": "Database error"
        }), 500


@app.route(
    "/api/services/<int:service_id>",
    methods=["GET"]
)
def get_one_service(service_id):

    try:

        service = get_service_by_id(
            service_id
        )

        if not service:

            return jsonify({
                "error":
                "Service not found"
            }), 404

        return jsonify(service)

    except Exception as error:

        print(
            "Get service error:",
            error
        )

        return jsonify({
            "error": "Database error"
        }), 500


# =========================================================
# SEARCH
# =========================================================

@app.route(
    "/api/search",
    methods=["GET"]
)
def search():

    query = request.args.get(
        "q",
        ""
    ).strip()

    if not query:
        return jsonify([])

    try:

        return jsonify(
            search_services(query)
        )

    except Exception as error:

        print(
            "Search error:",
            error
        )

        return jsonify({
            "error": "Database error"
        }), 500


# =========================================================
# SIGN UP
# =========================================================

@app.route(
    "/api/auth/signup",
    methods=["POST"]
)
def signup():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "error":
                "No data received"
            }), 400

        name = data.get(
            "name",
            ""
        ).strip()

        email = data.get(
            "email",
            ""
        ).strip().lower()

        password = data.get(
            "password",
            ""
        )

        if not name:
            return jsonify({
                "error":
                "Name is required"
            }), 400

        if not email:
            return jsonify({
                "error":
                "Email is required"
            }), 400

        if "@" not in email:
            return jsonify({
                "error":
                "Enter a valid email"
            }), 400

        if len(password) < 8:
            return jsonify({
                "error":
                "Password must be at least 8 characters"
            }), 400

        existing = get_user_by_email(
            email
        )

        if existing:
            return jsonify({
                "error":
                "An account with this email already exists"
            }), 409

        password_hash = (
            generate_password_hash(
                password
            )
        )

        user_id = create_user(
            name,
            email,
            password_hash
        )

        session.clear()

        session["user_id"] = user_id

        session.permanent = True

        return jsonify({
            "message":
            "Account created successfully",

            "user": {
                "id": user_id,
                "name": name,
                "email": email,
            }
        }), 201

    except Exception as error:

        print(
            "Signup error:",
            error
        )

        return jsonify({
            "error":
            "Could not create account"
        }), 500


# =========================================================
# LOGIN
# =========================================================

@app.route(
    "/api/auth/login",
    methods=["POST"]
)
def login():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "error":
                "No data received"
            }), 400

        email = data.get(
            "email",
            ""
        ).strip().lower()

        password = data.get(
            "password",
            ""
        )

        if not email or not password:
            return jsonify({
                "error":
                "Email and password are required"
            }), 400

        user = get_user_by_email(
            email
        )

        if not user:
            return jsonify({
                "error":
                "Invalid email or password"
            }), 401

        if not check_password_hash(
            user["password_hash"],
            password
        ):
            return jsonify({
                "error":
                "Invalid email or password"
            }), 401

        session.clear()

        session["user_id"] = user["id"]

        session.permanent = True

        return jsonify({
            "message":
            "Login successful",

            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
            }
        })

    except Exception as error:

        print(
            "Login error:",
            error
        )

        return jsonify({
            "error":
            "Login failed"
        }), 500


# =========================================================
# CURRENT USER
# =========================================================

@app.route(
    "/api/auth/me",
    methods=["GET"]
)
def current_user():

    user_id = session.get(
        "user_id"
    )

    if not user_id:

        return jsonify({
            "user": None
        })

    try:

        user = get_user_by_id(
            user_id
        )

        if not user:

            session.clear()

            return jsonify({
                "user": None
            })

        return jsonify({
            "user": user
        })

    except Exception as error:

        print(
            "Current user error:",
            error
        )

        return jsonify({
            "error":
            "Could not get current user"
        }), 500


# =========================================================
# LOGOUT
# =========================================================

@app.route(
    "/api/auth/logout",
    methods=["POST"]
)
def logout():

    session.clear()

    return jsonify({
        "message":
        "Logged out successfully"
    })


# =========================================================
# INQUIRIES
# =========================================================

@app.route(
    "/api/inquiries",
    methods=["POST"]
)
def inquiry():

    user_id = session.get(
        "user_id"
    )

    if not user_id:

        return jsonify({
            "error":
            "You must be logged in to send an inquiry"
        }), 401

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "error":
                "No data received"
            }), 400

        service_id = data.get(
            "service_id"
        )

        message = data.get(
            "message",
            ""
        ).strip()

        if not service_id:

            return jsonify({
                "error":
                "Service is required"
            }), 400

        if not message:

            return jsonify({
                "error":
                "Message is required"
            }), 400

        service = get_service_by_id(
            service_id
        )

        if not service:

            return jsonify({
                "error":
                "Service not found"
            }), 404

        inquiry_id = create_inquiry(
            user_id,
            service_id,
            message
        )

        return jsonify({
            "message":
            "Inquiry sent successfully",

            "id":
            inquiry_id
        }), 201

    except Exception as error:

        print(
            "Inquiry error:",
            error
        )

        return jsonify({
            "error":
            "Could not send inquiry"
        }), 500


# =========================================================
# ADMIN
# =========================================================

ADMIN_KEY = "my-admin-key"


def check_admin():

    key = request.headers.get(
        "X-Admin-Key"
    )

    return key == ADMIN_KEY


# =========================================================
# ADMIN GET SERVICES
# =========================================================

@app.route(
    "/api/admin/services",
    methods=["GET"]
)
def admin_services():

    if not check_admin():

        return jsonify({
            "error":
            "Unauthorized"
        }), 401

    try:

        return jsonify(
            get_all_services()
        )

    except Exception as error:

        print(
            "Admin services error:",
            error
        )

        return jsonify({
            "error":
            "Database error"
        }), 500


# =========================================================
# ADMIN CREATE SERVICE
# =========================================================

@app.route(
    "/api/admin/services",
    methods=["POST"]
)
def admin_create_service():

    if not check_admin():

        return jsonify({
            "error":
            "Unauthorized"
        }), 401

    try:

        # IMPORTANT:
        # This endpoint expects multipart/form-data
        # because it accepts an uploaded image.

        name = request.form.get(
            "name",
            ""
        ).strip()

        provider = request.form.get(
            "provider",
            ""
        ).strip()

        category = request.form.get(
            "category",
            ""
        ).strip()

        description = request.form.get(
            "description",
            ""
        ).strip()

        price = request.form.get(
            "price",
            ""
        ).strip()

        if not name:
            return jsonify({
                "error":
                "Service name is required"
            }), 400

        if not provider:
            return jsonify({
                "error":
                "Provider is required"
            }), 400

        if not category:
            return jsonify({
                "error":
                "Category is required"
            }), 400

        if price == "":
            return jsonify({
                "error":
                "Price is required"
            }), 400

        try:
            price = float(price)

        except ValueError:
            return jsonify({
                "error":
                "Price must be a number"
            }), 400

        image_url = ""

        image = request.files.get(
            "image"
        )

        if image:

            image_url = save_uploaded_image(
                image
            )

        service_id = add_service(
            name,
            provider,
            category,
            description,
            price,
            image_url or ""
        )

        return jsonify({
            "message":
            "Service created successfully",

            "id":
            service_id
        }), 201

    except ValueError as error:

        return jsonify({
            "error": str(error)
        }), 400

    except Exception as error:

        print(
            "Create service error:",
            error
        )

        return jsonify({
            "error":
            "Database error"
        }), 500


# =========================================================
# ADMIN UPDATE SERVICE
# =========================================================

@app.route(
    "/api/admin/services/<int:service_id>",
    methods=["PUT"]
)
def admin_update_service(
    service_id
):

    if not check_admin():

        return jsonify({
            "error":
            "Unauthorized"
        }), 401

    try:

        existing = get_service_by_id(
            service_id
        )

        if not existing:

            return jsonify({
                "error":
                "Service not found"
            }), 404

        name = request.form.get(
            "name",
            ""
        ).strip()

        provider = request.form.get(
            "provider",
            ""
        ).strip()

        category = request.form.get(
            "category",
            ""
        ).strip()

        description = request.form.get(
            "description",
            ""
        ).strip()

        price = request.form.get(
            "price",
            ""
        ).strip()

        if not name:
            return jsonify({
                "error":
                "Service name is required"
            }), 400

        if not provider:
            return jsonify({
                "error":
                "Provider is required"
            }), 400

        if not category:
            return jsonify({
                "error":
                "Category is required"
            }), 400

        if price == "":
            return jsonify({
                "error":
                "Price is required"
            }), 400

        try:
            price = float(price)

        except ValueError:
            return jsonify({
                "error":
                "Price must be a number"
            }), 400

        # No new image by default.
        # database.py will keep the old image.
        image_url = None

        image = request.files.get(
            "image"
        )

        if image:

            image_url = save_uploaded_image(
                image
            )

        updated = update_service(
            service_id,
            name,
            provider,
            category,
            description,
            price,
            image_url
        )

        if not updated:

            return jsonify({
                "error":
                "Service could not be updated"
            }), 500

        return jsonify({
            "message":
            "Service updated successfully",

            "service":
            get_service_by_id(
                service_id
            )
        })

    except ValueError as error:

        return jsonify({
            "error": str(error)
        }), 400

    except Exception as error:

        print(
            "Update service error:",
            error
        )

        return jsonify({
            "error":
            "Database error"
        }), 500


# =========================================================
# ADMIN DELETE
# =========================================================

@app.route(
    "/api/admin/services/<int:service_id>",
    methods=["DELETE"]
)
def admin_delete_service(
    service_id
):

    if not check_admin():

        return jsonify({
            "error":
            "Unauthorized"
        }), 401

    try:

        deleted = delete_service(
            service_id
        )

        if not deleted:

            return jsonify({
                "error":
                "Service not found"
            }), 404

        return jsonify({
            "message":
            "Service deleted successfully"
        })

    except Exception as error:

        print(
            "Delete service error:",
            error
        )

        return jsonify({
            "error":
            "Database error"
        }), 500


# =========================================================
# START
# =========================================================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )