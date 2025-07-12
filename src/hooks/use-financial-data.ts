'use client';

import { useState, useEffect, useCallback } from 'react';

// API Pública: https://docs.awesomeapi.com.br/api-de-moedas
const API_URL = 'https://economia.awesomeapi.com.br/json/last/';

interface FinancialInfo {
    value: string;
    name: string;
}

const CACHE_DURATION = 300000; // 5 minutos

const formatValue = (code: string, data: any): string => {
    switch (code) {
        case 'USD-BRL':
        case 'EUR-BRL':
            return parseFloat(data.bid).toFixed(2);
        case 'BTC-BRL':
             return parseFloat(data.bid).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        case 'IBOV':
            // A API de cotações parece não ter mais IBOV, mas mantemos a lógica
            // Em um caso real, usaríamos uma API específica para B3
            return parseFloat(data.pctChange).toFixed(2);
        default:
            return data.bid ? parseFloat(data.bid).toFixed(2) : 'N/A';
    }
}


export const useFinancialData = (codes: string[]) => {
    const [financialData, setFinancialData] = useState<Record<string, FinancialInfo>>({});
    const [financialError, setFinancialError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const codesString = codes.join(',');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const lastFetch = localStorage.getItem('financialLastFetch');
            const cachedData = localStorage.getItem('financialData');
            
            if (lastFetch && cachedData && (new Date().getTime() - Number(lastFetch)) < CACHE_DURATION) {
                setFinancialData(JSON.parse(cachedData));
                setIsLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}${codesString}`);
            if (!response.ok) {
                throw new Error('Falha ao buscar dados financeiros.');
            }
            
            const data = await response.json();
            
            const formattedData: Record<string, FinancialInfo> = {};
            
            Object.keys(data).forEach(key => {
                const code = data[key].code + '-' + data[key].codein;
                // Para o IBOV que não segue o padrão
                const lookupKey = codes.find(c => c.startsWith(data[key].code)) || code;

                formattedData[lookupKey] = {
                    value: formatValue(lookupKey, data[key]),
                    name: data[key].name,
                };
            });
            
            setFinancialData(formattedData);
            localStorage.setItem('financialData', JSON.stringify(formattedData));
            localStorage.setItem('financialLastFetch', new Date().getTime().toString());
            setFinancialError(null);

        } catch (error) {
            if (error instanceof Error) {
                setFinancialError(error.message);
            } else {
                setFinancialError('Ocorreu um erro desconhecido.');
            }
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [codesString]);

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, CACHE_DURATION);
        return () => clearInterval(intervalId);
    }, [fetchData]);

    return { financialData, financialError, isLoading };
};
