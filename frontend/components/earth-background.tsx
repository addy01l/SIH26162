'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function EarthBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.5, 5.8);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const earthRoot = new THREE.Group();
    earthRoot.rotation.z = (23.44 * Math.PI) / 180;
    scene.add(earthRoot);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');

    const dayTexture = textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    );
    dayTexture.colorSpace = THREE.SRGBColorSpace;

    const normalTexture = textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
    );
    const specularTexture = textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
    );
    const cloudsTexture = textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png',
    );
    const nightLightsTexture = textureLoader.load(
      'https://raw.githubusercontent.com/turban/webgl-earth/master/images/night-lights-2048.png',
    );
    nightLightsTexture.colorSpace = THREE.SRGBColorSpace;

    const sunDirection = new THREE.Vector3(3.0, 1.0, 2.0).normalize();

    // ─── Earth Surface Shader ───────────────────────────────────────────
    const earthVertexShader = `
      varying vec3 vNormal;
      varying vec2 vUv;
      varying vec3 vViewPosition;
      varying vec3 vWorldNormal;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const earthFragmentShader = `
      uniform sampler2D uDayMap;
      uniform sampler2D uNightMap;
      uniform sampler2D uNormalMap;
      uniform sampler2D uSpecularMap;
      uniform vec3 uSunDirection;
      uniform float uNormalScale;

      varying vec3 vNormal;
      varying vec2 vUv;
      varying vec3 vViewPosition;
      varying vec3 vWorldNormal;

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);

        // Normal map perturbation
        vec3 mapN = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;
        mapN.xy *= uNormalScale;
        vec3 N = normalize(normal + vec3(mapN.x, mapN.y, 0.0));

        vec3 L = normalize(uSunDirection);
        float NdotL = dot(N, L);
        float dayFactor = smoothstep(-0.12, 0.2, NdotL);

        vec4 dayColor = texture2D(uDayMap, vUv);
        vec4 nightColor = texture2D(uNightMap, vUv);
        float specularMask = texture2D(uSpecularMap, vUv).r;

        // Ocean specular highlight
        vec3 H = normalize(L + viewDir);
        float NdotH = max(dot(N, H), 0.0);
        float specularIntensity = pow(NdotH, 80.0) * specularMask * 3.0 * dayFactor;
        vec3 specColor = vec3(1.0, 0.95, 0.8) * specularIntensity;

        // Sharper diffuse with subtle ambient fill
        vec3 diffuseDay = dayColor.rgb * (max(NdotL, 0.0) * 0.92 + 0.08);
        
        // City lights: brighter on the dark side, sharp falloff
        vec3 cityLights = nightColor.rgb * pow(1.0 - dayFactor, 1.5) * 2.2;

        // Subtle ocean tint
        diffuseDay += vec3(0.0, 0.03, 0.08) * specularMask * dayFactor;

        // Terminator warmth: amber-orange band at the day/night boundary
        float terminatorBand = exp(-pow((NdotL + 0.05) / 0.12, 2.0));
        vec3 terminatorColor = vec3(0.9, 0.4, 0.12) * terminatorBand * 0.18;

        vec3 finalColor = diffuseDay + cityLights + specColor + terminatorColor;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const earthGeo = new THREE.SphereGeometry(2.0, 128, 128);
    const earthMat = new THREE.ShaderMaterial({
      vertexShader: earthVertexShader,
      fragmentShader: earthFragmentShader,
      uniforms: {
        uDayMap: { value: dayTexture },
        uNightMap: { value: nightLightsTexture },
        uNormalMap: { value: normalTexture },
        uSpecularMap: { value: specularTexture },
        uSunDirection: { value: sunDirection },
        uNormalScale: { value: 1.0 },
      },
    });

    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthRoot.add(earthMesh);

    // ─── Cloud Shadow Shell ─────────────────────────────────────────────
    const cloudShadowGeo = new THREE.SphereGeometry(2.012, 128, 128);
    const cloudShadowMat = new THREE.MeshBasicMaterial({
      map: cloudsTexture,
      color: 0x0a1525,
      transparent: true,
      opacity: 0.18,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const cloudShadowMesh = new THREE.Mesh(cloudShadowGeo, cloudShadowMat);
    earthRoot.add(cloudShadowMesh);

    // ─── Cloud Deck ─────────────────────────────────────────────────────
    const cloudsGeo = new THREE.SphereGeometry(2.032, 128, 128);
    const cloudsMat = new THREE.MeshPhongMaterial({
      map: cloudsTexture,
      color: 0xf0f4ff,
      transparent: true,
      opacity: 0.82,
      blending: THREE.NormalBlending,
      depthWrite: false,
      specular: 0x555555,
      shininess: 4,
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    earthRoot.add(cloudsMesh);



    // ─── Dense Starfield with Size Variation ────────────────────────────
    const starGeo = new THREE.BufferGeometry();
    const starCount = 3200;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    const starPhases = new Float32Array(starCount); // for twinkling

    for (let i = 0; i < starCount; i++) {
      const r = 35 + Math.random() * 60;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      const starTemp = Math.random();
      if (starTemp > 0.85) {
        // Hot blue-white
        starColors[i * 3] = 0.7;
        starColors[i * 3 + 1] = 0.85;
        starColors[i * 3 + 2] = 1.0;
      } else if (starTemp < 0.15) {
        // Warm amber
        starColors[i * 3] = 1.0;
        starColors[i * 3 + 1] = 0.82;
        starColors[i * 3 + 2] = 0.55;
      } else {
        // White
        starColors[i * 3] = 0.96;
        starColors[i * 3 + 1] = 0.96;
        starColors[i * 3 + 2] = 0.96;
      }

      // Vary sizes: mostly tiny, a few bright
      starSizes[i] = Math.random() > 0.92 ? 0.22 : 0.06 + Math.random() * 0.06;
      starPhases[i] = Math.random() * Math.PI * 2;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.09,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
    });

    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // ─── Lighting ───────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0x080e1a, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff8f0, 2.2);
    sunLight.position.copy(sunDirection.clone().multiplyScalar(10));
    scene.add(sunLight);

    // ─── Tiny Satellites ────────────────────────────────────────────────
    // Scaled down ~4× from the previous version so they read as specks.
    const SAT_SCALE = 0.25;
    const satBodyGeo = new THREE.BoxGeometry(
      0.13 * SAT_SCALE,
      0.1 * SAT_SCALE,
      0.19 * SAT_SCALE,
    );
    const panelGeo = new THREE.BoxGeometry(
      0.46 * SAT_SCALE,
      0.014 * SAT_SCALE,
      0.14 * SAT_SCALE,
    );
    const dishGeo = new THREE.SphereGeometry(
      0.05 * SAT_SCALE,
      8,
      6,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2,
    );
    const boomGeo = new THREE.CylinderGeometry(
      0.008 * SAT_SCALE,
      0.008 * SAT_SCALE,
      0.18 * SAT_SCALE,
      6,
    );

    const satMat = new THREE.MeshStandardMaterial({
      color: 0xd0d8e0,
      metalness: 0.95,
      roughness: 0.18,
    });

    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x0e3570,
      emissive: 0x061838,
      emissiveIntensity: 0.4,
      metalness: 0.5,
      roughness: 0.3,
    });

    const antennaMat = new THREE.MeshStandardMaterial({
      color: 0xeaeae6,
      metalness: 0.88,
      roughness: 0.14,
    });

    const satellites: THREE.Group[] = [];

    function createSatellite() {
      const satellite = new THREE.Group();
      const body = new THREE.Mesh(satBodyGeo, satMat);
      satellite.add(body);

      const leftPanel = new THREE.Mesh(panelGeo, panelMat);
      const rightPanel = new THREE.Mesh(panelGeo, panelMat);
      leftPanel.position.x = -0.3 * SAT_SCALE;
      rightPanel.position.x = 0.3 * SAT_SCALE;
      satellite.add(leftPanel, rightPanel);

      const dish = new THREE.Mesh(dishGeo, antennaMat);
      dish.rotation.x = Math.PI;
      dish.position.z = 0.14 * SAT_SCALE;
      const boom = new THREE.Mesh(boomGeo, antennaMat);
      boom.rotation.x = Math.PI / 2;
      boom.position.z = -0.18 * SAT_SCALE;
      satellite.add(dish, boom);

      // Tiny blinking beacon
      const beaconGeo = new THREE.SphereGeometry(0.006, 6, 6);
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff2222 });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = 0.06 * SAT_SCALE;
      satellite.add(beacon);

      return satellite;
    }

    for (let i = 0; i < 18; i++) {
      const sat = createSatellite();
      const r = 2.2 + Math.random() * 0.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      sat.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      );

      sat.userData = {
        speed: (0.15 + Math.random() * 0.25) * (Math.random() > 0.5 ? 1 : -1),
        axis: new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5,
        ).normalize(),
        beaconPhase: Math.random() * Math.PI * 2,
      };

      scene.add(sat);
      satellites.push(sat);
    }

    // ─── Interaction ────────────────────────────────────────────────────
    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;
    let velX = 0;
    let velY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let targetZoom = 5.8;
    let currentZoom = 5.8;

    const MIN_ZOOM = 2.65;
    const MAX_ZOOM = 12.0;

    function onPointerDown(e: MouseEvent | TouchEvent) {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      prevPointerX = clientX;
      prevPointerY = clientY;
      velX = 0;
      velY = 0;
    }

    function onPointerMove(e: MouseEvent | TouchEvent) {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      const deltaX = clientX - prevPointerX;
      const deltaY = clientY - prevPointerY;
      velX = deltaX * 0.005;
      velY = deltaY * 0.005;

      targetRotY += velX;
      targetRotX = Math.max(-Math.PI * 0.46, Math.min(Math.PI * 0.46, targetRotX + velY));

      prevPointerX = clientX;
      prevPointerY = clientY;
    }

    function onPointerUp() {
      isDragging = false;
    }

    function onWheel(e: WheelEvent) {
      targetZoom += e.deltaY * 0.004;
      targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom));
    }

    const domTarget = document.documentElement;
    domTarget.addEventListener('mousedown', onPointerDown as any);
    window.addEventListener('mousemove', onPointerMove as any, { passive: true });
    window.addEventListener('mouseup', onPointerUp);
    domTarget.addEventListener('touchstart', onPointerDown as any, { passive: true });
    window.addEventListener('touchmove', onPointerMove as any, { passive: true });
    window.addEventListener('touchend', onPointerUp);
    domTarget.addEventListener('wheel', onWheel as any, { passive: true });

    // ─── Animation Loop ─────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let animId: number;
    let cloudDrift = 0;
    let elapsed = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      elapsed += delta;

      if (!isDragging) {
        targetRotY += 0.018 * delta;
        velX *= 0.93;
        velY *= 0.93;
        targetRotY += velX;
        targetRotX = Math.max(-Math.PI * 0.46, Math.min(Math.PI * 0.46, targetRotX + velY));
      }

      currentZoom += (targetZoom - currentZoom) * 0.08;
      camera.position.z = currentZoom;

      earthMesh.rotation.y = targetRotY;
      earthMesh.rotation.x = targetRotX;

      cloudDrift += delta * 0.005;
      cloudsMesh.rotation.y = targetRotY + cloudDrift;
      cloudsMesh.rotation.x = targetRotX;
      cloudShadowMesh.rotation.y = targetRotY + cloudDrift - 0.015;
      cloudShadowMesh.rotation.x = targetRotX;

      stars.rotation.y -= 0.002 * delta;

      // Satellite orbiting + beacon blink
      satellites.forEach((sat) => {
        const axis = sat.userData.axis as THREE.Vector3;
        const speed = sat.userData.speed as number;
        const phase = sat.userData.beaconPhase as number;

        sat.position.applyAxisAngle(axis, speed * delta);
        sat.lookAt(0, 0, 0);

        // Blink the beacon light
        const beacon = sat.children[sat.children.length - 1] as THREE.Mesh;
        if (beacon && beacon.material) {
          const blink = Math.sin(elapsed * 4.0 + phase) > 0.6 ? 1 : 0;
          (beacon.material as THREE.MeshBasicMaterial).opacity = blink;
          (beacon.material as THREE.MeshBasicMaterial).transparent = true;
        }
      });

      renderer.render(scene, camera);
    }

    animate();

    // ─── Resize ─────────────────────────────────────────────────────────
    function onResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    }

    window.addEventListener('resize', onResize);

    // ─── Cleanup ────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);

      domTarget.removeEventListener('mousedown', onPointerDown as any);
      window.removeEventListener('mousemove', onPointerMove as any);
      window.removeEventListener('mouseup', onPointerUp);
      domTarget.removeEventListener('touchstart', onPointerDown as any);
      window.removeEventListener('touchmove', onPointerMove as any);
      window.removeEventListener('touchend', onPointerUp);
      domTarget.removeEventListener('wheel', onWheel as any);

      renderer.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      cloudShadowGeo.dispose();
      cloudShadowMat.dispose();
      cloudsGeo.dispose();
      cloudsMat.dispose();

      starGeo.dispose();
      starMat.dispose();
      satBodyGeo.dispose();
      panelGeo.dispose();
      dishGeo.dispose();
      boomGeo.dispose();
      satMat.dispose();
      panelMat.dispose();
      antennaMat.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
}
