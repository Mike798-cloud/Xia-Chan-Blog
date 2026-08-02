(function () {
  'use strict';

  const SAVE_KEY = '_xiachan_blog_rescue_save_v1';
  const TOTAL_CLUES = 24;
  const TOTAL_EGGS = 11;
  const DATE_ANSWER = ['0729', '0730', '0731', '0801', '0802', '0803', '0804'];
  const REPLY_ANSWER = { m1: 'r1', m2: 'r3', m3: 'r4', m4: 'r5', m5: 'r2' };
  const TIMELINE_ANSWER = ['diagnose', 'main_stop', 'first_comment', 'mock_exam', 'entrance_exam', 'discharge', 'small_stop', 'submit_backup'];
  const timelineText = {
    diagnose: ['2008.07', '知夏确诊病毒性心肌炎'],
    main_stop: ['2008.08.05', '大号停更，只留下“对不起”'],
    first_comment: ['2008.08.09', '小号第一次给苏晓匿名留言'],
    mock_exam: ['2008.11', '苏晓一模失利，小号鼓励她'],
    entrance_exam: ['2009.06', '苏晓参加中考'],
    discharge: ['2009.06', '知夏出院'],
    small_stop: ['2009.06.20', '小号停更'],
    submit_backup: ['2025.06.12', '知夏匿名提交博客备份']
  };

  const clueDefs = {
    unzip: ['备份解压成功', '密码 940712 来自博主生日 1994 年 7 月 12 日，数据损坏率 32%。'],
    dates: ['缺失的七天日记', '7.29 - 8.4 的日记被恢复，频繁出现头晕、医院、复查等关键词。'],
    mars: ['火星文核心句', '“不想让晓晓分心，但是我不得不走”说明知夏在主动切断联系。'],
    last_post: ['最后一篇“对不起”', '停更不是搬家转学那么简单，而是一句无法解释的告别。'],
    reply_match: ['未发送草稿匹配', '五条草稿都没有发出，留下的第六条留言没有任何回复。'],
    draft_letter: ['没发给苏晓的长信', '知夏隐瞒住院，是怕影响苏晓中考。'],
    su_blog: ['苏晓的寻找日记', '苏晓从 2008 年 8 月起持续写“找知夏”的内容。'],
    graduation_logo: ['毕业照医院 logo', '毕业照角落露出“青槐医院”标识，暗示知夏并非搬家。'],
    album_pass: ['私密相册口令', '“去看海”来自知夏和苏晓中考后的约定。'],
    hospital_photos: ['住院相册', '病房窗台、口罩侧脸和吊瓶照片证实知夏生病。'],
    diary_pass: ['私密日记口令', '“一起上一中”是两人共同的心愿。'],
    private_diary: ['私密日记完整记录', '确诊、住院、隐瞒苏晓和注册小号的过程被恢复。'],
    small_id: ['小号 ID', '图片信息备注中藏着小号 ID：知了不说夏。'],
    secret_blog: ['隐藏小号博客', '知夏住院期间一直匿名关注并鼓励苏晓，她从未真正离开。'],
    timeline: ['小号时间线闭合', '匿名留言、苏晓备考、知夏出院和 2025 投稿记录构成完整证据链。'],
    final_truth: ['博客由知夏本人提交', '2025 年，知夏匿名提交备份，是想借陌生人之手把故事讲完。'],
    reunion: ['留言触发重逢', '苏晓通过抢救计划看到博客，两人重新取得联系。'],
    admin_record: ['后台投稿记录', '管理入口显示 2025.06.12 提交人为林知夏，备注“麻烦帮我把故事讲完”。'],
    page_six: ['隐藏第六页留言', '第六页是一封写给偶然到访者的信。'],
    new_blog: ['2025 新博客', '强制刷新入口显示知夏当下的设计师生活和养猫日常。'],
    email_code: ['暗号邮箱', '输入“夏蝉鸣于夏”会收到自动回复：谢谢你，夏天收到啦。'],
    charity_link: ['青槐市儿童公益友链', '苏晓博客隐藏友链连到潮汐福利院公益博客，与系列世界观联动。'],
    sx_backup: ['苏晓也提交了备份', '后台深层记录显示苏晓也在同一计划里提交了自己的博客。'],
    studio_future: ['双人工作室', '圆满线索显示两人后来成为插画师与设计师，合伙开了工作室。']
  };

  const hints = {
    mars: ['先别被火星文字形吓到，看“晓晓”和“分心”这两个词。', '核心不是完整翻译，而是知夏为什么离开。', '输入关键词“不想分心”。'],
    ending: ['这里不是考试，重点是“终于敢说出口”。', '可以输入“好久不见”“对不起”“我一直都在”等真诚的话。']
  };

  function defaultState() {
    return {
      unzipped: false,
      unlockedTabs: ['home'],
      currentTab: 'home',
      selectedDates: [],
      repairedDates: false,
      replyPick: {},
      timelineOrder: ['main_stop', 'diagnose', 'mock_exam', 'first_comment', 'entrance_exam', 'submit_backup', 'discharge', 'small_stop'],
      timelineSelected: -1,
      visitor: 1307,
      clues: {},
      eggs: {},
      puzzles: {},
      hintsUsed: {},
      ending: '',
      paywallShown: false,
      musicIndex: 0,
      petalsStarted: false
    };
  }

  function mergedState(saved) {
    const base = defaultState();
    const state = Object.assign(base, saved || {});
    state.unlockedTabs = Array.isArray(state.unlockedTabs) ? state.unlockedTabs : ['home'];
    state.selectedDates = Array.isArray(state.selectedDates) ? state.selectedDates : [];
    state.replyPick = state.replyPick || {};
    state.timelineOrder = Array.isArray(state.timelineOrder) && state.timelineOrder.length === 8 ? state.timelineOrder : base.timelineOrder;
    state.clues = state.clues || {};
    state.eggs = state.eggs || {};
    state.puzzles = state.puzzles || {};
    state.hintsUsed = state.hintsUsed || {};
    return state;
  }

  const Game = {
    state: defaultState(),

    init() {
      this.load();
      this.bindGlobalEvents();
      this.renderAll();
      setInterval(() => this.autoPetals(), 8000);
      setTimeout(() => this.nightReminder(), 30 * 60 * 1000);
    },

    load() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        this.state = mergedState(raw ? JSON.parse(raw) : null);
      } catch (error) {
        console.warn('读档失败', error);
        this.state = defaultState();
      }
    },

    save() {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
      } catch (error) {
        console.warn('存档失败', error);
      }
    },

    bindGlobalEvents() {
      document.addEventListener('mousemove', (event) => {
        const glow = document.getElementById('cursor-glow');
        if (glow) {
          glow.style.left = event.clientX + 'px';
          glow.style.top = event.clientY + 'px';
        }
      });

      document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key === 'F5') {
          event.preventDefault();
          this.openNewBlog();
        }
      });
    },

    renderAll() {
      document.getElementById('restore-screen').classList.toggle('hidden', this.state.unzipped);
      document.getElementById('blog-screen').classList.toggle('hidden', !this.state.unzipped);
      if (this.state.unzipped) {
        document.getElementById('boot-progress').style.width = '100%';
      }
      this.renderTabs();
      this.renderDates();
      this.renderReplies();
      this.renderTimeline();
      this.renderProgress();
      this.renderClues();
      document.getElementById('recovered-days')?.classList.toggle('hidden', !this.state.repairedDates);
      document.getElementById('draft-box')?.classList.toggle('hidden', !this.state.puzzles.reply_match);
      document.getElementById('su-blog')?.classList.toggle('hidden', !this.state.puzzles.su_blog);
      document.getElementById('private-album')?.classList.toggle('hidden', !this.state.puzzles.album_pass);
      document.getElementById('private-diary')?.classList.toggle('hidden', !this.state.puzzles.diary_pass);
      document.getElementById('visitor-counter').textContent = String(this.state.visitor).padStart(6, '0');
    },

    checkUnzip() {
      const value = (document.getElementById('unzip-password').value || '').replace(/\D/g, '');
      if (value !== '940712') {
        this.toast('密码不对。“破壳日”是生日的六位数字。', 'error');
        this.play('playError');
        return;
      }
      this.state.unzipped = true;
      this.state.puzzles.unzip = true;
      this.addClue('unzip', true);
      this.save();
      this.renderAll();
      this.toast('解压完成：首页与公开日记已恢复。', 'success');
      this.play('playUnlock');
      if (typeof AudioSys !== 'undefined') AudioSys.startAmbience();
      if (!this.state.paywallShown) {
        this.state.paywallShown = true;
        this.save();
        setTimeout(() => this.showSupport(true), 800);
      }
    },

    toggleDate(btn) {
      const day = btn.dataset.day;
      const set = new Set(this.state.selectedDates);
      if (set.has(day)) set.delete(day);
      else set.add(day);
      this.state.selectedDates = Array.from(set);
      this.save();
      this.renderDates();
      this.play('playClick');
    },

    renderDates() {
      document.querySelectorAll('#calendar-grid button').forEach((btn) => {
        const day = btn.dataset.day;
        btn.classList.toggle('selected', this.state.selectedDates.includes(day));
        btn.classList.toggle('fixed', this.state.repairedDates && DATE_ANSWER.includes(day));
      });
    },

    repairDates() {
      const picked = this.state.selectedDates.slice().sort().join('|');
      const answer = DATE_ANSWER.slice().sort().join('|');
      if (picked !== answer) {
        this.toast('日期区间不完整。缺失的是 7.29 到 8.4。', 'error');
        this.play('playError');
        return;
      }
      this.state.repairedDates = true;
      this.state.puzzles.dates = true;
      this.addClue('dates');
      this.addClue('last_post');
      this.save();
      this.renderAll();
      this.toast('7 天损坏日记已恢复。', 'success');
      this.play('playClue');
    },

    checkMars() {
      if (!this.state.repairedDates) {
        this.toast('先修复缺失日期，才能看到完整火星文。', 'error');
        return;
      }
      const value = (document.getElementById('mars-answer').value || '').trim();
      if (!/不想.*分心|不想分心|不要分心/.test(value)) {
        this.toast('关键词还不对。她最怕影响晓晓什么？', 'error');
        this.play('playError');
        return;
      }
      this.state.puzzles.mars = true;
      this.addClue('mars');
      this.unlockTab('messages');
      this.state.currentTab = 'messages';
      this.save();
      this.renderAll();
      this.toast('留言板板块已恢复。', 'success');
      this.play('playUnlock');
    },

    pickReply(msg, reply) {
      if (reply) this.state.replyPick[msg] = reply;
      else delete this.state.replyPick[msg];
      this.save();
    },

    renderReplies() {
      for (const [msg, reply] of Object.entries(this.state.replyPick)) {
        const sel = document.querySelector(`[data-msg="${msg}"] select`);
        if (sel) sel.value = reply;
      }
    },

    checkReplies() {
      const ok = Object.entries(REPLY_ANSWER).every(([msg, reply]) => this.state.replyPick[msg] === reply);
      if (!ok) {
        this.toast('还有草稿和留言语气不匹配。', 'error');
        this.play('playError');
        return;
      }
      this.state.puzzles.reply_match = true;
      this.addClue('reply_match');
      this.addClue('draft_letter');
      this.save();
      this.renderAll();
      this.toast('草稿箱已恢复。', 'success');
      this.play('playClue');
    },

    unlockAlbum() {
      this.unlockTab('album');
      this.state.currentTab = 'album';
      this.save();
      this.renderAll();
      this.toast('相册与私密日记板块已恢复。', 'success');
    },

    openSuBlog() {
      if (!this.state.unlockedTabs.includes('messages')) {
        this.toast('先修复留言板。', 'error');
        return;
      }
      this.state.puzzles.su_blog = true;
      this.addClue('su_blog');
      this.save();
      this.renderAll();
      this.state.currentTab = 'messages';
      this.renderTabs();
      this.toast('已打开苏晓的博客镜像。', 'success');
    },

    showMaterialSite() {
      this.showDialog('动漫素材站', '<p>页面仍可访问，但大多数图片已经失链。角落里还挂着 2008 年常见的“欢迎交换友链”按钮。</p>');
    },

    deadForum() {
      this.foundEgg('dead_forum', '失效友链提示');
      this.showDialog('漫展论坛', '<p>该页面已失效。</p><p style="color:#d780a4;">有些网站会消失，但有些记忆不会。</p>');
    },

    qinghuaiCharity() {
      this.addClue('charity_link');
      this.foundEgg('charity_link', '系列宇宙联动友链');
      this.showDialog('青槐市儿童公益', '<p>恢复到一个旧公益博客：孩子们画的画、福利院日常、以及一条“潮汐福利院儿童画展”的旧横幅。</p>');
    },

    photoInfo(event) {
      event.preventDefault();
      this.addClue('graduation_logo');
      this.addClue('small_id');
      this.showDialog('图片信息', '<p>文件名：qxez_2008_graduation.jpg</p><p>拍摄者：陈屿</p><p>备注：右上角建筑标识为“青槐医院”。EXIF 备注栏另有一行小字：<strong>小号 ID：知了不说夏</strong></p>');
    },

    checkAlbumPass() {
      const value = (document.getElementById('album-password').value || '').trim();
      if (value !== '去看海') {
        this.toast('密码不对。她们中考完最想一起做什么？', 'error');
        return;
      }
      this.state.puzzles.album_pass = true;
      this.addClue('album_pass');
      this.addClue('hospital_photos');
      this.save();
      this.renderAll();
      this.toast('私密相册已解锁。', 'success');
      this.play('playUnlock');
    },

    checkDiaryPass() {
      const value = (document.getElementById('diary-password').value || '').trim().replace(/\s/g, '');
      if (value !== '一起上一中') {
        this.toast('密码不对。她们最大的心愿和学校有关。', 'error');
        return;
      }
      this.state.puzzles.diary_pass = true;
      this.addClue('diary_pass');
      this.addClue('private_diary');
      this.save();
      this.renderAll();
      this.toast('私密日记已解锁。试试搜索小号 ID。', 'success');
      this.play('playClue');
    },

    searchSite() {
      const input = (document.getElementById('site-search').value || '').trim();
      if (!input) return;
      if (input === '知了不说夏') {
        if (!this.state.puzzles.diary_pass && !this.state.clues.small_id) {
          this.toast('系统找到了相似 ID，但权限不足。先找出它的来源。', 'error');
          return;
        }
        this.addClue('secret_blog');
        this.unlockTab('secret');
        this.state.currentTab = 'secret';
        this.save();
        this.renderAll();
        this.toast('隐藏小号博客已恢复。', 'success');
        return;
      }
      if (input === '夏蝉鸣于夏') {
        this.addClue('email_code');
        this.foundEgg('email_code', '留言板暗号邮箱');
        this.showDialog('虚拟邮箱', '<p>收件箱自动回复：</p><p style="color:#d780a4;">谢谢你，夏天收到啦。</p>');
        return;
      }
      if (/潮汐|福利院|公益/.test(input)) {
        this.qinghuaiCharity();
        return;
      }
      this.toast('没有搜索到结果。旧博客的关键词，有时藏得很轻。', 'error');
    },

    renderTimeline() {
      const list = document.getElementById('timeline-list');
      if (!list) return;
      list.innerHTML = this.state.timelineOrder.map((id, index) => {
        const selected = index === this.state.timelineSelected ? ' selected' : '';
        const item = timelineText[id];
        return `<button class="timeline-item${selected}" onclick="Game.selectTimeline(${index})"><b>${item[0]}</b>${item[1]}</button>`;
      }).join('');
    },

    selectTimeline(index) {
      this.state.timelineSelected = index;
      this.save();
      this.renderTimeline();
    },

    moveTimeline(delta) {
      const idx = this.state.timelineSelected;
      if (idx < 0) {
        this.toast('先选中一个节点。', 'error');
        return;
      }
      const target = idx + delta;
      if (target < 0 || target >= this.state.timelineOrder.length) return;
      const [item] = this.state.timelineOrder.splice(idx, 1);
      this.state.timelineOrder.splice(target, 0, item);
      this.state.timelineSelected = target;
      this.save();
      this.renderTimeline();
      this.play('playClick');
    },

    checkTimeline() {
      if (this.state.timelineOrder.join('|') !== TIMELINE_ANSWER.join('|')) {
        this.toast('时间线还有矛盾。大号停更之前，她已经确诊。', 'error');
        this.play('playError');
        return;
      }
      this.state.puzzles.timeline = true;
      this.addClue('timeline');
      this.addClue('final_truth');
      this.unlockTab('truth');
      this.state.currentTab = 'truth';
      this.save();
      this.renderAll();
      this.toast('最终真相页已恢复。', 'success');
      this.play('playUnlock');
    },

    submitEnding() {
      const msg = (document.getElementById('final-message').value || '').trim();
      if (msg.length < 2) {
        this.toast('至少留下一句话吧。', 'error');
        return;
      }
      this.addClue('reunion');
      let type = 'normal';
      if (this.getClueCount() >= 12) type = 'true';
      if (this.getClueCount() >= TOTAL_CLUES && this.getEggCount() >= 7) type = 'perfect';
      this.state.ending = type;
      this.save();
      this.showEnding(type, msg);
    },

    showEnding(type, msg) {
      const data = {
        normal: ['普通结局：青春遗憾封存', '<p>修复报告确认知夏当年因病停更。她后来康复，开始了新生活，但旧朋友的去向仍未完全确认。</p>', '有些夏天会结束，有些话会留在草稿箱。'],
        true: ['真相结局：夏天收到回音', '<p>你找到了小号博客和投稿记录。三个月后，苏晓通过抢救计划看到了这份博客，两人重新取得联系。</p><p>博客最后更新了一张合照，配文：“夏天的蝉鸣，终于等到了回音。”</p>', '好久不见，是迟到很多年的“我一直都在”。'],
        perfect: ['圆满结局：我们的夏天不会结束', '<p>你找齐了所有关键线索与深层彩蛋。系统恢复出双博客联动页：苏晓也提交了自己的备份。</p><p>苏晓成了插画师，知夏成了设计师。她们后来合伙开了工作室，签名改成：“我们的夏天，永远不会结束。”</p>', '两份旧备份，在同一个夏天重新并肩。']
      }[type];
      const overlay = document.createElement('div');
      overlay.className = 'ending-overlay';
      overlay.innerHTML = `
        <div class="ending-box">
          <div class="ending-title">${data[0]}</div>
          <div class="ending-content">${data[1]}<p><b>你留下的话：</b>${this.escape(msg)}</p><p style="color:#d780a4;">${data[2]}</p><p>线索 ${this.getClueCount()}/${TOTAL_CLUES} · 彩蛋 ${this.getEggCount()}/${TOTAL_EGGS}</p></div>
          <div class="ending-actions"><button class="blog-btn" onclick="this.closest('.ending-overlay').remove()">继续翻看</button><button class="blog-btn primary" onclick="Game.showSupport()">支持作者 1元</button></div>
        </div>`;
      document.body.appendChild(overlay);
      this.play(type === 'perfect' ? 'playUnlock' : 'playClue');
    },

    openAdmin() {
      this.showDialog('博客后台登录', `
        <p>这个入口几乎和背景色融在一起。请输入后台密码。</p>
        <div class="form-line"><input id="admin-pass" class="blog-input" placeholder="后台密码"><button class="blog-btn primary" onclick="Game.checkAdmin()">登录</button></div>
      `);
    },

    checkAdmin() {
      const value = (document.getElementById('admin-pass')?.value || '').trim();
      if (value !== '知了不说夏') {
        this.toast('后台密码错误。', 'error');
        return;
      }
      this.addClue('admin_record');
      this.addClue('sx_backup');
      this.addClue('studio_future');
      this.foundEgg('admin_record', '博客后台投稿记录');
      this.showDialog('后台投稿记录', '<p>2025.06.12　提交人：林知夏</p><p>备注：麻烦帮我把故事讲完。</p><hr><p>深层同步记录：苏晓也提交了自己的旧博客备份。两份备份被同一项目接收。</p>');
    },

    hiddenPageSix() {
      this.addClue('page_six');
      this.foundEgg('page_six', '留言板隐藏第六页');
      this.showDialog('留言板 第 6 页', '<p>如果你只是偶然路过这里，谢谢你愿意看完一个陌生人的夏天。</p><p>我曾经以为消失是最好的保护，后来才知道，被记得也是一种很温柔的事。</p>');
    },

    openNewBlog() {
      this.addClue('new_blog');
      this.foundEgg('new_blog', '强制刷新跳转新博客');
      this.showDialog('林知夏的 2025 新博客', '<figure class="photo-card"><img src="cat-blog.svg" alt="知夏2025新博客养猫照片"><figcaption>她现在是一名平面设计师，猫叫“西瓜”。最新短文标题：寻找旧友。</figcaption></figure>');
    },

    showDoodle() {
      this.foundEgg('doodle', '日记边角涂鸦');
      this.showDialog('边角涂鸦', '<figure class="photo-card"><img src="doodle-friends.svg" alt="知夏和苏晓Q版涂鸦"><figcaption>“中考完一起去看海！”</figcaption></figure>');
    },

    olympicEgg() {
      this.foundEgg('olympic', '8月8日日历备注');
      this.showDialog('日历备注 / 2008.08.08', '<p>北京奥运开幕那天，和晓晓在她家一起看开幕式，她哭了我也哭了。</p>');
    },

    playBlogMusic() {
      const tracks = ['♪ 卡农 Piano ver.', '♪ 天空之城 MIDI', '♪ 夏日风铃 loop'];
      this.state.musicIndex = (this.state.musicIndex + 1) % tracks.length;
      document.getElementById('player-screen').textContent = tracks[this.state.musicIndex];
      this.foundEgg('music_player', '背景音乐播放器');
      this.play('playMusic');
      this.save();
    },

    bumpCounter() {
      this.state.visitor += 1;
      if (this.state.visitor > 1314) this.state.visitor = 1314;
      if (this.state.visitor === 1314) {
        this.foundEgg('visitor_1314', '第1314位访客');
        this.showDialog('访客计数器', '<p>第 1314 位访客，祝你也有久别重逢的运气。</p>');
      }
      this.save();
      this.renderAll();
    },

    autoPetals() {
      if (!this.state.unzipped) return;
      if (!this.state.petalsStarted) {
        this.state.petalsStarted = true;
        this.foundEgg('petals', '首页飘落花瓣');
        this.save();
      }
      const layer = document.getElementById('petal-layer');
      if (!layer) return;
      for (let i = 0; i < 7; i += 1) {
        const p = document.createElement('div');
        p.className = 'petal';
        p.style.left = Math.random() * 100 + 'vw';
        p.style.animationDuration = (5 + Math.random() * 5) + 's';
        p.style.animationDelay = Math.random() * 1.4 + 's';
        layer.appendChild(p);
        setTimeout(() => p.remove(), 11000);
      }
    },

    nightReminder() {
      if (!this.state.unzipped || this.state.eggs.night_tip) return;
      this.foundEgg('night_tip', '深夜温馨提示');
      this.showDialog('小提醒', '<p>夜深啦，看完这篇就早点休息哦。</p>');
    },

    unlockTab(tab) {
      if (!this.state.unlockedTabs.includes(tab)) this.state.unlockedTabs.push(tab);
    },

    goTab(tab) {
      if (!this.state.unlockedTabs.includes(tab)) {
        this.toast('这个板块还没修复。', 'error');
        return;
      }
      this.state.currentTab = tab;
      this.save();
      this.renderTabs();
      this.play('playClick');
    },

    renderTabs() {
      if (!this.state.unlockedTabs.includes(this.state.currentTab)) this.state.currentTab = 'home';
      document.querySelectorAll('.tab').forEach((tab) => {
        const id = tab.dataset.tab;
        tab.classList.toggle('locked', !this.state.unlockedTabs.includes(id));
        tab.classList.toggle('active', this.state.currentTab === id);
      });
      document.querySelectorAll('.tab-page').forEach((page) => {
        page.classList.toggle('active', page.dataset.page === this.state.currentTab);
      });
    },

    addClue(id, silent) {
      const def = clueDefs[id];
      if (!def || this.state.clues[id]) return;
      this.state.clues[id] = { title: def[0], desc: def[1], at: Date.now() };
      this.save();
      this.renderProgress();
      this.renderClues();
      if (!silent) {
        this.toast('新线索：' + def[0], 'success');
        this.play('playClue');
      }
    },

    foundEgg(id, name) {
      if (this.state.eggs[id]) return;
      this.state.eggs[id] = { name, at: Date.now() };
      this.save();
      this.toast('发现彩蛋：' + name, 'success');
      this.play('playClue');
    },

    getClueCount() {
      return Object.keys(this.state.clues).length;
    },

    getEggCount() {
      return Object.keys(this.state.eggs).length;
    },

    renderProgress() {
      const pct = Math.min(100, Math.round((this.getClueCount() / TOTAL_CLUES) * 100));
      const meter = document.getElementById('repair-meter');
      const percent = document.getElementById('repair-percent');
      const count = document.getElementById('clue-count');
      if (meter) meter.style.width = pct + '%';
      if (percent) percent.textContent = pct + '%';
      if (count) count.textContent = this.getClueCount() + '/' + TOTAL_CLUES;
    },

    renderClues() {
      const list = document.getElementById('clue-list');
      if (!list) return;
      const entries = Object.entries(this.state.clues).sort((a, b) => a[1].at - b[1].at);
      if (!entries.length) {
        list.innerHTML = '<div class="clue-item"><div class="clue-title">暂无线索</div><div class="clue-desc">修复日记、查看图片、探索隐藏入口后会记录在这里。</div></div>';
        return;
      }
      list.innerHTML = entries.map(([id, clue]) => `
        <div class="clue-item" data-clue="${id}">
          <div class="clue-title">${this.escape(clue.title)}</div>
          <div class="clue-desc">${this.escape(clue.desc)}</div>
        </div>
      `).join('');
    },

    toggleClues() {
      document.getElementById('clue-panel').classList.toggle('open');
    },

    showSupport(silentIfPaid) {
      if (typeof Paywall === 'undefined') return;
      if (Paywall.hasPaid()) {
        if (!silentIfPaid) this.toast('已记录你的支持，感谢！', 'success');
        return;
      }
      Paywall.show({ qrCode: 'paycode.png', price: '1元', title: '支持《夏蝉博客》', studio: 'abc studio' });
    },

    showHint(id) {
      const arr = hints[id];
      if (!arr) return;
      const used = this.state.hintsUsed[id] || 0;
      const idx = Math.min(used, arr.length - 1);
      this.state.hintsUsed[id] = Math.min(used + 1, arr.length);
      this.save();
      this.showDialog('提示 ' + (idx + 1) + '/' + arr.length, '<p>' + arr[idx] + '</p>');
    },

    confirmReset() {
      this.showDialog('重新开始', '<p>确定清除游戏进度并重新修复博客吗？这不会清除付款支持记录。</p>', [
        { text: '取消', action: () => this.closeDialog() },
        { text: '确定重开', primary: true, action: () => { localStorage.removeItem(SAVE_KEY); location.reload(); } }
      ]);
    },

    showDialog(title, content, buttons) {
      this.closeDialog();
      const root = document.getElementById('dialog-root');
      const overlay = document.createElement('div');
      overlay.className = 'dialog-overlay';
      overlay.innerHTML = `
        <div class="dialog-box">
          <div class="dialog-title">${title}</div>
          <div class="dialog-content">${content}</div>
          <div class="dialog-actions"></div>
        </div>
      `;
      const actions = overlay.querySelector('.dialog-actions');
      (buttons && buttons.length ? buttons : [{ text: '关闭', action: () => this.closeDialog() }]).forEach((btn) => {
        const b = document.createElement('button');
        b.className = 'blog-btn' + (btn.primary ? ' primary' : '');
        b.textContent = btn.text;
        b.addEventListener('click', btn.action);
        actions.appendChild(b);
      });
      root.appendChild(overlay);
      this.play('playClick');
    },

    closeDialog() {
      document.querySelector('.dialog-overlay')?.remove();
    },

    toast(msg, type) {
      document.querySelectorAll('.toast').forEach((t) => t.remove());
      const t = document.createElement('div');
      t.className = 'toast ' + (type || 'info');
      t.textContent = msg;
      document.body.appendChild(t);
      requestAnimationFrame(() => t.classList.add('show'));
      setTimeout(() => {
        t.classList.remove('show');
        setTimeout(() => t.remove(), 220);
      }, 2400);
    },

    play(method) {
      if (typeof AudioSys !== 'undefined' && AudioSys[method]) AudioSys[method]();
    },

    escape(value) {
      return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
  };

  window.Game = Game;
  document.addEventListener('DOMContentLoaded', () => Game.init());
})();
