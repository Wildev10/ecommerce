// src/app/page.tsx

'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function Home() {
    const [message, setMessage] = useState('Chargement...');

    useEffect(() => {
        api.get('/test')
            .then((response) => {
                setMessage(response.data.message);
            })
            .catch((error) => {
                setMessage('Erreur de connexion à l\'API');
                console.error(error);
            });
    }, []);

    return (
        <main className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">
                    E-commerce Marketplace
                </h1>
                <p className="text-xl text-gray-600">
                    API Status: {message}
                </p>
            </div>
        </main>
    );
}
