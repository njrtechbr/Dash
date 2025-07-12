'use client';

import { useState, useEffect, useCallback } from 'react';

// API Pública: https://docs.awesomeapi.com.br/api-de-moedas e https://brapi.dev/docs
const AWESOME_API_URL = 'https://economia.awesomeapi.com.br/json/last/';
const BRAPI_API_URL = 'https://brapi.dev/api/quote/';

const CODES = ['USD-BRL', 'EUR-BRL', 'BTC-BRL'];
const STOCKS = ['^BVSP', 'IXIC', 'GSPC']; // IBOVESPA, NASDAQ, S&P 500

interface FinancialInfo {
    value: string;
    name: string;
    change: string;
    isPositive: boolean;
}

const CACHE_DURATION = 300000; // 5 minutos

const formatCurrencyValue = (code: string, data: any): string => {
    switch (code) {
        case 'USD-BRL':
        case 'EUR-BRL':
            return parseFloat(data.bid).toFixed(2);
        case 'BTC-BRL':
             return (parseFloat(data.bid) * 1000).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        default:
            return data.bid ? parseFloat(data.bid).toFixed(2) : 'N/A';
    }
}

const formatStockValue = (data: any): string => {
    return data.regularMarketPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const useFinancialData = () => {
    const [financialData, setFinancialData] = useState<Record<string, FinancialInfo>>({});
    const [financialError, setFinancialError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const fetchData = useCallback(async () => {
        setIsLoading(true);

        try {
            const lastFetch = localStorage.getItem('financialLastFetch');
            const cachedData = localStorage.getItem('financialData');
            
            if (lastFetch && cachedData && (new Date().getTime() - Number(lastFetch)) < CACHE_DURATION) {
                const parsedCache = JSON.parse(cachedData);
                 if (CODES.every(code => parsedCache[code]) && STOCKS.every(stock => parsedCache[stock])) {
                    setFinancialData(parsedCache);
                    setFinancialError(null);
                    setIsLoading(false);
                    return;
                }
            }
            
            // Fetch Currencies
            const currencyResponse = await fetch(`${AWESOME_API_URL}${CODES.join(',')}`);
            if (!currencyResponse.ok) throw new Error('Falha ao buscar cotações de moedas.');
            const currencyData = await currencyResponse.json();

            // Fetch Stocks
            const stockResponse = await fetch(`${BRAPI_API_URL}${STOCKS.join(',')}`);
            if (!stockResponse.ok) throw new Error('Falha ao buscar dados de ações.');
            const stockData = await stockResponse.json();

            const formattedData: Record<string, FinancialInfo> = {};
            
            // Process Currencies
            Object.keys(currencyData).forEach(key => {
                const itemData = currencyData[key];
                const code = itemData.code + '-' + itemData.codein;
                const change = parseFloat(itemData.pctChange);
                formattedData[code] = {
                    value: formatCurrencyValue(code, itemData),
                    name: itemData.name.split('/')[0],
                    change: `${change.toFixed(2)}%`,
                    isPositive: change >= 0,
                };
            });

            // Process Stocks
            stockData.results.forEach((item: any) => {
                const change = item.regularMarketChangePercent;
                formattedData[item.symbol] = {
                    value: formatStockValue(item),
                    name: item.longName,
                    change: `${change.toFixed(2)}%`,
                    isPositive: change >= 0,
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
