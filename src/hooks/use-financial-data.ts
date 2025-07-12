'use client';

import { useState, useEffect, useCallback } from 'react';

// API Pública: https://docs.awesomeapi.com.br/api-de-moedas
const API_URL = 'https://economia.awesomeapi.com.br/json/last/';
const CODES = ['USD-BRL', 'EUR-BRL', 'BTC-BRL'];

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
        default:
            return data.bid ? parseFloat(data.bid).toFixed(2) : 'N/A';
    }
}


export const useFinancialData = () => {
    const [financialData, setFinancialData] = useState<Record<string, FinancialInfo>>({});
    const [financialError, setFinancialError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const codesString = CODES.join(',');

        try {
            const lastFetch = localStorage.getItem('financialLastFetch');
            const cachedData = localStorage.getItem('financialData');
            
            if (lastFetch && cachedData && (new Date().getTime() - Number(lastFetch)) < CACHE_DURATION) {
                const parsedCache = JSON.parse(cachedData);
                if(CODES.every(code => parsedCache[code])) {
                  setFinancialData(parsedCache);
                  setFinancialError(null);
                  setIsLoading(false);
                  return;
                }
            }

            const response = await fetch(`${API_URL}${codesString}`);
            if (!response.ok) {
                const errorText = await response.text();
                if (response.status === 404 && errorText.includes('Coin not found')) {
                    throw new Error('Uma ou mais moedas não foram encontradas.');
                }
                throw new Error('Falha ao buscar dados financeiros.');
            }
            
            const data = await response.json();
            
            const formattedData: Record<string, FinancialInfo> = {};
            
            Object.keys(data).forEach(key => {
                const itemData = data[key];
                const code = itemData.code + '-' + itemData.codein;

                formattedData[code] = {
                    value: formatValue(code, itemData),
                    name: itemData.name,
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
            const cachedData = localStorage.getItem('financialData');
            if (cachedData) {
                setFinancialData(JSON.parse(cachedData));
            }
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, CACHE_DURATION);
        return () => clearInterval(intervalId);
    }, [fetchData]);

    return { financialData, financialError, isLoading };
};
