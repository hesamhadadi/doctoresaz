'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/*
  صحنه‌ی سه‌بعدی هیرو — «سه‌تار در فضا»
  ────────────────────────────────────
  یک سازِ زهیِ ایرانی (کاسه‌ی گلابی‌شکل + دسته‌ی بلند + سیم‌ها + گوشی‌ها)
  که آرام می‌چرخد و شناور است. دورش:
    • تارهای مرتعش که مثل نوسان صدای ساز می‌لرزند
    • ذرات معلقِ نور طلایی
    • حلقه‌ی شمسه‌وارِ چرخان پشت ساز
  رنگ‌ها از پالت سایت: چوبِ زعفرانی + جزئیات فیروزه‌ای.
  با prefers-reduced-motion صحنه ساکن می‌شود.
*/
export default function Hero3D({ className = '' }: any) {
  const mountRef = useRef<any>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const W = () => mount.clientWidth;
    const H = () => mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W() / H(), 0.1, 100);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W(), H());
    mount.appendChild(renderer.domElement);

    // پالت
    const WOOD = new THREE.Color('#8A4614');
    const WOOD_LIGHT = new THREE.Color('#C77B33');
    const FIROOZE = new THREE.Color('#2FC2B4');
    const ZAFERAN = new THREE.Color('#E89B2E');
    const CREAM = new THREE.Color('#F2E6CE');

    // گروه اصلی ساز (کمی کج برای نمای سه‌رخ)
    const saz = new THREE.Group();
    saz.rotation.z = 0.15;
    scene.add(saz);

    // ─── کاسه‌ی گلابی‌شکل (بدنه‌ی سه‌تار) ───
    // نیم‌رخ کاسه را با LatheGeometry می‌چرخانیم تا حجم گلابی بسازد
    const bowlProfile: any[] = [];
    const pts = [
      [0.0, -2.7], [0.55, -2.55], [0.95, -2.2], [1.15, -1.7],
      [1.2, -1.15], [1.05, -0.6], [0.72, -0.2], [0.4, 0.0], [0.28, 0.08],
    ];
    pts.forEach(([x, y]) => bowlProfile.push(new THREE.Vector2(x, y)));
    const bowlGeo = new THREE.LatheGeometry(bowlProfile, 48);
    const woodMat = new THREE.MeshStandardMaterial({
      color: WOOD, roughness: 0.5, metalness: 0.15, flatShading: false,
    });
    const bowl = new THREE.Mesh(bowlGeo, woodMat);
    saz.add(bowl);

    // صفحه‌ی رویی کاسه (چوب روشن‌تر) — یک دیسک کمی محدب
    const faceGeo = new THREE.CircleGeometry(1.2, 48);
    const faceMat = new THREE.MeshStandardMaterial({
      color: WOOD_LIGHT, roughness: 0.4, metalness: 0.1, side: THREE.DoubleSide,
    });
    const face = new THREE.Mesh(faceGeo, faceMat);
    face.position.y = -1.15;
    face.rotation.x = -Math.PI / 2;
    face.scale.set(1, 0.92, 1);
    // چرخش صفحه به سمت دوربین
    const faceGroup = new THREE.Group();
    faceGroup.rotation.x = Math.PI / 2;
    faceGroup.position.y = -1.15;
    const faceDisk = new THREE.Mesh(faceGeo, faceMat);
    faceGroup.add(faceDisk);
    saz.add(faceGroup);

    // خرک (پل کوچک روی صفحه)
    const bridge = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.06, 0.12),
      new THREE.MeshStandardMaterial({ color: CREAM, roughness: 0.6 })
    );
    bridge.position.set(0, -1.55, 0.16);
    saz.add(bridge);

    // گلِ صوتی (سوراخ‌های ریز روی صفحه) — نقاط فیروزه‌ای
    const holeGeo = new THREE.BufferGeometry();
    const holePts: any[] = [];
    for (let i = 0; i < 30; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.15 + Math.random() * 0.35;
      holePts.push(Math.cos(a) * r, -1.0 + Math.random() * 0.3, 0.16 + Math.sin(a) * r * 0.3);
    }
    holeGeo.setAttribute('position', new THREE.Float32BufferAttribute(holePts, 3));
    saz.add(new THREE.Points(holeGeo, new THREE.PointsMaterial({ color: FIROOZE, size: 0.05, transparent: true, opacity: 0.7 })));

    // ─── دسته‌ی بلند ───
    const neckGeo = new THREE.CylinderGeometry(0.13, 0.16, 4.6, 20);
    const neck = new THREE.Mesh(neckGeo, new THREE.MeshStandardMaterial({ color: WOOD, roughness: 0.45, metalness: 0.15 }));
    neck.position.y = 1.35;
    saz.add(neck);

    // صفحه‌ی انگشت‌گذاری روشن روی دسته
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 4.6, 0.04),
      new THREE.MeshStandardMaterial({ color: WOOD_LIGHT, roughness: 0.4 })
    );
    board.position.set(0, 1.35, 0.15);
    saz.add(board);

    // پرده‌ها (نخ‌های دور دسته) — حلقه‌های فیروزه‌ای
    const fretMat = new THREE.MeshBasicMaterial({ color: FIROOZE, transparent: true, opacity: 0.55 });
    for (let i = 0; i < 11; i++) {
      const fret = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.012, 8, 24), fretMat);
      fret.position.set(0, -0.4 + i * 0.34, 0);
      fret.rotation.y = Math.PI / 2;
      saz.add(fret);
    }

    // ─── سرِ ساز و گوشی‌ها ───
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.9, 0.22),
      new THREE.MeshStandardMaterial({ color: WOOD, roughness: 0.45 })
    );
    head.position.y = 3.95;
    head.rotation.x = -0.25;
    saz.add(head);

    const pegMat = new THREE.MeshStandardMaterial({ color: CREAM, roughness: 0.5, metalness: 0.2 });
    const pegPos = [[-0.28, 3.7], [0.28, 3.75], [-0.28, 4.1], [0.28, 4.15]];
    pegPos.forEach(([x, y]) => {
      const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 10), pegMat);
      peg.position.set(x, y, 0.05);
      peg.rotation.z = Math.PI / 2;
      saz.add(peg);
    });

    // ─── سیم‌ها (از خرک تا سر) — با لرزش نور ───
    const strings: any[] = [];
    const stringMat = new THREE.LineBasicMaterial({ color: CREAM, transparent: true, opacity: 0.75 });
    const sx = [-0.09, -0.03, 0.03, 0.09];
    sx.forEach((x) => {
      const g = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, -1.55, 0.2),
        new THREE.Vector3(x, 3.6, 0.2),
      ]);
      const line = new THREE.Line(g, stringMat.clone());
      saz.add(line);
      strings.push({ line, x, base: [] });
    });

    // ─── حلقه‌ی شمسه‌وار پشت ساز ───
    const halo = new THREE.Group();
    [3.3, 3.9].forEach((r, i) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.008, 10, 90),
        new THREE.MeshBasicMaterial({ color: i ? ZAFERAN : FIROOZE, transparent: true, opacity: 0.3 - i * 0.1 })
      );
      halo.add(ring);
    });
    // ستاره‌ی هشت‌پر (شمسه) با خطوط
    const shamseMat = new THREE.LineBasicMaterial({ color: FIROOZE, transparent: true, opacity: 0.22 });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const g = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(a) * 3.1, Math.sin(a) * 3.1, 0),
      ]);
      halo.add(new THREE.Line(g, shamseMat));
    }
    halo.position.z = -1.5;
    scene.add(halo);

    // ─── تارهای مرتعش کناری (نوسان صدا) ───
    const waves = new THREE.Group();
    const waveLines: any[] = [];
    for (let i = 0; i < 5; i++) {
      const g = new THREE.BufferGeometry();
      const n = 60;
      const arr = new Float32Array(n * 3);
      for (let j = 0; j < n; j++) arr[j * 3] = (j / (n - 1) - 0.5) * 7;
      g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      const line = new THREE.Line(g, new THREE.LineBasicMaterial({
        color: i % 2 ? ZAFERAN : FIROOZE, transparent: true, opacity: 0.18,
      }));
      line.position.set(4.6, -2 + i * 1, -1);
      waves.add(line);
      waveLines.push({ line, n, off: i * 0.7, amp: 0.12 + i * 0.03 });
    }
    scene.add(waves);

    // ─── ذرات ───
    const N = 260;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: ZAFERAN, size: 0.04, transparent: true, opacity: 0.5,
    }));
    scene.add(particles);

    // ─── نور ───
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(CREAM, 2.2);
    key.position.set(4, 6, 6);
    scene.add(key);
    const fill = new THREE.PointLight(FIROOZE, 25, 40);
    fill.position.set(-5, -1, 4);
    scene.add(fill);
    const rim = new THREE.PointLight(ZAFERAN, 18, 40);
    rim.position.set(3, -3, -2);
    scene.add(rim);

    // ماوس
    const target = { x: 0, y: 0 };
    const onMove = (e) => {
      const r = mount.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    if (!reduce) window.addEventListener('pointermove', onMove);

    // حلقه‌ی رندر
    let raf;
    const clock = new THREE.Clock();
    const render = () => {
      const t = clock.getElapsedTime();

      if (!reduce) {
        saz.rotation.y = Math.sin(t * 0.25) * 0.5 + target.x * 0.5;
        saz.position.y = Math.sin(t * 0.7) * 0.15;
        saz.rotation.z = 0.15 + Math.sin(t * 0.4) * 0.03 + target.y * 0.1;
        halo.rotation.z = t * 0.08;
        particles.rotation.y = t * 0.02;

        // لرزش سیم‌ها
        strings.forEach((s, i) => {
          const p = s.line.geometry.attributes.position;
          const amp = 0.02 * Math.sin(t * 6 + i);
          p.setX(0, s.x);
          p.setX(1, s.x);
          // نقطه‌ی میانی مجازی با جابه‌جایی جزئی رنگ/نور (اثر ارتعاش با اپاسیتی)
          s.line.material.opacity = 0.55 + Math.abs(Math.sin(t * 5 + i * 1.3)) * 0.3;
        });

        // موج صدا
        waveLines.forEach((w) => {
          const p = w.line.geometry.attributes.position;
          for (let j = 0; j < w.n; j++) {
            const x = p.getX(j);
            p.setY(j, Math.sin(x * 1.2 + t * 3 + w.off) * w.amp * Math.exp(-Math.abs(x) * 0.12));
          }
          p.needsUpdate = true;
        });

        camera.position.x += (target.x * 0.8 - camera.position.x) * 0.04;
        camera.position.y += (-target.y * 0.5 - camera.position.y) * 0.04;
        camera.lookAt(0, 0.2, 0);
      } else {
        saz.rotation.y = 0.4;
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    render();

    const onResize = () => {
      camera.aspect = W() / H();
      camera.updateProjectionMatrix();
      renderer.setSize(W(), H());
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else render();
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointermove', onMove);
      renderer.dispose();
      scene.traverse((o: any) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
      });
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}
