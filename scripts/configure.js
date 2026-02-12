#!/usr/bin/env node
// =============================================================================
// OpenClaw Configuration Generator
// =============================================================================
// This script reads environment variables and generates openclaw.json
// Supports all OpenClaw configuration options via environment variables
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

// Deep merge helper
function deepMerge(target, source) {
    for (const key of Object.keys(source)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) &&
            target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
            deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}

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

// Parse integer
function parseInt(value) {
    if (!value) return undefined;
    const n = Number(value);
    return isNaN(n) ? undefined : n;
}

// =============================================================================
// Build configuration from environment variables
// =============================================================================
function buildConfig() {
    const config = {
        agents: {},
        channels: {},
        models: {},
        tools: {},
        gateway: {},
        hooks: {},
    };

    // =========================================================================
    // Agents Configuration
    // =========================================================================
    if (process.env.OPENCLAW_PRIMARY_MODEL || process.env.OPENCLAW_FALLBACK_MODELS || 
        process.env.OPENCLAW_IMAGE_MODEL_PRIMARY || process.env.OPENCLAW_IMAGE_MODEL_FALLBACKS) {
        config.agents.defaults = config.agents.defaults || {};
        config.agents.defaults.model = config.agents.defaults.model || {};
        
        // Primary text model
        if (process.env.OPENCLAW_PRIMARY_MODEL) {
            config.agents.defaults.model.primary = process.env.OPENCLAW_PRIMARY_MODEL;
        }
        
        // Fallback text models (comma-separated list)
        if (process.env.OPENCLAW_FALLBACK_MODELS) {
            config.agents.defaults.model.fallbacks = parseList(process.env.OPENCLAW_FALLBACK_MODELS);
        }
        
        // Image models configuration
        if (process.env.OPENCLAW_IMAGE_MODEL_PRIMARY || process.env.OPENCLAW_IMAGE_MODEL_FALLBACKS) {
            config.agents.defaults.model.image = config.agents.defaults.model.image || {};
            
            if (process.env.OPENCLAW_IMAGE_MODEL_PRIMARY) {
                config.agents.defaults.model.image.primary = process.env.OPENCLAW_IMAGE_MODEL_PRIMARY;
            }
            
            if (process.env.OPENCLAW_IMAGE_MODEL_FALLBACKS) {
                config.agents.defaults.model.image.fallbacks = parseList(process.env.OPENCLAW_IMAGE_MODEL_FALLBACKS);
            }
        }
    }

    // Workspace configuration
    config.agents.defaults = {
        ...(config.agents.defaults || {}),
        workspace: WORKSPACE_DIR,
    };

    // =========================================================================
    // Models / Providers Configuration
    // =========================================================================
    const providers = {};

    // Anthropic
    if (process.env.ANTHROPIC_API_KEY) {
        providers.anthropic = { apiKey: process.env.ANTHROPIC_API_KEY };
        if (process.env.ANTHROPIC_BASE_URL) {
            providers.anthropic.baseUrl = process.env.ANTHROPIC_BASE_URL;
        }
    }

    // OpenAI
    if (process.env.OPENAI_API_KEY) {
        providers.openai = { apiKey: process.env.OPENAI_API_KEY };
        if (process.env.OPENAI_BASE_URL) {
            providers.openai.baseUrl = process.env.OPENAI_BASE_URL;
        }
    }

    // OpenRouter
    if (process.env.OPENROUTER_API_KEY) {
        providers.openrouter = { apiKey: process.env.OPENROUTER_API_KEY };
    }

    // Gemini
    if (process.env.GEMINI_API_KEY) {
        providers.gemini = { apiKey: process.env.GEMINI_API_KEY };
    }

    // xAI
    if (process.env.XAI_API_KEY) {
        providers.xai = { apiKey: process.env.XAI_API_KEY };
    }

    // Groq
    if (process.env.GROQ_API_KEY) {
        providers.groq = { apiKey: process.env.GROQ_API_KEY };
    }

    // Mistral
    if (process.env.MISTRAL_API_KEY) {
        providers.mistral = { apiKey: process.env.MISTRAL_API_KEY };
    }

    // Cerebras
    if (process.env.CEREBRAS_API_KEY) {
        providers.cerebras = { apiKey: process.env.CEREBRAS_API_KEY };
    }

    // Venice
    if (process.env.VENICE_API_KEY) {
        providers.venice = { apiKey: process.env.VENICE_API_KEY };
    }

    // Moonshot
    if (process.env.MOONSHOT_API_KEY) {
        providers.moonshot = { apiKey: process.env.MOONSHOT_API_KEY };
        if (process.env.MOONSHOT_BASE_URL) {
            providers.moonshot.baseUrl = process.env.MOONSHOT_BASE_URL;
        }
    }

    // Kimi
    if (process.env.KIMI_API_KEY) {
        providers.kimi = { apiKey: process.env.KIMI_API_KEY };
        if (process.env.KIMI_BASE_URL) {
            providers.kimi.baseUrl = process.env.KIMI_BASE_URL;
        }
    }

    // ZAI
    if (process.env.ZAI_API_KEY) {
        providers.zai = { apiKey: process.env.ZAI_API_KEY };
    }

    // Minimax
    if (process.env.MINIMAX_API_KEY) {
        providers.minimax = { apiKey: process.env.MINIMAX_API_KEY };
    }

    // AI Gateway
    if (process.env.AI_GATEWAY_API_KEY) {
        providers.aiGateway = { apiKey: process.env.AI_GATEWAY_API_KEY };
        if (process.env.AI_GATEWAY_BASE_URL) {
            providers.aiGateway.baseUrl = process.env.AI_GATEWAY_BASE_URL;
        }
    }

    // OpenCode
    if (process.env.OPENCODE_API_KEY) {
        providers.opencode = { apiKey: process.env.OPENCODE_API_KEY };
    }

    // Synthetic
    if (process.env.SYNTHETIC_API_KEY) {
        providers.synthetic = { apiKey: process.env.SYNTHETIC_API_KEY };
    }

    // Copilot/GitHub
    if (process.env.COPILOT_GITHUB_TOKEN) {
        providers.copilot = { apiKey: process.env.COPILOT_GITHUB_TOKEN };
    }

    // Xiaomi
    if (process.env.XIAOMI_API_KEY) {
        providers.xiaomi = { apiKey: process.env.XIAOMI_API_KEY };
    }

    // AWS Bedrock
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        providers.bedrock = {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION || 'us-east-1',
        };
        if (process.env.AWS_SESSION_TOKEN) {
            providers.bedrock.sessionToken = process.env.AWS_SESSION_TOKEN;
        }
        if (process.env.BEDROCK_PROVIDER_FILTER) {
            providers.bedrock.providerFilter = process.env.BEDROCK_PROVIDER_FILTER;
        }
    }

    // Ollama
    if (process.env.OLLAMA_BASE_URL) {
        providers.ollama = { baseUrl: process.env.OLLAMA_BASE_URL };
    }

    // Deepgram
    if (process.env.DEEPGRAM_API_KEY) {
        providers.deepgram = { apiKey: process.env.DEEPGRAM_API_KEY };
    }

    if (Object.keys(providers).length > 0) {
        config.models.providers = providers;
    }

    // =========================================================================
    // Gateway Configuration
    // =========================================================================
    if (process.env.OPENCLAW_GATEWAY_TOKEN) {
        config.gateway.token = process.env.OPENCLAW_GATEWAY_TOKEN;
    }
    if (process.env.OPENCLAW_GATEWAY_BIND) {
        config.gateway.bind = process.env.OPENCLAW_GATEWAY_BIND;
    }

    // =========================================================================
    // Hooks Configuration
    // =========================================================================
    if (parseBool(process.env.HOOKS_ENABLED)) {
        config.hooks.enabled = true;
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
    if (parseBool(process.env.WHATSAPP_ENABLED) || process.env.WHATSAPP_DM_POLICY || process.env.WHATSAPP_ALLOW_FROM) {
        config.channels.whatsapp = {};
        
        if (process.env.WHATSAPP_DM_POLICY) {
            config.channels.whatsapp.dmPolicy = process.env.WHATSAPP_DM_POLICY;
        }
        if (process.env.WHATSAPP_ALLOW_FROM) {
            config.channels.whatsapp.allowFrom = parseList(process.env.WHATSAPP_ALLOW_FROM);
        }
        if (process.env.WHATSAPP_GROUP_POLICY) {
            config.channels.whatsapp.groups = {
                policy: process.env.WHATSAPP_GROUP_POLICY,
            };
            if (process.env.WHATSAPP_GROUP_ALLOW_FROM) {
                config.channels.whatsapp.groups.allowFrom = parseList(process.env.WHATSAPP_GROUP_ALLOW_FROM);
            }
        }
        if (parseBool(process.env.WHATSAPP_SELF_CHAT_MODE)) {
            config.channels.whatsapp.selfChatMode = true;
        }
        if (process.env.WHATSAPP_MEDIA_MAX_MB) {
            config.channels.whatsapp.mediaMaxMb = parseInt(process.env.WHATSAPP_MEDIA_MAX_MB);
        }
        if (process.env.WHATSAPP_HISTORY_LIMIT) {
            config.channels.whatsapp.historyLimit = parseInt(process.env.WHATSAPP_HISTORY_LIMIT);
        }
    }

    // =========================================================================
    // Telegram Configuration
    // =========================================================================
    if (process.env.TELEGRAM_BOT_TOKEN) {
        config.channels.telegram = {
            botToken: process.env.TELEGRAM_BOT_TOKEN,
        };
        if (process.env.TELEGRAM_DM_POLICY) {
            config.channels.telegram.dmPolicy = process.env.TELEGRAM_DM_POLICY;
        }
        if (process.env.TELEGRAM_ALLOW_FROM) {
            config.channels.telegram.allowFrom = parseList(process.env.TELEGRAM_ALLOW_FROM);
        }
        if (process.env.TELEGRAM_GROUP_POLICY) {
            config.channels.telegram.groups = {
                policy: process.env.TELEGRAM_GROUP_POLICY,
            };
            if (process.env.TELEGRAM_GROUP_ALLOW_FROM) {
                config.channels.telegram.groups.allowFrom = parseList(process.env.TELEGRAM_GROUP_ALLOW_FROM);
            }
        }
    }

    // =========================================================================
    // Discord Configuration
    // =========================================================================
    if (process.env.DISCORD_BOT_TOKEN) {
        config.channels.discord = {
            botToken: process.env.DISCORD_BOT_TOKEN,
        };
        if (process.env.DISCORD_DM_POLICY) {
            config.channels.discord.dmPolicy = process.env.DISCORD_DM_POLICY;
        }
        if (process.env.DISCORD_DM_ALLOW_FROM) {
            config.channels.discord.allowFrom = parseList(process.env.DISCORD_DM_ALLOW_FROM);
        }
        if (process.env.DISCORD_GROUP_POLICY) {
            config.channels.discord.groups = {
                policy: process.env.DISCORD_GROUP_POLICY,
            };
        }
    }

    // =========================================================================
    // Slack Configuration
    // =========================================================================
    if (process.env.SLACK_BOT_TOKEN) {
        config.channels.slack = {
            botToken: process.env.SLACK_BOT_TOKEN,
        };
        if (process.env.SLACK_APP_TOKEN) {
            config.channels.slack.appToken = process.env.SLACK_APP_TOKEN;
        }
        if (process.env.SLACK_DM_POLICY) {
            config.channels.slack.dmPolicy = process.env.SLACK_DM_POLICY;
        }
        if (process.env.SLACK_GROUP_POLICY) {
            config.channels.slack.groups = {
                policy: process.env.SLACK_GROUP_POLICY,
            };
        }
    }

    // =========================================================================
    // Browser Tool Configuration
    // =========================================================================
    if (process.env.BROWSER_CDP_URL) {
        config.tools = config.tools || {};
        config.tools.browser = {
            cdpUrl: process.env.BROWSER_CDP_URL,
        };
        if (process.env.BROWSER_DEFAULT_PROFILE) {
            config.tools.browser.defaultProfile = process.env.BROWSER_DEFAULT_PROFILE;
        }
        if (parseBool(process.env.BROWSER_EVALUATE_ENABLED)) {
            config.tools.browser.evaluateEnabled = true;
        }
        if (process.env.BROWSER_SNAPSHOT_MODE) {
            config.tools.browser.snapshotMode = process.env.BROWSER_SNAPSHOT_MODE;
        }
        if (process.env.BROWSER_REMOTE_TIMEOUT_MS) {
            config.tools.browser.remoteTimeoutMs = parseInt(process.env.BROWSER_REMOTE_TIMEOUT_MS);
        }
        if (process.env.BROWSER_REMOTE_HANDSHAKE_TIMEOUT_MS) {
            config.tools.browser.remoteHandshakeTimeoutMs = parseInt(process.env.BROWSER_REMOTE_HANDSHAKE_TIMEOUT_MS);
        }
    }

    // =========================================================================
    // 1Password Configuration
    // =========================================================================
    if (process.env.OP_SERVICE_ACCOUNT_TOKEN) {
        config.tools = config.tools || {};
        config.tools.onePassword = {
            serviceAccountToken: process.env.OP_SERVICE_ACCOUNT_TOKEN,
        };
    }

    // =========================================================================
    // GOG/Galaxy Configuration
    // =========================================================================
    if (process.env.GOG_KEYRING_PASSWORD) {
        config.tools = config.tools || {};
        config.tools.gog = {
            keyringPassword: process.env.GOG_KEYRING_PASSWORD,
        };
    }

    // =========================================================================
    // Clean up empty objects
    // =========================================================================
    if (Object.keys(config.agents).length === 0) delete config.agents;
    if (Object.keys(config.channels).length === 0) delete config.channels;
    if (Object.keys(config.models).length === 0) delete config.models;
    if (Object.keys(config.tools || {}).length === 0) delete config.tools;
    if (Object.keys(config.gateway).length === 0) delete config.gateway;
    if (Object.keys(config.hooks).length === 0) delete config.hooks;

    return config;
}

// =============================================================================
// Load and merge configuration
// =============================================================================
let config = {};

// 1. Load custom config as base (if mounted)
let hasCustomConfig = false;
try {
    const customRaw = fs.readFileSync(CUSTOM_CONFIG, 'utf8');
    config = JSON.parse(customRaw);
    hasCustomConfig = true;
    console.log('[configure] loaded custom config from', CUSTOM_CONFIG);
} catch {
    // No custom config file — that's fine
}

// 2. Merge persisted config on top (preserves runtime state)
try {
    const persisted = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    deepMerge(config, persisted);
    console.log('[configure] merged persisted config from', CONFIG_FILE);
} catch {
    console.log('[configure] no persisted config found');
}

// 3. Build and merge env var config on top
const envConfig = buildConfig();
deepMerge(config, envConfig);
console.log('[configure] applied environment variables');

// =============================================================================
// Write configuration file
// =============================================================================
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
