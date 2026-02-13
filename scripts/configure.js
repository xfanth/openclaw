#!/usr/bin/env node
// =============================================================================
// OpenClaw Configuration Generator
// =============================================================================
// This script reads environment variables and generates openclaw.json
// Uses minimal config format that OpenClaw expects
// =============================================================================

const fs = require('fs');
const path = require('path');

// Configuration paths
const STATE_DIR = (process.env.OPENCLAW_STATE_DIR || '/data/.openclaw').replace(/\/+$/, '');
const WORKSPACE_DIR = (process.env.OPENCLAW_WORKSPACE_DIR || '/data/workspace').replace(/\/+$/, '');
const CONFIG_FILE = process.env.OPENCLAW_CONFIG_PATH || path.join(STATE_DIR, 'openclaw.json');
const CUSTOM_CONFIG = process.env.OPENCLAW_CUSTOM_CONFIG || '/app/config/openclaw.json';

console.log('[configure] state dir:', STATE_DIR);
console.log('[configure] workspace dir:', WORKSPACE_DIR);
console.log('[configure] config file:', CONFIG_FILE);

// Ensure directories exist
fs.mkdirSync(STATE_DIR, { recursive: true });
fs.mkdirSync(WORKSPACE_DIR, { recursive: true });

// Parse comma-separated list
function parseList(value) {
    if (!value) return undefined;
    return value.split(',').map(s => s.trim()).filter(s => s);
}

// Parse boolean
function parseBool(value) {
    if (!value) return undefined;
    return value.toLowerCase() === 'true' || value === '1';
}

// =============================================================================
// Build configuration from environment variables
// =============================================================================
function buildConfig() {
    const config = {};

    // =========================================================================
    // Agents Configuration - minimal
    // =========================================================================
    config.agents = {
        defaults: {
            workspace: WORKSPACE_DIR
        }
    };

    if (process.env.OPENCLAW_PRIMARY_MODEL) {
        config.agents.defaults.model = process.env.OPENCLAW_PRIMARY_MODEL;
    }

    // =========================================================================
    // Models / Providers Configuration - only apiKey, no baseUrl/models
    // =========================================================================
    const providers = {};

    const providerMap = {
        'anthropic': process.env.ANTHROPIC_API_KEY,
        'openai': process.env.OPENAI_API_KEY,
        'openrouter': process.env.OPENROUTER_API_KEY,
        'gemini': process.env.GEMINI_API_KEY,
        'xai': process.env.XAI_API_KEY,
        'groq': process.env.GROQ_API_KEY,
        'mistral': process.env.MISTRAL_API_KEY,
        'cerebras': process.env.CEREBRAS_API_KEY,
        'venice': process.env.VENICE_API_KEY,
        'moonshot': process.env.MOONSHOT_API_KEY,
        'kimi': process.env.KIMI_API_KEY,
        'zai': process.env.ZAI_API_KEY,
        'minimax': process.env.MINIMAX_API_KEY,
        'aiGateway': process.env.AI_GATEWAY_API_KEY,
        'opencode': process.env.OPENCODE_API_KEY,
        'synthetic': process.env.SYNTHETIC_API_KEY,
        'copilot': process.env.COPILOT_GITHUB_TOKEN,
        'xiaomi': process.env.XIAOMI_API_KEY,
    };

    for (const [name, apiKey] of Object.entries(providerMap)) {
        if (apiKey) {
            providers[name] = { apiKey };
        }
    }

    // AWS Bedrock
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        providers.bedrock = {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION || 'us-east-1',
        };
    }

    // Ollama
    if (process.env.OLLAMA_BASE_URL) {
        providers.ollama = { baseUrl: process.env.OLLAMA_BASE_URL };
    }

    if (Object.keys(providers).length > 0) {
        config.models = { providers };
    }

    // =========================================================================
    // Gateway Configuration
    // =========================================================================
    if (process.env.OPENCLAW_GATEWAY_TOKEN) {
        config.gateway = {
            auth: { token: process.env.OPENCLAW_GATEWAY_TOKEN }
        };
    }
    if (process.env.OPENCLAW_GATEWAY_BIND) {
        config.gateway = config.gateway || {};
        config.gateway.bind = process.env.OPENCLAW_GATEWAY_BIND;
    }

    // =========================================================================
    // Hooks Configuration
    // =========================================================================
    if (parseBool(process.env.HOOKS_ENABLED)) {
        config.hooks = { enabled: true };
        if (process.env.HOOKS_TOKEN) {
            config.hooks.token = process.env.HOOKS_TOKEN;
        }
        if (process.env.HOOKS_PATH) {
            config.hooks.path = process.env.HOOKS_PATH;
        }
    }

    // =========================================================================
    // WhatsApp Configuration
    // =========================================================================
    if (parseBool(process.env.WHATSAPP_ENABLED) || process.env.WHATSAPP_DM_POLICY) {
        config.channels = config.channels || {};
        config.channels.whatsapp = {};
        
        if (process.env.WHATSAPP_DM_POLICY) {
            config.channels.whatsapp.dmPolicy = process.env.WHATSAPP_DM_POLICY;
        }
        if (process.env.WHATSAPP_ALLOW_FROM) {
            config.channels.whatsapp.allowFrom = parseList(process.env.WHATSAPP_ALLOW_FROM);
        }
        // Note: groups configuration simplified - policy is complex object
    }

    // =========================================================================
    // Telegram Configuration
    // =========================================================================
    if (process.env.TELEGRAM_BOT_TOKEN) {
        config.channels = config.channels || {};
        config.channels.telegram = {
            botToken: process.env.TELEGRAM_BOT_TOKEN,
        };
        if (process.env.TELEGRAM_DM_POLICY) {
            config.channels.telegram.dmPolicy = process.env.TELEGRAM_DM_POLICY;
        }
        if (process.env.TELEGRAM_ALLOW_FROM) {
            config.channels.telegram.allowFrom = parseList(process.env.TELEGRAM_ALLOW_FROM);
        }
    }

    // =========================================================================
    // Discord Configuration
    // =========================================================================
    if (process.env.DISCORD_BOT_TOKEN) {
        config.channels = config.channels || {};
        config.channels.discord = {
            botToken: process.env.DISCORD_BOT_TOKEN,
        };
        if (process.env.DISCORD_DM_POLICY) {
            config.channels.discord.dmPolicy = process.env.DISCORD_DM_POLICY;
        }
    }

    // =========================================================================
    // Slack Configuration
    // =========================================================================
    if (process.env.SLACK_BOT_TOKEN) {
        config.channels = config.channels || {};
        config.channels.slack = {
            botToken: process.env.SLACK_BOT_TOKEN,
        };
        if (process.env.SLACK_APP_TOKEN) {
            config.channels.slack.appToken = process.env.SLACK_APP_TOKEN;
        }
    }

    // =========================================================================
    // Browser Tool Configuration - minimal
    // =========================================================================
    if (process.env.BROWSER_CDP_URL) {
        config.tools = config.tools || {};
        config.tools.browser = {
            cdpUrl: process.env.BROWSER_CDP_URL,
        };
    }

    return config;
}

// =============================================================================
// Build configuration from scratch (do NOT load persisted config)
// =============================================================================
const config = buildConfig();
console.log('[configure] generated configuration from environment variables');

// Optionally load custom config if provided (but don't merge with persisted)
try {
    const customRaw = fs.readFileSync(CUSTOM_CONFIG, 'utf8');
    const custom = JSON.parse(customRaw);
    // Only use custom config if env vars didn't set these sections
    if (!config.agents && custom.agents) config.agents = custom.agents;
    if (!config.models && custom.models) config.models = custom.models;
    if (!config.channels && custom.channels) config.channels = custom.channels;
    if (!config.gateway && custom.gateway) config.gateway = custom.gateway;
    if (!config.hooks && custom.hooks) config.hooks = custom.hooks;
    if (!config.tools && custom.tools) config.tools = custom.tools;
    console.log('[configure] loaded custom config from', CUSTOM_CONFIG);
} catch {
    // No custom config file — that's fine
}

// 4. Write configuration file
const configJson = JSON.stringify(config, null, 2);
fs.writeFileSync(CONFIG_FILE, configJson, 'utf8');
console.log('[configure] wrote config to', CONFIG_FILE);

// Also write a backup
const backupFile = path.join(STATE_DIR, 'openclaw.json.backup');
fs.writeFileSync(backupFile, configJson, 'utf8');

// Set proper permissions
try {
    fs.chmodSync(CONFIG_FILE, 0o600);
    fs.chmodSync(backupFile, 0o600);
} catch (e) {
    console.log('[configure] warning: could not set file permissions');
}

console.log('[configure] configuration complete');
