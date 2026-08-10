import React, { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/all'
import * as THREE from 'three'
import './hero.css'

const Hero = () => {

    useEffect(() => {
        const REDUCED = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
        const MOBILE = window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent);

        gsap.registerPlugin(ScrollTrigger);

        let rafId = null;
        let cancelled = false;
        let scrollTrigger = null;
        let mouseMoveHandler = null;
        let mouseLeaveHandler = null;
        let resizeHandler = null;
        let heroEl = null;
        const tweenTargets = [];

        (async function heroInit() {
            const canvas = document.getElementById('hc');
            heroEl = document.getElementById('hero');
            const hsubEl = document.getElementById('hsub');
            const shintEl = document.getElementById('shint');
            const hfbEl = document.getElementById('hfb');

            /* ── MOBILE FALLBACK ──────────────────────────────────────── */
            if (MOBILE) {
                tweenTargets.push(hfbEl, hsubEl, shintEl);
                hfbEl.style.display = 'block';
                gsap.to(hfbEl, { opacity: 1, duration: 0.7, delay: 0.2 });
                gsap.to(hsubEl, { opacity: 1, y: 0, duration: 0.7, delay: 0.5 });
                gsap.to(shintEl, { opacity: 1, duration: 0.5, delay: 1.0 });
                return;
            }

            try { await document.fonts.load('800 100px Syne'); } catch (_) { }
            if (cancelled) return;

            /* ── THREE.JS SETUP ───────────────────────────────────────── */
            const W = heroEl.clientWidth;
            const H = heroEl.clientHeight;

            const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
            renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
            renderer.setSize(W, H);
            renderer.setClearColor(0x000000, 0);

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 1000);
            camera.position.z = 8;

            /* ── GENERATE TEXT PIXELS ─────────────────────────────────── */
            // Supersample the raster so thin/curved strokes (S, A) don't alias out
            // when the sparse STEP grid hits an anti-aliased edge below the alpha cutoff.
            const SS = 2;
            const FONT_SIZE = 136 * SS;
            const LINE_HEIGHT = 154 * SS;
            const TEXT_PADDING = 100 * SS;
            const TEXT_LINES = ['ArcOS'];

            const measureCanvas = document.createElement('canvas');
            const measureCtx = measureCanvas.getContext('2d');
            measureCtx.font = `600 ${FONT_SIZE}px Syne`;

            const metrics = TEXT_LINES.map(line => measureCtx.measureText(line));
            const maxTextWidth = Math.max(...metrics.map(metric =>
                Math.ceil(Math.max(
                    metric.width,
                    (metric.actualBoundingBoxLeft || 0) + (metric.actualBoundingBoxRight || 0)
                ))
            ));
            const maxAscent = Math.ceil(Math.max(...metrics.map(metric => metric.actualBoundingBoxAscent || FONT_SIZE * 0.8)));
            const maxDescent = Math.ceil(Math.max(...metrics.map(metric => metric.actualBoundingBoxDescent || FONT_SIZE * 0.2)));

            const OW = maxTextWidth + TEXT_PADDING * 2.5;
            const OH = maxAscent + maxDescent + LINE_HEIGHT * (TEXT_LINES.length - 1) + TEXT_PADDING * 1.5;

            const offscreenCanvas = Object.assign(
                document.createElement('canvas'),
                { width: OW, height: OH }
            );
            const ctx = offscreenCanvas.getContext('2d');

            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'alphabetic';
            ctx.font = `900 ${FONT_SIZE}px Syne`;

            const firstBaseline = TEXT_PADDING + maxAscent;
            TEXT_LINES.forEach((line, index) => {
                ctx.fillText(line, OW / 2, firstBaseline + LINE_HEIGHT * index);
            });

            const pixelData = ctx.getImageData(0, 0, OW, OH).data;
            const points = [];
            const STEP = 3 * SS;
            const ALPHA_MIN = 60; // was 100 — catches soft anti-aliased edges on curves

            for (let y = 0; y < OH; y += STEP) {
                for (let x = 0; x < OW; x += STEP) {
                    if (pixelData[(y * OW + x) * 4 + 3] > ALPHA_MIN) points.push(x, y);
                }
            }

            const N = points.length >> 1;

            /* ── WORLD SPACE MAPPING ──────────────────────────────────── */
            const aspect = W / H;
            const HALF_HEIGHT = 2;
            const HALF_WIDTH = HALF_HEIGHT * aspect;
            const FRUSTUM_HALF_HEIGHT = camera.position.z * Math.tan(25 * Math.PI / 180);
            const FRUSTUM_HALF_WIDTH = FRUSTUM_HALF_HEIGHT * aspect;

            const target = new Float32Array(N * 3);
            const source = new Float32Array(N * 3);
            const current = new Float32Array(N * 3);
            const colors = new Float32Array(N * 3);
            const repulsion = new Float32Array(N * 3);

            for (let i = 0; i < N; i++) {
                const px = points[i * 2];
                const py = points[i * 2 + 1];

                // Final text position
                target[i * 3] = (px / OW - 0.5) * HALF_WIDTH * 2;
                target[i * 3 + 1] = -(py / OH - 0.5) * HALF_HEIGHT * 2 + 0.8;
                target[i * 3 + 2] = 0;

                // Random scatter starting position
                const angle = Math.random() * Math.PI * 2;
                const radius = 6 + Math.random() * 9;

                source[i * 3] = current[i * 3] = Math.cos(angle) * radius;
                source[i * 3 + 1] = current[i * 3 + 1] = Math.sin(angle) * radius;
                source[i * 3 + 2] = current[i * 3 + 2] = (Math.random() - 0.5) * 12;

                // Orange → white gradient
                const t = py / OH;
                colors[i * 3] = 0.12;
                colors[i * 3 + 1] = 0.55;
                colors[i * 3 + 2] = 1.0;
            }

            /* ── CREATE PARTICLES ─────────────────────────────────────── */
            const geometry = new THREE.BufferGeometry();
            const positionAttribute = new THREE.BufferAttribute(current, 3);

            geometry.setAttribute('position', positionAttribute);
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const material = new THREE.PointsMaterial({
                size: 2.3,
                sizeAttenuation: false,
                vertexColors: true,
                transparent: true,
                opacity: 0,
            });

            scene.add(new THREE.Points(geometry, material));

            /* ── ASSEMBLE ANIMATION ───────────────────────────────────── */
            const state = { progress: 0, assembled: false };

            if (!REDUCED) {
                tweenTargets.push(material, state, hsubEl, shintEl);
                gsap.to(material, { opacity: 0.92, duration: 0.35 });

                gsap.to(state, {
                    progress: 1,
                    duration: 2,
                    delay: 0.1,
                    ease: 'power3.out',

                    onUpdate() {
                        const p = state.progress;
                        for (let i = 0; i < N; i++) {
                            current[i * 3] = source[i * 3] + (target[i * 3] - source[i * 3]) * p;
                            current[i * 3 + 1] = source[i * 3 + 1] + (target[i * 3 + 1] - source[i * 3 + 1]) * p;
                            current[i * 3 + 2] = source[i * 3 + 2] * (1 - p * p);
                        }
                        positionAttribute.needsUpdate = true;
                    },

                    onComplete() {
                        state.assembled = true;
                        gsap.to(hsubEl, { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' });
                        gsap.to(shintEl, { opacity: 1, duration: 0.5, delay: 0.35 });
                    },
                });

            } else {
                for (let i = 0; i < N; i++) {
                    current[i * 3] = target[i * 3];
                    current[i * 3 + 1] = target[i * 3 + 1];
                    current[i * 3 + 2] = 0;
                }
                positionAttribute.needsUpdate = true;
                material.opacity = 0.92;
                state.assembled = true;
                gsap.set([hsubEl, shintEl], { opacity: 1, y: 0 });
            }

            /* ── MOUSE INTERACTION ────────────────────────────────────── */
            const mouse = { x: -9999, y: -9999 };
            const cameraTarget = { x: 0, y: 0 };

            mouseMoveHandler = e => {
                const nx = (e.clientX / W) * 2 - 1;
                const ny = -(e.clientY / H) * 2 + 1;

                mouse.x = nx * FRUSTUM_HALF_WIDTH;
                mouse.y = ny * FRUSTUM_HALF_HEIGHT;

                cameraTarget.x = nx * 0.22;
                cameraTarget.y = ny * 0.16;
            };
            document.addEventListener('mousemove', mouseMoveHandler);

            mouseLeaveHandler = () => {
                mouse.x = -9999; mouse.y = -9999;
                cameraTarget.x = 0; cameraTarget.y = 0;
            };
            heroEl.addEventListener('mouseleave', mouseLeaveHandler);

            /* ── SCROLL FADE ──────────────────────────────────────────── */
            scrollTrigger = ScrollTrigger.create({
                trigger: heroEl,
                start: 'top top',
                end: 'bottom top',
                onUpdate(self) {
                    material.opacity = Math.max(0, 0.92 - self.progress * 2.2);
                },
            });

            /* ── RESIZE ───────────────────────────────────────────────── */
            resizeHandler = () => {
                const width = heroEl.clientWidth;
                const height = heroEl.clientHeight;
                renderer.setSize(width, height);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            };
            window.addEventListener('resize', resizeHandler);

            /* ── RENDER LOOP ──────────────────────────────────────────── */
            let elapsed = 0;
            let lastTime = 0;

            const RADIUS = .5;
            const RADIUS_SQUARED = RADIUS * RADIUS;

            function animate(timestamp) {
                if (cancelled) return;
                rafId = requestAnimationFrame(animate);

                const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
                elapsed += dt;
                lastTime = timestamp;

                // Camera parallax


                // Mouse repulsion
                if (state.assembled && !REDUCED) {
                    for (let i = 0; i < N; i++) {
                        const tx = target[i * 3];
                        const ty = target[i * 3 + 1];
                        const dx = tx - mouse.x;
                        const dy = ty - mouse.y;
                        const distSq = dx * dx + dy * dy;

                        if (distSq < RADIUS_SQUARED && distSq > 0.0001) {
                            const dist = Math.sqrt(distSq);
                            const force = (1 - dist / RADIUS) * 0.1;
                            repulsion[i * 3] += (dx / dist) * force;
                            repulsion[i * 3 + 1] += (dy / dist) * force;
                        }

                        repulsion[i * 3] = Math.max(-0.75, Math.min(0.75, repulsion[i * 3] * 0.87));
                        repulsion[i * 3 + 1] = Math.max(-0.75, Math.min(0.75, repulsion[i * 3 + 1] * 0.87));

                        // Tiny idle wave
                        const osc = Math.sin(elapsed * 0.48 + i * 0.035) * 0.009;

                        current[i * 3] = tx + repulsion[i * 3];
                        current[i * 3 + 1] = ty + repulsion[i * 3 + 1] + osc;
                    }
                    positionAttribute.needsUpdate = true;
                }

                renderer.render(scene, camera);
            }

            rafId = requestAnimationFrame(animate);
        })();

        return () => {
            cancelled = true;
            if (rafId) cancelAnimationFrame(rafId);
            if (mouseMoveHandler) document.removeEventListener('mousemove', mouseMoveHandler);
            if (heroEl && mouseLeaveHandler) heroEl.removeEventListener('mouseleave', mouseLeaveHandler);
            if (resizeHandler) window.removeEventListener('resize', resizeHandler);
            if (scrollTrigger) scrollTrigger.kill();
            if (tweenTargets.length) gsap.killTweensOf(tweenTargets);
        };
    }, []);


    return (
        <>

            <section className="hero" id="hero">
                <canvas id="hc"></canvas>
                <div className="hfb" id="hfb">
                    Arc OS
                </div>
                <p id="hsub" style={{ opacity: 0 }}>{/* subtitle text goes here */}</p>
                <span id="shint" style={{ opacity: 0 }}>{/* scroll hint text goes here */}</span>

            </section>
        </>

    )
}

export default Hero