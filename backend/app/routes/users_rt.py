from flask import Flask, flash, get_flashed_messages,Blueprint,redirect,render_template,request
from flask_login import current_user
from app.utils import data_validation
from app.models import Post, User
from app import db


users_bp = Blueprint("users", __name__)


@users_bp.route("/signup", methods = ["GET", "POST"])
def signup():
    if request.method == "POST":
        firstname = request.form["firstname"]
        lastname = request.form["lastname"]
        middlename = request.form["middlename"]
        email = request.form["email"]
        password = request.form["password"]
        confirmpassword = request.form["comfirmpassword"]

        if data_validation(firstname=firstname, middlename=middlename, lastname=lastname, email=email, password=password, confirmpassword=confirmpassword):

            return render_template("signup.html")


@users_bp.route("/login", methods = ["GET", "POST"])
def user_login():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")



@users_bp.route("/post/create", methods= ["POST"])
def create_post():
    title= request.form["title"]
    content= request.form["content"]
    user_id= current_user.id

    post=Post(
        title=title,
        content=content,
        user_id=user_id
    )
    db.session.add(post)
    db.session.commit()

    return redirect("/dashboard")


        