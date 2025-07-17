/**
 * Utilitário para copiar texto para clipboard de forma robusta
 * Funciona mesmo em ambientes onde navigator.clipboard não está disponível
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    // Método 1: Clipboard API moderno (preferido)
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Método 2: Fallback usando execCommand (compatibilidade)
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const result = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    return result;
  } catch (error) {
    console.warn('Clipboard copy failed:', error);
    return false;
  }
};

/**
 * Hook para usar copy to clipboard de forma segura
 */
export const useCopyToClipboard = () => {
  const copy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (!success) {
      // Fallback: mostrar o texto para o usuário copiar manualmente
      alert(`Não foi possível copiar automaticamente. Copie este texto:\n\n${text}`);
    }
    return success;
  };

  return { copy };
};
