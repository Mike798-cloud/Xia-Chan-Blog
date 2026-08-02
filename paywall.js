/**
 * 通用付费打赏系统 v1.0
 * 纯前端 localStorage 方案 - 自愿打赏模式
 * 夏蝉博客版本：沿用潮汐福利院付款流程，仅调整当前作品文案
 */

const Paywall = {
  STORAGE_KEY: '_xiachan_blog_support',
  SESSION_KEY: '_xiachan_blog_session',
  COOKIE_KEY: '_xiachan_pay_flag',

  /** 检查是否已打赏 */
  hasPaid() {
    // 三重存储交叉验证
    const ls = localStorage.getItem(this.STORAGE_KEY);
    const ss = sessionStorage.getItem(this.SESSION_KEY);
    const cookie = this._getCookie(this.COOKIE_KEY);

    // 至少有一处记录就视为已打赏（宽松策略，避免误判）
    return !!(ls || ss || cookie);
  },

  /** 标记已打赏（三重写入） */
  markPaid() {
    const token = this._generateToken();
    localStorage.setItem(this.STORAGE_KEY, token);
    sessionStorage.setItem(this.SESSION_KEY, token);
    this._setCookie(this.COOKIE_KEY, token, 365);
  },

  /** 生成签名令牌 */
  _generateToken() {
    const ts = Date.now();
    const rand = Math.random().toString(36).substring(2, 10);
    const sig = btoa(`${ts}_${rand}_abc_studio`);
    return sig;
  },

  /** Cookie 操作 */
  _setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
  },

  _getCookie(name) {
    const cname = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(cname) === 0) return c.substring(cname.length, c.length);
    }
    return '';
  },

  /** 显示打赏浮层 */
  show(config) {
    if (this.hasPaid()) return;

    const overlay = document.getElementById('paywall-overlay');
    if (!overlay) {
      this._createOverlay(config);
    } else {
      overlay.style.display = 'flex';
      overlay.classList.remove('paywall-show');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          overlay.classList.add('paywall-show');
        });
      });
    }
  },

  /** 隐藏打赏浮层 */
  hide() {
    const overlay = document.getElementById('paywall-overlay');
    if (overlay) {
      overlay.classList.add('paywall-closing');
      overlay.classList.remove('paywall-show');
      setTimeout(() => {
        overlay.style.display = 'none';
        overlay.classList.remove('paywall-closing');
      }, 400);
    }
  },

  /** 已支持按钮点击 */
  _onSupport() {
    this.markPaid();
    this.hide();
    // 显示感谢提示
    this._showThanks();
  },

  _showThanks() {
    const toast = document.createElement('div');
    toast.className = 'paywall-toast';
    toast.innerHTML = '感谢你的支持！愿每个夏天都有人回应。♡';
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  },

  _animateIn() {
    const overlay = document.getElementById('paywall-overlay');
    if (overlay) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          overlay.classList.add('paywall-show');
        });
      });
    }
  },

  /** 创建浮层DOM */
  _createOverlay(config) {
    const defaultConfig = {
      qrCode: 'paycode.png',
      price: '1元',
      title: '支持《夏蝉博客》',
      studio: 'abc studio'
    };
    const cfg = Object.assign(defaultConfig, config || {});

    const html = `
      <div class="paywall-overlay" id="paywall-overlay">
        <div class="paywall-card">
          <button class="paywall-close" onclick="Paywall.hide()" title="关闭">&times;</button>

          <div class="paywall-card-inner">
            <div class="paywall-header">
              <div class="paywall-title-row">
                <span class="paywall-heart">♡</span>
                <span class="paywall-title">${cfg.title}</span>
                <span class="paywall-heart">♡</span>
              </div>
              <div class="paywall-subtitle">${cfg.price} 自愿打赏 · 感谢支持</div>
            </div>

            <div class="paywall-body">
              <div class="paywall-qr-wrapper">
                <img src="${cfg.qrCode}" alt="收款码" class="paywall-qr-img" />
                <div class="paywall-qr-glow"></div>
              </div>
              <div class="paywall-qr-tip">请用 <strong style="color:#1677ff;">某宝</strong> 扫码打赏 ${cfg.price}</div>

              <div class="paywall-message">
                <p class="paywall-msg-warm">你好，我是 abc studio 的独立开发者。</p>
                <p class="paywall-msg-body">
                  制作这部旧博客修复解谜花了很多个夜晚，每篇日记、每张相册和每条留言都认真打磨过。<br>
                  如果你在游玩过程中感受到了一丝触动，愿意支持 <strong>1元</strong> 打赏，<br>
                  那将是我继续创作的最大动力。
                </p>
                <p class="paywall-msg-cute">
                  1块钱买不到一杯奶茶，但能给一个旧博客续上一点点夏天的电量。
                </p>
                <p class="paywall-msg-warm2">
                  后续还会有更多青槐市系列作品，感谢每一位愿意支持的你。
                </p>
              </div>
            </div>

            <div class="paywall-footer">
              <div class="paywall-hint">
                <span class="paywall-hint-icon">💡</span>
                <span>小提示：请勿清除浏览器数据，否则下次打开会再次看到这里哦~</span>
              </div>
              <div class="paywall-btns">
                <button class="paywall-btn paywall-btn-support" onclick="Paywall._onSupport()">
                  已完成支持 ♡
                </button>
                <button class="paywall-btn paywall-btn-later" onclick="Paywall.hide()">
                  下次一定
                </button>
              </div>
            </div>

            <div class="paywall-studio">abc studio</div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    this._animateIn();
  }
};

// 暴露到全局
window.Paywall = Paywall;
