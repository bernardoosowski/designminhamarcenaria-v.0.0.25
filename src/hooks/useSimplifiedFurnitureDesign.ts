import { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FurnitureSpace, Dimensions, PieceType, FurniturePiece, SlattedPanelConfig, Hole, Position, CappingConfig, SarrafoConfig } from '../types/furniture';
import { InsertionMode, InsertionContext } from '../types/insertion';
import { SpaceCuttingSystem } from '../utils/spaceCutting';

export const availableTextures = [
    { name: 'Carvalho', url: '/textures/mdf-carvalho.jpg' },
    { name: 'Branco TX', url: '/textures/mdf-branco.jpg' },
    { name: 'Nogueira', url: '/textures/mdf-nogueira.jpg' },
    { name: 'Cinza Sagrado', url: '/textures/mdf-cinza.jpg' },
];

const PIECE_CONFIG: Record<string, { name: string; color: string }> = {
    [PieceType.LATERAL_LEFT]: { name: 'Lateral Esquerda', color: '#8b5cf6' },
    [PieceType.LATERAL_RIGHT]: { name: 'Lateral Direita', color: '#8b5cf6' },
    [PieceType.LATERAL_FRONT]: { name: 'Lateral Frontal', color: '#f59e0b' },
    [PieceType.LATERAL_BACK]: { name: 'Costas', color: '#facc15' },
    [PieceType.BOTTOM]: { name: 'Base', color: '#ef4444' },
    [PieceType.TOP]: { name: 'Tampo', color: '#ef4444' },
    [PieceType.SHELF]: { name: 'Prateleira', color: '#10b981' },
    [PieceType.DIVIDER_VERTICAL]: { name: 'Divisória Vertical', color: '#3b82f6' },
    [PieceType.RIPA]: { name: 'Ripa', color: '#7e8d92' },
    [PieceType.CAPPING]: { name: 'Tamponamento', color: '#a855f7' },
    [PieceType.SARRAFO]: { name: 'Sarrafo', color: '#8b5a2b' },
    [PieceType.EXTERNAL_PIECE]: { name: 'Peça Externa', color: '#2563eb' },
};

export const useSimplifiedFurnitureDesign = () => {
    const [defaultThickness, setDefaultThickness] = useState(18);
    const [allPieces, setAllPieces] = useState<FurniturePiece[]>([]);
    const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>('main');
    const [mainSpaceInfo, setMainSpaceInfo] = useState({
        id: 'main',
        name: 'Móvel Principal',
        originalDimensions: { width: 800, height: 2100, depth: 600 },
        currentDimensions: { width: 800, height: 2100, depth: 600 },
        position: { x: 0, y: 0, z: 0 },
        pieces: [],
        subSpaces: [],
        isActive: true,
    });
    const [insertionContext, setInsertionContext] = useState<InsertionContext>({ mode: InsertionMode.STRUCTURAL });
    const [currentTexture, setCurrentTexture] = useState(availableTextures[0]);

    const memoizedState = useMemo(() => {
        const positionedPieces: FurniturePiece[] = [];
        const basePieceHoles = new Map<string, Hole[]>();

        const generateCapping = (generatorPiece: FurniturePiece): FurniturePiece[] => {
            if (!generatorPiece.isCappingGenerator || !generatorPiece.cappingConfig) return [];
            
            const { dimensions: pieceDims, position: piecePos, cappingConfig, type: pieceType } = generatorPiece;
            const { 
                thickness: cappingThickness, 
                gapExtension = 25, 
                extensionTop = gapExtension,
                extensionBottom = gapExtension,
                extensionLeft = gapExtension,
                extensionRight = gapExtension,
                extensionFront = gapExtension,
                extensionBack = gapExtension,
                dowelOptions 
            } = cappingConfig;
            
            // Criar apenas uma peça de tamponamento na face externa da peça selecionada
            let cappingDimensions: Dimensions;
            let cappingPosition: Position;
            let cappingName = 'Tamponamento';
            
            // Extensão para cobrir gaps de montagem (configurável)

            switch (pieceType) {
                case PieceType.LATERAL_LEFT:
                    // Tamponamento na face externa esquerda - estendido para cobrir gaps
                    cappingDimensions = { 
                        width: cappingThickness, 
                        height: pieceDims.height + extensionTop + extensionBottom, // Extensões personalizadas
                        depth: pieceDims.depth + extensionFront + extensionBack   // Extensões personalizadas
                    };
                    cappingPosition = { 
                        x: piecePos.x - pieceDims.width / 2 - cappingThickness / 2 - 0.1, // Pequeno ajuste para ficar bem na face externa
                        y: piecePos.y + (extensionTop - extensionBottom) / 2, // Ajuste pelo desbalanceamento entre extensões
                        z: piecePos.z + (extensionBack - extensionFront) / 2 // Ajuste pelo desbalanceamento entre extensões
                    };
                    cappingName = 'Tamponamento Lateral Esq.';
                    break;

                case PieceType.LATERAL_RIGHT:
                    // Tamponamento na face externa direita - estendido para cobrir gaps
                    cappingDimensions = { 
                        width: cappingThickness, 
                        height: pieceDims.height + extensionTop + extensionBottom, // Extensões personalizadas
                        depth: pieceDims.depth + extensionFront + extensionBack   // Extensões personalizadas
                    };
                    cappingPosition = { 
                        x: piecePos.x + pieceDims.width / 2 + cappingThickness / 2 + 0.1, // Pequeno ajuste para ficar bem na face externa
                        y: piecePos.y + (extensionTop - extensionBottom) / 2, // Ajuste pelo desbalanceamento entre extensões
                        z: piecePos.z + (extensionBack - extensionFront) / 2 // Ajuste pelo desbalanceamento entre extensões
                    };
                    cappingName = 'Tamponamento Lateral Dir.';
                    break;

                case PieceType.LATERAL_FRONT:
                    // Tamponamento na face frontal (Z negativo) - estendido para cobrir gaps
                    cappingDimensions = { 
                        width: pieceDims.width + extensionLeft + extensionRight,  // Extensões personalizadas
                        height: pieceDims.height + extensionTop + extensionBottom, // Extensões personalizadas
                        depth: cappingThickness 
                    };
                    cappingPosition = { 
                        x: piecePos.x + (extensionRight - extensionLeft) / 2, // Ajuste pelo desbalanceamento entre extensões
                        y: piecePos.y + (extensionTop - extensionBottom) / 2, // Ajuste pelo desbalanceamento entre extensões
                        z: piecePos.z - pieceDims.depth / 2 - cappingThickness / 2 - 0.1 // Posicionamento na face FRONTAL (Z negativo)
                    };
                    cappingName = 'Tamponamento Frontal';
                    break;

                case PieceType.LATERAL_BACK:
                    // Tamponamento na face traseira (Z positivo) - estendido para cobrir gaps
                    cappingDimensions = { 
                        width: pieceDims.width + extensionLeft + extensionRight,  // Extensões personalizadas
                        height: pieceDims.height + extensionTop + extensionBottom, // Extensões personalizadas
                        depth: cappingThickness 
                    };
                    cappingPosition = { 
                        x: piecePos.x + (extensionRight - extensionLeft) / 2, // Ajuste pelo desbalanceamento entre extensões
                        y: piecePos.y + (extensionTop - extensionBottom) / 2, // Ajuste pelo desbalanceamento entre extensões
                        z: piecePos.z + pieceDims.depth / 2 + cappingThickness / 2 + 0.1 // Posicionamento na face TRASEIRA (Z positivo)
                    };
                    cappingName = 'Tamponamento Traseiro';
                    break;

                case PieceType.TOP:
                    // Tamponamento na face superior - estendido para cobrir gaps
                    cappingDimensions = { 
                        width: pieceDims.width + extensionLeft + extensionRight,  // Extensões personalizadas
                        height: cappingThickness, 
                        depth: pieceDims.depth + extensionFront + extensionBack   // Extensões personalizadas
                    };
                    cappingPosition = { 
                        x: piecePos.x + (extensionRight - extensionLeft) / 2, // Ajuste pelo desbalanceamento entre extensões
                        y: piecePos.y + pieceDims.height / 2 + cappingThickness / 2 + 0.1, // Pequeno ajuste para ficar bem na face externa
                        z: piecePos.z + (extensionBack - extensionFront) / 2 // Ajuste pelo desbalanceamento entre extensões
                    };
                    cappingName = 'Tamponamento Superior';
                    break;

                case PieceType.BOTTOM:
                    // Tamponamento na face inferior - estendido para cobrir gaps
                    cappingDimensions = { 
                        width: pieceDims.width + extensionLeft + extensionRight,  // Extensões personalizadas
                        height: cappingThickness, 
                        depth: pieceDims.depth + extensionFront + extensionBack   // Extensões personalizadas
                    };
                    cappingPosition = { 
                        x: piecePos.x + (extensionRight - extensionLeft) / 2, // Ajuste pelo desbalanceamento entre extensões
                        y: piecePos.y - pieceDims.height / 2 - cappingThickness / 2 - 0.1, // Pequeno ajuste para ficar bem na face externa
                        z: piecePos.z + (extensionBack - extensionFront) / 2 // Ajuste pelo desbalanceamento entre extensões
                    };
                    cappingName = 'Tamponamento Inferior';
                    break;

                case PieceType.SHELF:
                    // Tamponamento na face superior da prateleira - estendido para cobrir gaps
                    cappingDimensions = { 
                        width: pieceDims.width + extensionLeft + extensionRight,  // Extensões personalizadas
                        height: cappingThickness, 
                        depth: pieceDims.depth + extensionFront + extensionBack   // Extensões personalizadas
                    };
                    cappingPosition = { 
                        x: piecePos.x + (extensionRight - extensionLeft) / 2, // Ajuste pelo desbalanceamento entre extensões
                        y: piecePos.y + pieceDims.height / 2 + cappingThickness / 2 + 0.1, // Pequeno ajuste para ficar bem na face externa
                        z: piecePos.z + (extensionBack - extensionFront) / 2 // Ajuste pelo desbalanceamento entre extensões
                    };
                    cappingName = 'Tamponamento Prateleira';
                    break;

                default:
                    // Para outros tipos de peça, não criar tamponamento
                    return [];
            }

            const cappingPiece: FurniturePiece = {
                id: `${generatorPiece.id}_capping`,
                type: PieceType.CAPPING,
                name: cappingName,
                thickness: cappingThickness,
                color: PIECE_CONFIG[PieceType.CAPPING].color,
                position: cappingPosition,
                dimensions: cappingDimensions,
                parentSpaceId: generatorPiece.parentSpaceId,
                holes: [], // Inicializar array de furos
            };

            // Implementar lógica de furação para tamponamento
            if (dowelOptions) {
                const { diameter, depth, edgeOffset } = dowelOptions;
                
                // Inicializar array de furos para a peça base se não existir
                if (!basePieceHoles.has(generatorPiece.id)) {
                    basePieceHoles.set(generatorPiece.id, []);
                }
                const baseHoles = basePieceHoles.get(generatorPiece.id)!;

                // Criar 4 furos em forma de cubo (retângulo) na face
                // Calcular as dimensões da face para posicionar os furos
                let faceWidth: number, faceHeight: number;
                let baseFaceDirection: 'up' | 'down' | 'left' | 'right' | 'front' | 'back';
                let cappingFaceDirection: 'up' | 'down' | 'left' | 'right' | 'front' | 'back';

                switch (pieceType) {
                    case PieceType.LATERAL_LEFT:
                        faceWidth = pieceDims.depth;
                        faceHeight = pieceDims.height;
                        baseFaceDirection = 'left';
                        cappingFaceDirection = 'right';
                        break;
                    case PieceType.LATERAL_RIGHT:
                        faceWidth = pieceDims.depth;
                        faceHeight = pieceDims.height;
                        baseFaceDirection = 'right';
                        cappingFaceDirection = 'left';
                        break;
                    case PieceType.LATERAL_FRONT:
                        faceWidth = pieceDims.width;
                        faceHeight = pieceDims.height;
                        baseFaceDirection = 'back'; // FRONTAL está em Z- (frente do móvel)
                        cappingFaceDirection = 'front';
                        break;
                    case PieceType.LATERAL_BACK:
                        faceWidth = pieceDims.width;
                        faceHeight = pieceDims.height;
                        baseFaceDirection = 'front'; // BACK está em Z+ (costas do móvel)
                        cappingFaceDirection = 'back';
                        break;
                    case PieceType.TOP:
                        faceWidth = pieceDims.width;
                        faceHeight = pieceDims.depth;
                        baseFaceDirection = 'up';
                        cappingFaceDirection = 'down';
                        break;
                    case PieceType.BOTTOM:
                    case PieceType.SHELF:
                        faceWidth = pieceDims.width;
                        faceHeight = pieceDims.depth;
                        baseFaceDirection = 'down';
                        cappingFaceDirection = 'up';
                        break;
                    default:
                        return [cappingPiece];
                }

                // Calcular posições dos 4 furos em forma de retângulo
                const availableWidth = faceWidth - (edgeOffset * 2);
                const availableHeight = faceHeight - (edgeOffset * 2);
                
                // Posições dos furos: canto superior esquerdo, superior direito, inferior esquerdo, inferior direito
                const holePositions = [
                    { x: -availableWidth / 2, y: availableHeight / 2 },   // Superior esquerdo
                    { x: availableWidth / 2, y: availableHeight / 2 },    // Superior direito
                    { x: -availableWidth / 2, y: -availableHeight / 2 },  // Inferior esquerdo
                    { x: availableWidth / 2, y: -availableHeight / 2 },   // Inferior direito
                ];

                holePositions.forEach((holePos) => {
                    // Posição do furo na peça de tamponamento (relativa ao centro)
                    let cappingHolePos: Position = { x: 0, y: 0, z: 0 };
                    // Posição do furo na peça base (relativa ao centro)
                    let baseHolePos: Position = { x: 0, y: 0, z: 0 };

                    switch (pieceType) {
                        case PieceType.LATERAL_LEFT:
                            cappingHolePos = { x: 0, y: holePos.y, z: holePos.x };
                            baseHolePos = { x: -pieceDims.width / 2, y: holePos.y, z: holePos.x };
                            break;
                        case PieceType.LATERAL_RIGHT:
                            cappingHolePos = { x: 0, y: holePos.y, z: holePos.x };
                            baseHolePos = { x: pieceDims.width / 2, y: holePos.y, z: holePos.x };
                            break;
                        case PieceType.LATERAL_FRONT:
                            cappingHolePos = { x: holePos.x, y: holePos.y, z: 0 };
                            baseHolePos = { x: holePos.x, y: holePos.y, z: pieceDims.depth / 2 };
                            break;
                        case PieceType.LATERAL_BACK:
                            cappingHolePos = { x: holePos.x, y: holePos.y, z: 0 };
                            baseHolePos = { x: holePos.x, y: holePos.y, z: -pieceDims.depth / 2 };
                            break;
                        case PieceType.TOP:
                            cappingHolePos = { x: holePos.x, y: 0, z: holePos.y };
                            baseHolePos = { x: holePos.x, y: pieceDims.height / 2, z: holePos.y };
                            break;
                        case PieceType.BOTTOM:
                        case PieceType.SHELF:
                            cappingHolePos = { x: holePos.x, y: 0, z: holePos.y };
                            baseHolePos = { x: holePos.x, y: -pieceDims.height / 2, z: holePos.y };
                            break;
                    }

                    // Adicionar furo na peça de tamponamento
                    cappingPiece.holes!.push({
                        id: uuidv4(),
                        position: cappingHolePos,
                        diameter,
                        depth: depth / 2, // Metade da profundidade para cada peça
                        direction: cappingFaceDirection
                    });

                    // Adicionar furo correspondente na peça base
                    baseHoles.push({
                        id: uuidv4(),
                        position: baseHolePos,
                        diameter,
                        depth: depth / 2, // Metade da profundidade para cada peça
                        direction: baseFaceDirection
                    });
                });
            }

            return [cappingPiece];
        };

        const generateRipas = (generatorPiece: FurniturePiece): FurniturePiece[] => {
            if (!generatorPiece.isSlattedGenerator || !generatorPiece.slattedConfig) return [];
            const { dimensions: pieceDims, position: piecePos, slattedConfig, type: pieceType } = generatorPiece;
            const { direction, calculationMode, width } = slattedConfig;
            const ripWidth = width || 30;
            const ripDepth = 15;
            const isFlatPiece = [PieceType.BOTTOM, PieceType.TOP, PieceType.SHELF].includes(pieceType);
            let availableSpace: number, slatLength: number;
            if (isFlatPiece) {
                availableSpace = direction === 'vertical' ? pieceDims.width : pieceDims.depth;
                slatLength = direction === 'vertical' ? pieceDims.depth : pieceDims.width;
            } else {
                // Para peças em pé (laterais, frente, costas)
                if (direction === 'vertical') {
                    // Ripas verticais: o comprimento é a altura da peça.
                    slatLength = pieceDims.height;
                    // O espaço disponível para distribuir as ripas depende da peça:
                    // - Nas laterais, as ripas se espalham pela profundidade.
                    // - Na frente/costas, as ripas se espalham pela largura.
                    availableSpace = (pieceType === PieceType.LATERAL_LEFT || pieceType === PieceType.LATERAL_RIGHT) 
                        ? pieceDims.depth 
                        : pieceDims.width;
                } else { // horizontal
                    // Ripas horizontais: o comprimento é a largura ou profundidade.
                    // O espaço para distribuir é sempre a altura.
                    availableSpace = pieceDims.height;
                    slatLength = (pieceType === PieceType.LATERAL_LEFT || pieceType === PieceType.LATERAL_RIGHT)
                        ? pieceDims.depth
                        : pieceDims.width;
                }
            }
            if (availableSpace <= 0) return [];
            let finalRipCount: number;
            if (calculationMode === 'count') {
                finalRipCount = Math.max(1, slattedConfig.count || 1);
            } else {
                const targetSpacing = slattedConfig.spacing || 50;
                const unitWidth = ripWidth + targetSpacing;
                finalRipCount = Math.max(1, Math.floor((availableSpace + targetSpacing) / unitWidth));
            }
            const totalSlatsWidth = finalRipCount * ripWidth;
            const finalSpacing = finalRipCount > 1 ? (availableSpace - totalSlatsWidth) / (finalRipCount - 1) : 0;
            if (finalRipCount <= 0) return [];
            const newRips: FurniturePiece[] = [];
            const startOffset = -availableSpace / 2;
            for (let i = 0; i < finalRipCount; i++) {
                const offset = startOffset + i * (ripWidth + finalSpacing) + ripWidth / 2;
                let position: Position, dimensions: Dimensions;
                if (isFlatPiece) {
                    // Para peças planas (tampo, base, prateleira)
                    const slatPlacementOffset = pieceDims.height / 2 + (ripDepth / 2);
                    position = direction === 'vertical' ? 
                        { x: piecePos.x + offset, y: piecePos.y + slatPlacementOffset, z: piecePos.z } : 
                        { x: piecePos.x, y: piecePos.y + slatPlacementOffset, z: piecePos.z + offset };
                    dimensions = direction === 'vertical' ? 
                        { width: ripWidth, height: ripDepth, depth: slatLength } : 
                        { width: slatLength, height: ripDepth, depth: ripWidth };
                } else {
                    // Para peças verticais (laterais, frente e costas)
                    
                    // Ajuste de posicionamento dependendo do tipo de peça
                    let positionFactor: Position = { x: 0, y: 0, z: 0 };
                    
                    switch(pieceType) {
                        case PieceType.LATERAL_LEFT:
                            // Offset para a face externa da peça
                            positionFactor = { 
                                x: -1, // Face da esquerda (negativo) - ripado fica para fora
                                y: 0,  
                                z: 0
                            };
                            break;
                            
                        case PieceType.LATERAL_RIGHT:
                            // Offset para a face externa da peça
                            positionFactor = { 
                                x: 1, // Face da direita (positivo) - ripado fica para fora
                                y: 0, 
                                z: 0
                            };
                            break;
                            
                        case PieceType.LATERAL_FRONT:
                            // Offset para a face externa da peça frontal
                            positionFactor = { 
                                x: 0,
                                y: 0, 
                                z: -1 // Face frontal (negativo Z) - ripado fica para fora
                            };
                            break;
                            
                        case PieceType.LATERAL_BACK:
                            // Offset para a face externa da peça traseira
                            positionFactor = { 
                                x: 0,
                                y: 0, 
                                z: 1 // Face traseira (positivo Z) - ripado fica para fora
                            };
                            break;
                    }
                    
                    // Calcular a dimensão e posição baseadas no tipo de peça e direção do ripado
                    if (direction === 'vertical') {
                        // Ripas verticais na face da peça
                        if (pieceType === PieceType.LATERAL_LEFT || pieceType === PieceType.LATERAL_RIGHT) {
                            // Para laterais esquerda e direita - ripado para fora
                            const slatPlacementOffset = pieceDims.width / 2;
                            position = { 
                                // Garantindo que o ripado fique para FORA do móvel
                                // O positionFactor.x é -1 para a lateral esquerda ou 1 para a lateral direita
                                x: piecePos.x + (positionFactor.x * (slatPlacementOffset + ripDepth/2)),
                                y: piecePos.y, 
                                z: piecePos.z + offset  // Offset ao longo do eixo Z (profundidade)
                            };
                            dimensions = { 
                                width: ripDepth,   // Espessura da ripa no eixo X (fina) 
                                height: pieceDims.height,  // Altura igual à altura da peça
                                depth: ripWidth    // Largura da ripa como profundidade no eixo Z
                            };
                        } else {
                            // Para frente e costas - ripado totalmente para FORA do móvel
                            // Pegamos o centro do ripado e o colocamos na face externa oposta
                            
                            // ATENÇÃO: No sistema de coordenadas, LATERAL_FRONT está em Z- e LATERAL_BACK em Z+
                            let externalFaceZ: number;
                            
                            if (pieceType === PieceType.LATERAL_FRONT) {
                                // Pegamos a posição mínima em Z (face frontal - Z negativo)
                                externalFaceZ = piecePos.z - (pieceDims.depth/2);
                                // Centramos o ripado na face externa, para frente
                                externalFaceZ = externalFaceZ - (ripDepth/2);
                            } else {
                                // Pegamos a posição máxima em Z (face traseira - Z positivo)
                                externalFaceZ = piecePos.z + (pieceDims.depth/2);
                                // Centramos o ripado na face externa, para trás
                                externalFaceZ = externalFaceZ + (ripDepth/2);
                            }
                            
                            position = {
                                x: piecePos.x + offset, // Offset ao longo do eixo X (largura)
                                y: piecePos.y,
                                z: externalFaceZ // Centralizado na face externa
                            };
                            
                            dimensions = {
                                width: ripWidth,    // Largura da ripa no eixo X
                                height: pieceDims.height,  // Altura igual à altura da peça
                                depth: ripDepth    // Espessura da ripa no eixo Z
                            };
                        }
                    } else {
                        // Ripas horizontais na face da peça
                        if (pieceType === PieceType.LATERAL_LEFT || pieceType === PieceType.LATERAL_RIGHT) {
                            // Para laterais esquerda e direita - ripado para fora
                            const slatPlacementOffset = pieceDims.width / 2;
                            position = { 
                                // Garantindo que o ripado fique para FORA do móvel
                                // O positionFactor.x é -1 para a lateral esquerda ou 1 para a lateral direita
                                x: piecePos.x + (positionFactor.x * (slatPlacementOffset + ripDepth/2)),
                                y: piecePos.y + offset,  // Offset vertical no eixo Y
                                z: piecePos.z  // Centralizada no eixo Z
                            };
                            dimensions = { 
                                width: ripDepth,   // Espessura da ripa no eixo X
                                height: ripWidth,  // Largura da ripa como altura no eixo Y
                                depth: pieceDims.depth // Profundidade igual à da peça
                            };
                        } else {
                            // Para frente e costas - ripado totalmente para FORA do móvel
                            // Mesma lógica das ripas verticais, mas para ripas horizontais
                            
                            // Atenção: LATERAL_FRONT está na face negativa Z e LATERAL_BACK na face positiva Z
                            let externalFaceZ: number;
                            
                            if (pieceType === PieceType.LATERAL_FRONT) {
                                // Pegamos a posição mínima em Z (face frontal)
                                externalFaceZ = piecePos.z - (pieceDims.depth/2);
                                // Centramos o ripado na face externa, para frente
                                externalFaceZ = externalFaceZ - (ripDepth/2);
                            } else {
                                // Pegamos a posição máxima em Z (face traseira)
                                externalFaceZ = piecePos.z + (pieceDims.depth/2);
                                // Centramos o ripado na face externa, para trás
                                externalFaceZ = externalFaceZ + (ripDepth/2);
                            }
                            
                            position = { 
                                x: piecePos.x,  // Centralizada no eixo X
                                y: piecePos.y + offset,  // Offset vertical no eixo Y
                                z: externalFaceZ // Centralizado na face externa
                            };
                            dimensions = { 
                                width: pieceDims.width, // Largura igual à da peça
                                height: ripWidth,       // Largura da ripa como altura no eixo Y
                                depth: ripDepth         // Espessura da ripa no eixo Z
                            };
                        }
                    }
                }
                newRips.push({ id: `${generatorPiece.id}_ripa_${i}`, type: PieceType.RIPA, name: `Ripa ${i + 1}`, thickness: ripDepth, color: PIECE_CONFIG[PieceType.RIPA].color, position, dimensions, parentSpaceId: generatorPiece.parentSpaceId });
            }
            const { dowelOptions } = slattedConfig;
            if (dowelOptions && dowelOptions.countPerSlat > 0) {
                if (!basePieceHoles.has(generatorPiece.id)) basePieceHoles.set(generatorPiece.id, []);
                const baseHoles = basePieceHoles.get(generatorPiece.id)!;
                for (let i = 0; i < finalRipCount; i++) {
                    const slatPiece = newRips[i];
                        slatPiece.holes = [];
                    const { countPerSlat, edgeOffset, diameter, depth } = dowelOptions;
                    for (let j = 0; j < countPerSlat; j++) {
                        const holePosOnSlat = { x: 0, y: 0, z: 0 };
                        const holePosOnBase = { x: slatPiece.position.x - piecePos.x, y: slatPiece.position.y - piecePos.y, z: slatPiece.position.z - piecePos.z };
                        
                        // Ajuste da posição base do furo na peça principal
                        if (isFlatPiece) {
                            holePosOnBase.y = pieceDims.height / 2;
                        } else {
                            // Para peças verticais, ajustamos conforme o tipo da peça
                            // Ajustamos a posição para os furos ficarem na face externa
                            switch(pieceType) {
                                case PieceType.LATERAL_LEFT:
                                    holePosOnBase.x = -pieceDims.width / 2;
                                    break;
                                case PieceType.LATERAL_RIGHT:
                                    holePosOnBase.x = pieceDims.width / 2;
                                    break;
                                case PieceType.LATERAL_FRONT:
                                    holePosOnBase.z = -pieceDims.depth / 2;
                                    break;
                                case PieceType.LATERAL_BACK:
                                    holePosOnBase.z = pieceDims.depth / 2;
                                    break;
                            }
                        }
                        
                        let pos: number;
                        
                        // ===================================================================
                        // CORREÇÃO: Lógica de furação para ripas em peças verticais e horizontais
                        // ===================================================================
                        let longDimension: number;
                        if (isFlatPiece) {
                            longDimension = slatLength;
                        } else {
                            // Ajustado para usar o comprimento correto baseado na nova dimensão das ripas
                            if (pieceType === PieceType.LATERAL_LEFT || pieceType === PieceType.LATERAL_RIGHT) {
                                longDimension = direction === 'vertical' ? 
                                    pieceDims.height :  // Ripas verticais usam altura da peça
                                    pieceDims.depth;    // Ripas horizontais usam profundidade da peça
                            } else {
                                // LATERAL_FRONT ou LATERAL_BACK
                                longDimension = direction === 'vertical' ? 
                                    pieceDims.height :  // Ripas verticais usam altura da peça
                                    pieceDims.width;    // Ripas horizontais usam largura da peça
                            }
                        }

                        const availableLengthForHoles = longDimension - (edgeOffset * 2);
                        if (countPerSlat === 1) pos = 0; else { const t = j / (countPerSlat - 1); pos = -availableLengthForHoles / 2 + (t * availableLengthForHoles); }
                        
                        if (isFlatPiece) {
                            if (direction === "vertical") { holePosOnSlat.z = pos; holePosOnBase.z += pos; } 
                            else { holePosOnSlat.x = pos; holePosOnBase.x += pos; }
                        } else { // Peça em pé
                            if (direction === "vertical") { 
                                // Para ripas verticais
                                holePosOnSlat.y = pos;
                                holePosOnBase.y = pos;
                            }
                            else { 
                                // Para ripas horizontais 
                                // A distribuição dos furos depende do tipo de peça
                                if (pieceType === PieceType.LATERAL_LEFT || pieceType === PieceType.LATERAL_RIGHT) {
                                    // Lateral: furos distribuídos na profundidade (Z)
                                    holePosOnSlat.z = pos; 
                                    holePosOnBase.z = pos;
                                } else {
                                    // Frente/Costas: furos distribuídos na largura (X)
                                    holePosOnSlat.x = pos; 
                                    holePosOnBase.x = pos;
                                }
                            }
                        }                        // Ajustando direções dos furos conforme nova posição das ripas
                        if (isFlatPiece) {
                            // Para peças planas, mantemos a direção original
                            slatPiece.holes.push({ id: uuidv4(), position: holePosOnSlat, diameter, depth: depth / 2, direction: 'down' });
                            baseHoles.push({ id: uuidv4(), position: holePosOnBase, diameter, depth: depth / 2, direction: 'up' });
                        } else {
                            // Para peças verticais, as direções dependem da face
                            switch(pieceType) {
                                case PieceType.LATERAL_LEFT:
                                    slatPiece.holes.push({ id: uuidv4(), position: holePosOnSlat, diameter, depth: depth / 2, direction: 'right' });
                                    baseHoles.push({ id: uuidv4(), position: holePosOnBase, diameter, depth: depth / 2, direction: 'left' });
                                    break;
                                case PieceType.LATERAL_RIGHT:
                                    slatPiece.holes.push({ id: uuidv4(), position: holePosOnSlat, diameter, depth: depth / 2, direction: 'left' });
                                    baseHoles.push({ id: uuidv4(), position: holePosOnBase, diameter, depth: depth / 2, direction: 'right' });
                                    break;
                                case PieceType.LATERAL_FRONT:
                                    slatPiece.holes.push({ id: uuidv4(), position: holePosOnSlat, diameter, depth: depth / 2, direction: 'back' });
                                    baseHoles.push({ id: uuidv4(), position: holePosOnBase, diameter, depth: depth / 2, direction: 'front' });
                                    break;
                                case PieceType.LATERAL_BACK:
                                    slatPiece.holes.push({ id: uuidv4(), position: holePosOnSlat, diameter, depth: depth / 2, direction: 'front' });
                                    baseHoles.push({ id: uuidv4(), position: holePosOnBase, diameter, depth: depth / 2, direction: 'back' });
                                    break;
                            }
                        }
                    }
                }
            }
            return newRips;
        };

        const generateSarrafos = (generatorPiece: FurniturePiece): FurniturePiece[] => {
            if (!generatorPiece.isSarrafoGenerator || !generatorPiece.sarrafoConfig) return [];
            
            const { dimensions: pieceDims, position: piecePos, sarrafoConfig, type: pieceType } = generatorPiece;
            const { 
                mountingType, 
                appearanceType, 
                sarrafoThickness,
                externalThickness,
                sarrafoWidth,
                autoExtend = false,
                extensionAmount = sarrafoThickness, // Padrão baseado na espessura do sarrafo
                extensionTop = 0,
                extensionBottom = 0,
                extensionLeft = 0,
                extensionRight = 0,
                extensionFront = 0,
                extensionBack = 0,
                gapExtension = 0
            } = sarrafoConfig;

            const generatedPieces: FurniturePiece[] = [];

            // Função para calcular extensão baseada no tipo de peça e direção
            const getExtensionForPieceAndDirection = (pieceType: any, direction: 'width' | 'depth' | 'height'): number => {
                // Se extensão automática estiver ativada, usa o valor automático
                if (autoExtend) {
                    return mountingType === 'ambos' ? extensionAmount * 2 : extensionAmount;
                }
                
                // Caso contrário, usa as extensões personalizadas baseadas no tipo de peça
                switch (pieceType) {
                    case PieceType.TOP:
                        if (direction === 'width') 
                            return (extensionLeft || 0) + (extensionRight || 0) + (gapExtension || 0) * 2; // esquerda + direita + gapExtension aplicado em ambos
                        else if (direction === 'depth')
                            return (extensionFront || 0) + (extensionBack || 0) + (gapExtension || 0) * 2; // frente + trás + gapExtension aplicado em ambos
                        else if (direction === 'height')
                            return (extensionTop || 0) + (extensionBottom || 0) + (gapExtension || 0) * 2; // superior + inferior + gapExtension aplicado em ambos
                        break;
                    
                    case PieceType.BOTTOM:
                    case PieceType.SHELF:
                        if (direction === 'width') 
                            return (extensionLeft || 0) + (extensionRight || 0) + (gapExtension || 0) * 2; // esquerda + direita + gapExtension aplicado em ambos
                        else if (direction === 'depth')
                            return (extensionFront || 0) + (extensionBack || 0) + (gapExtension || 0) * 2; // frente + trás + gapExtension aplicado em ambos
                        else if (direction === 'height')
                            return (extensionTop || 0) + (extensionBottom || 0) + (gapExtension || 0) * 2; // superior + inferior + gapExtension aplicado em ambos
                        break;
                    
                    case PieceType.LATERAL_LEFT:
                    case PieceType.LATERAL_RIGHT:
                        if (direction === 'depth') 
                            return (extensionFront || 0) + (extensionBack || 0) + (gapExtension || 0) * 2; // frente + trás + gapExtension aplicado em ambos
                        else if (direction === 'height')
                            return (extensionTop || 0) + (extensionBottom || 0) + (gapExtension || 0) * 2; // superior + inferior + gapExtension aplicado em ambos
                        break;
                    
                    case PieceType.LATERAL_FRONT:
                    case PieceType.LATERAL_BACK:
                        if (direction === 'width') 
                            return (extensionLeft || 0) + (extensionRight || 0) + (gapExtension || 0) * 2; // esquerda + direita + gapExtension aplicado em ambos
                        else if (direction === 'height')
                            return (extensionTop || 0) + (extensionBottom || 0) + (gapExtension || 0) * 2; // superior + inferior + gapExtension aplicado em ambos
                        break;
                    
                    default:
                        return 0;
                }
                return 0;
            };

            // Função para calcular extensão individual para uma direção específica
            const getIndividualExtension = (side: 'top' | 'bottom' | 'left' | 'right' | 'front' | 'back'): number => {
                // Se extensão automática estiver ativada, usa o valor automático
                if (autoExtend) {
                    return extensionAmount;
                }
                
                // Retorna a extensão específica para cada lado
                switch (side) {
                    case 'top': return extensionTop || 0;
                    case 'bottom': return extensionBottom || 0;
                    case 'left': return extensionLeft || 0;
                    case 'right': return extensionRight || 0;
                    case 'front': return extensionFront || 0;
                    case 'back': return extensionBack || 0;
                    default: return 0;
                }
            };

            // Função para criar um sarrafo vertical em uma posição específica
            const createSarrafoAtPosition = (positionOffset: Position, namePrefix: string) => {
                let sarrafoPosition: Position;
                let sarrafoDimensions: Dimensions;
                
                // Sarrafos são sempre verticais (altura da peça)
                const sarrafoHeight = pieceDims.height;
                
                // Calcular extensões individuais para altura
                const topExtension = getIndividualExtension('top');
                const bottomExtension = getIndividualExtension('bottom');
                
                // Calcular extensões individuais para profundidade (frente/trás)
                const frontExtension = getIndividualExtension('front');
                const backExtension = getIndividualExtension('back');
                
                switch (pieceType) {
                    case PieceType.LATERAL_LEFT:
                    case PieceType.LATERAL_RIGHT:
                        sarrafoPosition = {
                            x: piecePos.x + positionOffset.x,
                            y: piecePos.y + (topExtension - bottomExtension) / 2, // Ajustar posição baseado na diferença das extensões
                            z: piecePos.z + positionOffset.z + (frontExtension - backExtension) / 2 // Ajustar posição Z baseado na diferença das extensões frontais/traseiras
                        };
                        sarrafoDimensions = {
                            width: sarrafoThickness,
                            height: sarrafoHeight + topExtension + bottomExtension, // Soma das extensões individuais
                            depth: sarrafoWidth + frontExtension + backExtension // Profundidade com extensões frontais/traseiras
                        };
                        break;
                    case PieceType.LATERAL_FRONT:
                    case PieceType.LATERAL_BACK:
                        // Calcular extensões individuais para largura (esquerda/direita)
                        const leftExtension = getIndividualExtension('left');
                        const rightExtension = getIndividualExtension('right');
                        
                        sarrafoPosition = {
                            x: piecePos.x + positionOffset.x + (leftExtension - rightExtension) / 2, // Ajustar posição X baseado na diferença das extensões
                            y: piecePos.y + (topExtension - bottomExtension) / 2, // Ajustar posição baseado na diferença das extensões
                            z: piecePos.z + positionOffset.z
                        };
                        sarrafoDimensions = {
                            width: sarrafoWidth + leftExtension + rightExtension, // Largura com extensões esquerda/direita
                            height: sarrafoHeight + topExtension + bottomExtension, // Soma das extensões individuais
                            depth: sarrafoThickness
                        };
                        break;
                    case PieceType.TOP:
                    case PieceType.BOTTOM:
                    case PieceType.SHELF:
                        // Para peças horizontais, o sarrafo fica horizontal na borda
                        sarrafoPosition = {
                            x: piecePos.x + positionOffset.x,
                            y: piecePos.y + positionOffset.y,
                            z: piecePos.z + positionOffset.z + (frontExtension - backExtension) / 2 // Ajustar posição Z baseado na diferença das extensões frontais/traseiras
                        };
                        sarrafoDimensions = {
                            width: pieceDims.width + getExtensionForPieceAndDirection(pieceType, 'width'), // Extensão personalizada na largura
                            height: sarrafoThickness,
                            depth: sarrafoWidth + frontExtension + backExtension // Profundidade com extensões frontais/traseiras
                        };
                        break;
                    default:
                        return;
                }

                const sarrafoPiece: FurniturePiece = {
                    id: `${generatorPiece.id}_sarrafo_${namePrefix}`,
                    type: PieceType.SARRAFO,
                    name: `Sarrafo ${namePrefix}`,
                    thickness: sarrafoThickness,
                    color: PIECE_CONFIG[PieceType.SARRAFO].color,
                    position: sarrafoPosition,
                    dimensions: sarrafoDimensions,
                    parentSpaceId: generatorPiece.parentSpaceId,
                    holes: []
                };

                generatedPieces.push(sarrafoPiece);
            };

            // Calcular offsets para posicionar sarrafos rente às bordas DA FACE EXTERNA
            const calculateOffsets = () => {
                let frontalOffset: Position = { x: 0, y: 0, z: 0 };
                let traseiraOffset: Position = { x: 0, y: 0, z: 0 };

                switch (pieceType) {
                    case PieceType.LATERAL_LEFT:
                        // Face externa esquerda: frontal e traseira ficam nas bordas Z da face externa
                        const leftExternalX = -(pieceDims.width/2 + sarrafoThickness/2);
                        frontalOffset = { 
                            x: leftExternalX, 
                            y: 0, 
                            z: (pieceDims.depth/2 - sarrafoWidth/2) // TROCADO: frontal agora fica em Z positivo (trás)
                        };
                        traseiraOffset = { 
                            x: leftExternalX, 
                            y: 0, 
                            z: -(pieceDims.depth/2 - sarrafoWidth/2) // TROCADO: traseira agora fica em Z negativo (frente)
                        };
                        break;
                    case PieceType.LATERAL_RIGHT:
                        // Face externa direita: frontal e traseira ficam nas bordas Z da face externa
                        const rightExternalX = (pieceDims.width/2 + sarrafoThickness/2);
                        frontalOffset = { 
                            x: rightExternalX, 
                            y: 0, 
                            z: (pieceDims.depth/2 - sarrafoWidth/2) // TROCADO: frontal agora fica em Z positivo (trás)
                        };
                        traseiraOffset = { 
                            x: rightExternalX, 
                            y: 0, 
                            z: -(pieceDims.depth/2 - sarrafoWidth/2) // TROCADO: traseira agora fica em Z negativo (frente)
                        };
                        break;
                    case PieceType.LATERAL_FRONT:
                        // Face externa frontal: frontal e traseira ficam nas bordas X da face externa
                        const frontExternalZ = -(pieceDims.depth/2 + sarrafoThickness/2);
                        frontalOffset = { 
                            x: -(pieceDims.width/2 - sarrafoWidth/2), // Borda esquerda da face frontal
                            y: 0, 
                            z: frontExternalZ
                        };
                        traseiraOffset = { 
                            x: (pieceDims.width/2 - sarrafoWidth/2), // Borda direita da face frontal
                            y: 0, 
                            z: frontExternalZ
                        };
                        break;
                    case PieceType.LATERAL_BACK:
                        // Face externa traseira: frontal e traseira ficam nas bordas X da face externa
                        const backExternalZ = (pieceDims.depth/2 + sarrafoThickness/2);
                        frontalOffset = { 
                            x: -(pieceDims.width/2 - sarrafoWidth/2), // Borda esquerda da face traseira
                            y: 0, 
                            z: backExternalZ
                        };
                        traseiraOffset = { 
                            x: (pieceDims.width/2 - sarrafoWidth/2), // Borda direita da face traseira
                            y: 0, 
                            z: backExternalZ
                        };
                        break;
                    case PieceType.TOP:
                        // Face externa superior: frontal e traseira ficam nas bordas Z da face externa
                        const topExternalY = (pieceDims.height/2 + sarrafoThickness/2);
                        frontalOffset = { 
                            x: 0,
                            y: topExternalY, 
                            z: (pieceDims.depth/2 - sarrafoWidth/2) // TROCADO: frontal agora fica em Z positivo (trás)
                        };
                        traseiraOffset = { 
                            x: 0,
                            y: topExternalY, 
                            z: -(pieceDims.depth/2 - sarrafoWidth/2) // TROCADO: traseira agora fica em Z negativo (frente)
                        };
                        break;
                    case PieceType.BOTTOM:
                    case PieceType.SHELF:
                        // Face externa inferior: frontal e traseira ficam nas bordas Z da face externa
                        const bottomExternalY = -(pieceDims.height/2 + sarrafoThickness/2);
                        frontalOffset = { 
                            x: 0,
                            y: bottomExternalY, 
                            z: (pieceDims.depth/2 - sarrafoWidth/2) // TROCADO: frontal agora fica em Z positivo (trás)
                        };
                        traseiraOffset = { 
                            x: 0,
                            y: bottomExternalY, 
                            z: -(pieceDims.depth/2 - sarrafoWidth/2) // TROCADO: traseira agora fica em Z negativo (frente)
                        };
                        break;
                }

                return { frontalOffset, traseiraOffset };
            };

            const { frontalOffset, traseiraOffset } = calculateOffsets();

            // Criar sarrafos baseado no tipo de montagem (sempre 1 sarrafo por posição)
            switch (mountingType) {
                case 'frontal':
                    createSarrafoAtPosition(frontalOffset, 'Frontal');
                    break;
                case 'traseira':
                    createSarrafoAtPosition(traseiraOffset, 'Traseira');
                    break;
                case 'ambos':
                    createSarrafoAtPosition(frontalOffset, 'Frontal');
                    createSarrafoAtPosition(traseiraOffset, 'Traseira');
                    break;
            }

            // Criar peça externa se for aparente
            if (appearanceType === 'aparente') {
                let externalPosition: Position;
                let externalDimensions: Dimensions;

                // Calcular espessura total do tamponamento
                const externalOffset = sarrafoThickness; // Peça externa fica após o sarrafo
                
                // Calcular extensões individuais para altura
                const topExtension = getIndividualExtension('top');
                const bottomExtension = getIndividualExtension('bottom');
                
                // Calcular extensões individuais para profundidade (frente/trás)
                const frontExtension = getIndividualExtension('front');
                const backExtension = getIndividualExtension('back');
                
                // Calcular extensões individuais para largura (esquerda/direita)
                const leftExtension = getIndividualExtension('left');
                const rightExtension = getIndividualExtension('right');

                switch (pieceType) {
                    case PieceType.LATERAL_LEFT:
                        externalPosition = {
                            x: piecePos.x - (pieceDims.width/2 + externalOffset + externalThickness/2),
                            y: piecePos.y + (topExtension - bottomExtension) / 2, // Ajustar posição baseado na diferença das extensões
                            z: piecePos.z + (frontExtension - backExtension) / 2 // Ajustar posição Z baseado na diferença das extensões frontais/traseiras
                        };
                        externalDimensions = {
                            width: externalThickness,
                            height: pieceDims.height + topExtension + bottomExtension, // Soma das extensões individuais
                            depth: pieceDims.depth + frontExtension + backExtension // Profundidade com extensões frontais/traseiras
                        };
                        break;
                    case PieceType.LATERAL_RIGHT:
                        externalPosition = {
                            x: piecePos.x + (pieceDims.width/2 + externalOffset + externalThickness/2),
                            y: piecePos.y + (topExtension - bottomExtension) / 2, // Ajustar posição baseado na diferença das extensões
                            z: piecePos.z + (frontExtension - backExtension) / 2 // Ajustar posição Z baseado na diferença das extensões frontais/traseiras
                        };
                        externalDimensions = {
                            width: externalThickness,
                            height: pieceDims.height + topExtension + bottomExtension, // Soma das extensões individuais
                            depth: pieceDims.depth + frontExtension + backExtension // Profundidade com extensões frontais/traseiras
                        };
                        break;
                    case PieceType.LATERAL_FRONT:
                        externalPosition = {
                            x: piecePos.x + (leftExtension - rightExtension) / 2, // Ajustar posição X baseado na diferença das extensões
                            y: piecePos.y + (topExtension - bottomExtension) / 2, // Ajustar posição baseado na diferença das extensões
                            z: piecePos.z - (pieceDims.depth/2 + externalOffset + externalThickness/2)
                        };
                        externalDimensions = {
                            width: pieceDims.width + leftExtension + rightExtension, // Largura com extensões esquerda/direita
                            height: pieceDims.height + topExtension + bottomExtension, // Soma das extensões individuais
                            depth: externalThickness
                        };
                        break;
                    case PieceType.LATERAL_BACK:
                        externalPosition = {
                            x: piecePos.x + (leftExtension - rightExtension) / 2, // Ajustar posição X baseado na diferença das extensões
                            y: piecePos.y + (topExtension - bottomExtension) / 2, // Ajustar posição baseado na diferença das extensões
                            z: piecePos.z + (pieceDims.depth/2 + externalOffset + externalThickness/2)
                        };
                        externalDimensions = {
                            width: pieceDims.width + leftExtension + rightExtension, // Largura com extensões esquerda/direita
                            height: pieceDims.height + topExtension + bottomExtension, // Soma das extensões individuais
                            depth: externalThickness
                        };
                        break;
                    case PieceType.TOP:
                        externalPosition = {
                            x: piecePos.x,
                            y: piecePos.y + (pieceDims.height/2 + externalOffset + externalThickness/2),
                            z: piecePos.z + (frontExtension - backExtension) / 2 // Ajustar posição Z baseado na diferença das extensões frontais/traseiras
                        };
                        externalDimensions = {
                            width: pieceDims.width + getExtensionForPieceAndDirection(pieceType, 'width'),
                            height: externalThickness,
                            depth: pieceDims.depth + frontExtension + backExtension // Profundidade com extensões frontais/traseiras
                        };
                        break;
                    case PieceType.BOTTOM:
                    case PieceType.SHELF:
                        externalPosition = {
                            x: piecePos.x,
                            y: piecePos.y - (pieceDims.height/2 + externalOffset + externalThickness/2),
                            z: piecePos.z + (frontExtension - backExtension) / 2 // Ajustar posição Z baseado na diferença das extensões frontais/traseiras
                        };
                        externalDimensions = {
                            width: pieceDims.width + getExtensionForPieceAndDirection(pieceType, 'width'),
                            height: externalThickness,
                            depth: pieceDims.depth + frontExtension + backExtension // Profundidade com extensões frontais/traseiras
                        };
                        break;
                    default:
                        return generatedPieces;
                }

                const externalPiece: FurniturePiece = {
                    id: `${generatorPiece.id}_external`,
                    type: PieceType.EXTERNAL_PIECE,
                    name: `Peça Externa (${externalThickness}mm)`,
                    thickness: externalThickness,
                    color: PIECE_CONFIG[PieceType.EXTERNAL_PIECE].color,
                    position: externalPosition,
                    dimensions: externalDimensions,
                    parentSpaceId: generatorPiece.parentSpaceId,
                    holes: []
                };

                generatedPieces.push(externalPiece);
            }

            return generatedPieces;
        };

        const buildTree = (space: FurnitureSpace): FurnitureSpace => {
            let currentVoid = { ...space, subSpaces: [] as FurnitureSpace[], pieces: [] };
            const piecesForThisSpace = allPieces.filter(p => p.parentSpaceId === space.id);
            const structuralPieces = piecesForThisSpace.filter(p => ![PieceType.SHELF, PieceType.DIVIDER_VERTICAL].includes(p.type));
            structuralPieces.forEach(piece => {
                const positionedPiece = { ...piece, position: SpaceCuttingSystem.calculatePiecePosition(currentVoid, piece), dimensions: SpaceCuttingSystem.calculatePieceDimensions(currentVoid, piece.type, piece.thickness) };
                if (piece.isSlattedGenerator) { 
                    positionedPieces.push(positionedPiece); 
                    positionedPieces.push(...generateRipas(positionedPiece)); 
                } else if (piece.isCappingGenerator) {
                    positionedPieces.push(positionedPiece);
                    positionedPieces.push(...generateCapping(positionedPiece));
                } else if (piece.isSarrafoGenerator) {
                    positionedPieces.push(positionedPiece);
                    positionedPieces.push(...generateSarrafos(positionedPiece));
                }
                else { positionedPieces.push(positionedPiece); }
                // @ts-ignore - Ignorando erro de tipo com subSpaces
                currentVoid = SpaceCuttingSystem.applyCutToSpace(currentVoid, piece);
            });
            const verticalDividers = piecesForThisSpace.filter(p => p.type === PieceType.DIVIDER_VERTICAL);
            const shelves = piecesForThisSpace.filter(p => p.type === PieceType.SHELF);
            if (verticalDividers.length > 0) {
                const positionedDividers = verticalDividers.map(div => {
                    const positioned = { ...div, position: SpaceCuttingSystem.calculatePiecePosition(currentVoid, div), dimensions: SpaceCuttingSystem.calculatePieceDimensions(currentVoid, div.type, div.thickness) };
                    positionedPieces.push(positioned);
                    return positioned;
                });
                const subSpaces = SpaceCuttingSystem.divideSpaceByMultiple(currentVoid, positionedDividers, 'vertical');
                currentVoid.isActive = false;
                currentVoid.subSpaces = subSpaces.map(sub => buildTree(sub));
                return currentVoid;
            }
            if (shelves.length > 0) {
                const positionedShelves = shelves.map(shelf => {
                    const positioned = { ...shelf, position: SpaceCuttingSystem.calculatePiecePosition(currentVoid, shelf), dimensions: SpaceCuttingSystem.calculatePieceDimensions(currentVoid, shelf.type, shelf.thickness) };
                    positionedPieces.push(positioned);
                    return positioned;
                });
                const subSpaces = SpaceCuttingSystem.divideSpaceByMultiple(currentVoid, positionedShelves, 'horizontal');
                currentVoid.isActive = false;
                currentVoid.subSpaces = subSpaces.map(sub => buildTree(sub));
                return currentVoid;
            }
            return currentVoid;
        };

        const rootSpace: FurnitureSpace = { ...mainSpaceInfo, currentDimensions: mainSpaceInfo.originalDimensions, position: { x: 0, y: 0, z: 0 }, pieces: [], isActive: true };
        const spaceTree = buildTree(rootSpace);
        positionedPieces.forEach(p => { if (basePieceHoles.has(p.id)) { p.holes = [...(p.holes || []), ...basePieceHoles.get(p.id)!]; } });
        const collectActiveSpaces = (s: FurnitureSpace): FurnitureSpace[] => {
            if (!s.isActive && s.subSpaces && s.subSpaces.length > 0) return s.subSpaces.flatMap(collectActiveSpaces);
            return s.isActive ? [s] : [];
        };
        return { space: spaceTree, activeSpaces: collectActiveSpaces(spaceTree), renderedPieces: positionedPieces };
    }, [allPieces, mainSpaceInfo]);

    const getSelectedSpace = useCallback((): FurnitureSpace | null => {
        const find = (s: FurnitureSpace, id: string): FurnitureSpace | null => {
            if (s.id === id) return s;
            if (s.subSpaces) { for (const sub of s.subSpaces) { const found = find(sub, id); if (found) return found; } }
            return null;
        }
        if (!selectedSpaceId) return memoizedState.activeSpaces[0] || null;
        const selected = find(memoizedState.space, selectedSpaceId);
        return selected && selected.isActive ? selected : memoizedState.activeSpaces[0] || null;
    }, [selectedSpaceId, memoizedState.space, memoizedState.activeSpaces]);

    const addPiece = useCallback((pieceType: PieceType) => {
        const targetSpace = getSelectedSpace();
        if (!targetSpace) { console.warn("Nenhum espaço ativo selecionado."); return; };
        const config = PIECE_CONFIG[pieceType];
        const newPiece: FurniturePiece = { id: uuidv4(), type: pieceType, name: config.name, thickness: defaultThickness, color: config.color, position: { x: 0, y: 0, z: 0 }, dimensions: { width: 0, height: 0, depth: 0 }, parentSpaceId: targetSpace.id };
        setAllPieces(prev => [...prev, newPiece]);
    }, [getSelectedSpace, defaultThickness]);

    const removePiece = useCallback((pieceId: string) => {
        setAllPieces(prev => prev.filter(p => p.id !== pieceId && !p.id.startsWith(`${pieceId}_`)));
    }, []);

    const updateDimensions = useCallback((newDimensions: Dimensions) => {
        setMainSpaceInfo(prev => ({ ...prev, originalDimensions: newDimensions }));
    }, []);

    const clearAllPieces = useCallback(() => { setAllPieces([]); setSelectedSpaceId('main'); }, []);
    
    const createRipasFromPiece = useCallback((pieceId: string, config: SlattedPanelConfig) => {
        setAllPieces(prev => 
            prev.map(p => {
                if (p.id === pieceId) {
                    const baseName = p.name.startsWith('Painel Ripado (') ? p.name.match(/\(([^)]+)\)/)?.[1] || p.name : p.name;
                    return { ...p, name: `Painel Ripado (${baseName})`, isSlattedGenerator: true, slattedConfig: config };
                }
                return p;
            })
        );
    }, []);

    const createCappingFromPiece = useCallback((pieceId: string, config: CappingConfig) => {
        setAllPieces(prev =>
            prev.map(p => {
                if (p.id === pieceId) {
                    return { ...p, isCappingGenerator: true, cappingConfig: config };
                }
                return p;
            })
        );
    }, []);

    const removeCappingFromPiece = useCallback((pieceId: string) => {
        setAllPieces(prev => {
            // Remove as peças de tamponamento geradas por esta peça
            const filteredPieces = prev.filter(p => !p.id.startsWith(`${pieceId}_capping`));
            
            // Remove a configuração de tamponamento da peça original
            return filteredPieces.map(p => {
                if (p.id === pieceId) {
                    const { isCappingGenerator, cappingConfig, holes, ...rest } = p;
                    // Remove também os furos relacionados ao tamponamento
                    return { 
                        ...rest, 
                        holes: holes?.filter(hole => !hole.id.includes('capping')) || []
                    };
                }
                return p;
            });
        });
    }, []);

    const createSarrafoFromPiece = useCallback((pieceId: string, config: SarrafoConfig) => {
        setAllPieces(prev =>
            prev.map(p => {
                if (p.id === pieceId) {
                    const baseName = p.name.includes('Tamponamento') ? p.name.replace(' Tamponamento', '') : p.name;
                    return { 
                        ...p, 
                        name: `${baseName} Tamponamento`, 
                        isSarrafoGenerator: true, 
                        sarrafoConfig: config 
                    };
                }
                return p;
            })
        );
    }, []);

    const removeSarrafoFromPiece = useCallback((pieceId: string) => {
        setAllPieces(prev => {
            // Remove as peças de sarrafos e peça externa geradas por esta peça
            const filteredPieces = prev.filter(p => 
                !p.id.startsWith(`${pieceId}_sarrafo_`) && 
                !p.id.startsWith(`${pieceId}_external`)
            );
            
            // Remove a configuração de sarrafos da peça original
            return filteredPieces.map(p => {
                if (p.id === pieceId) {
                    const { isSarrafoGenerator, sarrafoConfig, ...rest } = p;
                    // Restaura o nome original removendo "Tamponamento"
                    const originalName = p.name.includes('Tamponamento') 
                        ? p.name.replace(' Tamponamento', '') 
                        : p.name;
                    
                    return { 
                        ...rest, 
                        name: originalName
                    };
                }
                return p;
            });
        });
    }, []);

    // Garante que space nunca é undefined e sempre tem as propriedades necessárias
    const safeSpace = memoizedState.space || {
        id: 'main',
        name: 'Móvel Principal',
        originalDimensions: { width: 800, height: 2100, depth: 600 },
        currentDimensions: { width: 800, height: 2100, depth: 600 },
        position: { x: 0, y: 0, z: 0 },
        pieces: [],
        subSpaces: [],
        isActive: true,
    };

    return {
        space: safeSpace,
        activeSpaces: memoizedState.activeSpaces || [],
        allPieces,
        renderedPieces: memoizedState.renderedPieces || [],
        addPiece,
        removePiece,
        updateDimensions,
        clearAllPieces,
        selectedSpaceId,
        selectSpace: setSelectedSpaceId,
        insertionContext,
        setInsertionMode: useCallback((mode: InsertionMode) => setInsertionContext({ mode }), []),
        defaultThickness,
        setDefaultThickness,
        currentTexture,
        setCurrentTexture,
        availableTextures,
        createRipasFromPiece,
        createCappingFromPiece,
        removeCappingFromPiece,
        createSarrafoFromPiece,
        removeSarrafoFromPiece,
    };
};