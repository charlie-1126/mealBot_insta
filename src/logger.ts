import winston from 'winston';

const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        generate: 3,
        upload: 4,
        dataset: 5,
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        generate: 'cyan',
        upload: 'magenta',
        dataset: 'blue',
    },
};

winston.addColors(customLevels.colors);

const { combine, timestamp, printf, colorize } = winston.format;

const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

type CustomLogger = winston.Logger & {
    generate: winston.LeveledLogMethod;
    upload: winston.LeveledLogMethod;
    dataset: winston.LeveledLogMethod;
};

const logger = winston.createLogger({
    levels: customLevels.levels,
    level: 'dataset', // level이 'dataset' 이하(0~5)인 모든 로그 출력
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), myFormat),
    transports: [
        new winston.transports.Console({
            format: combine(colorize({ all: true }), myFormat),
        }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
}) as CustomLogger;

export default logger;
