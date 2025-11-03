#!/usr/bin/env node
/**
 * Script de desenvolvimento para Replit com live reload
 * Este script reinicia automaticamente o servidor quando arquivos são alterados
 */

import { spawn } from 'child_process';
import { watch } from 'fs';
import { resolve } from 'path';

let serverProcess = null;

function startServer() {
  if (serverProcess) {
    console.log('🔄 Reiniciando servidor...');
    serverProcess.kill('SIGTERM');
  }

  console.log('🚀 Iniciando servidor de desenvolvimento...');
  serverProcess = spawn('tsx', ['server/index.ts'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });

  serverProcess.on('exit', (code) => {
    if (code !== null && code !== 0 && code !== 143) {
      console.log(`❌ Servidor saiu com código ${code}`);
    }
  });
}

function setupWatcher() {
  const watchPaths = ['server/', 'shared/', 'client/src/'];
  
  watchPaths.forEach(path => {
    const fullPath = resolve(path);
    console.log(`👀 Observando mudanças em: ${fullPath}`);
    
    watch(fullPath, { recursive: true }, (eventType, filename) => {
      if (filename && (
        filename.endsWith('.ts') || 
        filename.endsWith('.tsx') || 
        filename.endsWith('.js') || 
        filename.endsWith('.jsx')
      )) {
        console.log(`📁 Arquivo alterado: ${filename}`);
        // Debounce: aguarda um pouco antes de reiniciar
        clearTimeout(restartTimeout);
        restartTimeout = setTimeout(startServer, 500);
      }
    });
  });
}

let restartTimeout;

// Inicia o servidor
startServer();
setupWatcher();

// Lida com encerramento gracioso
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando servidor de desenvolvimento...');
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }
  process.exit(0);
});

console.log('✅ Servidor de desenvolvimento iniciado!');
console.log('💡 Pressione Ctrl+C para parar');