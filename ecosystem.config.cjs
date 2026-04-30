module.exports = {
  apps: [
    {
      name: "catalog_project",
      script: "./node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: "C:/путь/к/проекту",
      exec_mode: "fork", // "cluster" prod
      instances: 1, // max
      autorestart: true,
      watch: false
    }
  ]
};