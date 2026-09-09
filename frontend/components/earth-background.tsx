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
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    const earthRoot = new THREE.Group();
    earthRoot.rotation.z = (23.44 * Math.PI) / 180;
    scene.add(earthRoot);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');

    const dayTexture = textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    );
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

    const sunDirection = new THREE.Vector3(3.0, 1.0, 2.0).normalize();

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

        vec3 mapN = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;
        mapN.xy *= uNormalScale;
        vec3 N = normalize(normal + vec3(mapN.x, mapN.y, 0.0));

        vec3 L = normalize(uSunDirection);
        float NdotL = dot(N, L);
        float dayFactor = smoothstep(-0.15, 0.25, NdotL);

        vec4 dayColor = texture2D(uDayMap, vUv);
        vec4 nightColor = texture2D(uNightMap, vUv);
        float specularMask = texture2D(uSpecularMap, vUv).r;

        vec3 H = normalize(L + viewDir);
        float NdotH = max(dot(N, H), 0.0);
        float specularIntensity =
          pow(NdotH, 64.0) * specularMask * 2.5 * dayFactor;

        vec3 specColor = vec3(1.0, 0.9, 0.7) * specularIntensity;
        vec3 diffuseDay = dayColor.rgb * max(NdotL * 0.95 + 0.1, 0.0);
        vec3 cityLights = nightColor.rgb * (1.0 - dayFactor) * 1.85;

        diffuseDay += vec3(0.0, 0.04, 0.09) * specularMask;

        gl_FragColor = vec4(diffuseDay + cityLights + specColor, 1.0);
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
        uNormalScale: { value: 0.8 },
      },
    });

    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthRoot.add(earthMesh);

    // Cloud shadows: a subtle dark shell just above the Earth.
    const cloudShadowGeo = new THREE.SphereGeometry(2.012, 128, 128);
    const cloudShadowMat = new THREE.MeshBasicMaterial({
      map: cloudsTexture,
      color: 0x17263b,
      transparent: true,
      opacity: 0.16,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    const cloudShadowMesh = new THREE.Mesh(cloudShadowGeo, cloudShadowMat);
    earthRoot.add(cloudShadowMesh);

    // Real cloud deck. Normal blending prevents the old glowing blue edge.
    const cloudsGeo = new THREE.SphereGeometry(2.035, 128, 128);
    const cloudsMat = new THREE.MeshPhongMaterial({
      map: cloudsTexture,
      color: 0xf7fbff,
      transparent: true,
      opacity: 0.88,
      blending: THREE.NormalBlending,
      depthWrite: false,
      specular: 0xffffff,
      shininess: 6,
    });

    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    earthRoot.add(cloudsMesh);

    // Starfield
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1600;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const r = 40 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      const starTemp = Math.random();

      if (starTemp > 0.8) {
        starColors[i * 3] = 0.7;
        starColors[i * 3 + 1] = 0.85;
        starColors[i * 3 + 2] = 1.0;
      } else if (starTemp < 0.2) {
        starColors[i * 3] = 1.0;
        starColors[i * 3 + 1] = 0.85;
        starColors[i * 3 + 2] = 0.65;
      } else {
        starColors[i * 3] = 0.95;
        starColors[i * 3 + 1] = 0.95;
        starColors[i * 3 + 2] = 0.95;
      }
    }

    starGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(starPositions, 3),
    );
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    const ambientLight = new THREE.AmbientLight(0x060e1d, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
    sunLight.position.copy(sunDirection.clone().multiplyScalar(10));
    scene.add(sunLight);

    // Real-looking satellites: body, solar panels, antenna dish, and rear boom.
    const satBodyGeo = new THREE.BoxGeometry(0.13, 0.1, 0.19);
    const panelGeo = new THREE.BoxGeometry(0.46, 0.014, 0.14);
    const dishGeo = new THREE.SphereGeometry(
      0.065,
      16,
      10,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2,
    );
    const boomGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.2, 8);

    const satMat = new THREE.MeshStandardMaterial({
      color: 0xd9dee5,
      metalness: 0.92,
      roughness: 0.24,
    });

    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x103b7a,
      emissive: 0x071b4d,
      emissiveIntensity: 0.55,
      metalness: 0.5,
      roughness: 0.3,
    });

    const antennaMat = new THREE.MeshStandardMaterial({
      color: 0xf4f5ef,
      metalness: 0.85,
      roughness: 0.16,
    });

    const satellites: THREE.Group[] = [];

    function createSatellite() {
      const satellite = new THREE.Group();

      const body = new THREE.Mesh(satBodyGeo, satMat);
      satellite.add(body);

      const leftPanel = new THREE.Mesh(panelGeo, panelMat);
      const rightPanel = new THREE.Mesh(panelGeo, panelMat);

      leftPanel.position.x = -0.3;
      rightPanel.position.x = 0.3;

      satellite.add(leftPanel, rightPanel);

      const dish = new THREE.Mesh(dishGeo, antennaMat);
      dish.rotation.x = Math.PI;
      dish.position.z = 0.14;

      const boom = new THREE.Mesh(boomGeo, antennaMat);
      boom.rotation.x = Math.PI / 2;
      boom.position.z = -0.18;

      satellite.add(dish, boom);

      return satellite;
    }

    for (let i = 0; i < 12; i++) {
      const sat = createSatellite();
      const r = 2.25 + Math.random() * 0.55;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      sat.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      );

      sat.userData = {
        speed:
          (0.2 + Math.random() * 0.3) *
          (Math.random() > 0.5 ? 1 : -1),
        axis: new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5,
        ).normalize(),
      };

      scene.add(sat);
      satellites.push(sat);
    }

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

      const clientX =
        'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY =
        'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      prevPointerX = clientX;
      prevPointerY = clientY;
      velX = 0;
      velY = 0;
    }

    function onPointerMove(e: MouseEvent | TouchEvent) {
      if (!isDragging) return;

      const clientX =
        'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY =
        'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      const deltaX = clientX - prevPointerX;
      const deltaY = clientY - prevPointerY;

      velX = deltaX * 0.005;
      velY = deltaY * 0.005;

      targetRotY += velX;
      targetRotX = Math.max(
        -Math.PI * 0.46,
        Math.min(Math.PI * 0.46, targetRotX + velY),
      );

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
    window.addEventListener('mousemove', onPointerMove as any, {
      passive: true,
    });
    window.addEventListener('mouseup', onPointerUp);

    domTarget.addEventListener('touchstart', onPointerDown as any, {
      passive: true,
    });
    window.addEventListener('touchmove', onPointerMove as any, {
      passive: true,
    });
    window.addEventListener('touchend', onPointerUp);

    domTarget.addEventListener('wheel', onWheel as any, { passive: true });

    let clock = new THREE.Clock();
    let animId: number;
    let cloudDrift = 0;

    function animate() {
      animId = requestAnimationFrame(animate);

      const delta = clock.getDelta();

      if (!isDragging) {
        targetRotY += 0.02 * delta;

        velX *= 0.94;
        velY *= 0.94;

        targetRotY += velX;
        targetRotX = Math.max(
          -Math.PI * 0.46,
          Math.min(Math.PI * 0.46, targetRotX + velY),
        );
      }

      currentZoom += (targetZoom - currentZoom) * 0.08;
      camera.position.z = currentZoom;

      earthMesh.rotation.y = targetRotY;
      earthMesh.rotation.x = targetRotX;

      // Clouds rotate with Earth but drift gradually like real weather.
      cloudDrift += delta * 0.006;

      cloudsMesh.rotation.y = targetRotY + cloudDrift;
      cloudsMesh.rotation.x = targetRotX;

      cloudShadowMesh.rotation.y = targetRotY + cloudDrift - 0.018;
      cloudShadowMesh.rotation.x = targetRotX;

      stars.rotation.y -= 0.003 * delta;

      satellites.forEach((sat) => {
        const axis = sat.userData.axis as THREE.Vector3;
        const speed = sat.userData.speed as number;

        sat.position.applyAxisAngle(axis, speed * delta);
        sat.lookAt(0, 0, 0);
      });

      renderer.render(scene, camera);
    }

    animate();

    function onResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    }

    window.addEventListener('resize', onResize);

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
