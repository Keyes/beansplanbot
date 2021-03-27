module.exports = {
  apps: [
      {
        name: "beansplanbot",
        script: "./index.js",
        watch: true,
        env: {
          "T_TOKEN": "",
        }
      }
  ]
}