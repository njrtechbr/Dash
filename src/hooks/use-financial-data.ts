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
        let currentError: string | null = null;
        let finalData: Record<string, FinancialInfo> = {};

        const lastFetch = localStorage.getItem('financialLastFetch');
        const cachedData = localStorage.getItem('financialData');
        
        if (lastFetch && cachedData && (new Date().getTime() - Number(lastFetch)) < CACHE_DURATION) {
            const parsedCache = JSON.parse(cachedData) as Record<string, FinancialInfo>;
             if (CODES.every(code => parsedCache[code]) && STOCKS.every(stock => parsedCache[stock])) {
                setFinancialData(parsedCache);
                setFinancialError(null);
                setIsLoading(false);
                return;
            }
        }
        
        // Fetch Currencies
        try {
            const currencyResponse = await fetch(`${AWESOME_API_URL}${CODES.join(',')}`);
            if (!currencyResponse.ok) throw new Error('Falha ao buscar cotações de moedas.');
            const currencyData = await currencyResponse.json();
            Object.keys(currencyData).forEach(key => {
                const itemData = currencyData[key];
                const code = itemData.code + '-' + itemData.codein;
                const change = parseFloat(itemData.pctChange);
                finalData[code] = {
                    value: formatCurrencyValue(code, itemData),
                    name: itemData.name.split('/')[0],
                    change: `${change.toFixed(2)}%`,
                    isPositive: change >= 0,
                };
            });
        } catch (error) {
            console.error("Currency fetch error:", error);
            if (error instanceof Error) currentError = error.message;
             if(cachedData) {
                const parsedCache = JSON.parse(cachedData) as Record<string, FinancialInfo>;
                CODES.forEach(code => {
                    if(parsedCache[code]) finalData[code] = parsedCache[code];
                })
             }
        }

        // Fetch Stocks
        try {
            const stockResponse = await fetch(`${BRAPI_API_URL}${STOCKS.join(',')}`);
            if (stockResponse.ok) {
                const stockData = await stockResponse.json();
                 if (stockData.results) {
                    stockData.results.forEach((item: any) => {
                        const change = item.regularMarketChangePercent;
                        finalData[item.symbol] = {
                            value: formatStockValue(item),
                            name: item.longName || item.symbol,
                            change: `${change.toFixed(2)}%`,
                            isPositive: change >= 0,
                        };
                    });
                }
            } else if (stockResponse.status === 401) {
                console.warn("Stock fetch error: 401 Unauthorized. API may require a token.");
                if (!currentError) currentError = "Não foi possível carregar dados de ações (não autorizado)."
            }
        } catch(error) {
             console.error("Stock fetch error:", error);
             // Silently fail and rely on cache
        } finally {
             // Use cache for stocks if fetch failed but cache exists
             if(cachedData) {
                const parsedCache = JSON.parse(cachedData) as Record<string, FinancialInfo>;
                STOCKS.forEach(stock => {
                    // Only use cache if data wasn't successfully fetched in this run
                    if(parsedCache[stock] && !finalData[stock]) {
                        finalData[stock] = parsedCache[stock];
                    }
                })
             }
        }


        if (Object.keys(finalData).length > 0) {
             setFinancialData(finalData);
             localStorage.setItem('financialData', JSON.stringify(finalData));
             localStorage.setItem('financialLastFetch', new Date().getTime().toString());
        }

        setFinancialError(currentError);
        setIsLoading(false);

    }, []);

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, CACHE_DURATION);
        return () => clearInterval(intervalId);
    }, [fetchData]);

    return { financialData, financialError, isLoading };
};
