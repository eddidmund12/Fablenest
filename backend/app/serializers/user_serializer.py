def serialize_user(user):
    return{
        "id": user.id,
        "username": user.username,
        "firstname": user.firstname,
        "lastname": user.lastname,
        "bio": user.bio,
        "profile_picture": user.profile_picture,
"followers": user.followers_count(),
        "following": user.following_count()
    }