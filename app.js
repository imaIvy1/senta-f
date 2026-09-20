/**
 * 网页交互：不依赖框架或 CDN，双击 index.html 就能工作。
 * 内容修改请优先编辑 content.js；外观修改请编辑 styles.css。
 * 下方按“状态 → 实物 → 导航 → 打开 → 照片 → 音乐/桌面”分区。
 */
(() => {
  'use strict';
  const config = window.GIFT_CONFIG;
  const $ = id => document.getElementById(id);
  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  // active：当前环形陈列中选中的盒子；opened：本次访问真正打开过的盒子。
  // 重新锁上入口不会丢失本次进度；刷新页面会重新开始，不保存私人浏览记录。
  let active = 0;
  let opening = false;
  let currentBox = null;
  let hasShownLetter = false;
  let openTimer = null;
  let letterTimer = null; // 信件提示/拆封共用；离开窗口时清理，防止后台突然显示信。
  let photoIds = [];
  let photoIndex = 0;
  const opened = new Set();
  const objectButtons = [];
  const tabs = [];

  document.documentElement.style.setProperty('--open-time', `${config.openDuration}ms`);
  $('key-hint').textContent = config.hint;
  $('music-title').textContent = config.musicTitle;
  const audio = $('bgm');
  audio.src = config.music;
  audio.volume = config.volume;

  /** 创建一个带真实独立盖子的 DOM 实物。
   * 图片仅用作盒内表面；盖子由 CSS 绘制，可单独绕铰链旋转。
   * 内部缩略图只在 opened 时显露，不作为可点击元素；真正照片在右侧列表中。
   */
  function createObject(box, clickable = false) {
    const element = document.createElement(clickable ? 'button' : 'div');
    element.className = `memory-object ${box.type}${clickable ? ' ring-object' : ''}`;
    if (clickable) element.setAttribute('aria-label', `Open ${box.name}`);
    const vessel = document.createElement('span');
    vessel.className = 'vessel';
    const surface = document.createElement('span');
    surface.className = 'surface';
    const texture = document.createElement('img');
    texture.src = box.image;
    texture.alt = '';
    texture.draggable = false;
    surface.append(texture);
    const contents = document.createElement('span');
    contents.className = 'inside-photos';
    box.photos.slice(0, 3).forEach(id => {
      const image = document.createElement('img');
      image.src = config.photos[id].src;
      image.alt = '';
      image.draggable = false;
      contents.append(image);
    });
    surface.append(contents);
    vessel.append(surface);

    if (box.type === 'cardboard') {
      // 纸箱的四块盖板分别绕左右、上下边缘翻开。
      ['left', 'right', 'top', 'bottom'].forEach(side => {
        const flap = document.createElement('span');
        flap.className = `flap ${side}`;
        vessel.append(flap);
      });
    } else {
      const lid = document.createElement('span');
      lid.className = 'lid';
      const label = document.createElement('span');
      label.className = 'lid-label';
      label.textContent = box.id === 'tin' ? 'S.F.' : box.name.toUpperCase();
      lid.append(label);
      vessel.append(lid);
    }
    element.append(vessel);
    if (clickable) {
      const label = document.createElement('span');
      label.className = 'object-label';
      label.textContent = box.name;
      element.append(label);
    }
    return element;
  }

  // 一次性创建盒子和左侧文件夹标签。改 content.js 的数组可直接重排。
  config.boxes.forEach((box, index) => {
    const object = createObject(box, true);
    object.addEventListener('click', () => {
      // 拖动结束后浏览器可能继续发 click；消除这一次误触，避免误开盒子。
      if (suppressClick) return;
      selectBox(index);
      openBox();
    });
    $('box-ring').append(object);
    objectButtons.push(object);
    const tab = document.createElement('button');
    tab.className = 'box-tab';
    const icon = document.createElement('span');
    icon.className = 'folder-mini';
    icon.setAttribute('aria-hidden', 'true');
    const name = document.createElement('span');
    name.textContent = box.name;
    const seen = document.createElement('span');
    seen.className = 'seen-mark';
    tab.append(icon, name, seen);
    tab.addEventListener('click', () => {
      if (opening) return;
      if (currentBox !== null && closeBox()) return;
      selectBox(index);
    });
    $('box-tabs').append(tab);
    tabs.push(tab);
  });

  /** 椭圆轨迹 + 前后缩放形成一圈可翻看的盒子。
   * 使用百分比位置，手机与桌面共享同一逻辑。CSS transition 负责平滑移动。
   * 此处不用 WebGL：让用户更容易直接修改源码，也保留键盘与按钮支持。
   */
  function renderRing() {
    const count = config.boxes.length;
    objectButtons.forEach((object, index) => {
      const angle = (index - active) * Math.PI * 2 / count;
      const front = (Math.cos(angle) + 1) / 2;
      const x = 50 + Math.sin(angle) * 30;
      const y = 44 + Math.cos(angle) * 22;
      const scale = .55 + front * .52;
      object.style.left = `${x}%`;
      object.style.top = `${y}%`;
      object.style.transform = `translate(-50%, -50%) scale(${scale})`;
      object.style.opacity = String(.62 + front * .38);
      object.style.zIndex = String(Math.round(front * 10));
      object.setAttribute('aria-current', String(index === active));
      tabs[index].setAttribute('aria-current', String(index === active));
    });
    const box = config.boxes[active];
    $('selection-name').textContent = box.name;
    $('selection-count').textContent = `${String(active + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}`;
    $('open-box').setAttribute('aria-label', `Open ${box.name}`);
  }

  function selectBox(index) {
    active = (index + config.boxes.length) % config.boxes.length;
    renderRing();
  }
  function stepBox(step) {
    if (opening || currentBox !== null || $('desktop').hidden) return;
    selectBox(active + step);
  }
  $('previous').addEventListener('click', () => stepBox(-1));
  $('next').addEventListener('click', () => stepBox(1));
  $('next-box').addEventListener('click', () => {
    if (opening) return;
    if (currentBox !== null && closeBox()) return;
    selectBox(active + 1);
  });

  // 鼠标滚轮限频，避免一个滚轮动作连续转很多圈。
  let lastWheel = 0;
  $('box-ring').addEventListener('wheel', event => {
    event.preventDefault();
    if (performance.now() - lastWheel < 350 || Math.abs(event.deltaY) < 4) return;
    lastWheel = performance.now();
    stepBox(event.deltaY > 0 ? 1 : -1);
  }, { passive: false });

  // 拖动以主要位移方向计算，左右和上下都可操作；不捕获照片列表的滚动。
  let pointerStart = null;
  let suppressClick = false;
  $('box-ring').addEventListener('pointerdown', event => {
    pointerStart = { x: event.clientX, y: event.clientY };
  });
  $('box-ring').addEventListener('pointerup', event => {
    if (!pointerStart) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    pointerStart = null;
    const distance = Math.abs(dx) > Math.abs(dy) ? dx : dy;
    if (Math.abs(distance) > 35) {
      suppressClick = true;
      stepBox(distance < 0 ? 1 : -1);
      setTimeout(() => { suppressClick = false; }, 0);
    }
  });
  $('box-ring').addEventListener('pointercancel', () => { pointerStart = null; });

  /** 开盒顺序：显示封闭实物 → 下一帧打开盖子 → 动画结束显示照片。
   * 用计时器协调 CSS 动画。锁屏、切换页面时会清除它，防止旧操作继续运行。
   */
  function openBox() {
    if (opening || currentBox !== null) return;
    opening = true;
    currentBox = active;
    const box = config.boxes[active];
    $('ring-view').hidden = true;
    $('open-view').hidden = false;
    $('open-view').classList.remove('revealed');
    $('photo-grid').replaceChildren();
    $('photo-grid').inert = true;
    $('back').disabled = true;
    $('next-box').disabled = true;
    $('address').textContent = `My Computer / Memories / ${box.name}`;
    $('status-text').textContent = 'Opening...';
    const object = createObject(box);
    $('opening-object').replaceChildren(object);
    // 触发布局后再加 opened，确保浏览器有一个“盖子仍关闭”的起始帧。
    void object.offsetWidth;
    requestAnimationFrame(() => object.classList.add('opened'));
    openTimer = setTimeout(() => {
      opened.add(box.id);
      opening = false;
      tabs[currentBox].querySelector('.seen-mark').textContent = '✓';
      $('opened-count').textContent = `${opened.size} / ${config.boxes.length} opened`;
      $('progress').style.width = `${opened.size / config.boxes.length * 100}%`;
      renderPhotos(box.photos);
      $('photo-grid').inert = false;
      $('open-view').classList.add('revealed');
      $('back').disabled = false;
      $('next-box').disabled = false;
      $('status-text').textContent = `${box.photos.length} photos`;
      if (opened.size === config.boxes.length) {
        $('desktop-letter').hidden = false;
        $('start-letter').hidden = false;
      }
    }, reducedMotion() ? 0 : config.openDuration);
  }
  $('open-box').addEventListener('click', openBox);

  /** 第四盒仍先给用户看照片，不用计时器强行打断阅读。
   * 第四盒退出（Back）时自动显示信一次；从信返回不会反复弹出。
   */
  function closeBox(allowLetter = true) {
    clearTimeout(openTimer);
    opening = false;
    currentBox = null;
    $('open-view').hidden = true;
    $('ring-view').hidden = false;
    $('back').disabled = true;
    $('next-box').disabled = false;
    $('address').textContent = 'My Computer / Memories';
    $('status-text').textContent = `${config.boxes.length} objects`;
    if (allowLetter && opened.size === config.boxes.length && !hasShownLetter) {
      showLetter();
      return true; // 阻止触发退出的 Next/文件夹点击继续覆盖信件页面。
    }
    return false;
  }
  $('back').addEventListener('click', () => closeBox());

  function renderPhotos(ids) {
    $('photo-grid').replaceChildren();
    ids.forEach((id, index) => {
      const photo = config.photos[id];
      const button = document.createElement('button');
      button.className = 'photo-tile';
      button.dataset.photo = id;
      const figure = document.createElement('figure');
      const image = document.createElement('img');
      image.src = photo.src;
      image.alt = photo.caption || 'Photo';
      image.loading = 'lazy';
      const caption = document.createElement('figcaption');
      caption.lang = 'zh-CN';
      caption.textContent = photo.caption;
      figure.append(image, caption);
      button.append(figure);
      if (id === config.polaroid.front) {
        const badge = document.createElement('span');
        badge.className = 'flip-badge';
        badge.textContent = 'DOUBLE-SIDED ↻';
        button.append(badge);
      }
      button.addEventListener('click', () => {
        photoIds = ids;
        photoIndex = index;
        showPhoto();
        $('photo-dialog').showModal();
      });
      $('photo-grid').append(button);
    });
  }

  // 每次切换照片都重置放大与翻面状态，不让上一张的状态影响下一张。
  function showPhoto() {
    const id = photoIds[photoIndex];
    const isPolaroid = id === config.polaroid.front;
    $('photo-position').textContent = `${photoIndex + 1} / ${photoIds.length}`;
    $('photo-title').textContent = isPolaroid ? 'Polaroid Viewer' : 'Photo Viewer';
    $('photo-caption').textContent = config.photos[id].caption;
    $('photo-viewport').classList.remove('zoomed');
    $('photo-zoom').textContent = 'Zoom in';
    $('photo-zoom').hidden = isPolaroid;
    $('photo-image').hidden = isPolaroid;
    $('polaroid').hidden = !isPolaroid;
    $('flip-button').hidden = !isPolaroid;
    if (isPolaroid) {
      $('polaroid-front').src = config.photos[config.polaroid.front].src;
      $('polaroid-back').src = config.photos[config.polaroid.back].src;
      flipPhoto(false);
    } else {
      $('photo-image').src = config.photos[id].src;
      $('photo-image').alt = config.photos[id].caption || 'Photo';
    }
  }
  function flipPhoto(back = !$('polaroid').classList.contains('flipped')) {
    $('polaroid').classList.toggle('flipped', back);
    $('flip-button').setAttribute('aria-pressed', String(back));
    document.querySelector('.flip-face.front').setAttribute('aria-hidden', String(back));
    document.querySelector('.flip-face.back').setAttribute('aria-hidden', String(!back));
    $('flip-button').textContent = back ? 'Flip to front ↻' : 'Flip to back ↻';
    $('photo-caption').textContent = config.photos[back ? config.polaroid.back : config.polaroid.front].caption;
  }
  function stepPhoto(step) {
    photoIndex = (photoIndex + step + photoIds.length) % photoIds.length;
    showPhoto();
  }
  $('photo-prev').addEventListener('click', () => stepPhoto(-1));
  $('photo-next').addEventListener('click', () => stepPhoto(1));
  $('photo-close').addEventListener('click', () => $('photo-dialog').close());
  $('flip-button').addEventListener('click', () => flipPhoto());
  $('polaroid').addEventListener('click', () => flipPhoto());
  $('photo-zoom').addEventListener('click', () => {
    const zoomed = $('photo-viewport').classList.toggle('zoomed');
    $('photo-zoom').textContent = zoomed ? 'Fit to window' : 'Zoom in';
  });

  function showLetter() {
    if (opened.size !== config.boxes.length) return;
    hasShownLetter = true;
    $('collection-window').hidden = true;
    $('letter-window').hidden = false;
    clearTimeout(letterTimer);
    $('letter-scroll').classList.remove('zoomed');
    $('letter-scroll').scrollTop = 0;
    $('letter-zoom').textContent = 'Zoom in';
    $('letter-zoom').hidden = true;
    $('letter-image').hidden = true;
    $('letter-image').src = config.photos[config.letter].src;
    $('letter-peek').src = config.photos[config.letter].src;
    $('letter-intro').hidden = false;
    $('letter-intro').classList.remove('writing');
    $('letter-envelope').hidden = true;
    $('letter-envelope').disabled = false;
    $('letter-envelope').classList.remove('is-opening');
    // 重新打开信件窗口时也重播提示；读取布局使 CSS 逐字动画从头开始。
    void $('letter-intro').offsetWidth;
    $('letter-intro').classList.add('writing');
    letterTimer = setTimeout(() => {
      $('letter-envelope').hidden = false;
    }, reducedMotion() ? 0 : 2100);
    $('letter-back').focus();
  }
  $('letter-envelope').addEventListener('click', () => {
    $('letter-envelope').disabled = true;
    $('letter-envelope').classList.add('is-opening');
    letterTimer = setTimeout(() => {
      $('letter-intro').hidden = true;
      $('letter-image').hidden = false;
      $('letter-zoom').hidden = false;
      $('letter-scroll').scrollTop = 0;
      $('letter-zoom').focus({preventScroll: true});
    }, reducedMotion() ? 0 : 1150);
  });
  function backToCollection() {
    clearTimeout(letterTimer);
    $('letter-window').hidden = true;
    $('collection-window').hidden = false;
    $('start-menu').hidden = true;
    $('start').setAttribute('aria-expanded', 'false');
    $('open-box').focus();
  }
  $('letter-back').addEventListener('click', backToCollection);
  $('letter-close').addEventListener('click', backToCollection);
  $('desktop-letter').addEventListener('click', showLetter);
  $('start-letter').addEventListener('click', () => { $('start-menu').hidden = true; showLetter(); });
  $('letter-zoom').addEventListener('click', () => {
    const zoomed = $('letter-scroll').classList.toggle('zoomed');
    $('letter-zoom').textContent = zoomed ? 'Fit to window' : 'Zoom in';
  });

  // 密码成功的同一个用户手势里调用 play()，满足移动浏览器的自动播放规则。
  // 极少数浏览器仍会阻止播放，此时按钮变为 Play，用户可直接手动重试。
  async function playMusic() {
    try { await audio.play(); }
    catch (_) { $('music-toggle').textContent = 'Play'; $('music-toggle').setAttribute('aria-label', 'Play music'); }
  }
  function syncMusicButton() {
    $('music-toggle').textContent = audio.paused ? 'Play' : 'Pause';
    $('music-toggle').setAttribute('aria-label', audio.paused ? 'Play music' : 'Pause music');
  }
  audio.addEventListener('play', syncMusicButton);
  audio.addEventListener('pause', syncMusicButton);
  $('music-toggle').addEventListener('click', () => audio.paused ? playMusic() : audio.pause());
  $('unlock-form').addEventListener('submit', event => {
    event.preventDefault();
    if ($('key').value.trim() !== config.password) {
      $('key-error').textContent = 'Not quite. Try again — capital L.';
      $('key').setAttribute('aria-invalid', 'true');
      $('key').focus();
      return;
    }
    $('key-error').textContent = '';
    $('key').removeAttribute('aria-invalid');
    $('gate').hidden = true;
    $('desktop').hidden = false;
    document.title = 'Memory Collection';
    backToCollection();
    playMusic();
  });
  $('key').addEventListener('input', () => {
    $('key-error').textContent = '';
    $('key').removeAttribute('aria-invalid');
  });
  function lock() {
    clearTimeout(letterTimer);
    if (currentBox !== null) closeBox(false);
    $('photo-dialog').close();
    $('desktop').hidden = true;
    $('gate').hidden = false;
    $('key').value = '';
    document.title = config.hint;
    audio.pause();
    $('key').focus();
  }
  $('lock').addEventListener('click', lock);
  $('start-lock').addEventListener('click', lock);
  $('minimize').addEventListener('click', () => { $('collection-window').hidden = true; });
  $('maximize').addEventListener('click', () => {
    const maximized = $('collection-window').classList.toggle('maximized');
    $('maximize').setAttribute('aria-pressed', String(maximized));
  });
  ['task-memory', 'desktop-memory', 'start-memory'].forEach(id => $(id).addEventListener('click', backToCollection));
  $('start').addEventListener('click', () => {
    $('start-menu').hidden = !$('start-menu').hidden;
    $('start').setAttribute('aria-expanded', String(!$('start-menu').hidden));
  });

  // 有弹出照片时方向键只翻照片；否则只在盒子总览中切换盒子。
  document.addEventListener('keydown', event => {
    if ($('desktop').hidden) return;
    if ($('photo-dialog').open) {
      if (event.key === 'ArrowLeft') { event.preventDefault(); stepPhoto(-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); stepPhoto(1); }
      return;
    }
    if (!$('letter-window').hidden) return;
    if (['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(event.key) && currentBox === null) {
      event.preventDefault();
      stepBox(['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1);
    }
    if (event.key === 'Escape' && currentBox !== null && !opening) closeBox();
  });

  renderRing();
})();
