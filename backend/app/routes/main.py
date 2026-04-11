import os
from flask import Blueprint, render_template, flash, request, redirect, url_for, make_response, jsonify
from flask_login import login_required, current_user, login_user, logout_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from flask_mail import Message
from app.extensions import db, limiter, socketio
from datetime import datetime, timedelta
from app.models import Post, Comment, Notification, User, UserSession, Intrest, post_intrests
from app.utils import (data_validation,  create_notifications, 
                   generate_session_token, get_device_info, send_otp_email, 
                   get_client_ip, get_location_from_ip, calculate_reading_time, track_post_view, slugify)
from flask import current_app
from app.serializers.post_serializer import serialize_post
from app.serializers.comment_serializer import serialize_comment
from app.serializers.user_serializer import serialize_user
import uuid

main_bp = Blueprint("main", __name__, url_prefix="/api")

def post_to_dict(post):
    return {
        "id": post.id,
        "slug": post.slug,
        "title": post.title,
        "content": post.content,
        "image_url": post.image_url,
        "video_url": post.video_url,
        "author": {
            "id": post.author.id,
            "username": post.author.username,
            "profile_picture": post.author.profile_picture,
            "firstname": post.author.firstname,
            "lastname": post.author.lastname
        },
        "created_at": post.created_at.isoformat()
    }

def comment_to_dict(comment):
    return {
        "id": comment.id,
        "content": comment.content,
        "user": {
"id": comment.author.id,
"username": comment.author.username,
"firstname": comment.author.firstname,
"lastname": comment.author.lastname,
"profile_picture": comment.author.profile_picture
        },
        "created_at": comment.created_at.isoformat()
    }

# ==================== MAIN ROUTES ====================

@main_bp.route("/<username>", methods=["GET"])
def get_user_profile(username):
    from app.models import User, Post
    from app.serializers.post_serializer import serialize_post
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    posts = Post.query.filter_by(user_id=user.id).order_by(Post.created_at.desc()).limit(10).all()
    return jsonify({
        "user": serialize_user(user),
        "posts": [serialize_post(post) for post in posts]
    }), 200

@main_bp.route("/profile/<int:user_id>/followers", methods=["GET"])
@login_required
def followers_list(user_id):
    user = User.query.get_or_404(user_id)
    followers = user.followers.all()
    return jsonify([serialize_user(follower) for follower in followers]), 200


@main_bp.route("/profile/edit", methods=["GET", "POST"])
@login_required
def edit_profile():
    # Handle both JSON and form-data
    if request.is_json:
        data = request.get_json()
    else:
        data = {}
        for field in ['bio', 'website', 'twitter', 'linkedin', 'instagram', 'facebook']:
            data[field] = request.form.get(field)

    current_user.bio = data.get("bio", current_user.bio)
    current_user.website = data.get("website", current_user.website)
    current_user.twitter = data.get("twitter", current_user.twitter)
    current_user.linkedin = data.get("linkedin", current_user.linkedin)
    current_user.instagram = data.get("instagram", current_user.instagram)
    current_user.facebook = data.get("facebook", current_user.facebook)

    file = request.files.get("profile_picture")
    if file and file.filename != "":
        filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
        BASE_DIR = os.path.abspath(os.path.dirname(__file__))
        upload_folder = os.path.join(BASE_DIR, "..", "uploads/profiles")
        os.makedirs(upload_folder, exist_ok=True)
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)
        current_user.profile_picture = f"/uploads/profiles/{filename}"

    db.session.commit()
    return jsonify({
        "message": "Profile updated successfully!",
        "user": serialize_user(current_user)
    }), 200


UPLOAD_FOLDER = "static/uploads"



@main_bp.route("/<username>/<slug>", methods=["GET"])
def view_post(username, slug):
    user = User.query.filter_by(username=username).first_or_404()
    post = Post.query.filter_by(user_id=user.id, slug=slug).first_or_404()
    if not post:
        return jsonify({"error": "Post not found"}), 404
    return jsonify(post_to_dict(post))
    
@main_bp.route("/posts/<slug>/comments", methods=["GET"])
def get_comments(slug):
    post=Post.query.filter_by(slug=slug).first()
    if not post:
        return jsonify({"error": "Post not found"}), 404
    comments= Comment.query.filter_by(post_id=post.id).all()
    
    return jsonify([comment_to_dict(c) for c in comments])

@main_bp.route("/post/<slug>/comments", methods=["POST"])
@login_required
def add_comments(slug):
    post = Post.query.filter_by(slug=slug).first()
    if not post:
        return jsonify({"error": "Post not found"}), 404
    data= request.json
    content= data.get("content")
    parent_id= data.get("parent_id")
    if not content:
        return jsonify({"error": "Cannot be empty"}), 404
    
    comment= Comment(content=content, post_id=post.id, user_id=current_user.id, parent_id=parent_id)
    db.session.add(comment)
    db.session.commit()
    create_notifications(
        user_id=post.user_id,
        actor_id=current_user.id,
        type="comment",
        message = f"{current_user.firstname} {current_user.lastname} commented on your post",
        post_id=post.id
    )
    return jsonify({
        "message": "sent",
        "comment": comment_to_dict(comment)
    })

@main_bp.route("/posts", methods=["GET"])
def get_posts():
    page= request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    posts = Post.query.order_by(Post.created_at.desc()).paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )
    return jsonify({
        "posts": [
            serialize_post(post, current_user) for post in posts.items
        ],
        "total_pages": int(posts.pages),
        "current_page": int(posts.page)
    }), 200


@main_bp.route("/posts", methods=["POST"])
@login_required
def create_post():
    data= request.json
    
    title = data.get("title")
    content = data.get("content")
    image_url = data.get("image_url")
    video_url = data.get("video_url")
    category = data.get("category")

    if not title:
        current_app.logger.error(f"Title required")
        return jsonify({"error": "Title required"}), 400
    if not content:
        current_app.logger.error(f"Post cannot be empty")
        return jsonify({"error": "Post cannot be empty"}), 400
    
    new_post= Post(title=title, content=content, image_url=image_url, video_url=video_url, user_id=current_user.id, category=category)
    new_post.generate_slug()
    db.session.add(new_post)
    db.session.commit()
    return jsonify({"message": "Post created successfully", "post": serialize_post(new_post, current_user)})

@main_bp.route("/posts/<slug>", methods=["GET"])
def get_single_post(slug):
    post = Post.query.filter_by(slug=slug).first_or_404()
    return jsonify(post_to_dict(post))

@main_bp.route("/posts/<int:post_id>", methods=["PUT"])
@login_required
def update_post(post_id):
    post=Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404
    if post.user_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403
    
    data=request.json
    post.title= data.get("title", post.title)
    post.content= data.get("content", post.content)
    post.image_url= data.get("image_url", post.image_url)
    post.video_url= data.get("video_url", post.video_url)
    
    db.session.commit()
    return jsonify({"message": "Post updated", "post": serialize_post(post, current_user)})

@main_bp.route("/posts/<int:post_id>", methods=["DELETE"])
@login_required
def delete_post(post_id):
    post=Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404
    if post.user_id != current_user.id:
        return jsonify({"error": "unauthorized"}), 403
    db.session.delete(post)
    db.session.commit()

    return jsonify({"message": "Post deleted"})

@main_bp.route("/post/<slug>/bookmark", methods=["POST"])
@login_required
def bookmark_post(slug):
    post = Post.query.filter_by(slug=slug).first_or_404()
    if not post:
        return jsonify({"error": "Post not found"}), 404
    if post in current_user.bookmarked_posts:
        return jsonify({"message": "Already bookmarked"}), 400
    current_user.bookmarked_posts.append(post)
    db.session.commit()
    return jsonify({"message": "Post added to bookmark"})

@main_bp.route("/post/<slug>/remove-bookmark", methods=["POST"])
@login_required
def remove_bookmark(slug):
    post=Post.query.filter_by(slug=slug).first_or_404()
    if post not in current_user.bookmarked_posts:
        return jsonify({"message": "Not bookmarked"}), 400
    current_user.bookmarked_posts.remove(post)
    db.session.commit()
    return jsonify({"message": "Bookmark removed"})
@main_bp.route("/bookmarks", methods=["GET"])
@login_required
def get_bookmarks():
    posts= current_user.bookmarked_posts
    results=[]
    for post in posts:
        results.append({"title": post.title, "slug": post.slug, "cover_image": post.cover_image, "reading_time": calculate_reading_time(post.content), "author":{"username": post.author.username, "firstname": post.author.firstname, "lastname": post.author.lastname}})
    return jsonify(results)


@main_bp.route("/users/<int:user_id>/follow", methods=["POST"])
@login_required
def follow_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 400
    if current_user.id == user.id:
        return jsonify({"error": "."}), 400
    current_user.follow(user)
    db.session.commit()
    create_notifications(
        user_id= user.id,
        actor_id= current_user.id,
        type ="follow",
        message =f"{current_user.firstname} {current_user.lastname} started following you"
    )
    return jsonify({"message": "User followed"})
    

@main_bp.route("/users/<int:user_id>/unfollow", methods=["POST"])
@login_required
def unfollow_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return({"error": "User not found"}), 400
    if current_user.id == user.id:
        return jsonify({"error": "."}), 400
    current_user.unfollow(user)
    db.session.commit()
    return jsonify({"message": "User unfollowed"})

@main_bp.route("/notifications", methods=["GET"])
@login_required
def get_notifications():
    notifications = Notification.query.filter_by(user_id=current_user.id).order_by(Notification.created_at.desc()).limit(20).all()
    data = []
    for n in notifications:
        data.append({
            "id": n.id,
            "type": n.type,
            "actor_id": n.actor_id,
            "post_id": n.post_id,
            "is_read": n.is_read,
            "message": n.message,
            "link": n.link,
            "created_at": n.created_at.isoformat()
        })
    return jsonify(data)


@main_bp.route("/notifications/<int:id>/read", methods=["POST"])
@login_required
def mark_notifications_read(id):
    notification = Notification.query.get_or_404(id)
    if notification.user_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403
    notification.is_read=True
    db.session.commit()
    return jsonify({"message": "Notifiction marked as read"})

@main_bp.route("/notifications/unread-count", methods=["GET"])
@login_required
def unread_count():
    count = Notification.query.filter_by(user_id = current_user.id, is_read=False).count()
    return jsonify({"unread": count}), 200

@main_bp.route("/search", methods=["GET"])
def search_posts():
    query = request.args.get("q", "")

    if not query:
        return jsonify ({"results": []})
    posts = Post.query.filter(Post.title.ilike(f"%{query}%")).order_by(Post.created_at.desc()).limit(20).all()
    results=[]
    for post in posts:
        results.append({
            "id": post.id,
            "title": post.title,
            "slug": post.slug,
            "excerpt": post.excerpt,
            "cover_image": post.cover_image
        })
    return jsonify({"results": results})


@main_bp.route("/profile/<username>", methods=["GET"])
def get_profile(username):
    user = User.query.filter_by(username=username).first_or_404()
    posts = Post.query.filter_by(user_id=user.id).order_by(Post.created_at.desc()).limit(20).all()
    posts_data=[]
    for post in posts:
        posts_data.append({
            "id": post.id,
            "title": post.title,
            "slug": post.slug,
            "cover_image": post.cover_image,
            "created_at": post.created_at
        })
    return jsonify({"user": {
        "id": user.id,
        "username": user.username,
        "firstname": user.firstname,
        "lastname": user.lastname,
        "bio": user.bio,
        "profile_picture": user.profile_picture,
        "followers": user.followers_count(),
        "following": user.following_count()
    },
    "posts": posts_data})

@main_bp.route("/post/<slug>", methods=["GET"])
def get_post(slug):
    post = Post.query.filter_by(slug=slug).first_or_404()
    track_post_view(post)

    comments = Comment.query.filter_by(post_id=post.id, parent_id=None).order_by(Comment.created_at.asc()).all()
    return jsonify({"post": serialize_post(post, current_user),
                    "comments": [
                        serialize_comment(comment) for comment in comments
                    ]
    })
    
@main_bp.route("/post/<slug>/comment", methods=["POST"])
@login_required
def add_comment(slug):
    post = Post.query.filter_by(slug=slug).first_or_404()
    data=request.json
    content = data.get("content")

    if not content:
        return jsonify({"error": "Cannot be empty"}), 400
    
    comment = Comment(content=content, user_id=current_user.id, post_id=post.id)
    db.session.add(comment)

    if post.author.id != current_user.id:
        create_notifications(
            user_id=post.user_id,
            actor_id=current_user.id,
            type="comment",
            post_id=post.id,
            message=f"{current_user.username} commented on your post",
            link=f"/post/{post.slug}"
        )
    db.session.commit()

    return jsonify({"message": "Comment added"})




@main_bp.route("/user/intrests", methods=["POST"])
@login_required
def set_intrests():
    data = request.json
    intrests_list = data.get("intrests", [])
    
    if not intrests_list:
        return jsonify({"error": "No interests provided"}), 400
    
    intrests = []
    # Handle both IDs (int/list) and names (str/list)
    if isinstance(intrests_list, str):
        intrests_list = [intrests_list]
    
    for item in intrests_list:
        item = item.strip()
        if not item:
            continue
        if item.isdigit():
            # ID lookup
            intrest = Intrest.query.get(int(item))
        else:
            # Name lookup (case-insensitive)
            intrest = Intrest.query.filter(db.func.lower(Intrest.name) == item.lower()).first()
        if intrest:
            intrests.append(intrest)
    
    if not intrests:
        return jsonify({"error": "No valid interests found"}), 400
    
    # Limit to prevent abuse
    intrests = intrests[:10]
    
    current_user.intrests = intrests
    db.session.commit()
    
    return jsonify({
        "message": "Interests updated successfully!",
        "interests": [{"id": i.id, "name": i.name} for i in intrests]
    })


@main_bp.route("/feed", methods=["GET"])
@login_required
def personalized_feed():
    intrest_ids = [
        intrest.id for intrest in current_user.intrests
    ]
    posts = Post.query.join(post_intrests).filter(
        post_intrests.c.intrest_id.in_(intrest_ids)
    ).order_by(Post.created_at.desc()).limit(20).all()
    results = []
    for post in posts:
        results.append({"id": post.id, "title": post.title, "slug": post.slug, "cover_image": post.cover_image, "reading_time": calculate_reading_time(post.content), "author": {"username": post.author.username, "firstname": post.author.firstname, "lastname": post.author.lastname}
                        })
    
    return jsonify(results)



@main_bp.route("/post/<slug>/like", methods=["POST"])
@limiter.limit("30/minute")
@login_required
def like_post(slug):
    post = Post.query.filter_by(slug=slug).first_or_404()
    user = current_user
    post.like_by(user)
    db.session.commit()
    create_notifications(
        user_id= post.user_id,
        actor_id= current_user.id,
        type="like",
        message =f"{current_user.firstname} {current_user.lastname} liked your post",
        post_id=post.id
    )
    return jsonify({"message": post.like_count})
    
@main_bp.route("/post/<slug>/unlike", methods=["POST"])
@login_required
def unlike_post(slug):
    post=Post.query.filter_by(slug=slug).first_or_404()
    user = current_user
    post.unlike_by(user)
    db.session.commit()
    return jsonify({"message": post.like_count})