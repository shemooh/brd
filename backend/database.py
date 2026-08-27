
import mysql.connector
from mysql.connector import Error


# =========================================================
# DATABASE CONFIG
# =========================================================

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "admin",
    "database": "simple_db",
}


# =========================================================
# CONNECTION
# =========================================================

def get_connection():
    try:
        return mysql.connector.connect(
            host=DB_CONFIG["host"],
            user=DB_CONFIG["user"],
            password=DB_CONFIG["password"],
            database=DB_CONFIG["database"],
        )

    except Error as error:
        print("MYSQL CONNECTION ERROR:")
        print(error)
        raise


# =========================================================
# GET ALL SERVICES
# =========================================================

def get_all_services():

    connection = get_connection()

    try:
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                id,
                name,
                provider,
                category,
                description,
                price,
                image_url
            FROM services
            ORDER BY id DESC
        """)

        return cursor.fetchall()

    finally:
        cursor.close()
        connection.close()


# =========================================================
# GET ONE SERVICE
# =========================================================

def get_service_by_id(service_id):

    connection = get_connection()

    try:
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                id,
                name,
                provider,
                category,
                description,
                price,
                image_url
            FROM services
            WHERE id = %s
        """, (service_id,))

        return cursor.fetchone()

    finally:
        cursor.close()
        connection.close()


# =========================================================
# SEARCH
# =========================================================

def search_services(query):

    connection = get_connection()

    try:
        cursor = connection.cursor(dictionary=True)

        search = f"%{query}%"

        cursor.execute("""
            SELECT
                id,
                name,
                provider,
                category,
                description,
                price,
                image_url
            FROM services
            WHERE
                name LIKE %s
                OR provider LIKE %s
                OR category LIKE %s
                OR description LIKE %s
            ORDER BY id DESC
        """, (
            search,
            search,
            search,
            search,
        ))

        return cursor.fetchall()

    finally:
        cursor.close()
        connection.close()


# =========================================================
# CREATE SERVICE
# =========================================================

def add_service(
    name,
    provider,
    category,
    description,
    price,
    image_url=""
):

    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("""
            INSERT INTO services
            (
                name,
                provider,
                category,
                description,
                price,
                image_url
            )
            VALUES
            (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s
            )
        """, (
            name,
            provider,
            category,
            description,
            price,
            image_url,
        ))

        connection.commit()

        return cursor.lastrowid

    except Exception:
        connection.rollback()
        raise

    finally:
        cursor.close()
        connection.close()


# =========================================================
# UPDATE SERVICE
# =========================================================

def update_service(
    service_id,
    name,
    provider,
    category,
    description,
    price,
    image_url=None
):

    connection = get_connection()

    try:
        cursor = connection.cursor()

        # If no new image was uploaded,
        # keep the existing image.
        if image_url is None:

            cursor.execute("""
                UPDATE services
                SET
                    name = %s,
                    provider = %s,
                    category = %s,
                    description = %s,
                    price = %s
                WHERE id = %s
            """, (
                name,
                provider,
                category,
                description,
                price,
                service_id,
            ))

        else:

            cursor.execute("""
                UPDATE services
                SET
                    name = %s,
                    provider = %s,
                    category = %s,
                    description = %s,
                    price = %s,
                    image_url = %s
                WHERE id = %s
            """, (
                name,
                provider,
                category,
                description,
                price,
                image_url,
                service_id,
            ))

        connection.commit()

        return cursor.rowcount > 0

    except Exception:
        connection.rollback()
        raise

    finally:
        cursor.close()
        connection.close()


# =========================================================
# DELETE SERVICE
# =========================================================

def delete_service(service_id):

    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("""
            DELETE FROM services
            WHERE id = %s
        """, (service_id,))

        connection.commit()

        return cursor.rowcount > 0

    except Exception:
        connection.rollback()
        raise

    finally:
        cursor.close()
        connection.close()


# =========================================================
# USERS
# =========================================================

def create_user(
    name,
    email,
    password_hash
):

    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("""
            INSERT INTO users
            (
                name,
                email,
                password_hash
            )
            VALUES
            (
                %s,
                %s,
                %s
            )
        """, (
            name,
            email,
            password_hash,
        ))

        connection.commit()

        return cursor.lastrowid

    except Exception:
        connection.rollback()
        raise

    finally:
        cursor.close()
        connection.close()


def get_user_by_email(email):

    connection = get_connection()

    try:
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                id,
                name,
                email,
                password_hash
            FROM users
            WHERE email = %s
        """, (email,))

        return cursor.fetchone()

    finally:
        cursor.close()
        connection.close()


def get_user_by_id(user_id):

    connection = get_connection()

    try:
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                id,
                name,
                email
            FROM users
            WHERE id = %s
        """, (user_id,))

        return cursor.fetchone()

    finally:
        cursor.close()
        connection.close()


# =========================================================
# INQUIRIES
# =========================================================

def create_inquiry(
    user_id,
    service_id,
    message
):

    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("""
            INSERT INTO inquiries
            (
                user_id,
                service_id,
                message
            )
            VALUES
            (
                %s,
                %s,
                %s
            )
        """, (
            user_id,
            service_id,
            message,
        ))

        connection.commit()

        return cursor.lastrowid

    except Exception:
        connection.rollback()
        raise

    finally:
        cursor.close()
        connection.close()
