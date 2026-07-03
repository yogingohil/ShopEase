/**
 * ShopEase — Global Animation Engine
 * Canvas-based particle system for all WOW moments
 */

import { useEffect, useRef, useCallback } from "react";

// ── Easing ──────────────────────────────────────────────
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

// ── Particle class ───────────────────────────────────────
class Particle {
    constructor({ x, y, vx, vy, color, size, life, emoji, text }) {
        this.x = x; this.y = y;
        this.vx = vx; this.vy = vy;
        this.color = color || "#7c3aed";
        this.size = size || 6;
        this.maxLife = life || 80;
        this.life = this.maxLife;
        this.emoji = emoji || null;
        this.text = text || null;
        this.alpha = 1;
        this.gravity = 0.12;
        this.friction = 0.98;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= this.friction;
        this.life--;
        this.alpha = easeOut(this.life / this.maxLife);
        this.size *= 0.995;
    }
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        if (this.emoji) {
            ctx.font = `${this.size * 3}px serif`;
            ctx.fillText(this.emoji, this.x, this.y);
        } else if (this.text) {
            ctx.font = `bold ${this.size * 2}px 'Sora', sans-serif`;
            ctx.fillStyle = this.color;
            ctx.fillText(this.text, this.x, this.y);
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        ctx.restore();
    }
    isDead() { return this.life <= 0; }
}

// ── Airplane class ───────────────────────────────────────
class Airplane {
  constructor({ startX, startY, endX, endY, onDone }) {
    this.x = startX; this.y = startY;
    this.startX = startX; this.startY = startY;
    this.endX = endX; this.endY = endY;
    this.progress = 0;
    this.speed = 0.028;
    this.done = false;
    this.onDone = onDone;
    this.trail = [];
  }
  update() {
    this.progress += this.speed;
    if (this.progress >= 1) { this.progress = 1; this.done = true; if (this.onDone) this.onDone(); }
    // Bezier arc
    const t = this.progress;
    const cpX = (this.startX + this.endX) / 2;
    const cpY = Math.min(this.startY, this.endY) - 180;
    this.x = (1-t)*(1-t)*this.startX + 2*(1-t)*t*cpX + t*t*this.endX;
    this.y = (1-t)*(1-t)*this.startY + 2*(1-t)*t*cpY + t*t*this.endY;
    this.trail.push({ x: this.x, y: this.y, alpha: 0.6 });
    if (this.trail.length > 20) this.trail.shift();
  }
  draw(ctx) {
    // Trail
    this.trail.forEach((pt, i) => {
      ctx.save();
      ctx.globalAlpha = (i / this.trail.length) * 0.4;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#06b6d4";
      ctx.fill();
      ctx.restore();
    });
    // Plane emoji
    const t = Math.min(this.progress + 0.01, 1);
    const cpX = (this.startX + this.endX) / 2;
    const cpY = Math.min(this.startY, this.endY) - 180;
    const nx = (1-t)*(1-t)*this.startX + 2*(1-t)*t*cpX + t*t*this.endX;
    const ny = (1-t)*(1-t)*this.startY + 2*(1-t)*t*cpY + t*t*this.endY;
    const angle = Math.atan2(ny - this.y, nx - this.x);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(angle);
    ctx.font = "28px serif";
    ctx.fillText("✈️", -14, 10);
    ctx.restore();
  }
}

// ── Flying Product (Add to Cart) ─────────────────────────
class FlyingProduct {
  constructor({ startX, startY, endX, endY, imageUrl, onDone }) {
    this.x = startX; this.y = startY;
    this.startX = startX; this.startY = startY;
    this.endX = endX; this.endY = endY;
    this.progress = 0;
    this.speed = 0.045;
    this.size = 60;
    this.done = false;
    this.onDone = onDone;
    this.imageUrl = imageUrl;
    this.img = null;
    if (imageUrl) {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => { this.img = img; };
    }
  }
  update() {
    this.progress += this.speed;
    if (this.progress >= 1) { this.progress = 1; this.done = true; if (this.onDone) this.onDone(); }
    const t = this.progress;
    const cpX = this.startX + (this.endX - this.startX) * 0.1;
    const cpY = Math.min(this.startY, this.endY) - 200;
    this.x = (1-t)*(1-t)*this.startX + 2*(1-t)*t*cpX + t*t*this.endX;
    this.y = (1-t)*(1-t)*this.startY + 2*(1-t)*t*cpY + t*t*this.endY;
    const shrinkStart = 0.7;
    if (this.progress > shrinkStart) {
      const s = 1 - ((this.progress - shrinkStart) / (1 - shrinkStart));
      this.size = 60 * s;
    }
  }
    draw(ctx) {
        if (this.size < 1) return;
        ctx.save();
        ctx.globalAlpha = this.progress < 0.8 ? 1 : 1 - ((this.progress - 0.8) / 0.2);
        const half = this.size / 2;
        if (this.img) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, half, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(this.img, this.x - half, this.y - half, this.size, this.size);
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, half, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(124,58,237,0.8)";
            ctx.fill();
            ctx.font = "20px serif";
            ctx.fillText("🛍️", this.x - 10, this.y + 7);
        }
        ctx.restore();
    }
}

// ── Main Canvas Engine ───────────────────────────────────
export function useAnimationEngine(canvasRef) {
    const particlesRef = useRef([]);
    const airplanesRef = useRef([]);
    const flyingProductsRef = useRef([]);
    const rafRef = useRef(null);
    const cursorRef = useRef({ x: -999, y: -999, trail: [] });

    const loop = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Cursor trail
        const cur = cursorRef.current;
        cur.trail.push({ x: cur.x, y: cur.y });
        if (cur.trail.length > 16) cur.trail.shift();
        cur.trail.forEach((pt, i) => {
            const alpha = (i / cur.trail.length) * 0.5;
            const size = (i / cur.trail.length) * 6;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
            const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, size);
            grad.addColorStop(0, `rgba(124,58,237,${alpha})`);
            grad.addColorStop(1, `rgba(6,182,212,0)`);
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.restore();
        });

        // Particles
        particlesRef.current = particlesRef.current.filter(p => !p.isDead());
        particlesRef.current.forEach(p => { p.update(); p.draw(ctx); });

        // Airplanes
        airplanesRef.current = airplanesRef.current.filter(a => !a.done);
        airplanesRef.current.forEach(a => { a.update(); a.draw(ctx); });

        // Flying products
        flyingProductsRef.current = flyingProductsRef.current.filter(fp => !fp.done);
        flyingProductsRef.current.forEach(fp => { fp.update(); fp.draw(ctx); });

        rafRef.current = requestAnimationFrame(loop);
    }, [canvasRef]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        const onMouseMove = (e) => {
            cursorRef.current.x = e.clientX;
            cursorRef.current.y = e.clientY;
        };
        window.addEventListener("mousemove", onMouseMove);

        rafRef.current = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", onMouseMove);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [loop, canvasRef]);

    // ── Public API ──────────────────────────────────────────

    /**  Burst of emoji particles from (x,y) */
    const burst = useCallback((x, y, { emoji, count = 20, colors, size = 10, spread = 8 } = {}) => {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const speed = spread * (0.5 + Math.random());
            particlesRef.current.push(new Particle({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - speed * 0.5,
                color: colors ? colors[Math.floor(Math.random() * colors.length)] : "#f43f5e",
                size: size * (0.5 + Math.random()),
                life: 80 + Math.floor(Math.random() * 40),
                emoji,
            }));
        }
    }, []);

    /** Confetti rain from top */
    const confetti = useCallback((count = 120) => {
        const colors = ["#7c3aed", "#06b6d4", "#f43f5e", "#f59e0b", "#10b981", "#a78bfa", "#67e8f9"];
        const canvas = canvasRef.current;
        const W = canvas?.width || window.innerWidth;
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                particlesRef.current.push(new Particle({
                    x: Math.random() * W,
                    y: -20,
                    vx: (Math.random() - 0.5) * 4,
                    vy: 2 + Math.random() * 4,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    size: 4 + Math.random() * 6,
                    life: 120 + Math.floor(Math.random() * 80),
                    gravity: 0.05,
                }));
            }, i * 10);
        }
    }, [canvasRef]);

    /** Paper airplane from element to top-right */
    const sendAirplane = useCallback((fromEl, onDone) => {
        const canvas = canvasRef.current;
        if (!canvas || !fromEl) return;
        const rect = fromEl.getBoundingClientRect();
        airplanesRef.current.push(new Airplane({
            startX: rect.left + rect.width / 2,
            startY: rect.top + rect.height / 2,
            endX: canvas.width - 80,
            endY: 60,
            onDone,
        }));
    }, [canvasRef]);

    /** Product fly to cart icon */
    const flyToCart = useCallback((fromEl, imageUrl, cartEl, onDone) => {
        if (!fromEl) return;
        const rect = fromEl.getBoundingClientRect();
        const cartRect = cartEl?.getBoundingClientRect() || { left: window.innerWidth - 100, top: 40 };
        flyingProductsRef.current.push(new FlyingProduct({
            startX: rect.left + rect.width / 2,
            startY: rect.top + rect.height / 2,
            endX: cartRect.left + cartRect.width / 2,
            endY: cartRect.top + cartRect.height / 2,
            imageUrl,
            onDone,
        }));
    }, []);

    /** Hearts burst from element */
    const heartsFrom = useCallback((el, count = 16) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        burst(cx, cy, { emoji: "❤️", count, size: 14, spread: 10 });
    }, [burst]);

    /** Stars from element */
    const starsFrom = useCallback((el, count = 14) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        burst(rect.left + rect.width / 2, rect.top + rect.height / 2, {
            emoji: "⭐", count, size: 14, spread: 9
        });
    }, [burst]);

    /** Money rain */
    const moneyRain = useCallback((count = 40) => {
        const canvas = canvasRef.current;
        const W = canvas?.width || window.innerWidth;
        const emojis = ["💰", "💵", "💸", "🤑"];
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                particlesRef.current.push(new Particle({
                    x: Math.random() * W,
                    y: -30,
                    vx: (Math.random() - 0.5) * 3,
                    vy: 2 + Math.random() * 3,
                    emoji: emojis[Math.floor(Math.random() * emojis.length)],
                    size: 8 + Math.random() * 6,
                    life: 110 + Math.floor(Math.random() * 60),
                    gravity: 0.04,
                }));
            }, i * 15);
        }
    }, [canvasRef]);

    /** Fireworks */
    const fireworks = useCallback((count = 6) => {
        const canvas = canvasRef.current;
        const W = canvas?.width || window.innerWidth;
        const H = canvas?.height || window.innerHeight;
        const colors = ["#7c3aed", "#06b6d4", "#f43f5e", "#f59e0b", "#10b981", "#fff"];
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const cx = 100 + Math.random() * (W - 200);
                const cy = 80 + Math.random() * (H * 0.4);
                burst(cx, cy, { count: 30, colors, size: 6, spread: 12 });
            }, i * 200);
        }
    }, [burst]);

    /** Sparkles from element */
    const sparkleFrom = useCallback((el, count = 12) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        burst(rect.left + rect.width / 2, rect.top + rect.height / 2, {
            emoji: "✨", count, size: 10, spread: 7
        });
    }, [burst]);

    return {
        burst, confetti, sendAirplane, flyToCart,
        heartsFrom, starsFrom, moneyRain, fireworks, sparkleFrom,
    };
}
