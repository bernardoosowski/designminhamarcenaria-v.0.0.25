import { FurniturePiece, PieceType, Dimensions, Position } from '../types/furniture';
import { v4 as uuidv4 } from 'uuid';

// Opções para a furação de cavilhas
interface DowelOptions {
  diameter: number;
  depth: number;
  countPerSlat: number; // Ex: 2 furos por ripa
  edgeOffset: number;   // Distância da borda
}

// Opções para o painel ripado
interface SlattedPanelOptions {
  baseDimensions: Dimensions;
  basePosition?: Position;
  slatProfile: { width: number; depth: number };
  dowelOptions: DowelOptions;
  calculation: 
    | { mode: 'auto-fit-spacing'; targetSpacing: number; }
    | { mode: 'fixed-slat-count'; count: number; };
}

/**
 * Cria um conjunto de peças (base + ripas) para um painel ripado,
 * incluindo a furação de cavilha correspondente.
 */
export function createSlattedPanelWithDowels(options: SlattedPanelOptions): FurniturePiece[] {
  const { 
    baseDimensions, 
    basePosition = { x: 0, y: 0, z: 0 },
    slatProfile, 
    calculation, 
    dowelOptions 
  } = options;
  
  const pieces: FurniturePiece[] = [];
  const slatWidth = slatProfile.width;

  // 1. Criar a peça base
  const basePiece: FurniturePiece = {
    id: uuidv4(),
    type: PieceType.BOTTOM, // Usando BOTTOM em vez de BASE que não existe
    name: 'Base do Painel',
    color: '#D3B88C',
    thickness: baseDimensions.depth,
    position: basePosition,
    dimensions: baseDimensions,
    holes: []
  };

  // 2. Calcular a quantidade e espaçamento das ripas
  let slatCount: number;
  let actualSpacing: number;

  if (calculation.mode === 'fixed-slat-count') {
    slatCount = calculation.count;
    if (slatCount < 1) return [basePiece];
    const totalSlatsWidth = slatCount * slatWidth;
    const remainingSpace = baseDimensions.width - totalSlatsWidth;
    actualSpacing = slatCount > 1 ? remainingSpace / (slatCount - 1) : 0;
  } else {
    const targetSpacing = calculation.targetSpacing;
    const unitWidth = slatWidth + targetSpacing;
    slatCount = Math.floor((baseDimensions.width + targetSpacing) / unitWidth);
    const totalSlatsWidth = slatCount * slatWidth;
    const remainingSpace = baseDimensions.width - totalSlatsWidth;
    actualSpacing = slatCount > 1 ? remainingSpace / (slatCount - 1) : 0;
  }

  // 3. Criar as ripas e os furos
  const startX = basePosition.x - baseDimensions.width / 2 + slatWidth / 2;
  const slatY = basePosition.y;
  // Posiciona a ripa na superfície frontal da base
  const slatZ = basePosition.z + baseDimensions.depth / 2 + slatProfile.depth / 2;

  for (let i = 0; i < slatCount; i++) {
    const slatPositionX = startX + i * (slatWidth + actualSpacing);
    
    const slatPiece: FurniturePiece = {
      id: uuidv4(),
      type: PieceType.RIPA,
      name: `Ripa ${i + 1}`,
      color: '#A0A0A0',
      thickness: slatProfile.depth,
      position: { x: slatPositionX, y: slatY, z: slatZ },
      dimensions: {
        width: slatWidth,
        height: baseDimensions.height,
        depth: slatProfile.depth,
      },
      holes: []
    };

    // Adicionar furos na ripa e na base
    const { diameter, depth, countPerSlat, edgeOffset } = dowelOptions;
    
    for (let j = 0; j < countPerSlat; j++) {
      // Posição Y do furo, calculada a partir das bordas superior/inferior
      const yPos = (baseDimensions.height / 2 - edgeOffset) * (j === 0 ? 1 : -1);

      // Furo na ripa (na face traseira)
      slatPiece.holes?.push({
        id: uuidv4(),
        position: { x: 0, y: yPos, z: -slatProfile.depth / 2 },
        diameter,
        depth: depth / 2, // Metade da profundidade na ripa
        direction: 'back'
      });

      // Furo correspondente na base (na face frontal)
      basePiece.holes?.push({
        id: uuidv4(),
        position: { 
          x: slatPositionX - basePosition.x, // Posição X relativa à base
          y: yPos,
          z: baseDimensions.depth / 2 
        },
        diameter,
        depth: depth / 2, // Metade da profundidade na base
        direction: 'front'
      });
    }
    
    pieces.push(slatPiece);
  }

  pieces.push(basePiece);
  return pieces;
}