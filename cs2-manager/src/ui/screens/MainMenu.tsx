// src/ui/screens/MainMenu.tsx
import React from 'react';
import { Button } from '../components/Button';

// Interface para definir as ações que o menu pode realizar
interface MainMenuProps {
    onStartNew: () => void;
    onLoadSave: (saveId: string) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartNew, onLoadSave }) => {
    // Simulando alguns saves para visualização (depois você conectará isso ao localStorage ou backend)
    const savedLeagues = [
        { id: '1', name: 'Major Copenhagen Run', team: 'FURIA', date: '22/12/2025' },
        { id: '2', name: 'Liga Brasileira', team: 'Imperial', date: '20/12/2025' },
    ];

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '100vh', 
            padding: '20px',
            gap: '3rem',
            background: 'linear-gradient(to bottom, #0f172a, #111827)' // Fundo sutil
        }}>
            
            {/* Título Centralizado no Topo */}
            <h1 style={{ 
                fontSize: '3.5rem', 
                color: '#fff', 
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '6px',
                margin: 0,
                textShadow: '0 0 20px rgba(6, 182, 212, 0.4)' // Brilho neon azul ciano do seu tema
            }}>
                Simulado de<br/>
                <span style={{ color: '#06b6d4' }}>Manager E-SPORTS</span>
            </h1>

            {/* Área de Ação Principal */}
            <div style={{ 
                width: '100%', 
                maxWidth: '500px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '40px' 
            }}>
                
                {/* Botão Gigante de Iniciar */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Button 
                        onClick={onStartNew}
                        style={{ 
                            width: '100%', 
                            padding: '24px', 
                            fontSize: '1.8rem', 
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            boxShadow: '0 0 30px rgba(6, 182, 212, 0.25)',
                            border: '1px solid #06b6d4',
                            cursor: 'pointer'
                        }}
                    >
                        Iniciar Nova Liga
                    </Button>
                </div>

                {/* Lista de Saves */}
                <div style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.03)', 
                    borderRadius: '16px', 
                    padding: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <h3 style={{ 
                        color: '#94a3b8', 
                        marginTop: 0, 
                        marginBottom: '15px', 
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        Continuar Carreira
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {savedLeagues.map(save => (
                            <div key={save.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '16px',
                                backgroundColor: '#1e293b',
                                borderRadius: '8px',
                                borderLeft: '4px solid #3b82f6', // Detalhe azul na lateral
                                transition: 'transform 0.2s'
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ color: '#e2e8f0', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                        {save.name}
                                    </span>
                                    <span style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
                                        Time: <span style={{ color: '#94a3b8' }}>{save.team}</span> • {save.date}
                                    </span>
                                </div>
                                
                                <Button 
                                    onClick={() => onLoadSave(save.id)}
                                    style={{ 
                                        padding: '10px 24px', 
                                        fontSize: '0.9rem',
                                        backgroundColor: '#334155', // Cor mais neutra para ação secundária
                                        color: '#fff'
                                    }}
                                >
                                    PLAY ▶
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};