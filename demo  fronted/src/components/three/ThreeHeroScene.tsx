import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeHeroSceneProps {
  className?: string;
}

export const ThreeHeroScene: React.FC<ThreeHeroSceneProps> = ({ className = 'w-full h-full' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x2dd4bf, 2, 20);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const secondaryLight = new THREE.DirectionalLight(0x38bdf8, 1);
    secondaryLight.position.set(-5, -3, 2);
    scene.add(secondaryLight);

    // Core AI mesh
    const coreGeo = new THREE.IcosahedronGeometry(1.3, 2);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0x0f172a,
      emissive: 0x1e293b,
      transparent: true,
      opacity: 0.9,
      shininess: 100,
      wireframe: false
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // Inner wireframe overlay for high-tech aesthetic
    const wireGeo = new THREE.IcosahedronGeometry(1.32, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireMesh);

    // Outer Torus Ring
    const ringGeo = new THREE.TorusGeometry(1.7, 0.025, 16, 100);
    const ringMat = new THREE.MeshPhongMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.75
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.2;
    scene.add(ring);

    // Floating Nodes & Connecting Lines
    const nodeCount = 8;
    const nodes: THREE.Mesh[] = [];
    const lines: THREE.Line[] = [];
    const nodeMat = new THREE.MeshPhongMaterial({
      color: 0x2dd4bf,
      emissive: 0x0d9488,
      transparent: true,
      opacity: 0.85
    });

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.25
    });

    for (let i = 0; i < nodeCount; i++) {
      const nodeGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const node = new THREE.Mesh(nodeGeo, nodeMat);

      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 3.2;
      node.position.x = Math.cos(angle) * radius;
      node.position.y = Math.sin(angle) * radius;
      node.position.z = (Math.random() - 0.5) * 1.5;

      scene.add(node);
      nodes.push(node);

      // Connection Line
      const points = [new THREE.Vector3(0, 0, 0), node.position];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);
      lines.push(line);
    }

    let animationFrameId: number;

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const slowTime = time * 0.001;

      core.rotation.y += 0.004;
      core.rotation.z += 0.002;
      wireMesh.rotation.y = core.rotation.y;
      wireMesh.rotation.z = core.rotation.z;
      ring.rotation.z -= 0.003;

      // Pulse effect
      const pulse = Math.sin(slowTime * 1.5) * 0.08 + 1;
      core.scale.set(pulse, pulse, pulse);
      wireMesh.scale.set(pulse, pulse, pulse);

      nodes.forEach((node, i) => {
        node.position.y += Math.sin(slowTime + i) * 0.002;
        node.position.x += Math.cos(slowTime + i) * 0.001;

        if (lines[i]) {
          const positions = lines[i].geometry.attributes.position.array as Float32Array;
          positions[3] = node.position.x;
          positions[4] = node.position.y;
          positions[5] = node.position.z;
          lines[i].geometry.attributes.position.needsUpdate = true;
        }
      });

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      lineMat.dispose();
      nodeMat.dispose();
    };
  }, []);

  return <div ref={containerRef} className={`relative overflow-hidden pointer-events-none ${className}`} />;
};
