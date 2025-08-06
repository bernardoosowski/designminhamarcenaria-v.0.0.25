import { useState, useEffect } from 'react';
import { Scene3D } from './components/Scene3D';
import { Toolbar } from './components/Toolbar';
import { InstructionsPanel } from './components/InstructionsPanelNew';
import { SpaceSelector } from './components/SpaceSelector';
import { useSimplifiedFurnitureDesign } from './hooks/useSimplifiedFurnitureDesign';
import { SelectionInfo } from './components/SelectionInfo';
import { FurniturePiece } from './types/furniture';
import { ModeIndicator } from './components/ModeIndicator';

const App = () => {
  const {
    space,
    allPieces, // Lista para gerenciamento na UI
    renderedPieces, // Lista para renderização 3D
    addPiece,
    removePiece,
    clearAllPieces,
    defaultThickness,
    setDefaultThickness,
    selectedSpaceId,
    selectSpace,
    updateDimensions,
    currentTexture,
    setCurrentTexture,
    availableTextures,
    // addRipas removido pois não existe no hook
    createRipasFromPiece, // <-- Obtenha a nova função do hook
    createCappingFromPiece, // <-- Função para criar tamponamento
    removeCappingFromPiece, // <-- Função para remover tamponamento
    createSarrafoFromPiece, // <-- Função para criar sarrafos
    removeSarrafoFromPiece, // <-- Função para remover sarrafos
    // A função addSlattedPanel não é mais necessária aqui
  } = useSimplifiedFurnitureDesign();

  // NOVO: State para controlar a peça destacada
  const [hoveredPieceId, setHoveredPieceId] = useState<string | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<FurniturePiece | null>(null);

  // NOVO: State para controlar o modo de seleção (peças ou espaços)
  const [selectionMode, setSelectionMode] = useState<'piece' | 'space'>('piece');

  // NOVO: Estado para o botão de visualização de furos
  const [holeVisualization, setHoleVisualization] = useState(false);

  // NOVO: Hook para escutar o atalho do teclado (Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Verifica se Ctrl + S foi pressionado
      if (event.ctrlKey && event.key.toLowerCase() === 's') {
        event.preventDefault(); // Impede a ação padrão do navegador (Salvar página)
        setSelectionMode(prevMode => (prevMode === 'piece' ? 'space' : 'piece'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Limpa o listener quando o componente é desmontado
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // O array vazio garante que o listener seja adicionado apenas uma vez

  // Remover handleSave e handleFullscreen

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        background: 'var(--color-background-gradient)',
        overflow: 'hidden',
        transition: 'background 0.3s',
      }}
    >
      {/* Botão de alternância de tema - agora mais abaixo */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        style={{
          position: 'fixed',
          top: 110,
          right: 24,
          zIndex: 2000,
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-md)',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
          fontWeight: 600,
        }}
        aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
        title={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
      >
        {theme === 'dark' ? '🌙 Noite' : '☀️ Claro'}
      </button>

      {/* NOVO: Componente para dar feedback visual do modo atual */}
      <ModeIndicator mode={selectionMode} />

      <Scene3D
        space={space || { id: 'main', name: 'Móvel Principal', originalDimensions: { width: 800, height: 2100, depth: 600 }, isActive: true, subSpaces: [] }}
        allPieces={renderedPieces || []} // Lista correta para a cena 3D
        selectedSpaceId={selectedSpaceId}
        onSelectSpace={selectSpace}
        textureUrl={currentTexture.url}
        hoveredPieceId={hoveredPieceId}
        selectedPieceId={selectedPiece?.id || null}
        onPieceClick={(piece) => {
          setSelectedPiece(prev => (prev?.id === piece.id ? null : piece));
        }}
        selectionMode={selectionMode}
        holeVisualizationActive={holeVisualization}
      />

      <Toolbar
        pieces={allPieces} // Lista correta para a Toolbar
        onAddPiece={addPiece}
        onRemovePiece={removePiece}
        onClearAll={clearAllPieces}
        originalDimensions={space?.originalDimensions || { width: 800, height: 2100, depth: 600 }}
        onUpdateDimensions={updateDimensions}
        defaultThickness={defaultThickness}
        onThicknessChange={setDefaultThickness}
        availableTextures={availableTextures}
        currentTexture={currentTexture}
        onTextureChange={setCurrentTexture}
        onHoverPiece={setHoveredPieceId}
        onSelectPiece={(piece) => {
          setSelectedPiece(prev => (prev?.id === piece.id ? null : piece));
        }}
        onToggleHoleVisualization={() => setHoleVisualization(v => !v)}
        holeVisualizationActive={holeVisualization}
        // A prop onAddSlattedPanel foi removida daqui
      />

      <SpaceSelector
        space={space || { id: 'main', name: 'Móvel Principal', originalDimensions: { width: 800, height: 2100, depth: 600 }, isActive: true, subSpaces: [] }}
        selectedSpaceId={selectedSpaceId}
        onSelectSpace={selectSpace}
      />

      <InstructionsPanel />

      {/* =================================================================== */}
      {/* CORREÇÃO: Remova ou comente a linha abaixo para excluir os botões   */}
      {/* =================================================================== */}
      {/* <FloatingActionButtons
        onReset={clearAllPieces}
        onSave={handleSave}
        onFullscreen={handleFullscreen}
      /> */}
      <SelectionInfo 
        piece={selectedPiece}
        onClose={() => setSelectedPiece(null)}
        createRipasFromPiece={createRipasFromPiece}
        createCappingFromPiece={createCappingFromPiece}
        removeCappingFromPiece={removeCappingFromPiece}
        createSarrafoFromPiece={createSarrafoFromPiece}
        removeSarrafoFromPiece={removeSarrafoFromPiece}
      />
    </div>
  );
};

export default App;
