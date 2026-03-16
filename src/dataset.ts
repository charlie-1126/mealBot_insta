import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import type { MealCardData } from './template.js';
import logger from './logger.js';
import dotenv from 'dotenv';

dotenv.config();

dayjs.extend(utc);
dayjs.extend(timezone);

export async function fetchNeisMeals(dateParam?: Date): Promise<MealCardData[]> {
    // 입력받은 Date(혹은 undefined)를 KST 기준으로 해석
    const targetDate = dayjs(dateParam).tz('Asia/Seoul');
    const yyyy = targetDate.format('YYYY');
    const mm = targetDate.format('MM');
    const dd = targetDate.format('DD');
    const ymd = `${yyyy}${mm}${dd}`;

    const url = 'https://open.neis.go.kr/hub/mealServiceDietInfo';
    const params = {
        Type: 'json',
        ATPT_OFCDC_SC_CODE: process.env.NEIS_ATPT_OFCDC_SC_CODE,
        SD_SCHUL_CODE: process.env.NEIS_SD_SCHUL_CODE,
        MLSV_YMD: ymd,
    };

    try {
        const response = await axios.get(url, { params });
        const data = response.data;

        if (!data.mealServiceDietInfo) {
            logger.dataset('급식 데이터가 없습니다.');
            return [];
        }

        const rows = data.mealServiceDietInfo[1].row;
        const meals: MealCardData[] = rows.map((row: any) => {
            const rawItems: string = row.DDISH_NM;
            const items = rawItems
                .split('<br/>')
                .map((item) =>
                    item
                        .replace(/[^가-힣a-zA-Z0-9\s]/g, (match) => {
                            return match;
                        })
                        .replace(/\s*\([\d.]+\)/g, '')
                        .trim(),
                )
                .filter((item) => item.length > 0);

            let calories = 0;
            if (row.CAL_INFO) {
                calories = parseFloat(row.CAL_INFO.replace(/[^0-9.]/g, ''));
            }

            return {
                items,
                date: `${yyyy}. ${mm}. ${dd}`,
                mealType: `[${row.MMEAL_SC_NM}]`,
                calories: Math.round(calories),
                watermark: '@neungjuhs_lunch',
            };
        });

        const mealOrders: Record<string, number> = {
            '[조식]': 1,
            '[중식]': 2,
            '[석식]': 3,
        };

        meals.sort((a, b) => (mealOrders[a.mealType] || 0) - (mealOrders[b.mealType] || 0));

        return meals;
    } catch (error) {
        logger.error(`NEIS API 호출 오류: ${error}`);
        return [];
    }
}
