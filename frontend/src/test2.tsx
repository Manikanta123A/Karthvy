// App — 3D Space Landing Page (Cosmicon)
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Float, Sparkles, Preload, AdaptiveDpr } from "@react-three/drei";
import * as THREE from "three";
import "./index.css";
import gsap from "gsap";

function Navbar() {
  const [open, setOpen] = useState(false);
  const items = [
    { label: "Home", href: "#home" },
    { label: "Registration", href: "#register" },
    { label: "Login", href: "#login" }
  ];
  return (
    <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur supports-[backdrop-filter]:bg-black/40 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <a href="#home" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-white/90" />
            <span className="text-xl font-extrabold tracking-wide">Cosmicon</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            {items.map((it) => (
              <a key={it.label} href={it.href} className="text-sm uppercase tracking-widest hover:text-blue-300 transition-colors">
                {it.label}
              </a>
            ))}
          </div>
          <button
            aria-label="Toggle Menu"
            className="md:hidden inline-flex items-center justify-center rounded p-2 hover:bg-white/10"
            onClick={() => setOpen((v) => !v)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        {open && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col gap-2">
              {items.map((it) => (
                <a
                  key={it.label}
                  href={it.href}
                  className="rounded px-3 py-2 hover:bg-white/10"
                  onClick={() => setOpen(false)}
                >
                  {it.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function ParallaxRig() {
  const { camera, mouse } = useThree();
  const target = useRef(new THREE.Vector3());
  useFrame(() => {
    target.current.set(mouse.x * 0.5, mouse.y * 0.3, camera.position.z);
    camera.position.lerp(target.current, 0.03);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function Planet() {
  const planetRef = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    planetRef.current.rotation.y += delta * 0.15;
  });
  return (
    <Float speed={1} rotationIntensity={0.3} floatIntensity={0.6}>
      <mesh ref={planetRef} castShadow receiveShadow position={[0, 0, 0]}>
        <icosahedronGeometry args={[2.2, 5]} />
        <meshStandardMaterial color="#C8D6FF" roughness={0.6} metalness={0.15} />
      </mesh>
      {/* Planet ring */}
      <mesh rotation={[Math.PI / 2.2, 0, 0]}>
        <ringGeometry args={[2.6, 3.2, 64]} />
        <meshBasicMaterial color="#7FB8FF" opacity={0.25} transparent />
      </mesh>
    </Float>
  );
}

type SatelliteProps = { radius?: number; speed?: number; size?: number; phase?: number };
function Satellite({ radius = 4.2, speed = 0.5, size = 0.22, phase = 0 }: SatelliteProps) {
  const ref = useRef<THREE.Mesh>(null!);
  const hover = useRef(false);
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed + phase;
    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * radius;
    const y = Math.sin(t * 1.8) * 0.4;
    ref.current.position.set(x, y, z);
    const s = hover.current ? size * 1.8 : size;
    ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, s, 0.2));
    ref.current.rotation.x += 0.02;
    ref.current.rotation.y += 0.02;
  });
  return (
    <mesh
      ref={ref}
      onPointerOver={() => (hover.current = true)}
      onPointerOut={() => (hover.current = false)}
      castShadow
    >
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#ffffff" metalness={0.6} roughness={0.25} />
    </mesh>
  );
}

function SpaceScene() {
  const starProps = useMemo(() => ({ radius: 280, depth: 80, count: 16000, factor: 6, saturation: 0 }), []);
  function RotatingSpace() {
    const rotatingRef = useRef<THREE.Group>(null!);
    useFrame((_, delta) => {
      if (rotatingRef.current) {
        rotatingRef.current.rotation.y += delta * 0.05;
      }
    });

    function AsteroidField({ count = 120, radius = 10, spread = 10 }) {
      const meshRef = useRef<THREE.InstancedMesh>(null!);
      const dummy = useMemo(() => new THREE.Object3D(), []);
    
      const params = useMemo(
        () =>
          Array.from({ length: count }).map(() => ({
            r: radius + Math.random() * spread, // random radius around planet
            speed: 0.05 + Math.random() * 0.25,
            size: 0.08 + Math.random() * 0.22,
            phase: Math.random() * Math.PI * 2,
            tilt: (Math.random() - 0.5) * 0.6
          })),
        [count, radius, spread]
      );
    
      useFrame((state) => {
        const t = state.clock.getElapsedTime();
        params.forEach((p, i) => {
          const x = Math.cos(t * p.speed + p.phase) * p.r;
const y = Math.sin(t * p.speed + p.phase * 0.5) * (p.r * 0.2); // y is now tied to orbit
const z = Math.sin(t * p.speed + p.phase) * p.r;
          dummy.position.set(x, y, z);
          dummy.rotation.set(t * p.speed, t * p.speed * 0.8, 0);
          dummy.scale.set(p.size, p.size, p.size);
          dummy.updateMatrix();
          meshRef.current.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
      });
    
      return (
        <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, count]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#cfd9ff" roughness={0.6} metalness={0.2} />
        </instancedMesh>
      );
    }
    
    return (
      <group ref={rotatingRef}>
        <ParallaxRig />
        {/* <Planet /> */}
        <Satellite radius={4.2} speed={0.5} size={0.22} phase={0} />
        <Satellite radius={5.2} speed={0.35} size={0.18} phase={1.2} />
        <Satellite radius={6.0} speed={0.28} size={0.16} phase={2.4} />
        <AsteroidField count={160} />
        <AsteroidField count={100} />
        <Sparkles size={1.8} scale={[40, 40, 40]} speed={0.5} count={1800} opacity={0.8} />
        <Stars {...starProps} fade />
      </group>
    );
  }
  return (
    <Canvas
      className="fixed inset-0 z-0"
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 8], fov: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      {/* Background */}
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000010", 10, 40]} />


      {/* Lights */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 8, 5]} intensity={1.2} castShadow />
      <pointLight position={[-6, -4, -4]} intensity={0.5} />

      {/* Main Scene */}
      <RotatingSpace />

      {/* Helpers */}
      <AdaptiveDpr pixelated />
      <Preload all />
    </Canvas>
  );
}

function Hero() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const paraRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(titleRef.current, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.9 })
      .fromTo(paraRef.current, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.5")
      .fromTo(
        ctaRef.current?.children || [],
        { autoAlpha: 0, y: 15 },
        { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.12 },
        "-=0.4"
      );
  }, []);

  return (
    <section id="home" className="relative min-h-[100svh] w-full flex flex-col justify-center items-center text-center text-white">
      <div className="px-6">
        <h1 ref={titleRef} className="text-5xl md:text-7xl font-black tracking-tight mb-5 leading-tight">
          Explore The Cosmos
        </h1>
        <p ref={paraRef} className="text-base md:text-xl max-w-3xl mx-auto text-white/80 mb-8">
          Cosmicon — a premier space research event. Immerse yourself in live talks, interactive
          demos, and a universe of discovery.
        </p>
        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center gap-4 justify-center">
          <a href="#register" className="px-7 py-3 rounded-full bg-white text-black font-semibold tracking-wide hover:opacity-90 transition">
            Register Now
          </a>
          <a href="#login" className="px-7 py-3 rounded-full border border-white/60 text-white font-semibold tracking-wide hover:bg-white/10 transition">
            Login
          </a>
        </div>
      </div>
    </section>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="relative w-full py-20 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-6">{title}</h2>
        <div className="text-white/85 leading-relaxed">{children}</div>
      </div>
    </section>
  );
}

export default function Test2() {
  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {/* 3D Background */}
      <SpaceScene />

      {/* Foreground content */}
      <div className="relative z-10 text-center text-white flex flex-col justify-center items-center h-full">
        <h1 className="text-6xl font-extrabold drop-shadow-lg">Cosmicon 2025</h1>
        <p className="text-xl mt-4">Exploring Beyond the Stars</p>
        <button className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-semibold shadow-lg">
          Register Now
        </button>
      </div>
    </div>
  );
}
