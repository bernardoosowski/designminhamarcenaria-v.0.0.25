/**
 * Utilitário para analisar fórmulas simples de adição e subtração
 * Permite ao usuário inserir expressões como "10+5" ou "25-10" em campos numéricos
 */

/**
 * Analisa uma string contendo uma expressão matemática simples
 * Suporta adição e subtração de números inteiros e decimais
 * 
 * @param input A string contendo a expressão a ser avaliada
 * @returns O resultado numérico da expressão, ou NaN se a expressão for inválida
 * 
 * Exemplos:
 * - "10+5" => 15
 * - "25-10" => 15
 * - "10.5+4.5" => 15
 * - "20+5-10" => 15
 */
export const parseFormula = (input: string): number => {
  if (!input || typeof input !== 'string') return NaN;
  
  // Remove espaços em branco
  const formula = input.replace(/\s/g, '');
  
  // Verifica se já é um número simples
  if (!isNaN(Number(formula))) {
    return Number(formula);
  }
  
  try {
    // Regex para validar se a fórmula tem apenas números e operadores + e -
    const validFormulaRegex = /^[0-9]+(\.[0-9]+)?([+\-][0-9]+(\.[0-9]+)?)*$/;
    
    if (!validFormulaRegex.test(formula)) {
      return NaN;
    }
    
    // Tokenização da fórmula em números e operadores
    const tokens: (number | string)[] = [];
    let currentNumber = '';
    
    for (let i = 0; i < formula.length; i++) {
      const char = formula[i];
      if (char === '+' || char === '-') {
        if (currentNumber) {
          tokens.push(parseFloat(currentNumber));
          currentNumber = '';
        }
        tokens.push(char);
      } else {
        currentNumber += char;
      }
    }
    
    if (currentNumber) {
      tokens.push(parseFloat(currentNumber));
    }
    
    // Avaliação da fórmula
    let result = tokens[0] as number;
    for (let i = 1; i < tokens.length; i += 2) {
      const operator = tokens[i] as string;
      const operand = tokens[i + 1] as number;
      
      if (operator === '+') {
        result += operand;
      } else if (operator === '-') {
        result -= operand;
      }
    }
    
    return result;
  } catch (error) {
    console.error('Erro ao analisar fórmula:', error);
    return NaN;
  }
};

/**
 * Função para verificar se uma entrada pode ser uma fórmula
 * @param value Valor a ser verificado
 * @returns true se a entrada contém caracteres de fórmula
 */
export const isFormula = (value: string): boolean => {
  return /[+\-]/.test(value);
};
