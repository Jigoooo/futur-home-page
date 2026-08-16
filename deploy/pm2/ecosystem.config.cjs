const deployPath = process.env.DEPLOY_PATH;

if (!deployPath) {
  throw new Error('DEPLOY_PATH is required for the FUTUR PM2 process.');
}

module.exports = {
  apps: [
    {
      name: 'futur',
      script: `${deployPath}/current/server/index.mjs`,
      cwd: `${deployPath}/current`,
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
      },
    },
  ],
};
