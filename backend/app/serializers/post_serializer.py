from app.utils import calculate_reading_time

def serialize_post(post, current_user=None):
    return{"id": post.id,
           "title": post.title,
           "slug": post.slug,
           "subTitle": post.subtitle,
"category": post.category,
           "content": post.content,
           "img": post.cover_image,
           "img_url": post.image_url,
           "video_url": post.video_url,
"createdAt": post.created_at.isoformat() if post.created_at else None,
           "reading_time": calculate_reading_time(post.content),
           "views": len(post.views),
"likes": post.like_count(),
           "comment": len(post.comments),
        #    "is_liked": post in current_user.liked_posts if current_user.is_authenticated else False,
            "author":f"{post.author.firstname} {post.author.lastname}",
           "userName": post.author.username}