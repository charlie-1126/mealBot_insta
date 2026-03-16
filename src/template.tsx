import type { ReactElement } from 'react';

export type MealCardData = {
    items: string[];
    date: string;
    mealType: string;
    calories: number;
    watermark: string;
};

export function MealCard({ data }: { data?: MealCardData }): ReactElement {
    if (!data) {
        throw new Error('No data provided for MealCard');
    }

    const count = data.items.length;

    const nameFontSize = count <= 8 ? 35 : count === 9 ? 32 : 29;
    const bulletSize = nameFontSize - 18;

    const minGap = 40;
    const isCentered = count <= 6;

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                width: 810,
                height: 1080,
                backgroundColor: '#212121',
                padding: '70px 50px 34px 50px',
                fontFamily: '"Noto Sans KR", sans-serif',
                boxSizing: 'border-box',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    border: '3px solid #3A3A3A',
                    padding: '70px 76px 60px 76px',
                    boxSizing: 'border-box',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '3px solid #3A3A3A',
                        paddingBottom: 40,
                        flexShrink: 0,
                    }}
                >
                    <div
                        style={{
                            fontSize: 44,
                            fontWeight: 600,
                            color: '#BFBAB4',
                            letterSpacing: '1px',
                        }}
                    >
                        {data.date}
                    </div>
                    <div
                        style={{
                            fontSize: 46,
                            fontWeight: 900,
                            color: '#EEECEA',
                            letterSpacing: '-0.5px',
                        }}
                    >
                        {data.mealType}
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        justifyContent: isCentered ? 'center' : 'space-between',
                        gap: isCentered ? minGap : 0,
                        padding: '44px 0 40px 0',
                    }}
                >
                    {data.items.map((name, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            <span
                                style={{
                                    fontSize: bulletSize,
                                    color: '#4A4642',
                                    flexShrink: 0,
                                    lineHeight: 1,
                                }}
                            >
                                ●
                            </span>
                            <span
                                style={{
                                    fontSize: nameFontSize,
                                    fontWeight: 500,
                                    color: '#EEECEA',
                                    letterSpacing: '-0.5px',
                                }}
                            >
                                {name}
                            </span>
                        </div>
                    ))}
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '2px dashed #303030',
                        paddingTop: 36,
                        flexShrink: 0,
                    }}
                >
                    <div
                        style={{
                            fontSize: 20,
                            fontWeight: 900,
                            color: '#555050',
                            letterSpacing: '4px',
                            transform: 'translateY(6.5px)',
                        }}
                    >
                        TOTAL ENERGY
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span
                            style={{
                                fontSize: 54,
                                fontWeight: 500,
                                color: '#C8C3BC',
                                letterSpacing: '-2px',
                                transform: 'translateY(7px)',
                            }}
                        >
                            {data.calories}
                        </span>
                        <span
                            style={{
                                fontSize: 24,
                                fontWeight: 400,
                                color: '#6E6860',
                                letterSpacing: '1px',
                            }}
                        >
                            kcal
                        </span>
                    </div>
                </div>
            </div>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: 12,
                    fontSize: 18,
                    color: '#464343',
                    letterSpacing: '1.5px',
                }}
            >
                {data.watermark}
            </div>
        </div>
    );
}
