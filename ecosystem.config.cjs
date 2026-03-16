module.exports = {
    apps: [
        {
            name: 'mealbot-worker',
            script: 'dist/index.js',
            env: {
                NODE_ENV: 'production',
            },
        },
        {
            name: 'mealbot-dashboard',
            script: 'dist/dashboard.js',
        },
        {
            name: 'mealbot-monitor',
            script: 'dist/monitor.js',
            env: {
                NODE_ENV: 'production',
            },
        },
    ],
};
