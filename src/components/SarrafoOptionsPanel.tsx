import React from 'react';
import styled from 'styled-components';
import { SarrafoConfig } from '../types/furniture';

const Container = styled.div`
  background: var(--color-surface);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  padding: 16px;
  margin: 8px 0;
`;

const Title = styled.h4`
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
`;

const OptionGroup = styled.div`
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 8px;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 12px;
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary)20;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 12px;
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary)20;
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

interface SarrafoOptionsPanelProps {
  config: SarrafoConfig;
  onChange: (config: SarrafoConfig) => void;
}

export const SarrafoOptionsPanel: React.FC<SarrafoOptionsPanelProps> = ({
  config,
  onChange
}) => {
  const handleChange = (field: keyof SarrafoConfig, value: any) => {
    onChange({
      ...config,
      [field]: value
    });
  };

  return (
    <Container>
      <Title>Opções de Sarrafos</Title>
      
      <OptionGroup>
        <Label>Tipo de Montagem</Label>
        <Select
          value={config.mountingType}
          onChange={(e) => handleChange('mountingType', e.target.value)}
        >
          <option value="frontal">Frontal</option>
          <option value="traseira">Traseira</option>
          <option value="ambos">Ambos</option>
        </Select>
      </OptionGroup>

      <OptionGroup>
        <Label>Tipo de Aparência</Label>
        <Select
          value={config.appearanceType}
          onChange={(e) => handleChange('appearanceType', e.target.value)}
        >
          <option value="escondido">Escondido</option>
          <option value="aparente">Aparente</option>
        </Select>
      </OptionGroup>

      <OptionGroup>
        <Row>
          <div>
            <Label>Espessura (mm)</Label>
            <Input
              type="number"
              value={config.sarrafoThickness}
              onChange={(e) => handleChange('sarrafoThickness', Number(e.target.value))}
              min="1"
              max="50"
            />
          </div>
          <div>
            <Label>Largura (mm)</Label>
            <Input
              type="number"
              value={config.sarrafoWidth}
              onChange={(e) => handleChange('sarrafoWidth', Number(e.target.value))}
              min="5"
              max="200"
            />
          </div>
        </Row>
      </OptionGroup>

      {config.appearanceType === 'aparente' && (
        <>
          <OptionGroup>
            <Row>
              <div>
                <Label>Espessura Peça Externa (mm)</Label>
                <Input
                  type="number"
                  value={config.externalThickness || 18}
                  onChange={(e) => handleChange('externalThickness', Number(e.target.value))}
                  min="1"
                  max="50"
                />
              </div>
              <div>
                <Label>Offset Peça Externa (mm)</Label>
                <Input
                  type="number"
                  value={config.externalOffset || 5}
                  onChange={(e) => handleChange('externalOffset', Number(e.target.value))}
                  min="0"
                  max="100"
                />
              </div>
            </Row>
          </OptionGroup>
        </>
      )}
    </Container>
  );
};
