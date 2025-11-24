module.exports = {
  apps: [
    {
      name: 'notion-test',
      script: 'src/index.js',
      env: {
        NODE_ENV: 'local',
      },
      watch: true,
      ignore_watch: ['node_modules', '**/*.json', '**/*.css', '**/*.jpg', '**/*.png', '**/*.txt', '**/*.md'],
    },
    {
      name: 'notion-prod',
      script: 'src/index.js',
      env: {
        NODE_ENV: 'production',
      },
      watch: false,
      ignore_watch: ['node_modules', '**/*.json', '**/*.css', '**/*.jpg', '**/*.png', '**/*.txt', '**/*.md'],
    },
  ],
};
