import sys
import json
import os
from instagrapi import Client

SESSION_FILE = "session.json"

def upload(username, password, images, caption):
    try:
        cl = Client()
        
        # 프록시가 설정되어 있다면 사용 (예: 한국 IP 프록시)
        proxy = os.environ.get("IG_PROXY")
        if proxy:
            cl.set_proxy(proxy)
            
        session_loaded = False
        if os.path.exists(SESSION_FILE):
            cl.load_settings(SESSION_FILE)
            session_loaded = True
            
        try:
            cl.login(username, password)
        except Exception as e:
            if "challenge_required" in str(e).lower() and session_loaded:
                # If challenge is required even with session, try to re-login without session
                os.remove(SESSION_FILE)
                cl = Client()
                cl.login(username, password)
            else:
                raise e
                
        # Save session for next time to avoid repeated logins
        cl.dump_settings(SESSION_FILE)
        
        if len(images) == 1:
            cl.photo_upload(images[0], caption)
        else:
            cl.album_upload(images, caption)
        print("SUCCESS")
    except Exception as e:
        error_msg = str(e)
        if "challenge_required" in error_msg.lower():
            error_msg = "challenge_required: 인스타그램 앱이나 웹사이트에서 본인 확인(로그인 인증/이것은 나였습니다 클릭)을 완료한 후 다시 시도해주세요."
        print(f"ERROR: {error_msg}", file=sys.stderr)
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
