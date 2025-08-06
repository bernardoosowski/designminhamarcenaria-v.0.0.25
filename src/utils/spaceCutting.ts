import { Dimensions, Position, FurniturePiece, FurnitureSpace, PieceType } from '../types/furniture';

export class SpaceCuttingSystem {

  static calculatePiecePosition(space: FurnitureSpace, piece: FurniturePiece): Position {
    const { type, thickness } = piece;
    const { currentDimensions: spaceDims, position: spacePos } = space;

    const isInternalPiece = [PieceType.SHELF, PieceType.DIVIDER_VERTICAL].includes(type);

    if (isInternalPiece) {
      // Peças internas são posicionadas no centro do espaço que ocupam
      return { ...spacePos };
    }

    // Peças Estruturais
    let piecePosition: Position = { ...spacePos };
    switch (type) {
      case PieceType.LATERAL_LEFT:
        piecePosition.x = spacePos.x - spaceDims.width / 2 + thickness / 2;
        break;
      case PieceType.LATERAL_RIGHT:
        piecePosition.x = spacePos.x + spaceDims.width / 2 - thickness / 2;
        break;
      case PieceType.BOTTOM:
        piecePosition.y = spacePos.y - spaceDims.height / 2 + thickness / 2;
        break;
      case PieceType.TOP:
        piecePosition.y = spacePos.y + spaceDims.height / 2 - thickness / 2;
        break;
      case PieceType.LATERAL_BACK:
        piecePosition.z = spacePos.z + spaceDims.depth / 2 - thickness / 2;
        break;
      case PieceType.LATERAL_FRONT:
        piecePosition.z = spacePos.z - spaceDims.depth / 2 + thickness / 2;
        break;
    }
    return piecePosition;
  }

  static calculatePieceDimensions(space: FurnitureSpace, pieceType: PieceType, thickness: number): Dimensions {
    const { currentDimensions } = space;
    switch (pieceType) {
      case PieceType.LATERAL_LEFT:
      case PieceType.LATERAL_RIGHT:
        return { width: thickness, height: currentDimensions.height, depth: currentDimensions.depth };
      case PieceType.LATERAL_BACK:
      case PieceType.LATERAL_FRONT:
        return { width: currentDimensions.width, height: currentDimensions.height, depth: thickness };
      case PieceType.BOTTOM:
      case PieceType.TOP:
        return { width: currentDimensions.width, height: thickness, depth: currentDimensions.depth };
      case PieceType.SHELF:
        return { width: currentDimensions.width, height: thickness, depth: currentDimensions.depth };
      case PieceType.DIVIDER_VERTICAL:
        return { width: thickness, height: currentDimensions.height, depth: currentDimensions.depth };
      default:
        return { width: 0, height: 0, depth: 0 };
    }
  }

  static applyCutToSpace(space: FurnitureSpace, piece: FurniturePiece): FurnitureSpace {
    const { type, thickness } = piece;
    const newDims = { ...space.currentDimensions };
    const newPos = { ...space.position };

    switch (type) {
      case PieceType.LATERAL_LEFT:
        newDims.width -= thickness;
        newPos.x += thickness / 2;
        break;
      case PieceType.LATERAL_RIGHT:
        newDims.width -= thickness;
        newPos.x -= thickness / 2;
        break;
      case PieceType.BOTTOM:
        newDims.height -= thickness;
        newPos.y += thickness / 2;
        break;
      case PieceType.TOP:
        newDims.height -= thickness;
        newPos.y -= thickness / 2;
        break;
      case PieceType.LATERAL_BACK:
        newDims.depth -= thickness;
        newPos.z -= thickness / 2;
        break;
      case PieceType.LATERAL_FRONT:
        newDims.depth -= thickness;
        newPos.z += thickness / 2;
        break;
    }
    return { ...space, currentDimensions: newDims, position: newPos };
  }

  static divideSpace(space: FurnitureSpace, piece: FurniturePiece): FurnitureSpace[] {
    const { type, thickness } = piece;
    const { currentDimensions: dims, position: pos } = space;

    if (type === PieceType.SHELF) {
      const remHeight = dims.height - thickness;
      if (remHeight < 1) return [];
      const h = remHeight / 2;
      const space1: FurnitureSpace = {
        id: `${space.id}_bottom`, name: `${space.name} Inferior`,
        originalDimensions: { ...dims, height: h }, currentDimensions: { ...dims, height: h },
        position: { x: pos.x, y: pos.y - h / 2 - thickness / 2, z: pos.z },
        pieces: [], parentSpaceId: space.id, isActive: true
      };
      const space2: FurnitureSpace = {
        id: `${space.id}_top`, name: `${space.name} Superior`,
        originalDimensions: { ...dims, height: h }, currentDimensions: { ...dims, height: h },
        position: { x: pos.x, y: pos.y + h / 2 + thickness / 2, z: pos.z },
        pieces: [], parentSpaceId: space.id, isActive: true
      };
      return [space1, space2];
    }

    if (type === PieceType.DIVIDER_VERTICAL) {
      const remWidth = dims.width - thickness;
      if (remWidth < 1) return [];
      const w = remWidth / 2;
      const space1: FurnitureSpace = {
        id: `${space.id}_left`, name: `${space.name} Esquerda`,
        originalDimensions: { ...dims, width: w }, currentDimensions: { ...dims, width: w },
        position: { x: pos.x - w / 2 - thickness / 2, y: pos.y, z: pos.z },
        pieces: [], parentSpaceId: space.id, isActive: true
      };
      const space2: FurnitureSpace = {
        id: `${space.id}_right`, name: `${space.name} Direita`,
        originalDimensions: { ...dims, width: w }, currentDimensions: { ...dims, width: w },
        position: { x: pos.x + w / 2 + thickness / 2, y: pos.y, z: pos.z },
        pieces: [], parentSpaceId: space.id, isActive: true
      };
      return [space1, space2];
    }
    return [];
  }

  // ===================================================================
  // FUNÇÃO NOVA: Adicione esta função à sua classe
  // ===================================================================
  static divideSpaceByMultiple(space: FurnitureSpace, dividers: FurniturePiece[], direction: 'vertical' | 'horizontal'): FurnitureSpace[] {
    const sortedDividers = [...dividers].sort((a, b) => 
        direction === 'vertical' 
            ? a.position.x - b.position.x 
            : a.position.y - b.position.y
    );
    
    const subspaces: FurnitureSpace[] = [];
    let start, end, size, center;

    if (direction === 'vertical') {
        start = space.position.x - space.currentDimensions.width / 2;
        for (let i = 0; i < sortedDividers.length; i++) {
            const div = sortedDividers[i];
            end = div.position.x - div.thickness / 2;
            size = end - start;
            if (size > 1) {
                center = start + size / 2;
                subspaces.push({
                    id: `${space.id}_vsub_${i}`, name: `${space.name} VSub ${i+1}`,
                    originalDimensions: { ...space.currentDimensions, width: size },
                    currentDimensions: { ...space.currentDimensions, width: size },
                    position: { x: center, y: space.position.y, z: space.position.z },
                    pieces: [], parentSpaceId: space.id, isActive: true
                });
            }
            start = div.position.x + div.thickness / 2;
        }
        end = space.position.x + space.currentDimensions.width / 2;
        size = end - start;
        if (size > 1) {
            center = start + size / 2;
            subspaces.push({
                id: `${space.id}_vsub_${sortedDividers.length}`, name: `${space.name} VSub ${sortedDividers.length+1}`,
                originalDimensions: { ...space.currentDimensions, width: size },
                currentDimensions: { ...space.currentDimensions, width: size },
                position: { x: center, y: space.position.y, z: space.position.z },
                pieces: [], parentSpaceId: space.id, isActive: true
            });
        }
    } else { // horizontal
        start = space.position.y - space.currentDimensions.height / 2;
        for (let i = 0; i < sortedDividers.length; i++) {
            const div = sortedDividers[i];
            end = div.position.y - div.thickness / 2;
            size = end - start;
            if (size > 1) {
                center = start + size / 2;
                subspaces.push({
                    id: `${space.id}_hsub_${i}`, name: `${space.name} HSub ${i+1}`,
                    originalDimensions: { ...space.currentDimensions, height: size },
                    currentDimensions: { ...space.currentDimensions, height: size },
                    position: { x: space.position.x, y: center, z: space.position.z },
                    pieces: [], parentSpaceId: space.id, isActive: true
                });
            }
            start = div.position.y + div.thickness / 2;
        }
        end = space.position.y + space.currentDimensions.height / 2;
        size = end - start;
        if (size > 1) {
            center = start + size / 2;
            subspaces.push({
                id: `${space.id}_hsub_${sortedDividers.length}`, name: `${space.name} HSub ${sortedDividers.length+1}`,
                originalDimensions: { ...space.currentDimensions, height: size },
                currentDimensions: { ...space.currentDimensions, height: size },
                position: { x: space.position.x, y: center, z: space.position.z },
                pieces: [], parentSpaceId: space.id, isActive: true
            });
        }
    }
    return subspaces;
  }

  // ===================================================================
  // FUNÇÃO NOVA: Adicione esta também
  // ===================================================================
  static isPieceInSpace(piece: FurniturePiece, space: FurnitureSpace, parentVoid: FurnitureSpace): boolean {
    const pPos = this.calculatePiecePosition(parentVoid, piece);
    const sPos = space.position;
    const sDims = space.currentDimensions;

    if (piece.type === PieceType.SHELF) {
      const pTop = pPos.y + piece.thickness / 2;
      const pBottom = pPos.y - piece.thickness / 2;
      const sTop = sPos.y + sDims.height / 2;
      const sBottom = sPos.y - sDims.height / 2;
      return pBottom >= sBottom && pTop <= sTop;
    }
    if (piece.type === PieceType.DIVIDER_VERTICAL) {
      const pRight = pPos.x + piece.thickness / 2;
      const pLeft = pPos.x - piece.thickness / 2;
      const sRight = sPos.x + sDims.width / 2;
      const sLeft = sPos.x - sDims.width / 2;
      return pLeft >= sLeft && pRight <= sRight;
    }
    return false;
  }
}