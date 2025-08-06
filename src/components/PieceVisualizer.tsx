import React, { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTexture, Edges } from '@react-three/drei';
import { FurniturePiece, PieceType, Hole } from '../types/furniture';
import { ThreeEvent } from '@react-three/fiber';
import { Mesh } from 'three';

const defaultRaycast = Mesh.prototype.raycast;
const noopRaycast = () => null;

interface PieceVisualizerProps {
  piece: FurniturePiece;
  textureUrl: string;
  isHovered: boolean;
  isSelected: boolean;
  onClick: () => void;
  selectionMode: 'piece' | 'space';
  isTransparent: boolean;
}

const getHoleRotation = (direction: Hole['direction']): [number, number, number] => {
  switch (direction) {
    case 'up':
    case 'down':
      return [0, 0, 0];
    case 'left':
    case 'right':
      return [0, 0, Math.PI / 2];
    case 'front':
    case 'back':
      return [Math.PI / 2, 0, 0];
    default:
      return [0, 0, 0];
  }
};

export const PieceVisualizer: React.FC<PieceVisualizerProps> = ({ 
  piece, 
  textureUrl, 
  onClick, 
  isHovered,
  isSelected,
  selectionMode,
  isTransparent
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { position, dimensions } = piece;
  const colorMap = useTexture(textureUrl);

  const isRipa = piece.type === PieceType.RIPA;
  const baseColor = isRipa ? '#7e8d92' : '#ffffff';
  const roughness = isRipa ? 1.0 : 0.8;
  const metalness = isRipa ? 0.0 : 0.1;

  const materials = useMemo(() => {
    const textureScale = isRipa ? 200 : 500;
    const createMaterialForFace = (faceWidth: number, faceHeight: number) => {
      const colorMapClone = colorMap.clone();
      colorMapClone.wrapS = THREE.RepeatWrapping;
      colorMapClone.wrapT = THREE.RepeatWrapping;
      colorMapClone.center.set(0.5, 0.5);

      const repeatU = faceWidth / textureScale;
      const repeatV = faceHeight / textureScale;
      colorMapClone.repeat.set(repeatU, repeatV);
      return new THREE.MeshStandardMaterial({
        map: colorMapClone,
        color: baseColor,
        roughness,
        metalness,
        envMapIntensity: 0.5,
        transparent: isTransparent,
        opacity: isTransparent ? 0.5 : 1.0,
        depthWrite: !isTransparent,
      });
    };
    return [
      createMaterialForFace(dimensions.depth, dimensions.height), // Left/Right
      createMaterialForFace(dimensions.depth, dimensions.height),
      createMaterialForFace(dimensions.width, dimensions.depth),  // Top/Bottom
      createMaterialForFace(dimensions.width, dimensions.depth),
      createMaterialForFace(dimensions.width, dimensions.height), // Front/Back
      createMaterialForFace(dimensions.width, dimensions.height)
    ];
  }, [colorMap, dimensions, isRipa, isTransparent]);

  const renderHoles = () => {
    if (!isTransparent || !piece.holes?.length) return null;
    return piece.holes.map((hole) => (
      <mesh
        key={hole.id}
        position={[hole.position.x / 100, hole.position.y / 100, hole.position.z / 100]}
        rotation={getHoleRotation(hole.direction)}
      >
        <cylinderGeometry args={[
          hole.diameter / 2 / 100,
          hole.diameter / 2 / 100,
          hole.depth / 100,
          16
        ]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    ));
  };

  useEffect(() => {
    if (!meshRef.current?.material) return;
    
    const materials = Array.isArray(meshRef.current.material) 
      ? meshRef.current.material 
      : [meshRef.current.material];

    materials.forEach(mat => {
      if (mat instanceof THREE.MeshStandardMaterial) {
        mat.emissive.set(isHovered && !isSelected ? '#fde047' : '#000000');
        mat.emissiveIntensity = isHovered && !isSelected ? 0.4 : 0;
      }
    });
  }, [isHovered, isSelected]);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (selectionMode !== 'piece') return;
    event.stopPropagation();
    onClick();
  };

  if (!dimensions || dimensions.width <= 0.01 || dimensions.height <= 0.01 || dimensions.depth <= 0.01) {
    return null;
  }

  return (
    <group position={[position.x / 100, position.y / 100, position.z / 100]}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        raycast={selectionMode === 'piece' ? defaultRaycast : noopRaycast}
        castShadow
        receiveShadow
        material={materials}
      >
        <boxGeometry args={[
          dimensions.width / 100, 
          dimensions.height / 100, 
          dimensions.depth / 100
        ]} />
        <Edges
          scale={1}
          threshold={15}
          color={isSelected ? '#f97316' : '#222222'}
          linewidth={isSelected ? 2.5 : 1}
        />
      </mesh>
      {renderHoles()}
    </group>
  );
};