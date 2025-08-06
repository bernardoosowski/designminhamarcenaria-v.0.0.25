# Teste do Sistema de Sarrafos - Casos de Uso

## 🧪 Cenários de Teste

### Teste 1: Sarrafo Frontal Simples (Escondido)
1. Adicione uma **Lateral Esquerda** ao móvel
2. Clique na peça para selecioná-la
3. No painel de sarrafos, configure:
   - **Tipo de Montagem**: Frontal
   - **Tipo de Aparência**: Escondido
   - **Espessura Sarrafo**: 18mm
   - **Largura Sarrafo**: 50mm
4. Clique em **Aplicar Sarrafos**
5. **Resultado esperado**: 1 sarrafo vertical de 18mm na face externa esquerda

### Teste 2: Sarrafos Ambos com Peça Externa (Aparente)
1. Adicione uma **Lateral Frontal** ao móvel
2. Clique na peça para selecioná-la
3. No painel de sarrafos, configure:
   - **Tipo de Montagem**: Ambos
   - **Tipo de Aparência**: Aparente
   - **Espessura Sarrafo**: 15mm
   - **Espessura Peça Externa**: 25mm
   - **Largura Sarrafo**: 80mm
4. Clique em **Aplicar Sarrafos**
5. **Resultado esperado**: 
   - 2 sarrafos verticais (frontal e traseiro)
   - 1 peça externa de 25mm
   - Espessura total: 40mm (15+25)
   - Nome da peça: "Painel Sarrafos 40mm"

### Teste 3: Combinações de Espessuras
Teste todas as combinações possíveis:
- **15+15 = 30mm**
- **15+18 = 33mm**
- **15+25 = 40mm**
- **18+18 = 36mm**
- **18+25 = 43mm**
- **25+25 = 50mm**

### Teste 4: Diferentes Tipos de Peças
Teste sarrafos em:
- ✅ **Lateral Esquerda**: Sarrafo na face externa esquerda
- ✅ **Lateral Direita**: Sarrafo na face externa direita
- ✅ **Lateral Frontal**: Sarrafo na face frontal do móvel
- ✅ **Lateral Traseira**: Sarrafo na face traseira do móvel
- ✅ **Tampo**: Sarrafo na borda superior
- ✅ **Fundo**: Sarrafo na borda inferior
- ✅ **Prateleira**: Sarrafo na borda da prateleira

### Teste 5: Remover Sarrafos
1. Aplique sarrafos em uma peça (qualquer configuração)
2. Clique na peça novamente
3. Clique em **Remover Sarrafos**
4. **Resultado esperado**: 
   - Todos os sarrafos e peças externas removidos
   - Nome da peça restaurado ao original

## 🎯 Validações Visuais

### Posicionamento Correto
- Sarrafos ficam **rente às bordas** das peças
- Sarrafos são sempre **verticais** (altura da peça)
- **Frontal**: Face externa do móvel
- **Traseira**: Face interna/oposta do móvel
- **Ambos**: Duas posições simultaneamente

### Renderização 3D
- **Sarrafos**: Cor marrom (#8b5a2b)
- **Peças Externas**: Cor azul (#2563eb)
- **Peça original**: Mantém cor original

### Interface do Usuário
- ✅ Seletor de espessuras com botões visuais
- ✅ Indicador de espessura total para modo "Aparente"
- ✅ Fórmula de cálculo visível (ex: "15mm + 25mm")
- ✅ Nome da peça atualizado com espessura total

## 🚀 Funcionalidades Implementadas

### ✅ Características dos Sarrafos
- [x] Sempre verticais
- [x] Sempre 1 por posição (ou 2 no "ambos")
- [x] Posicionados rente às bordas
- [x] Espessuras padronizadas (15, 18, 25mm)

### ✅ Sistema de Espessuras
- [x] Sarrafo: 15mm, 18mm, 25mm
- [x] Peça Externa: 15mm, 18mm, 25mm
- [x] Soma automática das espessuras
- [x] Visualização clara do total

### ✅ Interface de Usuário
- [x] Seletores visuais de espessura
- [x] Configuração de largura do sarrafo
- [x] Indicador de espessura total
- [x] Aplicar/Remover sarrafos

### ✅ Integração 3D
- [x] Renderização em tempo real
- [x] Cores diferenciadas por tipo
- [x] Posicionamento preciso
- [x] Hot reload das mudanças

## 📋 Checklist de Qualidade

- [x] Sarrafos sempre verticais
- [x] 1 sarrafo por posição máximo
- [x] Posicionamento rente às bordas
- [x] Espessuras padronizadas
- [x] Sistema de soma das espessuras
- [x] Interface intuitiva
- [x] Visualização 3D
- [x] Funcionalidade de remoção
- [x] Nomenclatura adequada das peças
- [x] Sem erros de compilação
- [x] Hot reload funcionando
