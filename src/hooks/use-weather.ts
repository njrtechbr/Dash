'use client';

import { useState, useEffect } from 'react';

// Usando API gratuita Open-Meteo para previsão e Geocoding
const GEO_API_URL = 'https://geocoding-api.open-meteo.com/v1/search?count=1&language=pt&format=json&name=';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast?current_weather=true';

interface WeatherData {
    temp: string;
    city: string;
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

    useEffect(() => {
        const fetchWeather = (lat: number, lon: number, city: string) => {
             fetch(`${WEATHER_API_URL}&latitude=${lat}&longitude=${lon}`)
                .then(res => res.json())
                .then(data => {
                    if (data.current_weather) {
                        const { temperature, weathercode } = data.current_weather;
                        setWeather({
                            temp: Math.round(temperature).toString(),
                            city: city,
                            description: WEATHER_CODES[weathercode] || 'Condição desconhecida'
                        });
                        setWeatherError(null);
                    } else {
                        throw new Error('Dados de clima não encontrados na resposta.');
                    }
                })
                .catch(error => {
                    if (error instanceof Error) setWeatherError(error.message);
                    else setWeatherError('Erro ao buscar clima.');
                    console.error(error);
                })
                .finally(() => setIsLoading(false));
        }

        const getLocation = () => {
            setIsLoading(true);
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                          .then(res => res.json())
                          .then(geoData => {
                              const city = geoData.address.city || geoData.address.town || geoData.address.village || 'sua localização';
                              fetchWeather(latitude, longitude, city);
                          }).catch(() => {
                            // Fallback se a geocodificação reversa falhar
                             fetchWeather(latitude, longitude, 'sua localização');
                          })
                    },
                    (error) => {
                        setWeatherError('Não foi possível obter a localização.');
                        console.error(error);
                        setIsLoading(false);
                    },
                    { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
                );
            } else {
                setWeatherError('Geolocalização não é suportada por este navegador.');
                setIsLoading(false);
            }
        };

        getLocation();
    }, []);

    return { weather, weatherError, isLoading };
};
