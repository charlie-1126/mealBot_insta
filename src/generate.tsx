import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';
import satori from 'satori';

import { MealCard } from './template.js';
import { fetchNeisMeals } from './dataset.js';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const outputDir = resolve(projectRoot, 'output');
const fontsDir = resolve(projectRoot, 'fonts');

type FontSpec = {
    name: string;
    filename: string;
    weight: 400 | 500 | 600 | 900;
};

const fontSpecs: FontSpec[] = [
    { name: 'Noto Sans KR', filename: 'NotoSansKR-Regular.ttf', weight: 400 },
    { name: 'Noto Sans KR', filename: 'NotoSansKR-Medium.ttf', weight: 500 },
    { name: 'Noto Sans KR', filename: 'NotoSansKR-SemiBold.ttf', weight: 600 },
    { name: 'Noto Sans KR', filename: 'NotoSansKR-Black.ttf', weight: 900 },
];

function loadFonts() {
    return fontSpecs.map((font) => {
        const fontPath = resolve(fontsDir, font.filename);

        return {
            name: font.name,
            data: readFileSync(fontPath),
            weight: font.weight,
            style: 'normal' as const,
        };
    });
}

export async function generateMealImages(targetDate?: Date): Promise<string[]> {
    mkdirSync(outputDir, { recursive: true });

    const fonts = loadFonts();
    const meals = await fetchNeisMeals(targetDate);
    const total = meals.length;

    if (total === 0) {
        logger.generate('생성할 급식 데이터가 없습니다.');
        return [];
    }

    logger.generate(`생성 시작: ${total}개의 급식 이미지\n`);
    const generatedFiles: string[] = [];

    for (let i = 0; i < total; i++) {
        const data = meals[i];
        const mealKey =
            data.mealType === '[조식]'
                ? '1_breakfast'
                : data.mealType === '[중식]'
                  ? '2_lunch'
                  : '3_dinner';
        const filename = `meal_${mealKey}.jpg`;
        const filepath = resolve(outputDir, filename);

        try {
            const svg = await satori(<MealCard data={data} />, {
                width: 810,
                height: 1080,
                fonts,
            });

            await sharp(Buffer.from(svg)).jpeg({ quality: 100 }).toFile(filepath);

            logger.generate(`[${i + 1}/${total}] ${filename} - ${data.date} ${data.mealType}`);
            generatedFiles.push(filepath);
        } catch (error) {
            logger.error(
                `[${i + 1}/${total}] ${filename} 생성 실패: ${error instanceof Error ? error.message : error}`,
            );
        }
    }

    logger.generate(`총 ${total}개 이미지가 생성되었습니다.`);
    return generatedFiles;
}

// 직접 실행될 때만 동작 (import 될 때는 무시)
const isMain =
    import.meta.url === `file://${process.argv[1]}` ||
    import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`;

if (isMain) {
    generateMealImages().catch((error: unknown) => {
        logger.error(error);
        process.exitCode = 1;
    });
}
