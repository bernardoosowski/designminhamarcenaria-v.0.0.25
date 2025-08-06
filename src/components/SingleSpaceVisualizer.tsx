import React from 'react';
import { Box } from '@react-three/drei';
import { FurnitureSpace } from '../types/furniture';
import { ThreeEvent } from '@react-three/fiber';
import { Mesh } from 'three'; // Importação necessária

// ===================================================================
// SOLUÇÃO DEFINITIVA: Definimos explicitamente as funções de raycast
// ===================================================================
const defaultRaycast = Mesh.prototype.raycast; // A função de clique padrão
const noopRaycast = () => null;                // Uma função vazia para desativar

interface SingleSpaceVisualizerProps {
  space: FurnitureSpace;
  isSelected?: boolean;
  onSelect?: (spaceId: string) => void;
  selectionMode: 'piece' | 'space';
}

export const SingleSpaceVisualizer: React.FC<SingleSpaceVisualizerProps> = ({ 
  space, 
  isSelected = false, 
  onSelect, 
  selectionMode 
}) => {
  const { currentDimensions, position = { x: 0, y: 0, z: 0 } } = space;
  
  // Garante que o componente não tente renderizar um espaço com dimensões inválidas.
  if (!currentDimensions || currentDimensions.width <= 1 || currentDimensions.height <= 1 || currentDimensions.depth <= 1) {
    return null;
  }

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (selectionMode !== 'space') return;
    
    event.stopPropagation();
    if (onSelect) {
      onSelect(space.id);
    }
  };
  
  return (
    <Box
      // Chave simplificada para garantir estabilidade na renderização
      key={space.id}
      position={[position.x / 100, position.y / 100, position.z / 100]}
      args={[currentDimensions.width / 100, currentDimensions.height / 100, currentDimensions.depth / 100]}
      onClick={handleClick}
      // SOLUÇÃO DEFINITIVA (DUPLA PROTEÇÃO):
      // 1. O objeto só é visível no modo 'space'.
      visible={selectionMode === 'space'}
      // 2. A interatividade também é controlada explicitamente para garantir que seja sempre uma função.
      raycast={selectionMode === 'space' ? defaultRaycast : noopRaycast}
    >
      <meshStandardMaterial
        color={isSelected ? '#ff6600' : '#3b82f6'}
        transparent
        opacity={isSelected ? 0.35 : 0.15}
        depthWrite={false}
      />
    </Box>
  );
};
