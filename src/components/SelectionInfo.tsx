import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FurniturePiece, CappingConfig, SarrafoConfig } from '../types/furniture';
import { SlattedPanelConfig } from '../types/furniture';
import { parseFormula, isFormula } from '../utils/formulaParser';
import { ThicknessSelector } from './ThicknessSelector';

// Hook para detectar o tamanho da tela
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// =====================================================================================
// CORREÇÃO: Posição do container alterada para o canto inferior direito
// =====================================================================================
const InfoContainer = styled.div`
  position: fixed;
  bottom: var(--space-4);
  right: var(--space-4);
  background: var(--color-toolbar-surface, #ffffffcc);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-lg, 8px);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
  z-index: 1000;
  padding: var(--space-4);
  width: 350px;
  max-height: 85vh;
  overflow-y: auto;
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Ajustes para telas menores */
  @media (max-width: 768px) {
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    width: 90%;
    max-width: 400px;
    bottom: var(--space-3);
  }

  /* Scrollbar personalizada */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.25);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
`;

const Title = styled.h3`
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--color-text);
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: var(--color-text-muted);
  &:hover { color: var(--color-text); }
`;

const InfoRow = styled.p`
  margin: var(--space-1) 0;
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  display: flex;
  justify-content: space-between;

  & > span:first-child {
    font-weight: 600;
  }
`;

// ===================================================================
// ESTILOS ADICIONADOS PARA OS CONTROLES DO RIPADO
// ===================================================================
const Divider = styled.hr`
  border: none;
  border-top: 1px solid var(--color-border);
  margin: var(--space-4) 0;
`;

const RipadoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  
  & h4, & h5 {
    margin-top: var(--space-3);
    margin-bottom: var(--space-2);
  }
`;

// NOVO: Estilos para dropdowns responsivos
const DropdownSection = styled.div`
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md, 6px);
  margin-bottom: var(--space-3);
  overflow: hidden;
  background: var(--color-surface);
`;

const DropdownHeader = styled.div<{ $isOpen: boolean }>`
  padding: var(--space-3);
  background: var(--color-background-alt);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
  transition: background 0.2s ease;
  border-bottom: ${props => props.$isOpen ? '1px solid var(--color-border)' : 'none'};
  
  &:hover {
    background: var(--color-border-light);
  }
  
  h4 {
    margin: 0;
    color: var(--color-text);
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }
  
  &::after {
    content: '${props => props.$isOpen ? '▲' : '▼'}';
    font-size: 12px;
    color: var(--color-text-secondary);
    transition: transform 0.2s ease;
  }
`;

const DropdownContent = styled.div<{ $isOpen: boolean }>`
  max-height: ${props => props.$isOpen ? '1000px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  padding: ${props => props.$isOpen ? 'var(--space-3)' : '0 var(--space-3)'};
`;

const RipadoControls = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-2);

  @media (max-width: 400px) {
    grid-template-columns: 1fr;
  }
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  
  & > label {
    font-size: var(--font-size-xs);
    font-weight: 500;
    color: var(--color-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Select = styled.select`
  padding: var(--space-2);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
`;

const Input = styled.input`
  padding: var(--space-2);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  width: 100%;
  min-height: 36px;
  font-family: monospace; /* Melhor para visualizar fórmulas */
  &:disabled { background: var(--color-background-alt); cursor: not-allowed; }
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }
  
  /* Estilo especial quando contém fórmula */
  &[data-is-formula="true"] {
    color: #3b82f6; /* Azul para indicar fórmula */
    font-weight: 500;
    background-color: rgba(59, 130, 246, 0.05);
    border-color: rgba(59, 130, 246, 0.5);
  }
`;

const ApplyButton = styled.button`
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: none;
  background: var(--color-primary);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
  min-height: 44px;
  &:hover { background: var(--color-primary-hover); }
`;

const RemoveButton = styled.button`
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: none;
  background: #ef4444;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
  min-height: 44px;
  &:hover { background: #dc2626; }
`;

interface SelectionInfoProps {
  piece: FurniturePiece | null;
  onClose: () => void;
  createRipasFromPiece: (
    pieceId: string,
    config: SlattedPanelConfig // ATUALIZADO para passar o objeto de config inteiro
  ) => void;
  createCappingFromPiece?: (
    pieceId: string,
    config: CappingConfig
  ) => void;
  removeCappingFromPiece?: (
    pieceId: string
  ) => void;
  createSarrafoFromPiece?: (
    pieceId: string,
    config: SarrafoConfig
  ) => void;
  removeSarrafoFromPiece?: (
    pieceId: string
  ) => void;
}

export const SelectionInfo: React.FC<SelectionInfoProps> = ({ 
  piece, 
  onClose, 
  createRipasFromPiece, 
  createCappingFromPiece,
  removeCappingFromPiece,
  createSarrafoFromPiece,
  removeSarrafoFromPiece
}) => {
  const { width } = useWindowSize();
  const isMobile = width <= 400;
  
  // ATUALIZADO: Estado para a configuração completa do ripado
  const [ripConfig, setRipConfig] = useState<Omit<SlattedPanelConfig, 'calculationMode'>>({
    direction: 'vertical',
    spacing: 50,
    count: 10,
    width: 30,
    dowelOptions: {
      diameter: 8,
      depth: 20,
      countPerSlat: 2,
      edgeOffset: 50,
    }
  });
  const [ripadoCalcMode, setRipadoCalcMode] = useState<'count' | 'spacing'>('spacing');
  
  // Estado para configuração do tamponamento
  const [cappingConfig, setCappingConfig] = useState<CappingConfig>({
    thickness: 25,
    gapExtension: 25, // Extensão padrão 
    extensionTop: 25,
    extensionBottom: 25,
    extensionLeft: 25,
    extensionRight: 25,
    extensionFront: 25,
    extensionBack: 25,
    dowelOptions: {
      diameter: 8,
      depth: 20,
      countPerSlat: 4, // Fixo em 4 furos para tamponamento
      edgeOffset: 50,
    }
  });

  // Estado para configuração de sarrafos
  const [sarrafoConfig, setSarrafoConfig] = useState<SarrafoConfig>({
    mountingType: 'frontal',
    appearanceType: 'escondido',
    sarrafoThickness: 18,
    externalThickness: 18,
    sarrafoWidth: 50,
    autoExtend: false,
    extensionAmount: 18,
    extensionTop: 0,
    extensionBottom: 0,
    extensionLeft: 0,
    extensionRight: 0,
    extensionFront: 0,
    extensionBack: 0,
    gapExtension: 0
  });

  // Estados para controlar dropdowns responsivos
  const [isRipadoOpen, setIsRipadoOpen] = useState(true);
  const [isTamponamentoOpen, setIsTamponamentoOpen] = useState(false);
  const [isSarrafoOpen, setIsSarrafoOpen] = useState(false);

  // ===================================================================
  // NOVO useEffect PARA CARREGAR OS DADOS DA PEÇA SELECIONADA
  // ===================================================================
  useEffect(() => {
    if (piece && piece.isSlattedGenerator && piece.slattedConfig) {
      const { calculationMode, ...config } = piece.slattedConfig;
      setRipadoCalcMode(calculationMode);
      // Mescla a configuração salva com os valores padrão para garantir que todos os campos existam
      setRipConfig(prev => {
        const safePrevDowel = prev.dowelOptions ?? { diameter: 8, depth: 20, countPerSlat: 2, edgeOffset: 50 };
        const safeConfigDowel: Partial<import('../types/furniture').DowelOptions> = config.dowelOptions ?? {};
        return {
          ...prev,
          ...config,
          dowelOptions: {
            diameter: safeConfigDowel.diameter ?? safePrevDowel.diameter,
            depth: safeConfigDowel.depth ?? safePrevDowel.depth,
            countPerSlat: safeConfigDowel.countPerSlat ?? safePrevDowel.countPerSlat,
            edgeOffset: safeConfigDowel.edgeOffset ?? safePrevDowel.edgeOffset,
          }
        };
      });
    } else {
      // Reseta para o padrão quando uma nova peça é selecionada
      setRipadoCalcMode('spacing');
      setRipConfig({
        direction: 'vertical',
        spacing: 50,
        count: 10,
        width: 30,
        dowelOptions: {
          diameter: 8,
          depth: 20,
          countPerSlat: 2,
          edgeOffset: 50,
        }
      });
    }

    // Carregar configuração de sarrafos se existir
    if (piece && piece.isSarrafoGenerator && piece.sarrafoConfig) {
      setSarrafoConfig(piece.sarrafoConfig);
    } else {
      // Reseta para padrão quando uma nova peça é selecionada
      setSarrafoConfig({
        mountingType: 'frontal',
        appearanceType: 'escondido',
        sarrafoThickness: 18,
        externalThickness: 18,
        sarrafoWidth: 50
      });
    }
  }, [piece]);

  if (!piece) {
    return null;
  }

  const handleApplyRipas = () => {
    // Passa o objeto de configuração completo
    createRipasFromPiece(piece.id, {
      calculationMode: ripadoCalcMode,
      ...ripConfig,
    });
    onClose(); 
  };

  const handleApplyCapping = () => {
    if (createCappingFromPiece) {
      createCappingFromPiece(piece.id, cappingConfig);
      onClose();
    }
  };

  const handleRemoveCapping = () => {
    if (removeCappingFromPiece) {
      removeCappingFromPiece(piece.id);
      onClose();
    }
  };

  const handleApplySarrafo = () => {
    if (createSarrafoFromPiece) {
      createSarrafoFromPiece(piece.id, sarrafoConfig);
      onClose();
    }
  };

  const handleRemoveSarrafo = () => {
    if (removeSarrafoFromPiece) {
      removeSarrafoFromPiece(piece.id);
      onClose();
    }
  };

  const handleConfigChange = (field: keyof typeof ripConfig, value: any) => {
    setRipConfig(p => ({...p, [field]: value}));
  };

  const handleDowelChange = (field: keyof NonNullable<typeof ripConfig.dowelOptions>, value: any) => {
    setRipConfig(p => {
      const safeDowel = p.dowelOptions ?? { diameter: 8, depth: 20, countPerSlat: 2, edgeOffset: 50 };
      return {
        ...p,
        dowelOptions: {
          diameter: field === 'diameter' ? +value : safeDowel.diameter,
          depth: field === 'depth' ? +value : safeDowel.depth,
          countPerSlat: field === 'countPerSlat' ? +value : safeDowel.countPerSlat,
          edgeOffset: field === 'edgeOffset' ? +value : safeDowel.edgeOffset,
        }
      };
    });
  };

  const handleCappingChange = (field: keyof CappingConfig, value: any) => {
    // Se o valor for uma string e contiver operadores + ou -
    if (typeof value === 'string' && isFormula(value)) {
      // Mantém a fórmula como texto no input
      setCappingConfig(p => ({...p, [field]: value}));
    } else {
      // Caso contrário, converte para número ou mantém o valor original
      const numericValue = typeof value === 'string' ? parseFormula(value) : value;
      setCappingConfig(p => ({...p, [field]: !isNaN(numericValue) ? numericValue : value}));
    }
  };

  const handleCappingDowelChange = (field: keyof NonNullable<CappingConfig['dowelOptions']>, value: any) => {
    setCappingConfig(p => {
      const safeDowel = p.dowelOptions ?? { diameter: 8, depth: 20, countPerSlat: 4, edgeOffset: 50 };
      
      // Processa fórmulas para campos numéricos
      let processedValue = value;
      if (typeof value === 'string') {
        // Se for uma fórmula, calcula o valor
        if (isFormula(value)) {
          const calculated = parseFormula(value);
          if (!isNaN(calculated)) {
            processedValue = calculated;
          }
        } else {
          // Tenta converter para número
          processedValue = !isNaN(parseFloat(value)) ? parseFloat(value) : value;
        }
      }
      
      return {
        ...p,
        dowelOptions: {
          diameter: field === 'diameter' ? processedValue : safeDowel.diameter,
          depth: field === 'depth' ? processedValue : safeDowel.depth,
          countPerSlat: 4, // Sempre fixo em 4 furos para tamponamento
          edgeOffset: field === 'edgeOffset' ? processedValue : safeDowel.edgeOffset,
        }
      };
    });
  };

  const { name, dimensions } = piece;

  // Cálculo da profundidade apenas para exibição
  const calculatedRipDepth = ripConfig.direction === 'vertical'
    ? piece.thickness
    : piece.dimensions.depth;

  return (
    <InfoContainer>
      <Header>
        <Title>{name}</Title>
        <CloseButton onClick={onClose} title="Fechar">×</CloseButton>
      </Header>
      <InfoRow>
        <span>Largura:</span>
        <span>{dimensions.width.toFixed(0)} mm</span>
      </InfoRow>
      <InfoRow>
        <span>Altura:</span>
        <span>{dimensions.height.toFixed(0)} mm</span>
      </InfoRow>
      <InfoRow>
        <span>Profundidade:</span>
        <span>{dimensions.depth.toFixed(0)} mm</span>
      </InfoRow>
      <Divider />
      
      {/* SEÇÃO DE RIPADO COM DROPDOWN */}
      <DropdownSection>
        <DropdownHeader 
          $isOpen={isRipadoOpen}
          onClick={() => setIsRipadoOpen(!isRipadoOpen)}
        >
          <h4>� Criar Ripado na Peça</h4>
        </DropdownHeader>
        <DropdownContent $isOpen={isRipadoOpen}>
          <RipadoSection>
        {/* ... (Controles de Ripado existentes) ... */}
        <RipadoControls>
          <ControlGroup>
            <label>Modo Cálculo</label>
            <Select value={ripadoCalcMode} onChange={e => setRipadoCalcMode(e.target.value as any)}>
              <option value="spacing">Por Espaçamento</option>
              <option value="count">Por Quantidade</option>
            </Select>
          </ControlGroup>
          <ControlGroup>
            <label>Direção</label>
            <Select value={ripConfig.direction} onChange={e => handleConfigChange('direction', e.target.value)}>
              <option value="vertical">Vertical</option>
              <option value="horizontal">Horizontal</option>
            </Select>
          </ControlGroup>
          <ControlGroup>
            <label>Espaç. (mm)</label>
            <Input type="number" value={ripConfig.spacing} onChange={e => handleConfigChange('spacing', +e.target.value)} disabled={ripadoCalcMode === 'count'} />
          </ControlGroup>
          <ControlGroup>
            <label>Qtd.</label>
            <Input type="number" value={ripConfig.count} onChange={e => handleConfigChange('count', +e.target.value)} disabled={ripadoCalcMode === 'spacing'} />
          </ControlGroup>
          <ControlGroup>
            <label>Larg. Ripa (mm)</label>
            <Input type="number" value={ripConfig.width} onChange={e => handleConfigChange('width', +e.target.value)} />
          </ControlGroup>
          <ControlGroup>
            <label>Prof. Ripa (mm)</label>
            <Input 
              type="number" 
              value={calculatedRipDepth.toFixed(0)} 
              disabled
              title="Profundidade calculada automaticamente"
            />
          </ControlGroup>
        </RipadoControls>

        {/* NOVO: Seção de Furação */}
        <h5 style={{color: 'var(--color-text)'}}>Configuração das Cavilhas</h5>
        <RipadoControls>
          <ControlGroup>
            <label>Diâmetro (mm)</label>
            <Input type="number" value={ripConfig.dowelOptions?.diameter} onChange={e => handleDowelChange('diameter', e.target.value)} />
          </ControlGroup>
          <ControlGroup>
            <label>Prof. Total (mm)</label>
            <Input type="number" value={ripConfig.dowelOptions?.depth} onChange={e => handleDowelChange('depth', e.target.value)} />
          </ControlGroup>
          <ControlGroup>
            <label>Furos / Ripa</label>
            <Input type="number" value={ripConfig.dowelOptions?.countPerSlat} onChange={e => handleDowelChange('countPerSlat', e.target.value)} />
          </ControlGroup>
          <ControlGroup>
            <label>Dist. Borda (mm)</label>
            <Input type="number" value={ripConfig.dowelOptions?.edgeOffset} onChange={e => handleDowelChange('edgeOffset', e.target.value)} />
          </ControlGroup>
        </RipadoControls>

        <ApplyButton onClick={handleApplyRipas} style={{marginTop: 'var(--space-3)'}}>Aplicar Ripado e Furos</ApplyButton>
          </RipadoSection>
        </DropdownContent>
      </DropdownSection>

      {/* SEÇÃO DE TAMPONAMENTO COM DROPDOWN */}
      {createCappingFromPiece && (
        <DropdownSection>
          <DropdownHeader 
            $isOpen={isTamponamentoOpen}
            onClick={() => setIsTamponamentoOpen(!isTamponamentoOpen)}
          >
            <h4>�️ Criar Tamponamento na Peça</h4>
          </DropdownHeader>
          <DropdownContent $isOpen={isTamponamentoOpen}>
            <RipadoSection>
          
          <RipadoControls>
            <ControlGroup>
              <label>Espessura (mm)</label>
              <Input 
                type="text" 
                value={cappingConfig.thickness} 
                onChange={e => handleCappingChange('thickness', e.target.value)}
                onBlur={e => {
                  if (isFormula(e.target.value)) {
                    const result = parseFormula(e.target.value);
                    if (!isNaN(result)) {
                      handleCappingChange('thickness', result);
                    }
                  }
                }}
                placeholder="Ex: 10+15"
                data-is-formula={cappingConfig.thickness !== undefined && isFormula(String(cappingConfig.thickness))}
              />
            </ControlGroup>
          </RipadoControls>

          <h5 style={{color: 'var(--color-text)'}}>Extensões Personalizadas (mm)</h5>
          <p style={{fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px'}}>
            Dica: Você pode usar fórmulas como "10+15" ou "25-5" nos campos abaixo.
          </p>
          <RipadoControls>
            <ControlGroup>
              <label>Superior</label>
              <Input 
                type="text" 
                value={cappingConfig.extensionTop ?? cappingConfig.gapExtension} 
                onChange={e => handleCappingChange('extensionTop', e.target.value)}
                onBlur={e => {
                  if (isFormula(e.target.value)) {
                    const result = parseFormula(e.target.value);
                    if (!isNaN(result)) {
                      handleCappingChange('extensionTop', result);
                    }
                  }
                }}
                placeholder="Ex: 10+15"
                data-is-formula={cappingConfig.extensionTop !== null && isFormula(String(cappingConfig.extensionTop))}
              />
            </ControlGroup>
            <ControlGroup>
              <label>Inferior</label>
              <Input 
                type="text" 
                value={cappingConfig.extensionBottom ?? cappingConfig.gapExtension} 
                onChange={e => handleCappingChange('extensionBottom', e.target.value)}
                onBlur={e => {
                  if (isFormula(e.target.value)) {
                    const result = parseFormula(e.target.value);
                    if (!isNaN(result)) {
                      handleCappingChange('extensionBottom', result);
                    }
                  }
                }}
                placeholder="Ex: 10+15"
                data-is-formula={cappingConfig.extensionBottom !== null && isFormula(String(cappingConfig.extensionBottom))}
              />
            </ControlGroup>
          </RipadoControls>
          
          <RipadoControls>
            <ControlGroup>
              <label>Esquerda</label>
              <Input 
                type="text" 
                value={cappingConfig.extensionLeft ?? cappingConfig.gapExtension} 
                onChange={e => handleCappingChange('extensionLeft', e.target.value)}
                onBlur={e => {
                  if (isFormula(e.target.value)) {
                    const result = parseFormula(e.target.value);
                    if (!isNaN(result)) {
                      handleCappingChange('extensionLeft', result);
                    }
                  }
                }}
                placeholder="Ex: 10+15"
                data-is-formula={cappingConfig.extensionLeft !== null && isFormula(String(cappingConfig.extensionLeft))}
              />
            </ControlGroup>
            <ControlGroup>
              <label>Direita</label>
              <Input 
                type="text" 
                value={cappingConfig.extensionRight ?? cappingConfig.gapExtension} 
                onChange={e => handleCappingChange('extensionRight', e.target.value)}
                onBlur={e => {
                  if (isFormula(e.target.value)) {
                    const result = parseFormula(e.target.value);
                    if (!isNaN(result)) {
                      handleCappingChange('extensionRight', result);
                    }
                  }
                }}
                placeholder="Ex: 10+15"
                data-is-formula={cappingConfig.extensionRight !== null && isFormula(String(cappingConfig.extensionRight))}
              />
            </ControlGroup>
          </RipadoControls>
          
          <RipadoControls>
            <ControlGroup>
              <label>Frontal</label>
              <Input 
                type="text" 
                value={cappingConfig.extensionFront ?? cappingConfig.gapExtension} 
                onChange={e => handleCappingChange('extensionFront', e.target.value)}
                onBlur={e => {
                  if (isFormula(e.target.value)) {
                    const result = parseFormula(e.target.value);
                    if (!isNaN(result)) {
                      handleCappingChange('extensionFront', result);
                    }
                  }
                }}
                placeholder="Ex: 10+15"
                data-is-formula={cappingConfig.extensionFront !== null && isFormula(String(cappingConfig.extensionFront))}
              />
            </ControlGroup>
            <ControlGroup>
              <label>Traseira</label>
              <Input 
                type="text" 
                value={cappingConfig.extensionBack ?? cappingConfig.gapExtension} 
                onChange={e => handleCappingChange('extensionBack', e.target.value)}
                onBlur={e => {
                  if (isFormula(e.target.value)) {
                    const result = parseFormula(e.target.value);
                    if (!isNaN(result)) {
                      handleCappingChange('extensionBack', result);
                    }
                  }
                }}
                placeholder="Ex: 10+15"
                data-is-formula={cappingConfig.extensionBack !== null && isFormula(String(cappingConfig.extensionBack))}
              />
            </ControlGroup>
          </RipadoControls>
          
          <RipadoControls style={{ marginTop: 'var(--space-2)' }}>
            <ControlGroup style={{ gridColumn: isMobile ? 'auto' : '1 / -1' }}>
              <label>Todas as direções</label>
              <Input 
                type="text" 
                value={cappingConfig.gapExtension} 
                onChange={e => {
                  const inputValue = e.target.value;
                  handleCappingChange('gapExtension', inputValue);
                  handleCappingChange('extensionTop', inputValue);
                  handleCappingChange('extensionBottom', inputValue);
                  handleCappingChange('extensionLeft', inputValue);
                  handleCappingChange('extensionRight', inputValue);
                  handleCappingChange('extensionFront', inputValue);
                  handleCappingChange('extensionBack', inputValue);
                }}
                onBlur={e => {
                  if (isFormula(e.target.value)) {
                    const result = parseFormula(e.target.value);
                    if (!isNaN(result)) {
                      const value = result;
                      handleCappingChange('gapExtension', value);
                      handleCappingChange('extensionTop', value);
                      handleCappingChange('extensionBottom', value);
                      handleCappingChange('extensionLeft', value);
                      handleCappingChange('extensionRight', value);
                      handleCappingChange('extensionFront', value);
                      handleCappingChange('extensionBack', value);
                    }
                  }
                }}
                placeholder="Ex: 10+15"
                title="Define o mesmo valor para todas as extensões"
                data-is-formula={cappingConfig.gapExtension !== undefined && isFormula(String(cappingConfig.gapExtension))}
              />
            </ControlGroup>
          </RipadoControls>

          <h5 style={{color: 'var(--color-text)'}}>Configuração das Cavilhas</h5>
          <RipadoControls>
            <ControlGroup>
              <label>Diâmetro (mm)</label>
              <Input 
                type="text" 
                value={cappingConfig.dowelOptions?.diameter} 
                onChange={e => handleCappingDowelChange('diameter', e.target.value)}
                onBlur={e => {
                  if (isFormula(e.target.value)) {
                    const result = parseFormula(e.target.value);
                    if (!isNaN(result)) {
                      handleCappingDowelChange('diameter', result);
                    }
                  }
                }}
                placeholder="Ex: 10+15"
                data-is-formula={cappingConfig.dowelOptions?.diameter !== undefined && isFormula(String(cappingConfig.dowelOptions.diameter))}
              />
            </ControlGroup>
            <ControlGroup>
              <label>Prof. Total (mm)</label>
              <Input 
                type="text" 
                value={cappingConfig.dowelOptions?.depth} 
                onChange={e => handleCappingDowelChange('depth', e.target.value)}
                onBlur={e => {
                  if (isFormula(e.target.value)) {
                    const result = parseFormula(e.target.value);
                    if (!isNaN(result)) {
                      handleCappingDowelChange('depth', result);
                    }
                  }
                }}
                placeholder="Ex: 10+15"
                data-is-formula={cappingConfig.dowelOptions?.depth !== undefined && isFormula(String(cappingConfig.dowelOptions.depth))}
              />
            </ControlGroup>
            <ControlGroup>
              <label>Dist. Borda (mm)</label>
              <Input 
                type="text" 
                value={cappingConfig.dowelOptions?.edgeOffset} 
                onChange={e => handleCappingDowelChange('edgeOffset', e.target.value)}
                onBlur={e => {
                  if (isFormula(e.target.value)) {
                    const result = parseFormula(e.target.value);
                    if (!isNaN(result)) {
                      handleCappingDowelChange('edgeOffset', result);
                    }
                  }
                }}
                placeholder="Ex: 10+15"
                data-is-formula={cappingConfig.dowelOptions?.edgeOffset !== undefined && isFormula(String(cappingConfig.dowelOptions.edgeOffset))}
              />
            </ControlGroup>
          </RipadoControls>

          <div 
            style={{
              display: 'flex', 
              gap: 'var(--space-2)', 
              marginTop: 'var(--space-3)',
              flexDirection: isMobile ? 'column' : 'row'
            }}
          >
            <ApplyButton onClick={handleApplyCapping} style={{flex: 1}}>
              Aplicar Tamponamento
            </ApplyButton>
            {piece.isCappingGenerator && removeCappingFromPiece && (
              <RemoveButton 
                onClick={handleRemoveCapping} 
                style={{flex: 1}}
              >
                Remover Tamponamento
              </RemoveButton>
            )}
          </div>
            </RipadoSection>
          </DropdownContent>
        </DropdownSection>
      )}

      {/* SEÇÃO DE SARRAFOS COM DROPDOWN */}
      {(createSarrafoFromPiece || removeSarrafoFromPiece) && (
        <DropdownSection>
          <DropdownHeader 
            $isOpen={isSarrafoOpen}
            onClick={() => setIsSarrafoOpen(!isSarrafoOpen)}
          >
            <h4>🔧 Criar Sarrafos na Peça</h4>
          </DropdownHeader>
          <DropdownContent $isOpen={isSarrafoOpen}>
            <RipadoSection>
          
          <div>
            <label style={{
              display: 'block',
              fontWeight: '500',
              color: 'var(--color-text)',
              marginBottom: '8px',
              fontSize: '13px'
            }}>
              Tipo de Montagem
            </label>
            <Select
              value={sarrafoConfig.mountingType}
              onChange={(e) => setSarrafoConfig(prev => ({
                ...prev,
                mountingType: e.target.value as 'frontal' | 'traseira' | 'ambos'
              }))}
            >
              <option value="frontal">Frontal</option>
              <option value="traseira">Traseira</option>
              <option value="ambos">Ambos</option>
            </Select>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontWeight: '500',
              color: 'var(--color-text)',
              marginBottom: '8px',
              fontSize: '13px'
            }}>
              Tipo de Aparência
            </label>
            <Select
              value={sarrafoConfig.appearanceType}
              onChange={(e) => setSarrafoConfig(prev => ({
                ...prev,
                appearanceType: e.target.value as 'aparente' | 'escondido'
              }))}
            >
              <option value="escondido">Escondido</option>
              <option value="aparente">Aparente</option>
            </Select>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
            <ThicknessSelector
              label="Espessura Sarrafo (mm)"
              value={sarrafoConfig.sarrafoThickness}
              onChange={(val) => setSarrafoConfig(prev => ({
                ...prev, 
                sarrafoThickness: val
              }))}
            />
            <div>
              <label style={{
                display: 'block',
                fontWeight: '500',
                color: 'var(--color-text)',
                marginBottom: '8px',
                fontSize: '13px'
              }}>
                Largura Sarrafo (mm)
              </label>
              <Input 
                type="number"
                value={sarrafoConfig.sarrafoWidth} 
                onChange={(e) => setSarrafoConfig(prev => ({...prev, sarrafoWidth: Number(e.target.value)}))}
                min={20}
                max={300}
              />
            </div>
          </div>

          {sarrafoConfig.appearanceType === 'aparente' && (
            <ThicknessSelector
              label="Espessura Peça Externa (mm)"
              value={sarrafoConfig.externalThickness}
              onChange={(val) => setSarrafoConfig(prev => ({
                ...prev, 
                externalThickness: val
              }))}
              showTotal={true}
              otherThickness={sarrafoConfig.sarrafoThickness}
            />
          )}

          {/* Extensões Personalizadas para Sarrafos */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginTop: '16px',
            padding: '12px',
            borderRadius: '6px',
            backgroundColor: 'var(--color-background-alt)',
            border: '1px solid var(--color-border)'
          }}>
            <h5 style={{color: 'var(--color-text)', margin: 0}}>Extensões Personalizadas (mm)</h5>
            <p style={{fontSize: '12px', color: 'var(--color-text-muted)', margin: 0}}>
              Configure extensões específicas para cada direção dos sarrafos.
            </p>
            
            <RipadoControls>
              <ControlGroup>
                <label>Superior</label>
                <Input 
                  type="number" 
                  value={sarrafoConfig.extensionTop ?? sarrafoConfig.gapExtension ?? 0} 
                  onChange={(e) => setSarrafoConfig(prev => ({
                    ...prev, 
                    extensionTop: Number(e.target.value)
                  }))}
                  min={0}
                  step={1}
                />
              </ControlGroup>
              <ControlGroup>
                <label>Inferior</label>
                <Input 
                  type="number" 
                  value={sarrafoConfig.extensionBottom ?? sarrafoConfig.gapExtension ?? 0} 
                  onChange={(e) => setSarrafoConfig(prev => ({
                    ...prev, 
                    extensionBottom: Number(e.target.value)
                  }))}
                  min={0}
                  step={1}
                />
              </ControlGroup>
            </RipadoControls>
            
            <RipadoControls>
              <ControlGroup>
                <label>Esquerda</label>
                <Input 
                  type="number" 
                  value={sarrafoConfig.extensionLeft ?? sarrafoConfig.gapExtension ?? 0} 
                  onChange={(e) => setSarrafoConfig(prev => ({
                    ...prev, 
                    extensionLeft: Number(e.target.value)
                  }))}
                  min={0}
                  step={1}
                />
              </ControlGroup>
              <ControlGroup>
                <label>Direita</label>
                <Input 
                  type="number" 
                  value={sarrafoConfig.extensionRight ?? sarrafoConfig.gapExtension ?? 0} 
                  onChange={(e) => setSarrafoConfig(prev => ({
                    ...prev, 
                    extensionRight: Number(e.target.value)
                  }))}
                  min={0}
                  step={1}
                />
              </ControlGroup>
            </RipadoControls>
            
            <RipadoControls>
              <ControlGroup>
                <label>Frontal</label>
                <Input 
                  type="number" 
                  value={sarrafoConfig.extensionFront ?? sarrafoConfig.gapExtension ?? 0} 
                  onChange={(e) => setSarrafoConfig(prev => ({
                    ...prev, 
                    extensionFront: Number(e.target.value)
                  }))}
                  min={0}
                  step={1}
                />
              </ControlGroup>
              <ControlGroup>
                <label>Traseira</label>
                <Input 
                  type="number" 
                  value={sarrafoConfig.extensionBack ?? sarrafoConfig.gapExtension ?? 0} 
                  onChange={(e) => setSarrafoConfig(prev => ({
                    ...prev, 
                    extensionBack: Number(e.target.value)
                  }))}
                  min={0}
                  step={1}
                />
              </ControlGroup>
            </RipadoControls>
            
            <RipadoControls style={{ marginTop: '8px' }}>
              <ControlGroup style={{ gridColumn: '1 / -1' }}>
                <label>Todas as direções</label>
                <Input 
                  type="number" 
                  value={sarrafoConfig.gapExtension ?? 0} 
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setSarrafoConfig(prev => ({
                      ...prev,
                      gapExtension: value,
                      extensionTop: value,
                      extensionBottom: value,
                      extensionLeft: value,
                      extensionRight: value,
                      extensionFront: value,
                      extensionBack: value
                    }));
                  }}
                  min={0}
                  step={1}
                />
              </ControlGroup>
            </RipadoControls>
          </div>

          {/* Extensão Automática */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginTop: '16px',
            padding: '12px',
            borderRadius: '6px',
            backgroundColor: 'var(--color-background-alt)',
            border: '1px solid var(--color-border)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <input
                type="checkbox"
                id="autoExtend"
                checked={sarrafoConfig.autoExtend}
                onChange={(e) => setSarrafoConfig(prev => ({
                  ...prev, 
                  autoExtend: e.target.checked
                }))}
              />
              <label htmlFor="autoExtend" style={{
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--color-text)'
              }}>
                Extensão Automática (eliminar gaps)
              </label>
            </div>
            
            {sarrafoConfig.autoExtend && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <label style={{
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)'
                }}>
                  Quantidade de Extensão (mm)
                </label>
                <Input
                  type="number"
                  value={sarrafoConfig.extensionAmount}
                  onChange={(e) => setSarrafoConfig(prev => ({
                    ...prev, 
                    extensionAmount: Number(e.target.value)
                  }))}
                  min={1}
                  max={50}
                  step={1}
                />
              </div>
            )}
          </div>

          <div style={{
            display: 'flex',
            gap: '8px',
            marginTop: '16px'
          }}>
            <ApplyButton onClick={handleApplySarrafo} style={{flex: 1}}>
              Aplicar Sarrafos
            </ApplyButton>
            {piece.isSarrafoGenerator && removeSarrafoFromPiece && (
              <RemoveButton 
                onClick={handleRemoveSarrafo} 
                style={{flex: 1}}
              >
                Remover Sarrafos
              </RemoveButton>
            )}
          </div>
            </RipadoSection>
          </DropdownContent>
        </DropdownSection>
      )}
    </InfoContainer>
  );
};