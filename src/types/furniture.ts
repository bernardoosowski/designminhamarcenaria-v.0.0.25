// NOVO: Interface para as opções de cavilha
export interface DowelOptions {
  diameter: number;
  depth: number;
  countPerSlat: number;
  edgeOffset: number;
}
export interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface SlattedPanelConfig {
  direction: 'horizontal' | 'vertical';
  calculationMode: 'count' | 'spacing';
  spacing?: number;
  count?: number;
  width?: number;
  dowelOptions?: DowelOptions; // NOVO: Adicionar opções de furação
}

export enum PieceType {
  LATERAL_LEFT = 'lateral_left',
  LATERAL_RIGHT = 'lateral_right',
  LATERAL_FRONT = 'lateral_front',
  LATERAL_BACK = 'lateral_back',
  BOTTOM = 'bottom',
  TOP = 'top',
  SHELF = 'shelf',
  DIVIDER_VERTICAL = 'divider_vertical',
  RIPA = 'ripa', // Adicionado para suportar ripas
  CAPPING = 'capping', // Adicionado para suportar tamponamento
  SARRAFO = 'sarrafo', // Adicionado para suportar sarrafos
  EXTERNAL_PIECE = 'external_piece' // Peça externa para móveis aparentes
}

export interface FurniturePiece {
  id: string;
  type: PieceType;
  dimensions: Dimensions;
  position: Position;
  thickness: number;
  color: string;
  name: string;
  parentSpaceId?: string; // Adicionado para ancestralidade de subSpace
  // NOVO: Adicionado array para furos
  holes?: Hole[];

  // ===================================================================
  // CAMPOS ADICIONADOS PARA GERENCIAR O RIPADO DINAMICAMENTE
  // ===================================================================
  isSlattedGenerator?: boolean; // Flag para identificar a peça como geradora
  slattedConfig?: SlattedPanelConfig; // Configuração para gerar as ripas

  // NOVO: Campos para gerenciar o tamponamento
  isCappingGenerator?: boolean;
  cappingConfig?: CappingConfig;

  // NOVO: Campos para gerenciar os sarrafos
  isSarrafoGenerator?: boolean;
  sarrafoConfig?: SarrafoConfig;
}

// NOVO: Interface para configuração do Tamponamento
export interface CappingConfig {
  thickness: number;
  // Extensões personalizáveis para cada direção
  extensionTop?: number;
  extensionBottom?: number;
  extensionLeft?: number;
  extensionRight?: number;
  extensionFront?: number;
  extensionBack?: number;
  gapExtension?: number; // Valor padrão para todas as direções se específicas não forem definidas
  dowelOptions?: DowelOptions;
}

// NOVO: Interface para configuração de Sarrafos
export interface SarrafoConfig {
  mountingType: 'frontal' | 'traseira' | 'ambos'; // Tipo de montagem dos sarrafos
  appearanceType: 'aparente' | 'escondido'; // Se o móvel tem lado aparente ou não
  sarrafoThickness: 15 | 18 | 25; // Espessura do sarrafo (padronizada)
  externalThickness: 15 | 18 | 25; // Espessura da peça externa (padronizada)
  sarrafoWidth: number; // Largura dos sarrafos
  autoExtend?: boolean; // Se deve estender automaticamente para eliminar gaps
  extensionAmount?: number; // Quantidade de extensão automática (padrão baseado na espessura)
  externalOffset?: number; // Offset da peça externa
  // Extensões personalizáveis para cada direção (similar ao CappingConfig)
  extensionTop?: number;
  extensionBottom?: number;
  extensionLeft?: number;
  extensionRight?: number;
  extensionFront?: number;
  extensionBack?: number;
  gapExtension?: number; // Valor padrão para todas as direções se específicas não forem definidas
}

// NOVO: Interface para definir um furo
export interface Hole {
  id: string;
  position: Position; // Posição relativa ao centro da peça
  diameter: number;
  depth: number;
  direction: 'up' | 'down' | 'left' | 'right' | 'front' | 'back'; // Direção do furo
}

export interface FurnitureSpace {
  id: string;
  originalDimensions: Dimensions;
  currentDimensions: Dimensions;
  position: Position;
  pieces: FurniturePiece[];
  name: string;
  subSpaces?: FurnitureSpace[]; // Espaços criados após divisões
  parentSpaceId?: string; // ID do espaço pai
  isActive?: boolean; // Se o espaço está ativo (não foi dividido)
  createdByPieceId?: string; // ID da peça que originou este subespaço
}

export interface CutResult {
  remainingSpace: Dimensions;
  cutPosition: Position;
  dividedSpaces?: FurnitureSpace[]; // Novos espaços criados pela divisão
}

export interface SpaceDivisionResult {
  dividedSpaces: FurnitureSpace[];
  insertedPiece: FurniturePiece;
}

export interface PieceConfiguration {
  type: PieceType;
  name: string;
  defaultThickness: number;
  color: string;
  description: string;
}
