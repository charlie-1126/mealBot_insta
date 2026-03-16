import sys
import json
from instagrapi import Client

def upload(username, password, images, caption):
    try:
        cl = Client()
        cl.login(username, password)
        if len(images) == 1:
            cl.photo_upload(images[0], caption)
        else:
            cl.album_upload(images, caption)
        print("SUCCESS")
    except Exception as e:
        print(f"ERROR: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 5:
        print("ERROR: Missing arguments", file=sys.stderr)
        sys.exit(1)

    username = sys.argv[1]
    password = sys.argv[2]
    caption = sys.argv[3]
    images = json.loads(sys.argv[4])

    upload(username, password, images, caption)
