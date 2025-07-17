'use server';
/**
 * @fileOverview Um agente de IA que sugere detalhes para um link (ícone, grupo, descrição).
 *
 * - suggestLinkDetails - Uma função que lida com o processo de sugestão de detalhes do link.
 * - SuggestLinkDetailsInput - O tipo de entrada para a função suggestLinkDetails.
 * - SuggestLinkDetailsOutput - O tipo de retorno para a função suggestLinkDetails.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { ICONS } from '@/lib/icons';

const iconNames = ICONS.map(icon => icon.name);

const SuggestLinkDetailsInputSchema = z.object({
  title: z.string().describe('O título do link.'),
  url: z.string().url().describe('A URL do link.'),
});
export type SuggestLinkDetailsInput = z.infer<typeof SuggestLinkDetailsInputSchema>;

const SuggestLinkDetailsOutputSchema = z.object({
  iconName: z.string().describe('O nome do ícone sugerido da lista fornecida.'),
  group: z.string().describe('O nome do grupo sugerido para o link (ex: Trabalho, Estudo, Lazer).'),
  description: z.string().describe('Uma descrição curta e concisa do link em uma frase.'),
});
export type SuggestLinkDetailsOutput = z.infer<typeof SuggestLinkDetailsOutputSchema>;

export async function suggestLinkDetails(input: SuggestLinkDetailsInput): Promise<SuggestLinkDetailsOutput> {
  try {
    return await suggestLinkDetailsFlow(input);
  } catch (error) {
    console.warn('Erro na sugestão de detalhes do link, usando fallback:', error);
    
    // Fallback: lógica simples baseada na URL
    const url = input.url.toLowerCase();
    let iconName = 'Link';
    let group = 'Geral';
    
    if (url.includes('github')) {
      iconName = 'Github';
      group = 'Desenvolvimento';
    } else if (url.includes('youtube') || url.includes('netflix') || url.includes('twitch')) {
      iconName = 'Play';
      group = 'Entretenimento';
    } else if (url.includes('google') || url.includes('bing') || url.includes('duckduckgo')) {
      iconName = 'Search';
      group = 'Ferramentas';
    } else if (url.includes('news') || url.includes('noticia') || url.includes('blog')) {
      iconName = 'Globe';
      group = 'Notícias';
    } else if (url.includes('facebook') || url.includes('twitter') || url.includes('instagram')) {
      iconName = 'Users';
      group = 'Social';
    }
    
    return {
      iconName,
      group,
      description: `${input.title} - Link adicionado`
    };
  }
}

// Reativando recursos de IA

const prompt = ai.definePrompt({
  name: 'suggestLinkDetailsPrompt',
  input: {schema: SuggestLinkDetailsInputSchema},
  output: {schema: SuggestLinkDetailsOutputSchema},
  prompt: `Você é um assistente de UI/UX especialista em organização de links.
Sua tarefa é analisar o título e a URL de um link e sugerir o ícone mais apropriado de uma lista, um grupo para categorizá-lo e uma descrição concisa.

Analise o seguinte link:
Título: {{{title}}}
URL: {{{url}}}

Agora, faça o seguinte:
1.  Escolha o nome do ícone mais relevante da lista abaixo. Retorne apenas o nome exato do ícone.
2.  Sugira um nome de grupo apropriado para este link. Exemplos: "Trabalho", "Desenvolvimento", "Notícias", "Finanças", "Estudo", "Entretenimento", "Ferramentas".
3.  Crie uma descrição curta e informativa (máximo 15 palavras) sobre o que é o link.

Lista de Ícones Disponíveis:
${iconNames.join(', ')}

Exemplos de raciocínio:
- Se for sobre código ou GitHub, use o ícone 'Github' e o grupo 'Desenvolvimento'.
- Se for uma ferramenta de design como Figma, use 'Palette' e o grupo 'Design' ou 'Trabalho'.
- Se for uma plataforma de streaming como Netflix, use 'Film' e o grupo 'Entretenimento'.
- Se for um site de notícias, use 'Globe' e o grupo 'Notícias'.
- Para links genéricos, 'Link' ou 'Globe' são boas opções de ícone e 'Geral' para o grupo.

Sua resposta deve ser um objeto JSON completo com os campos "iconName", "group", e "description".`,
});

const suggestLinkDetailsFlow = ai.defineFlow(
  {
    name: 'suggestLinkDetailsFlow',
    inputSchema: SuggestLinkDetailsInputSchema,
    outputSchema: SuggestLinkDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      return { iconName: 'Link', group: 'Geral', description: 'Não foi possível gerar uma descrição.' };
    }
    
    // Garante que o ícone retornado existe na nossa lista
    if (!iconNames.includes(output.iconName)) {
        return { ...output, iconName: 'Link' };
    }

    return output;
  }
);
