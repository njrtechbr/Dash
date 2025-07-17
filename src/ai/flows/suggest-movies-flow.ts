'use server';
/**
 * @fileOverview Um agente de IA que sugere filmes com base nas preferências do usuário.
 *
 * - suggestMovies - Uma função que lida com o processo de sugestão de filmes.
 * - SuggestMoviesInput - O tipo de entrada para a função suggestMovies.
 * - SuggestMoviesOutput - O tipo de retorno para a função suggestMovies.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SuggestMoviesInputSchema = z.object({
  prompt: z.string().describe('As preferências do usuário, como gêneros, filmes favoritos ou temas.'),
  watchedMovies: z.array(z.string()).optional().describe('Uma lista de filmes que o usuário já assistiu ou tem na lista.'),
});
export type SuggestMoviesInput = z.infer<typeof SuggestMoviesInputSchema>;

const SuggestMoviesOutputSchema = z.object({
  recommendations: z.array(z.object({
    title: z.string().describe('O nome original do filme.'),
    year: z.number().describe('O ano de lançamento do filme.'),
    reason: z.string().describe('Uma breve explicação do porquê o filme está sendo recomendado.'),
  })).describe('Uma lista de filmes recomendados.'),
});
export type SuggestMoviesOutput = z.infer<typeof SuggestMoviesOutputSchema>;

export async function suggestMovies(input: SuggestMoviesInput): Promise<SuggestMoviesOutput> {
  try {
    return await suggestMoviesFlow(input);
  } catch (error) {
    console.warn('Erro na sugestão de filmes:', error);
    return { recommendations: [] };
  }
}

const prompt = ai.definePrompt({
  name: 'suggestMoviesPrompt',
  input: {schema: SuggestMoviesInputSchema},
  output: {schema: SuggestMoviesOutputSchema},
  prompt: `Você é um especialista em cinema e seu trabalho é recomendar filmes para os usuários com base em seus gostos.
Analise a solicitação do usuário e os filmes que ele já tem na lista para sugerir até 5 filmes relevantes. Para cada filme, forneça o nome original, o ano de lançamento e uma breve justificativa para a recomendação.

{{#if watchedMovies}}
O usuário já tem estes filmes na lista, use-os como inspiração:
{{#each watchedMovies}}
- {{this}}
{{/each}}
{{/if}}

{{#if prompt}}
A solicitação específica do usuário é: "{{{prompt}}}"
{{else}}
{{#if watchedMovies}}
O usuário não deu uma instrução específica, então baseie suas recomendações inteiramente nos filmes que ele já tem na lista.
{{else}}
O usuário não forneceu nenhuma informação. Recomende 5 filmes populares e aclamados de gêneros variados.
{{/if}}
{{/if}}

Exemplos de resposta:
- Se o usuário pedir "filmes de ficção científica como Blade Runner", você pode sugerir "Dune (2021)", "Arrival (2016)" ou "Interstellar (2014)".
- Se o usuário já tem "The Godfather" na lista, você pode sugerir "Goodfellas (1990)" ou "Pulp Fiction (1994)".

Retorne uma lista de recomendações no formato JSON especificado. Evite recomendar filmes que já estão na lista de filmes do usuário.`,
});

const suggestMoviesFlow = ai.defineFlow(
  {
    name: 'suggestMoviesFlow',
    inputSchema: SuggestMoviesInputSchema,
    outputSchema: SuggestMoviesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      return { recommendations: [] };
    }
    return output;
  }
);
