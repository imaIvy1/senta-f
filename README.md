# to_friend
给Senta的19岁生日祝福以及我们的回忆。
可以用于和你爱的人庆祝生日/纪念日/节日等场景，或者单纯作为一个移动相册，总之，用属于你的回忆装点它吧。

## 1. 打开方式

双击此目录的 `index.html`，用 Chrome、Safari 或 Edge 打开。输入 `Lovely`，首字母大写。这里的 `index.html` 会读取同目录的样式、代码和 `assets`，因此请保留整个文件夹。
项目使用原生 HTML、CSS 和 JavaScript，不需要安装依赖、运行构建命令或配置后端服务。
密码在 content.js 的 password 字段中设置，区分大小写，输入前后的空格会被忽略。

## 2. 文件内容

| 文件 | 修改内容 |
| --- | --- |
| `content.js` | 密码、配文、每个盒子的照片与先后顺序、歌曲路径、音量 |
| `styles.css` | 颜色、字体、窗口尺寸、背景、盒子样式、开盖动画、手机布局 |
| `app.js` | 密钥判断、开盒流程、环形导航、自动出信、翻面、音乐控制 |
| `index.html` | 页面元素、英文按钮与窗口标题 |
| `assets/photos` | 28 张转换后的照片；原始素材没有被改动 |
| `assets/boxes` | 来自 empty-boxes 模板的盒内表面素材 |
| `assets/hey-jude.mp3` | 你提供的完整音乐文件 |
| `assets/fonts` | CEF Fonts CJK 字体与原始 OFL 许可证 |
| `build.py` | 用 Python 标准库生成单文件成品和源码 ZIP |

## 3. 换成你的故事
所有主要代码区域都附有中文说明。通常只改 `content.js` 就足够。

- password、hint：入口密码与提示文字。
- music、musicTitle、volume：音乐文件、显示名称与音量。
- boxes：容器名称、类型、图片及所包含的照片顺序。
- photos：照片路径与配文。
- polaroid：双面拍立得的正面与背面照片。
- letter：最后展示的手写信图片。
- openDuration：容器开启动画的时长。
- 
替换照片时，将文件放入 assets/photos/，并更新对应路径。照片 ID 需要与盒子、拍立得和信件配置中的引用保持一致。
如果修改密码，也记得调整 app.js 中的错误提示文案；当前提示包含首字母线索。

## 4. 分享与访问
项目可以作为静态网站托管。发布时，将页面文件与 assets 目录一并上传，并保持目录结构不变。
密码仅交互作用，不提供加密或真正的访问控制。发布后的源代码与资源可以被访问，因此请在分享前确认内容适合公开，并确认相关素材的使用授权。

## 5. 补充说明
vibe coding产物，用于自学js。
网页界面风格参考了pin上的素材图。如有侵权请联系。


Hey Jude;
Remember to let her into your heart,
Then you can start to make it better.
