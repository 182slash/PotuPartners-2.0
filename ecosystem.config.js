/**
 * PM2 Ecosystem Configuration
 * PotuPartners — Production Process Manager
 *
 * Usage:
 *   pm2 start ecosystem.config.js           # Start all apps
 *   pm2 restart ecosystem.config.js         # Restart all
 *   pm2 reload ecosystem.config.js          # Zero-downtime reload
 *   pm2 stop ecosystem.config.js            # Stop all
 *   pm2 logs potupartners-api               # Stream logs
 *   pm2 monit                               # Live process monitor
 *   pm2 save && pm2 startup                 # Persist across reboots
 */

module.exports = {
  apps: [

    // ─── Node.js Express API + Socket.io ──────────────────────────────────────
    {
      name:             'potupartners-api',
      script:           'dist/index.js',
      cwd:              '/opt/potupartners/backend',

      // Cluster mode: one worker per CPU core (max 4 for a 4GB droplet)
      instances:        'max',
      exec_mode:        'cluster',

      // Environment
      env_production: {
        NODE_ENV: 'production',
        PORT:     4000,
      },
      env_development: {
        NODE_ENV:  'development',
        PORT:      4000,
      },

      // Restart strategy
      max_restarts:         10,
      min_uptime:           '5s',
      restart_delay:        1000,       // 1 second between restarts
      exp_backoff_restart_delay: 100,   // Exponential backoff up to 16s

      // Memory limit — restart if > 512MB (normal usage ~80–150MB)
      max_memory_restart:   '512M',

      // Logging
      log_file:         '/var/log/potupartners/api-combined.log',
      out_file:         '/var/log/potupartners/api-out.log',
      error_file:       '/var/log/potupartners/api-error.log',
      log_date_format:  'YYYY-MM-DD HH:mm:ss Z',
      merge_logs:       true,

      // Watch (disabled in production — use deploy + reload instead)
      watch:            false,
      ignore_watch:     ['node_modules', 'dist', 'logs'],

      // Graceful shutdown
      kill_timeout:         10000,    // Wait 10s for requests to finish
      listen_timeout:       8000,     // Wait 8s for port to be bound
      shutdown_with_message: false,

      // Node.js flags
      node_args:        '--max-old-space-size=512',

      // Source maps for better error traces
      source_map_support: true,

      // Health check
      health_check_grace_period: 3000,
    },

    // ─── Python FastAPI RAG Microservice ──────────────────────────────────────
    {
      name:         'potupartners-rag',
      script:       'gunicorn',
      args:         [
        'app.main:app',
        '--worker-class', 'uvicorn.workers.UvicornWorker',
        '--workers',      '2',
        '--bind',         '127.0.0.1:8000',
        '--timeout',      '120',          // RAG can take time for large docs
        '--keepalive',    '5',
        '--access-logfile', '/var/log/potupartners/rag-access.log',
        '--error-logfile',  '/var/log/potupartners/rag-error.log',
        '--log-level',      'info',
        '--capture-output',
        '--enable-stdio-inheritance',
      ].join(' '),
      cwd:          '/opt/potupartners/rag-service',
      interpreter:  '/opt/potupartners/rag-service/venv/bin/python',

      // Single process — ChromaDB is not thread-safe for writes
      instances: 1,
      exec_mode: 'fork',

      env_production: {
        PYTHONPATH:       '/opt/potupartners/rag-service',
        PYTHONUNBUFFERED: '1',
      },

      max_restarts:           5,
      min_uptime:             '10s',
      restart_delay:          2000,
      max_memory_restart:     '800M',   // ChromaDB + embeddings can use more RAM

      log_file:       '/var/log/potupartners/rag-combined.log',
      out_file:       '/var/log/potupartners/rag-out.log',
      error_file:     '/var/log/potupartners/rag-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs:     true,

      watch:          false,
      kill_timeout:   15000,
    },

  ],

  // ─── Deploy configuration ──────────────────────────────────────────────────
  deploy: {
    production: {
      user:         'potupartners',
      host:         ['YOUR_DROPLET_IP'],
      ref:          'origin/main',
      repo:         'git@github.com:your-org/potupartners.git',
      path:         '/opt/potupartners',
      'pre-deploy-local': '',
      'post-deploy':
        'cd backend && npm ci --omit=dev && npm run build && npm run migrate && ' +
        'cd ../rag-service && source venv/bin/activate && pip install -r requirements.txt && deactivate && ' +
        'pm2 reload ecosystem.config.js --env production && ' +
        'pm2 save',
      'pre-setup': '',
      env: {
        NODE_ENV: 'production',
      },
    },
  },
};
