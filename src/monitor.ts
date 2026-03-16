import pm2 from 'pm2';
import dotenv from 'dotenv';

dotenv.config();

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

if (!DISCORD_WEBHOOK_URL) {
    console.warn('DISCORD_WEBHOOK_URL이 설정되지 않아 모니터링을 종료합니다.');
    process.exit(1);
}

pm2.connect((err: any) => {
    if (err) {
        console.error('PM2 연결 실패:', err);
        process.exit(2);
    }

    console.log('PM2 모니터링을 시작합니다...');

    pm2.launchBus((err: any, pm2_bus: any) => {
        if (err) throw err;

        // 로그 메세지 감지 (업로드 성공 등 일반 출력)
        pm2_bus.on('log:out', (data: any) => {
            const logMessage = data.data ? data.data.toString() : '';
            if (logMessage.includes('업로드 성공')) {
                const appName = data.process.name;
                sendDiscordAlert(
                    `✅ **업로드 성공**\n\`${appName}\` 프로세스에서 인스타그램 업로드를 완료했습니다!`,
                );
            }
        });

        // 프로세스 이벤트 감지 (종료, 재시작 등)
        pm2_bus.on('process:event', (data: any) => {
            // 'exit', 'stop', 'errored' 등의 상태 감지
            if (data.event === 'exit' || data.event === 'stop') {
                const appName = data.process.name;
                // 모니터링 앱 자신은 제외
                if (appName !== 'mealbot-monitor') {
                    sendDiscordAlert(`**봇 중지 알림**\n\`${appName}\` 프로세스가 종료되었습니다.`);
                }
            }
        });

        // 프로세스에서 예외(에러/크래시) 발생 시
        pm2_bus.on('process:exception', (data: any) => {
            const appName = data.process.name;
            const errorMessage =
                data.data && data.data.message ? data.data.message : '알 수 없는 에러';
            sendDiscordAlert(
                `**예외 발생/크래시**\n\`${appName}\` 프로세스에서 에러가 발생했습니다:\n\`\`\`${errorMessage}\`\`\``,
            );
        });
    });
});

async function sendDiscordAlert(content: string) {
    try {
        await fetch(DISCORD_WEBHOOK_URL as string, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
        });
    } catch (error) {
        console.error('디스코드 웹훅 전송 실패:', error);
    }
}
