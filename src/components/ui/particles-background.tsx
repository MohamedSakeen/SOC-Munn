'use client';

import { useCallback, useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Container, ISourceOptions } from '@tsparticles/engine';

interface ParticlesBackgroundProps {
  variant?: 'default' | 'rain' | 'smoke' | 'dust' | 'matrix';
  className?: string;
}

export function ParticlesBackground({ variant = 'default', className }: ParticlesBackgroundProps) {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    // console.log('Particles loaded', container);
  }, []);

  const getConfig = (): ISourceOptions => {
    switch (variant) {
      case 'rain':
        return {
          fullScreen: false,
          background: { color: { value: 'transparent' } },
          fpsLimit: 60,
          particles: {
            color: { value: '#ffffff' },
            move: {
              direction: 'bottom',
              enable: true,
              speed: 15,
              straight: true,
            },
            number: { density: { enable: true }, value: 100 },
            opacity: { value: 0.3 },
            shape: { type: 'line' },
            size: { value: { min: 10, max: 20 } },
          },
        };

      case 'smoke':
        return {
          fullScreen: false,
          background: { color: { value: 'transparent' } },
          fpsLimit: 30,
          particles: {
            color: { value: '#888888' },
            move: {
              direction: 'top',
              enable: true,
              speed: 0.5,
              random: true,
              outModes: { default: 'out' },
            },
            number: { density: { enable: true }, value: 30 },
            opacity: { value: { min: 0.05, max: 0.2 } },
            shape: { type: 'circle' },
            size: { value: { min: 50, max: 150 } },
          },
        };

      case 'dust':
        return {
          fullScreen: false,
          background: { color: { value: 'transparent' } },
          fpsLimit: 30,
          particles: {
            color: { value: '#ffffff' },
            move: {
              direction: 'none',
              enable: true,
              speed: 0.3,
              random: true,
            },
            number: { density: { enable: true }, value: 50 },
            opacity: { 
              value: { min: 0.1, max: 0.4 },
              animation: { enable: true, speed: 0.5, sync: false }
            },
            shape: { type: 'circle' },
            size: { value: { min: 1, max: 3 } },
          },
        };

      case 'matrix':
        return {
          fullScreen: false,
          background: { color: { value: 'transparent' } },
          fpsLimit: 60,
          particles: {
            color: { value: '#00ff00' },
            move: {
              direction: 'bottom',
              enable: true,
              speed: 3,
              straight: true,
            },
            number: { density: { enable: true }, value: 80 },
            opacity: { value: { min: 0.1, max: 0.5 } },
            shape: { type: 'char', options: { char: { value: ['0', '1', '?', '*', '#'] } } },
            size: { value: 10 },
          },
        };

      default:
        return {
          fullScreen: false,
          background: { color: { value: 'transparent' } },
          fpsLimit: 60,
          interactivity: {
            events: {
              onHover: { enable: true, mode: 'grab' },
            },
            modes: {
              grab: { distance: 140, links: { opacity: 0.5 } },
            },
          },
          particles: {
            color: { value: '#ffffff' },
            links: {
              color: '#ffffff',
              distance: 150,
              enable: true,
              opacity: 0.1,
              width: 1,
            },
            move: {
              direction: 'none',
              enable: true,
              speed: 0.5,
              random: false,
            },
            number: { density: { enable: true }, value: 40 },
            opacity: { value: 0.2 },
            shape: { type: 'circle' },
            size: { value: { min: 1, max: 3 } },
          },
        };
    }
  };

  if (!init) return null;

  return (
    <Particles
      id={`tsparticles-${variant}`}
      className={className}
      particlesLoaded={particlesLoaded}
      options={getConfig()}
    />
  );
}
