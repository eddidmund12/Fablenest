from app.extensions import db
from datetime import datetime
from flask_login import UserMixin
from app.utils import slugify
from app.serializers.user_serializer import serialize_user

followers= db.Table("followers", db.metadata, db.Column("follower_id", db.Integer, db.ForeignKey("users.id"), primary_key=True),
                    db.Column("followed_id", db.Integer, db.ForeignKey("users.id"), primary_key=True))


bookmarks = db.Table("bookmarks", db.Column("user_id", db.Integer, db.ForeignKey("users.id")),
                     db.Column("post_id", db.Integer, db.ForeignKey("posts.id")))

users_intrests = db.Table("user_intrests", db.Column("user_id", db.ForeignKey("users.id")), db.Column("intrest_id", db.Integer, db.ForeignKey("intrest.id")))

post_intrests = db.Table("post_intrest", db.Column("post_id", db.Integer, db.ForeignKey("posts.id")), db.Column("intrest_id", db.Integer, db.ForeignKey("intrest.id")))

post_likes = db.Table("post_likes", db.Column("user_id", db.Integer, db.ForeignKey("users.id"), primary_key=True), db.Column("post_id", db.Integer, db.ForeignKey("posts.id"), primary_key=True),  db.Column("created_at", db.DateTime, default=datetime.utcnow))


class User(db.Model, UserMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username= db.Column(db.String(50), unique=True, nullable=True)
    firstname = db.Column(db.String(120), nullable=True)
    middlename = db.Column(db.String(120), nullable=True)
    lastname = db.Column(db.String(120), nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=True)
    profile_picture= db.Column(db.String(255))  
    last_login_ip = db.Column(db.String(45), nullable=True)
    last_login_at = db.Column(db.DateTime, nullable=True)
    is_verified = db.Column(db.Boolean, default=False)
    bio = db.Column(db.Text, nullable=True)
    website = db.Column(db.Text, nullable=True)
    twitter = db.Column(db.String(255), nullable=True)
    linkedin = db.Column(db.String(255), nullable=True)
    instagram = db.Column(db.String(255), nullable= True)
    facebook = db.Column(db.String(255), nullable= True)
    is_admin = db.Column(db.Boolean, default=False)
    is_admin_approved = db.Column(db.Boolean, default=False)
    is_super_admin = db.Column(db.Boolean, default=False)
    is_banned = db.Column(db.Boolean, default=False)
    ban_reason = db.Column(db.String(255), nullable=True)
    banned_at = db.Column(db.DateTime, nullable=True)
    is_suspended = db.Column(db.Boolean, default=False)
    suspend_until = db.Column(db.DateTime, nullable = True)
    otp_code = db.Column(db.String(255), nullable=True)
    otp_expiry = db.Column(db.DateTime)
    liked_posts = db.relationship("Post", secondary="post_likes", back_populates="likes")
    
    
    # Correction required for users profile picture storage

    posts = db.relationship("Post", backref="author", lazy=True, foreign_keys="Post.user_id")
    bookmarked_posts = db.relationship("Post", secondary=bookmarks, backref=db.backref("bookmarked_by", lazy="dynamic"))
    notifications = db.relationship(
        "Notification", foreign_keys="Notification.user_id", backref="owner", lazy="dynamic"
    )
    followers = db.relationship("User", secondary=followers, primaryjoin=(followers.c.followed_id == id), 
                                secondaryjoin=(followers.c.follower_id == id),
                                backref=db.backref("following", lazy="dynamic"), 
                                lazy="dynamic")
    intrests= db.relationship("Intrest", secondary=users_intrests,backref="users")
    

    
    def follow(self, user):
        if not self.is_following(user):
            self.following.append(user)

    def unfollow(self,user):
        if self.is_following(user):
            self.following.remove(user)

    def is_following(self, user):
        return self.following.filter(followers.c.followed_id == user.id).count() > 0
    
    def followers_count(self):
        return self.followers.count()
    
    def following_count(self):
        return self.following.count()

    def serialize(self):
        return serialize_user(self)

    



class Admin(db.Model):
    __tablename__ = "admins"

    id = db.Column(db.Integer, primary_key = True)
    firstname = db.Column(db.String(120), nullable=False)
    middlename = db.Column(db.String(120), nullable=True)
    lastname = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    profile_picture = db.Column(db.String(255))



class Post(db.Model):
    __tablename__ = "posts"

    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(255), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content= db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(255))
    video_url = db.Column(db.String(255))
    category = db.Column(db.String(200), nullable=True)
    subtitle = db.Column(db.String(200), nullable=True)
    cover_image = db.Column(db.String(255), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(
        db.Integer, 
        db.ForeignKey("users.id"),
        nullable=False
    )
    comments = db.relationship("Comment", backref ="post", lazy=True, cascade="all, delete-orphan")
    intrests=db.relationship("Intrest", secondary=post_intrests, backref="posts")
    views = db.relationship("PostView", backref="post", lazy=True, cascade="all, delete-orphan")
    likes = db.relationship("User", secondary="post_likes", back_populates="liked_posts")
    def liked_by(self, user):
        if user not in self.likes:
            self.likes.append(user)
            db.session.commit()
    def unliked_by(self, user):
        if user in self.likes:
            self.likes.remove(user)
            db.session.commit()
    def like_count(self):
        return len(self.likes)

    def generate_slug(self):
        self.slug = slugify(self.title)

class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id= db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    actor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    type = db.Column(db.String(50), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"), nullable=True)
    is_read = db.Column(db.Boolean, default=False)
    created_at= db.Column(db.DateTime, default=datetime.utcnow)
    link = db.Column(db.String(500), nullable=True)
    user = db.relationship("User", foreign_keys=[user_id], overlaps="notifications,owner")
    actor = db.relationship("User", foreign_keys=[actor_id])
    message = db.Column(db.String(500), nullable=False)

class UserSession(db.Model):
    __tablename__ = "user_sessions"

    id=db.Column(db.Integer, primary_key=True)
    user_id=db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    session_token=db.Column(db.String(255), unique=True, nullable=False)
    device_name=db.Column(db.String(120))
    device_type=db.Column(db.String(50))
    browser=db.Column(db.String(80))
    os=db.Column(db.String(80))
    ip_address=db.Column(db.String(45))
    location=db.Column(db.String(120))
    is_trusted=db.Column(db.Boolean,default=True)
    is_active=db.Column(db.Boolean, default=True)
    last_activity=db.Column(db.DateTime, nullable=False)
    expires_at= db.Column(db.DateTime, nullable=False)
    created_at=db.Column(db.DateTime, default=datetime.utcnow)
    user=db.relationship("User", backref="sessions")

class Comment(db.Model):
    __tablename__ = "comments"

    id=db.Column(db.Integer, primary_key=True)
    content=db.Column(db.Text, nullable=False)
    user_id =db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey("comments.id"), nullable=True)
    created_at= db.Column(db.DateTime, default = datetime.utcnow)
    author= db.relationship("User", backref="comments")
    replies = db.relationship("Comment", backref=db.backref("parent", remote_side=[id]), lazy=True)


class Intrest(db.Model):
    id= db.Column(db.Integer, primary_key=True)
    name= db.Column(db.String(50), unique=True, nullable=False)


class PostView(db.Model):
    id= db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    ip_address = db.Column(db.String(45))
    viewed_at = db.Column(db.DateTime, default=datetime.utcnow)
