import express from 'express';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFilePath = path.join(__dirname, '..', 'logs', 'combined.log');
const errorLogFilePath = path.join(__dirname, '..', 'logs', 'error.log');

const app = express();
const port = process.env.PORT || 3000;

app.get('/api/status', (req, res) => {
    let combinedLogs = '';
    let errorLogs = '';

    try {
        if (fs.existsSync(logFilePath)) combinedLogs = fs.readFileSync(logFilePath, 'utf-8');
        if (fs.existsSync(errorLogFilePath)) errorLogs = fs.readFileSync(errorLogFilePath, 'utf-8');
    } catch (e) {
        console.error(e);
    }

    const lines = combinedLogs.split('\n').filter((line) => line.trim() !== '');

    let lastStart = '기록 없음';
    let lastSuccess = '기록 없음';

    // 시간 순 정렬 이벤트 (사용자에게 보여줄 꾸며진 로그용)
    const prettyEvents: { time: string; message: string; type: 'success' | 'error' | 'start' }[] =
        [];

    // 로그 파싱 및 상태 추출
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].replace(/\r$/, ''); // 윈도우 CRLF 보이지 않는 줄바꿈 문자 제거 (\r)

        // 날짜/시간 정규식
        const match = line.match(/^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+\[(.*?)\]:\s+(.*)$/);
        if (!match) continue;

        const timeStr = match[1];
        const msg = match[3];

        // 봇 기동
        if (msg.includes('봇이 시작되었습니다.')) {
            lastStart = timeStr;
        }

        // 업로드 성공 및 완료 필터링
        if (msg.includes('업로드 성공')) {
            lastSuccess = timeStr;
            prettyEvents.unshift({
                time: timeStr,
                message: 'Upload Success',
                type: 'success',
            });
        }
    }

    res.json({
        lastStart,
        lastSuccess,
        prettyEvents: prettyEvents.slice(0, 15), // 최근 15개
        rawCombined: lines.slice(-200).reverse().join('\n'), // 최신 200줄 (개발자용)
        rawError: errorLogs
            .split('\n')
            .filter((line) => line.trim() !== '')
            .map((l) => l.replace(/\r$/, ''))
            .slice(-100)
            .reverse()
            .join('\n'),
    });
});

app.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MealBot Dashboard</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            ::-webkit-scrollbar { width: 8px; }
            ::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
            ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
            ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            
            .raw-scrollbar::-webkit-scrollbar-track { background: #1f2937; }
            .raw-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; }
        </style>
    </head>
    <body class="bg-slate-50 text-gray-800 font-sans p-4 md:p-8 min-h-screen">
        <div class="max-w-5xl mx-auto space-y-6">
            
            <!-- Header -->
            <div class="flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 class="text-2xl font-extrabold text-indigo-600 flex items-center gap-2">
                        MealBot Monitor
                        <span class="flex h-3 w-3 relative ml-2">
                          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                    </h1>
                </div>
                <div class="text-right flex flex-col items-end">
                    <button onclick="fetchStatus()" class="hover:bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-lg text-sm font-medium border border-indigo-100 transition shadow-sm bg-white">
                        Refresh
                    </button>
                </div>
            </div>
            
            <!-- Main Content -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Status Cards -->
                <div class="space-y-4">
                    <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center border-l-4 border-l-indigo-400 h-[calc(50%-0.5rem)]">
                        <h2 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                            last Start time
                        </h2>
                        <p id="lastStart" class="text-lg font-bold text-gray-800">Loading...</p>
                    </div>
                    
                    <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center border-l-4 border-l-green-500 h-[calc(50%-0.5rem)]">
                        <h2 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                            last Success time
                        </h2>
                        <p id="lastSuccess" class="text-lg font-bold text-green-600">Loading...</p>
                    </div>
                </div>

                <!-- Pretty Logs (History) -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col max-h-[350px]">
                    <h2 class="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                        Upload Events
                    </h2>
                    <div id="prettyLogsContainer" class="flex-1 overflow-y-auto pr-2 space-y-3">
                        <!-- Events injected here -->
                    </div>
                </div>
            </div>

            <!-- Developer Toggle -->
            <div class="pt-4">
                <button onclick="toggleRaw()" class="text-sm text-gray-400 hover:text-gray-600 font-medium flex items-center gap-1 transition">
                    <span id="rawToggleIcon">▶</span> logs
                </button>
            </div>

            <!-- Terminal / Raw Log Viewers (Hidden by default) -->
            <div id="rawContainer" class="hidden grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <!-- Combined Log -->
                <div class="bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden flex flex-col">
                    <div class="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
                        <h2 class="text-gray-300 font-mono font-medium text-xs">📄 combined.log</h2>
                    </div>
                    <textarea id="rawCombined" class="raw-scrollbar w-full h-[300px] bg-transparent text-green-400 font-mono text-xs leading-relaxed p-4 resize-none focus:outline-none" readonly></textarea>
                </div>
                
                <!-- Error Log -->
                <div class="bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden flex flex-col">
                    <div class="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-red-900/50">
                        <h2 class="text-red-400 font-mono font-medium text-xs">⚠️ error.log</h2>
                    </div>
                    <textarea id="rawError" class="raw-scrollbar w-full h-[300px] bg-transparent text-red-400 font-mono text-xs leading-relaxed p-4 resize-none focus:outline-none" readonly></textarea>
                </div>
            </div>
        </div>

        <script>
            let rawVisible = false;

            function toggleRaw() {
                rawVisible = !rawVisible;
                const container = document.getElementById('rawContainer');
                if (rawVisible) {
                    container.classList.remove('hidden');
                    container.classList.add('grid');
                } else {
                    container.classList.add('hidden');
                    container.classList.remove('grid');
                }
                document.getElementById('rawToggleIcon').textContent = rawVisible ? '▼' : '▶';
            }

            async function fetchStatus() {
                try {
                    const res = await fetch('/api/status');
                    const data = await res.json();
                    
                    document.getElementById('lastStart').textContent = data.lastStart || '기록 없음';
                    document.getElementById('lastSuccess').textContent = data.lastSuccess || '기록 없음';

                    // Render Pretty Logs
                    const prettyContainer = document.getElementById('prettyLogsContainer');
                    prettyContainer.innerHTML = '';
                    if (data.prettyEvents.length === 0) {
                        prettyContainer.innerHTML = '<p class="text-sm text-gray-400 text-center py-4">아직 최근 업로드 성공 기록이 없습니다.</p>';
                    } else {
                        data.prettyEvents.forEach(evt => {
                            let textColor = 'text-green-700';
                            let bgClass = 'bg-green-50';
                            
                            prettyContainer.innerHTML += \`
                                <div class="flex flex-col p-3 rounded-lg \${bgClass} border border-green-100/50">
                                    <span class="text-xs font-mono text-gray-500 mb-1">\${evt.time}</span>
                                    <span class="text-sm font-semibold \${textColor}">\${evt.message}</span>
                                </div>
                            \`;
                        });
                    }

                    // Feed Raw Textareas
                    document.getElementById('rawCombined').value = data.rawCombined || '가동 기록이 없습니다.';
                    document.getElementById('rawError').value = data.rawError || '에러 기록이 없습니다.';
                    
                } catch (e) {
                    console.error('대시보드 에러:', e);
                }
            }
            
            // 초기 로드 & 10초마다 갱신
            fetchStatus();
            setInterval(fetchStatus, 10000);
        </script>
    </body>
    </html>
    `;
    res.send(html);
});

app.listen(port as number, '0.0.0.0', () => {
    console.log(`[Dashboard] 대시보드 서버 재실행됨 (포트: ${port}) - 외부 접속 허용 (0.0.0.0)`);
});
