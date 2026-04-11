def serialize_comment(comment):
    return {
        "id": comment.id,
        "content": comment.content,
        "createdAt": comment.created_at.isoformat(),
        "author": {
            "id": comment.author.id,
            "username": comment.author.username,
            "firstname": comment.author.firstname,
            "lastname": comment.author.lastname,
            "profile_picture": comment.author.profile_picture
        },
        "replies": [
            serialize_comment(reply) for reply in comment.replies
        ]
    }

