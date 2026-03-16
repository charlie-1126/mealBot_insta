import os
from instagrapi import Client

SESSION_FILE = "session.json"

def main():
    print("=== 인스타그램 로컬 세션 생성기 ===")
    username = input("인스타그램 아이디를 입력하세요: ")
    password = input("인스타그램 비밀번호를 입력하세요: ")
    
    cl = Client()
    
    try:
        print("\n로그인 시도 중...")
        cl.login(username, password)
        cl.dump_settings(SESSION_FILE)
        print(f"\n✅ 성공! '{SESSION_FILE}' 파일이 생성되었습니다.")
        print("이제 이 파일을 서버(타국가)의 같은 경로에 업로드하고 실행해보세요.")
    except Exception as e:
        error_msg = str(e)
        if "challenge_required" in error_msg.lower():
            print("\n❌ 본인 확인(Challenge)이 필요합니다.")
            print("스마트폰의 인스타그램 앱이나 웹사이트를 열어 '본인이 로그인한 것이 맞나요? (이것은 나였습니다)'를 클릭 및 인증한 후,")
            print("이 스크립트를 다시 실행해주세요.")
        elif "two_factor_required" in error_msg.lower():
            print("\n❌ 2단계 인증이 설정되어 있습니다. 아직 이 스크립트는 2FA를 직접 지원하지 않습니다.")
        else:
            print(f"\n❌ 로그인 실패: {error_msg}")

if __name__ == "__main__":
    main()
