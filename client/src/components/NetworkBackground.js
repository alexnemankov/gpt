import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';

const GRID_X = 42;
const GRID_Z = 28;
const SPACING = 0.48;
const POINT_COUNT = GRID_X * GRID_Z;
const CONNECTION_DISTANCE = 0.72;
const MAX_CONNECTIONS = POINT_COUNT * 8;

function NetworkField() {
  const pointsRef = useRef();
  const lineGeometryRef = useRef();
  const frameCounterRef = useRef(0);

  const basePositions = useMemo(() => {
    const positions = new Float32Array(POINT_COUNT * 3);
    const offsetX = ((GRID_X - 1) * SPACING) / 2;
    const offsetZ = ((GRID_Z - 1) * SPACING) / 2;

    let idx = 0;
    for (let x = 0; x < GRID_X; x += 1) {
      for (let z = 0; z < GRID_Z; z += 1) {
        positions[idx] = x * SPACING - offsetX;
        positions[idx + 1] = 0;
        positions[idx + 2] = z * SPACING - offsetZ;
        idx += 3;
      }
    }

    return positions;
  }, []);

  const dynamicPositions = useMemo(() => new Float32Array(basePositions), [basePositions]);

  const linePositions = useMemo(() => new Float32Array(MAX_CONNECTIONS * 6), []);

  const connectionPairs = useMemo(() => {
    const pairs = [];
    for (let x = 0; x < GRID_X; x += 1) {
      for (let z = 0; z < GRID_Z; z += 1) {
        const current = x * GRID_Z + z;
        if (x + 1 < GRID_X) pairs.push([current, (x + 1) * GRID_Z + z]);
        if (z + 1 < GRID_Z) pairs.push([current, x * GRID_Z + (z + 1)]);
        if (x + 1 < GRID_X && z + 1 < GRID_Z) pairs.push([current, (x + 1) * GRID_Z + (z + 1)]);
        if (x - 1 >= 0 && z + 1 < GRID_Z) pairs.push([current, (x - 1) * GRID_Z + (z + 1)]);
      }
    }
    return pairs;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    for (let i = 0; i < POINT_COUNT; i += 1) {
      const ptr = i * 3;
      const baseX = basePositions[ptr];
      const baseZ = basePositions[ptr + 2];

      dynamicPositions[ptr] = baseX;
      dynamicPositions[ptr + 1] =
        Math.sin(t * 0.7 + i * 0.22 + baseX * 0.25) * 0.085 +
        Math.cos(t * 0.45 + baseZ * 0.4) * 0.035;
      dynamicPositions[ptr + 2] = baseZ + Math.cos(t * 0.6 + i * 0.14 + baseX * 0.2) * 0.06;
    }

    if (pointsRef.current?.geometry?.attributes?.position) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }

    frameCounterRef.current += 1;
    if (frameCounterRef.current % 2 !== 0) {
      return;
    }

    let write = 0;
    for (let p = 0; p < connectionPairs.length && write < MAX_CONNECTIONS; p += 1) {
      const [a, b] = connectionPairs[p];
      const aPtr = a * 3;
      const bPtr = b * 3;

      const dx = dynamicPositions[aPtr] - dynamicPositions[bPtr];
      const dy = dynamicPositions[aPtr + 1] - dynamicPositions[bPtr + 1];
      const dz = dynamicPositions[aPtr + 2] - dynamicPositions[bPtr + 2];

      if (Math.sqrt(dx * dx + dy * dy + dz * dz) <= CONNECTION_DISTANCE) {
        const linePtr = write * 6;
        linePositions[linePtr] = dynamicPositions[aPtr];
        linePositions[linePtr + 1] = dynamicPositions[aPtr + 1];
        linePositions[linePtr + 2] = dynamicPositions[aPtr + 2];
        linePositions[linePtr + 3] = dynamicPositions[bPtr];
        linePositions[linePtr + 4] = dynamicPositions[bPtr + 1];
        linePositions[linePtr + 5] = dynamicPositions[bPtr + 2];
        write += 1;
      }
    }

    if (lineGeometryRef.current?.attributes?.position) {
      lineGeometryRef.current.setDrawRange(0, write * 2);
      lineGeometryRef.current.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group position={[0, -0.45, -0.9]}>
      <lineSegments frustumCulled={false}>
        <bufferGeometry ref={lineGeometryRef}>
          <bufferAttribute
            attach="attributes-position"
            count={linePositions.length / 3}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#7ac7ff"
          transparent
          opacity={0.22}
          blending={2}
          depthWrite={false}
        />
      </lineSegments>

      <Points ref={pointsRef} positions={dynamicPositions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#dbf9ff"
          size={0.03}
          sizeAttenuation
          opacity={0.85}
          blending={2}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

function NetworkBackground() {
  return (
    <div className="network-background" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 8], fov: 50, near: 0.1, far: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#060713']} />
        <fog attach="fog" args={['#060713', 6, 18]} />
        <NetworkField />
      </Canvas>
    </div>
  );
}

export default NetworkBackground;
