'use client';

import { useState, useEffect, useCallback } from 'react';
import type { FinancialInfo, HistoryData } from '@/types';

// API Pública: https://docs.awesomeapi.com.br/api-de-moedas
const AWESOME_API_URL = 'https://economia.awesomeapi.com.br/json';

const CODES = ['USD-BRL', 'EUR-BRL'];
const HISTORY_DAYS = 7;

const CACHE_DURATION = 300000; // 5 minutos
const STALE_DURATION = 60000; // 1 minuto para dados "stale"

const formatCurrencyValue = (valueStr: string | number): string => {
    const value = parseFloat(String(valueStr));
    if (isNaN(value)) {
        return 'N/A';
    }
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const useFinancialData = () => {
    const [financialData, setFinancialData] = useState<Record<string, FinancialInfo>>({});
    const [financialError, setFinancialError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        let currentError: string | null = null;
        const finalData: Record<string, FinancialInfo> = {};
        
        try {
            const [currentDataResponse, ...historyResponses] = await Promise.all([
                fetch(`${AWESOME_API_URL}/last/${CODES.join(',')}`),
                ...CODES.map(code => fetch(`${AWESOME_API_URL}/daily/${code}/${HISTORY_DAYS}`))
            ]);

            if (!currentDataResponse.ok) throw new Error('Falha ao buscar cotações atuais.');
            const currentData = await currentDataResponse.json();

            const historyData: Record<string, any[]> = {};
            await Promise.all(historyResponses.map(async (res, index) => {
                if (res.ok) {
                    historyData[CODES[index]] = await res.json();
                }
            }));
            
            Object.keys(currentData).forEach(key => {
                const itemData = currentData[key];
                const code = itemData.code + '-' + itemData.codein;
                const change = parseFloat(itemData.pctChange);

                const history: HistoryData[] = (historyData[code] || []).map(h => ({
                    date: new Date(Number(h.timestamp) * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit'}),
                    value: parseFloat(h.bid)
                })).reverse();

                finalData[code] = {
                    value: formatCurrencyValue(itemData.bid),
                    name: itemData.name.split('/')[0],
                    change: `${change.toFixed(2)}%`,
                    isPositive: change >= 0,
                    footer: 'Comercial',
                    history: history,
                };
            });

             if (Object.keys(finalData).length > 0) {
                 setFinancialData(finalData);
            }

        } catch (error) {
            console.error("Currency fetch error:", error);
            if (error instanceof Error) currentError = error.message;
        }

        setFinancialError(currentError);
        setIsLoading(false);

    }, []);
    
    useEffect(() => {
        // Busca inicial
        fetchData();

        // Busca em intervalos regulares
        const intervalId = setInterval(fetchData, CACHE_DURATION);

        return () => clearInterval(intervalId);
    }, [fetchData]);

    return { financialData, financialError, isLoading };
};
