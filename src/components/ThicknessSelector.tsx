import React from 'react';
import styled from 'styled-components';

const ThicknessGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 8px;
`;

const ThicknessOption = styled.button<{ $isSelected: boolean }>`
  padding: 8px 12px;
  border: 2px solid ${props => props.$isSelected ? 'var(--color-primary)' : 'var(--color-border)'};
  border-radius: 6px;
  background: ${props => props.$isSelected ? 'var(--color-primary)20' : 'var(--color-background)'};
  color: ${props => props.$isSelected ? 'var(--color-primary)' : 'var(--color-text)'};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--color-primary);
    background: var(--color-primary)10;
  }
`;

const TotalIndicator = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: linear-gradient(135deg, var(--color-primary)10, var(--color-primary)05);
  border: 1px solid var(--color-primary)30;
  border-radius: 8px;
  text-align: center;
`;

const TotalLabel = styled.div`
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TotalValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
`;

const Formula = styled.div`
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-top: 4px;
`;

interface ThicknessSelectorProps {
  label: string;
  value: 15 | 18 | 25;
  onChange: (value: 15 | 18 | 25) => void;
  showTotal?: boolean;
  otherThickness?: 15 | 18 | 25;
}

export const ThicknessSelector: React.FC<ThicknessSelectorProps> = ({
  label,
  value,
  onChange,
  showTotal = false,
  otherThickness
}) => {
  const options: Array<15 | 18 | 25> = [15, 18, 25];
  const total = showTotal && otherThickness ? value + otherThickness : value;

  return (
    <div>
      <label style={{
        display: 'block',
        fontWeight: '500',
        color: 'var(--color-text)',
        marginBottom: '8px',
        fontSize: '13px'
      }}>
        {label}
      </label>
      
      <ThicknessGrid>
        {options.map(thickness => (
          <ThicknessOption
            key={thickness}
            $isSelected={value === thickness}
            onClick={() => onChange(thickness)}
          >
            {thickness}mm
          </ThicknessOption>
        ))}
      </ThicknessGrid>

      {showTotal && otherThickness && (
        <TotalIndicator>
          <TotalLabel>Espessura Total</TotalLabel>
          <TotalValue>{total}mm</TotalValue>
          <Formula>{value}mm + {otherThickness}mm</Formula>
        </TotalIndicator>
      )}
    </div>
  );
};
