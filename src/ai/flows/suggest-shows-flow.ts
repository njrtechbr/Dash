'use server';
/**
 * @fileOverview Um agente de IA que sugere séries de TV com base nas preferências do usuário e no que ele já assiste.
 *
 * - suggestShows - Uma função que lida com o processo de sugestão de séries.
 * - SuggestShowsInput - O tipo de entrada para a função suggestShows.
 * - SuggestShowsOutput - O tipo de retorno para a função suggestShows.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SuggestShowsInputSchema = z.object({
  prompt: z.string().describe('As preferências do usuário, como gêneros, séries favoritas ou temas.'),
  watchedShows: z.array(z.string()).optional().describe('Uma lista de séries que o usuário já acompanha.'),
});
export type SuggestShowsInput = z.infer<typeof SuggestShowsInputSchema>;

const SuggestShowsOutputSchema = z.object({
  recommendations: z.array(z.object({
    name: z.string().describe('O nome original da série de TV.'),
    year: z.number().describe('O ano de lançamento da série.'),
    reason: z.string().describe('Uma breve explicação do porquê a série está sendo recomendada.'),
  })).describe('Uma lista de séries de TV recomendadas.'),
});
export type SuggestShowsOutput = z.infer<typeof SuggestShowsOutputSchema>;

export async function suggestShows(input: SuggestShowsInput): Promise<SuggestShowsOutput> {
  return suggestShowsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestShowsPrompt',
  input: {schema: SuggestShowsInputSchema},
  output: {schema: SuggestShowsOutputSchema},
  prompt: `Você é um especialista em séries de TV e seu trabalho é recomendar séries para os usuários com base em seus gostos.
Analise a solicitação do usuário e as séries que ele já assiste para sugerir até 5 séries relevantes. Para cada série, forneça o nome original, o ano de lançamento e uma breve justificativa para a recomendação.

{{#if watchedShows}}
O usuário já assiste estas séries, use-as como principal inspiração:
{{#each watchedShows}}
- {{this}}
{{/each}}
{{/if}}

{{#if prompt}}
A solicitação específica do usuário é: "{{{prompt}}}"
{{else}}
{{#if watchedShows}}
O usuário não deu uma instrução específica, então baseie suas recomendações inteiramente nas séries que ele já assiste.
{{else}}
O usuário não forneceu nenhuma informação. Recomende 5 séries populares e aclamadas de gêneros variados.
{{/if}}
{{/if}}


Exemplos de resposta:
- Se o usuário pedir "séries de comédia como The Office", você pode sugerir "Parks and Recreation (2009)", "Brooklyn Nine-Nine (2013)" e "Superstore (2015)".
- Se o usuário já assiste "Game of Thrones", você pode sugerir "The Witcher (2019)" ou "The Wheel of Time (2021)".

Retorne uma lista de recomendações no formato JSON especificado. Evite recomendar séries que já estão na lista de séries assistidas do usuário.`,
});

const suggestShowsFlow = ai.defineFlow(
  {
    name: 'suggestShowsFlow',
    inputSchema: SuggestShowsInputSchema,
    outputSchema: SuggestShowsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      return { recommendations: [] };
    }
    return output;
  }
);
