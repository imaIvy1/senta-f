/**
 * 最常修改的文件：密码、音乐、照片配文、盒内照片顺序都集中在这里。
 * 不需要 npm 或任何框架；保存后重新打开同目录的 index.html 即可看到修改。
 * 照片 ID 对应 assets/photos/ 下的文件名，例如 "09" 对应 09.jpg。
 * 注意：本地密码是趣味入口，不是加密。不要用它保护真正敏感的资料。
 */
window.GIFT_CONFIG = {
  password: 'Lovely',               // 区分大小写；输入前后的空格会被忽略。
  hint: 'Simply——',
  music: 'assets/hey-jude.mp3',      // 换歌：替换文件，或修改这里的相对路径。
  musicTitle: 'Hey Jude',
  volume: 0.45,                    // 音量范围 0～1；只在解锁成功后开始播放。
  openDuration: 850,               // 盖子开启动画时间，单位毫秒。
  letter: '22',                    // 最后的原始手写信。
  polaroid: { front: '24', back: '23' }, // 双面拍立得的正面和背面。

  // 数组的顺序 = 环形陈列的顺序。photos 内的顺序 = 打开后照片的顺序。
  // type 决定盖子结构：fridge 左铰链门；basket 编织盖；cardboard 纸箱四瓣；tin 铁盖。
  boxes: [
    { id: 'fridge', name: 'Fridge', type: 'fridge', image: 'assets/boxes/fridge.jpeg',
      photos: ['09', '10', '11', '12'] },
    { id: 'basket', name: 'Basket', type: 'basket', image: 'assets/boxes/basket.png',
      photos: ['15', '14', '18', '00', '07', '01', '13', '08', '17'] },
    { id: 'cardboard', name: 'Cardboard', type: 'cardboard', image: 'assets/boxes/cardboard.png',
      photos: ['06', '05', '02', '03', '04', '20', '21'] },
    { id: 'tin', name: 'Tin Box', type: 'tin', image: 'assets/boxes/tin.png',
      photos: ['24', '16', '19', '27', '26', '25'] },
  ],

  // 中文仅出现在照片配文中；照片本身的文字与手写信均保留原样。
  // source 是原始文件名，只给修改者参考，不显示在网页界面。^ ^
  photos: {
    '00': { src: 'assets/photos/00.jpg', caption: '上赛美好的日落&你拍到的酸石榴高清版', source: '4293_livephoto.HEIC' },
    '01': { src: 'assets/photos/01.jpg', caption: '给RB22换胎拿到大结果的天', source: 'E361B4FF-B6F2-427F-BD5D-FD8261BCF994.JPG' },
    '02': { src: 'assets/photos/02.jpg', caption: '今年的四轮依旧没有善待我们...', source: 'IMG_1280.heic' },
    '03': { src: 'assets/photos/03.jpg', caption: '圣诞礼物收到了最独特的同人本，好感动吧！', source: 'IMG_1288.heic' },
    '04': { src: 'assets/photos/04.jpg', caption: '2026 To be continued…', source: 'IMG_1302.HEIC' },
    '05': { src: 'assets/photos/05.jpg', caption: '汉密尔顿中巡开在家门口。好吧上一句是梦话。', source: 'IMG_2677.HEIC' },
    '06': { src: 'assets/photos/06.jpg', caption: 'Not throwing away my shot!', source: 'IMG_2758.jpg' },
    '07': { src: 'assets/photos/07.jpg', caption: '二位请一直缠斗下去吧（注意安全。', source: 'IMG_5867.HEIC' },
    '08': { src: 'assets/photos/08.jpg', caption: '胜利结算画面 干杯！', source: 'IMG_5921.HEIC' },
    '09': { src: 'assets/photos/09.jpg', caption: '#01', source: 'IMG_5950.JPG' },
    '10': { src: 'assets/photos/10.jpg', caption: '#02', source: 'IMG_5953.JPG' },
    '11': { src: 'assets/photos/11.jpg', caption: '#03', source: 'IMG_5954.JPG' },
    '12': { src: 'assets/photos/12.jpg', caption: '#04', source: 'IMG_5955.JPG' },
    '13': { src: 'assets/photos/13.jpg', caption: '桌上的卡片', source: 'IMG_6318.HEIC' },
    '14': { src: 'assets/photos/14.jpg', caption: '帽子大亨*2闪击南京路', source: 'IMG_6380.JPG' },
    '15': { src: 'assets/photos/15.jpg', caption: '牛马孝女加油！', source: 'IMG_6390.JPG' },
    '16': { src: 'assets/photos/16.jpg', caption: 'IN CHAPTER 19', source: 'IMG_7563.JPG' },
    '17': { src: 'assets/photos/17.jpg', caption: '如果让四轮妹一起拼豆那么 2016 once more', source: 'IMG_7565.JPG' },
    '18': { src: 'assets/photos/18.jpg', caption: '想念就会相见^ ^', source: 'IMG_7568.JPG' },
    '19': { src: 'assets/photos/19.jpg', caption: '泡泡鱼大乱斗', source: 'IMG_9686.HEIC' },
    '20': { src: 'assets/photos/20.jpg', caption: '最美好的ktv团建以及热聊家产的起点', source: 'livePhoto_1765949985.JPG' },
    '21': { src: 'assets/photos/21.jpg', caption: '神奇的是没过几天就传来了泡不退役的消息', source: 'ofm 2026-04-14 23451341EDC7929B4C.jpg' },
    '22': { src: 'assets/photos/22.jpg', caption: '', source: '信件 放最后.jpg' },
    '23': { src: 'assets/photos/23.jpg', caption: '「生日快乐」by 蕉野绿', source: '双面拍立得/IMG_7553.jpg' },
    '24': { src: 'assets/photos/24.jpg', caption: '我想你知道这个字体（Goat Font from Messi', source: '双面拍立得/IMG_7560.JPG' },
    '25': { src: 'assets/photos/25.jpg', caption: '现在，他的愿望全部实现了。未来的你也是！', source: '鼓励的话/IMG_7545.jpg' },
    '26': { src: 'assets/photos/26.jpg', caption: 'He is always here', source: '鼓励的话/IMG_7546.jpg' },
    '27': { src: 'assets/photos/27.jpg', caption: ' Lewis: Don’t panic', source: '鼓励的话/IMG_7547.jpg' },
  },
};
