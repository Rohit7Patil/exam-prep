"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Icosahedron, Float } from "@react-three/drei";
import { useRef } from "react";

function SubtleShape() {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.1;
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  const primaryColor = "#3b82f6"; // Tailwind blue-500
  const secondaryColor = "#8b5cf6"; // Tailwind violet-500

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Icosahedron ref={meshRef} args={[2.5, 1]}>
        <meshPhysicalMaterial 
          color={primaryColor}
          wireframe
          transparent
          opacity={0.15}
          roughness={0.1}
          metalness={0.8}
        />
      </Icosahedron>
      
      {/* Inner core */}
      <Icosahedron args={[0.8, 0]}>
        <meshPhysicalMaterial 
          color={secondaryColor}
          transparent
          opacity={0.6}
          roughness={0.2}
          emissive={secondaryColor}
          emissiveIntensity={0.8}
        />
      </Icosahedron>
    </Float>
  );
}

export default function ThreeDElement() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-60 dark:opacity-50">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <SubtleShape />
      </Canvas>
    </div>
  );
}
