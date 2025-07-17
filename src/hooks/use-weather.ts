'use client';

import { useState, useEffect, useCallback } from 'react';

const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast?current_weather=true';

interface WeatherData {
    temp: string;
    description: string;
}

const WEATHER_CODES: { [key: number]: string } = {
    0: 'Céu limpo',
    1: 'Quase limpo',
    2: 'Parcialmente nublado',
    3: 'Nublado',
    45: 'Nevoeiro',
    48: 'Nevoeiro depositando geada',
    51: 'Chuvisco leve',
    53: 'Chuvisco moderado',
    55: 'Chuvisco denso',
    61: 'Chuva leve',
    63: 'Chuva moderada',
    65: 'Chuva forte',
    71: 'Neve leve',
    73: 'Neve moderada',
    75: 'Neve forte',
    80: 'Pancadas de chuva leves',
    81: 'Pancadas de chuva moderadas',
    82: 'Pancadas de chuva violentas',
    95: 'Trovoada',
};

export const useWeather = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [weatherError, setWeatherError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchWeatherForCoords = useCallback(async (lat: number, lon: number) => {
        setIsLoading(true);
        setWeatherError(null);
        try {
            const response = await fetch(`${WEATHER_API_URL}&latitude=${lat}&longitude=${lon}&timestamp=${Date.now()}`);
            if (!response.ok) throw new Error('Falha na resposta da API de clima');
            
            const data = await response.json();
            if (data && data.current_weather) {
                const { temperature, weathercode } = data.current_weather;
                setWeather({
                    temp: Math.round(temperature).toString(),
                    description: WEATHER_CODES[weathercode] || 'Condição desconhecida'
                });
                setLastUpdated(new Date());
            } else {
                throw new Error('Dados de clima não encontrados na resposta.');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar clima.';
            setWeatherError(errorMessage);
            console.error("Weather fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const getLocationAndFetchWeather = useCallback(() => {
        setIsLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchWeatherForCoords(latitude, longitude);
                },
                (error) => {
                    // Usar localização padrão em caso de erro
                    console.warn("Geolocation error, using default location:", error);
                    fetchWeatherForCoords(-23.5505, -46.6333); // São Paulo como padrão
                },
                { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
            );
        } else {
            // Fallback: usar localização padrão (São Paulo) se geolocalização não estiver disponível
            console.warn('Geolocalização não suportada, usando localização padrão');
            fetchWeatherForCoords(-23.5505, -46.6333); // São Paulo como padrão
        }
    }, [fetchWeatherForCoords]);

    useEffect(() => {
        getLocationAndFetchWeather();
    }, [getLocationAndFetchWeather]);

    return { 
        weather, 
        weatherError, 
        isLoading,
        lastUpdated,
        refreshWeather: getLocationAndFetchWeather
    };
};

    