export default class TerminalBackground {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.config = {
      gap: 6, // espacement entre les points (px CSS)
      minRadius: 0.4, // rayon minimum vers les bords
      maxRadius: 1.6, // rayon maximum au centre
      color: [20, 90, 40], // RGB des points
      background: "#020a04",
      vignette: 1, // 0 à 1, assombrissement des bords
      ...options,
    };

    this.lastWidth = window.innerWidth;
    this.timeout = null;
    this.onResize = this.onResize.bind(this);

    this.draw();
    window.addEventListener("resize", this.onResize);
  }

  onResize() {
    // Ignore les resize de hauteur seule (barre d'adresse mobile)
    if (window.innerWidth === this.lastWidth) return;
    this.lastWidth = window.innerWidth;
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => this.draw(), 100);
  }

  draw() {
    const { canvas, ctx } = this;
    const { gap, minRadius, maxRadius, color, background, vignette } = this.config;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const maxDist = Math.hypot(cx, cy);
    const [r, g, b] = color;

    for (let x = gap / 2; x < w; x += gap) {
      for (let y = gap / 2; y < h; y += gap) {
        const d = Math.hypot(x - cx, y - cy) / maxDist; // 0 centre → 1 coin
        const radius = maxRadius - d * (maxRadius - minRadius);
        const alpha = 0.9 - d * 0.6;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxDist);
    grad.addColorStop(0.3, "rgba(0,0,0,0)");
    grad.addColorStop(1, `rgba(0,0,0,${vignette})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  destroy() {
    clearTimeout(this.timeout);
    window.removeEventListener("resize", this.onResize);
  }
}
