import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const NetworkThreeGlobe = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 550;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
    camera.position.z = 4.8;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const mainLight = new THREE.DirectionalLight(0x2dd4bf, 1.5);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);

    const blueLight = new THREE.PointLight(0x38bdf8, 2, 20);
    blueLight.position.set(-5, -5, 3);
    scene.add(blueLight);

    // Central AI Core (Icosahedron)
    const coreMaterial = new THREE.MeshPhongMaterial({
      color: 0x0f172a,
      emissive: 0x1e293b,
      transparent: true,
      opacity: 0.85,
      shininess: 90,
      wireframe: false,
    });
    const coreGeo = new THREE.IcosahedronGeometry(1.35, 2);
    const core = new THREE.Mesh(coreGeo, coreMaterial);
    scene.add(core);

    // Wireframe overlay on core
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const coreWire = new THREE.Mesh(coreGeo, wireMat);
    scene.add(coreWire);

    // Outer orbital ring for core
    const ringGeo = new THREE.TorusGeometry(1.85, 0.02, 16, 100);
    const ringMat = new THREE.MeshPhongMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.65,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.2;
    scene.add(ring);

    // Floating Nodes (Hospitals/Mothers in Maharashtra & Tamil Nadu)
    const nodeMaterial = new THREE.MeshPhongMaterial({
      color: 0x2dd4bf,
      emissive: 0x0d9488,
      transparent: true,
      opacity: 0.85,
      shininess: 100,
    });

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.25,
    });

    const nodes = [];
    const lines = [];
    const nodeCount = 9;

    for (let i = 0; i < nodeCount; i++) {
      const nodeGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const node = new THREE.Mesh(nodeGeo, nodeMaterial);

      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 3.1;
      node.position.x = Math.cos(angle) * radius;
      node.position.y = Math.sin(angle) * radius * 0.75;
      node.position.z = (Math.sin(i * 1.7) * 1.5);

      scene.add(node);
      nodes.push(node);

      // Connecting lines to center
      const points = [new THREE.Vector3(0, 0, 0), node.position];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeo, lineMaterial);
      scene.add(line);
      lines.push(line);
    }

    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      core.rotation.y += 0.003;
      core.rotation.z += 0.0015;
      coreWire.rotation.y += 0.003;
      coreWire.rotation.z += 0.0015;
      ring.rotation.z -= 0.0025;

      // Pulse effect
      const pulse = Math.sin(time * 1.8) * 0.06 + 1;
      core.scale.set(pulse, pulse, pulse);
      coreWire.scale.set(pulse, pulse, pulse);

      nodes.forEach((node, i) => {
        node.position.y += Math.sin(time + i) * 0.0015;
        node.position.x += Math.cos(time + i) * 0.001;

        // Update connected lines
        const pos = lines[i].geometry.attributes.position.array;
        pos[3] = node.position.x;
        pos[4] = node.position.y;
        pos[5] = node.position.z;
        lines[i].geometry.attributes.position.needsUpdate = true;
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || 550;
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
    <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-none" />
  );
};

export default NetworkThreeGlobe;
