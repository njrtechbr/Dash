'use client';

import { useState, useEffect } from 'react';

export const useTime = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000); // Atualiza a cada segundo

        return () => {
            clearInterval(timerId); // Limpa o intervalo quando o componente desmonta
        };
    }, []);

    const time = currentTime.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    const date = new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'full',
    }).format(currentTime);

    return { time, date: date.charAt(0).toUpperCase() + date.slice(1) };
};
