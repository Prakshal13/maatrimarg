import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const NetworkThreeGlobe = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
    camera.position.z = 5.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Ambient and Point Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const blueLight = new THREE.PointLight(0x0284c7, 3, 50);
    blueLight.position.set(4, 4, 4);
    scene.add(blueLight);

    const tealLight = new THREE.PointLight(0x0d9488, 3, 50);
    tealLight.position.set(-4, -4, 4);
    scene.add(tealLight);

    // Central AI Neural Globe (Wireframe + Core)
    const coreGeo = new THREE.IcosahedronGeometry(1.3, 2);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0x1e40af,
      emissive: 0x0f172a,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    const innerSphereGeo = new THREE.SphereGeometry(0.9, 24, 24);
    const innerSphereMat = new THREE.MeshPhongMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      transparent: true,
      opacity: 0.85,
    });
    const innerSphere = new THREE.Mesh(innerSphereGeo, innerSphereMat);
    scene.add(innerSphere);

    // Floating Network Nodes (Rural PHCs, Mothers, District Hospitals)
    const nodes = [];
    const lines = [];
    const nodeCount = 10;
    const nodeGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const nodeMat = new THREE.MeshPhongMaterial({
      color: 0x14b8a6,
      emissive: 0x0d9488,
      shininess: 100,
    });

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
    });

    for (let i = 0; i < nodeCount; i++) {
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 2.6 + Math.sin(i * 1.5) * 0.4;
      node.position.x = Math.cos(angle) * radius;
      node.position.y = Math.sin(angle) * radius;
      node.position.z = (Math.sin(i) * 1.2);

      scene.add(node);
      nodes.push({ mesh: node, speed: 0.004 + (i % 3) * 0.002, angle, radius });

      // Line connecting to core
      const points = [new THREE.Vector3(0, 0, 0), node.position];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);
      lines.push(line);
    }

    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      core.rotation.y += 0.004;
      core.rotation.x += 0.002;
      innerSphere.rotation.y -= 0.003;

      // Pulse inner core
      const scale = 1 + Math.sin(elapsedTime * 2.5) * 0.06;
      innerSphere.scale.set(scale, scale, scale);

      // Orbit nodes
      nodes.forEach((n, idx) => {
        n.angle += n.speed;
        n.mesh.position.x = Math.cos(n.angle) * n.radius;
        n.mesh.position.y = Math.sin(n.angle) * n.radius;

        // Update connected line geometry
        const line = lines[idx];
        if (line) {
          const positions = line.geometry.attributes.position.array;
          positions[3] = n.mesh.position.x;
          positions[4] = n.mesh.position.y;
          positions[5] = n.mesh.position.z;
          line.geometry.attributes.position.needsUpdate = true;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={mountRef} className="w-full h-full min-h-[380px] lg:min-h-[460px] flex items-center justify-center relative cursor-grab active:cursor-grabbing" />
  );
};

export default NetworkThreeGlobe;
