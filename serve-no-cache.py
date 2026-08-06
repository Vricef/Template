#!/usr/bin/env python3
"""
Serveur HTTP local sans cache pour le développement
"""
import http.server
import socketserver
from http.server import SimpleHTTPRequestHandler

class NoCacheHTTPRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Désactive le cache pour tous les fichiers
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

PORT = 8000
Handler = NoCacheHTTPRequestHandler

print(f'🚀 Serveur démarré sur http://localhost:{PORT}')
print('📝 Cache désactivé - Les fichiers seront toujours rafraîchis')
print('⏹️  Appuyez sur Ctrl+C pour arrêter\n')

with socketserver.TCPServer(('', PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\n\n✅ Serveur arrêté')

