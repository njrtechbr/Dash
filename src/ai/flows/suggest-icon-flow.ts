'use server';
/**
 * @fileOverview Um agente de IA que sugere um ícone para um link.
 *
 * - suggestIcon - Uma função que lida com o processo de sugestão de ícone.
 * - SuggestIconInput - O tipo de entrada para a função suggestIcon.
 * - SuggestIconOutput - O tipo de retorno para a função suggestIcon.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { ICONS } from '@/lib/icons';

const iconNames = ICONS.map(icon => icon.name);

const SuggestIconInputSchema = z.object({
  title: z.string().describe('O título do link.'),
  url: z.string().url().describe('A URL do link.'),
});
export type SuggestIconInput = z.infer<typeof SuggestIconInputSchema>;

const SuggestIconOutputSchema = z.object({
  iconName: z.string().describe('O nome do ícone sugerido da lista fornecida.'),
});
export type SuggestIconOutput = z.infer<typeof SuggestIconOutputSchema>;

export async function suggestIcon(input: SuggestIconInput): Promise<SuggestIconOutput> {
  return suggestIconFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestIconPrompt',
  input: {schema: SuggestIconInputSchema},
  output: {schema: SuggestIconOutputSchema},
  prompt: `Você é um assistente de UI/UX expert em escolher ícones.
Sua tarefa é analisar o título e a URL de um link e escolher o ícone mais apropriado de uma lista pré-definida.

Analise o seguinte link:
Título: {{{title}}}
URL: {{{url}}}

Agora, escolha o nome do ícone mais relevante da lista abaixo. Retorne apenas o nome exato do ícone.

Lista de Ícones Disponíveis:
${iconNames.join(', ')}

Se a URL ou título for sobre desenvolvimento, código, ou tecnologia, considere ícones como 'Code', 'Terminal', 'Server', 'Database', 'GitBranch'.
Se for sobre uma empresa específica como GitHub, use 'Github'.
Para e-commerce, use 'ShoppingCart'.
Para entretenimento (filmes, música), use 'Film' ou 'Music'.
Para trabalho ou produtividade, use 'Briefcase' ou 'Folder'.
Para links genéricos, 'Link' ou 'Globe' são boas opções.

Sua resposta deve ser apenas o nome do ícone escolhido.`,
});

const suggestIconFlow = ai.defineFlow(
  {
    name: 'suggestIconFlow',
    inputSchema: SuggestIconInputSchema,
    outputSchema: SuggestIconOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      return { iconName: 'Link' };
    }
    // Garante que o ícone retornado existe na nossa lista
    if (iconNames.includes(output.iconName)) {
        return output;
    }
    return { iconName: 'Link' };
  }
);
