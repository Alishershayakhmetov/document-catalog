module.exports = {
  apps: [
    {
      name: "catalog_project",
      script: "npm",
      args: "run start",
      cwd: "C:/путь/к/проекту",
      instances: 1,
      autorestart: true,
      watch: false
    }
  ]
};