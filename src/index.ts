import { generateMealImages } from './generate.js';
import { uploadToInstagram } from './upload.js';
import schedule from 'node-schedule';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import logger from './logger.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const KST = 'Asia/Seoul';

async function runUploadTask(targetDate: Date) {
    logger.info('NEIS 급식 정보 가져오기 & 이미지 생성');
    try {
        const dateObj = dayjs(targetDate).tz(KST);
        const yyyy = dateObj.format('YYYY');
        const mm = dateObj.format('M');
        const dd = dateObj.format('D');
        const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
        const dayName = days[dateObj.day()];

        const generatedImages = await generateMealImages(dateObj.toDate());

        if (generatedImages.length === 0) {
            logger.info('업로드할 급식 이미지가 생성되지 않았습니다.');
            return;
        }

        const caption = `${yyyy}년 ${mm}월 ${dd}일 ${dayName}`;

        logger.info('인스타그램 업로드');
        await uploadToInstagram(generatedImages, caption);
        logger.info('모든 작업이 성공적으로 완료되었습니다.');
    } catch (error) {
        logger.error(`실행 중 에러 발생: ${error}`);
    }
}

const isOnce = process.argv.includes('--once');
const isOnceTomorrow = process.argv.includes('--once-tomorrow');

if (isOnce) {
    logger.info('1회성 실행 옵션으로 스크립트를 시작합니다 (오늘).');
    const today = dayjs().tz(KST).toDate();
    runUploadTask(today);
} else if (isOnceTomorrow) {
    logger.info('1회성 실행 옵션으로 스크립트를 시작합니다 (내일).');
    const tomorrow = dayjs().tz(KST).add(1, 'day').toDate();
    runUploadTask(tomorrow);
} else {
    const rule = new schedule.RecurrenceRule();
    rule.hour = 22;
    rule.minute = 0;
    rule.tz = KST;

    logger.info('봇이 시작되었습니다.');
    schedule.scheduleJob(rule, () => {
        const tomorrow = dayjs().tz(KST).add(1, 'day').toDate();
        runUploadTask(tomorrow);
    });
}
