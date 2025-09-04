import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls} from "@react-three/drei";
import * as THREE from "three";

const NUM_ASTEROIDS = 200;

function AsteroidField() {
  const groupRef = useRef<THREE.Group>(null);
  const [targetPositions, setTargetPositions] = useState<THREE.Vector3[] | null>(null);

  // Create random asteroid positions initially
  const asteroids = useRef(
    Array.from({ length: NUM_ASTEROIDS }, () => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      ),
      mesh: React.createRef<THREE.Mesh>(),
    }))
  );

  // After 2 sec, form text "COSMIC"
  useEffect(() => {
    setTimeout(() => {
      const dummyScene = new THREE.Scene();
      const loader = new THREE.FontLoader();
      loader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
        const textGeo = new THREE.TextGeometry("COSMIC", {
          font,
          size: 3,
          height: 0.5,
        });
        textGeo.center();
        textGeo.computeBoundingBox();
        textGeo.computeBoundingSphere();

        // sample points from text geometry
        const points = textGeo.attributes.position.array;
        const positions: THREE.Vector3[] = [];
        for (let i = 0; i < points.length; i += 3) {
          if (positions.length < NUM_ASTEROIDS) {
            positions.push(new THREE.Vector3(points[i], points[i + 1], points[i + 2]));
          }
        }
        setTargetPositions(positions);
      });
    }, 2000);
  }, []);

  // Animate each asteroid toward its target
  useFrame(() => {
    if (targetPositions) {
      asteroids.current.forEach((a, i) => {
        if (a.mesh.current && targetPositions[i]) {
          a.mesh.current.position.lerp(targetPositions[i], 0.02); // smooth move
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {asteroids.current.map((a, i) => (
        <mesh ref={a.mesh} key={i} position={a.position}>
          <sphereGeometry args={[0.15, 12, 12]} />
          <meshStandardMaterial color="gray" />
        </mesh>
      ))}
    </group>
  );
}

export default function AsteroidText() {
  return (
    <Canvas camera={{ position: [0, 0, 30], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[20, 20, 20]} />
      <OrbitControls />
      <AsteroidField />
    </Canvas>
  );
}
