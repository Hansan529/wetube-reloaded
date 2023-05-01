# Video Player

```js
module.exports = {
  entry: {
    main: "./src/client/js/main.js",
    videoPlayer: "./src/client/js/videoPlayer.js",
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/styles.css",
    }),
  ],
  mode: "development",
  watch: true,
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, "assets"),
    clean: true,
  },
  ...
};
```

entry를 object 요소로 만들고, 이름을 지정해준다. output에서, [name] 을 이용하면 entry의 name을 불러온다.  
dev:assets 재실행해보면 main.js, videoPlayer.js로 2가지 파일로 변환된 걸 몰 수 있다.
