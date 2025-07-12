'use client';

import { useState, useEffect } from 'react';

// API Pública: https://docs.awesomeapi.com.br/api-de-moedas
const API_URL = 'https://economia.awesomeapi.com.br/json/last/USD-BRL';

export const useDollarRate = () => {
    const [dollarRate, setDollarRate] = useState<string | null>(null);
    const [dollarError, setDollarError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDollarRate = async () => {
            try {
                // Para evitar sobrecarga, buscamos a cada 5 minutos
                // Uma solução em produção poderia usar um cache mais robusto
                const lastFetch = localStorage.getItem('dollarLastFetch');
                const cachedData = localStorage.getItem('dollarData');

                if (lastFetch && cachedData && (new Date().getTime() - Number(lastFetch)) < 300000) {
                    const data = JSON.parse(cachedData);
                    const rate = parseFloat(data.USDBRL.bid).toFixed(2);
                    setDollarRate(rate);
                    return;
                }

                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error('Falha ao buscar cotação do dólar.');
                }
                const data = await response.json();

                if (data.USDBRL && data.USDBRL.bid) {
                    const rate = parseFloat(data.USDBRL.bid).toFixed(2);
                    setDollarRate(rate);
                    localStorage.setItem('dollarData', JSON.stringify(data));
                    localStorage.setItem('dollarLastFetch', new Date().getTime().toString());
                    setDollarError(null);
                } else {
                    throw new Error('Formato de resposta inesperado da API.');
                }
            } catch (error) {
                if (error instanceof Error) {
                    setDollarError(error.message);
                } else {
                    setDollarError('Ocorreu um erro desconhecido.');
                }
                console.error(error);
            }
        };

        fetchDollarRate();
         // Opcional: recarregar a cada 5 minutos
        const intervalId = setInterval(fetchDollarRate, 300000);

        return () => clearInterval(intervalId);
    }, []);

    return { dollarRate, dollarError };
};
