module.exports = {
  apps: [
    {
      name: "catalog_project",
      script: "npm",
      args: "start",
      cwd: "C:/путь/к/проекту",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};