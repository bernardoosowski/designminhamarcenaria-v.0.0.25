import React, { Suspense, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { FurnitureSpace, FurniturePiece } from '../types/furniture';
import { SingleSpaceVisualizer } from './SingleSpaceVisualizer';
import { PieceVisualizer } from './PieceVisualizer';
import { LoadingSpinner } from './LoadingSpinner';

// ===================================================================
// ALTERAÇÃO DE BOAS PRÁTICAS: Componente movido para fora da Scene3D
// para evitar ser recriado em cada renderização, garantindo estabilidade.
// ===================================================================
const RecursiveSpaceVisualizer = ({ space, selectedSpaceId, onSelectSpace, selectionMode }: { 
  space: FurnitureSpace; 
  selectedSpaceId?: string | null; 
  onSelectSpace?: (spaceId: string) => void;
  selectionMode: 'piece' | 'space';
}) => {
  if (!space) return null;
  if (space.isActive) {
    return <SingleSpaceVisualizer space={space} isSelected={selectedSpaceId === space.id} onSelect={onSelectSpace} selectionMode={selectionMode} />;
  }

  if (Array.isArray(space.subSpaces) && space.subSpaces.length > 0) {
    return (
      <group>
        {space.subSpaces.map(sub => (
          <RecursiveSpaceVisualizer key={sub.id} space={sub} selectedSpaceId={selectedSpaceId} onSelectSpace={onSelectSpace} selectionMode={selectionMode} />
        ))}
      </group>
    );
  }

  return null;
};

interface Scene3DProps {
  space: FurnitureSpace;
  allPieces: FurniturePiece[];
  textureUrl: string;
  selectedSpaceId?: string | null;
  onSelectSpace?: (spaceId: string) => void;
  onPieceClick?: (piece: FurniturePiece) => void;
  hoveredPieceId?: string | null;
  selectedPieceId?: string | null;
  selectionMode?: 'piece' | 'space';
  holeVisualizationActive?: boolean; // NOVO
}

export const Scene3D: React.FC<Scene3DProps> = ({ 
  space, 
  allPieces, 
  textureUrl, 
  selectedSpaceId, 
  onSelectSpace, 
  onPieceClick,
  hoveredPieceId,
  selectedPieceId,
  selectionMode = 'piece',
  holeVisualizationActive = false
}) => {
  const gridYPosition = - ((space?.originalDimensions?.height || 2100) / 100) / 2 - 0.2;
  const [gridColors, setGridColors] = useState({ cell: '#e0e0e0', section: '#3b82f6' });

  useEffect(() => {
    const computedStyle = getComputedStyle(document.documentElement);
    const cellColor = computedStyle.getPropertyValue('--color-border').trim();
    const sectionColor = computedStyle.getPropertyValue('--color-primary').trim();
    if (cellColor && sectionColor) {
      setGridColors({ cell: cellColor, section: sectionColor });
    }
  }, []);

  console.log('All pieces:', allPieces);

  return (
    <Suspense fallback={<LoadingSpinner message="Carregando visualização 3D..." />}>
      <Canvas 
        shadows
        camera={{ position: [5, 4, 12], fov: 50 }} 
        style={{ background: 'var(--color-background-gradient)' }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
      >
        <Suspense fallback={null}> 
          <ambientLight intensity={0.8} />
          <directionalLight 
              position={[5, 10, 8]} 
              intensity={1.5} 
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
          />
          <Environment preset="apartment" /> 
          
          <Grid 
            position={[0, gridYPosition, 0]} 
            args={[25, 25]} 
            cellColor={gridColors.cell} 
            sectionColor={gridColors.section} 
            infiniteGrid 
          />
            
          {/* Lógica final: Ambos os tipos de visualizadores são renderizados, */}
          {/* e cada um gerencia sua própria interatividade e visibilidade. */}
          <RecursiveSpaceVisualizer space={space} selectedSpaceId={selectedSpaceId} onSelectSpace={onSelectSpace} selectionMode={selectionMode} />
          
          {allPieces.map((piece) => {
            console.log('Mapping piece:', piece.id, piece.type);
            return (
              <PieceVisualizer 
                key={piece.id}
                piece={piece} 
                textureUrl={textureUrl}
                onClick={() => onPieceClick && onPieceClick(piece)}
                isHovered={piece.id === hoveredPieceId}
                isSelected={piece.id === selectedPieceId}
                selectionMode={selectionMode}
      isTransparent={holeVisualizationActive} // NOVO
              />
            );
          })}

          <OrbitControls makeDefault maxPolarAngle={Math.PI / 1.8} minDistance={2} maxDistance={50} />
        </Suspense>
      </Canvas>
    </Suspense>
  );
};
