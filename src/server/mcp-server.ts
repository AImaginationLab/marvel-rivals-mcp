import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import pino from 'pino';
import { MarvelsApiProvider } from '../providers/MarvelsApiProvider.js';
import { config } from '../config.js';

const logger = pino({
  name: 'mcp-marvel-rivals',
  level: config.logLevel,
}, pino.destination({ dest: 2, sync: false })); // 2 = stderr

export async function createMCPServer() {
  const server = new Server(
    {
      name: 'mcp-marvel-rivals',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  const provider = new MarvelsApiProvider(config.marvelsApiUrl);

  // Handle list_tools request
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'listHeroes',
          description: 'Retrieve complete roster of playable Marvel heroes. Returns all available characters with their basic info, roles (Vanguard/Duelist/Strategist), and identifiers for further queries.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'getHeroAbilities',
          description: 'Fetch detailed ability kit for a specific hero including primary fire, abilities, ultimate, and passives. Essential for understanding hero mechanics and cooldowns.',
          inputSchema: {
            type: 'object',
            properties: {
              identifier: {
                type: 'string',
                description: 'Hero ID or slug',
              },
            },
            required: ['identifier'],
          },
        },
        {
          name: 'getHeroInfo',
          description: 'Comprehensive hero data: stats, abilities, lore, difficulty rating, role details. Best for complete hero overview including gameplay tips and synergies.',
          inputSchema: {
            type: 'object',
            properties: {
              identifier: {
                type: 'string',
                description: 'Hero ID or slug',
              },
            },
            required: ['identifier'],
          },
        },
        {
          name: 'getHeroSkins',
          description: 'List all cosmetic skins/outfits available for a hero. Includes rarity tiers, unlock methods, and visual variants.',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Hero ID',
              },
            },
            required: ['id'],
          },
        },
        {
          name: 'listSkins',
          description: 'Browse entire game skin catalog across all heroes. Useful for finding cosmetics by rarity, event, or collection.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'listAchievements',
          description: 'Full achievement/trophy list with unlock conditions, points, and progression tracking. Covers hero-specific and general gameplay milestones.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'searchAchievement',
          description: 'Find specific achievements by partial name match. Helpful for tracking progress on particular challenges or hero mastery.',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Achievement name to search for',
              },
            },
            required: ['name'],
          },
        },
        {
          name: 'listItems',
          description: 'Catalog of all cosmetic items: nameplates, MVP animations, emotes, sprays. Shows unlock methods and rarity distribution.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'getItemsByType',
          description: 'Filter cosmetics by category (NAMEPLATE/MVP/EMOTE/SPRAY). Perfect for browsing specific customization options.',
          inputSchema: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['NAMEPLATE', 'MVP', 'EMOTE', 'SPRAY'],
                description: 'Item type',
              },
            },
            required: ['type'],
          },
        },
        {
          name: 'listMaps',
          description: 'All playable maps with layouts, objectives, and modes. Includes map-specific strategies and callout locations.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'filterMaps',
          description: 'Filter maps by game mode (convoy/convergence) or queue type (competitive/casual). Essential for mode-specific strategies.',
          inputSchema: {
            type: 'object',
            properties: {
              filter: {
                type: 'string',
                enum: ['convoy', 'convergence', 'competitive', 'casual'],
                description: 'Filter type',
              },
            },
            required: ['filter'],
          },
        },
        {
          name: 'getPlayerProfile',
          description: 'Comprehensive player stats: rank, main heroes, win rates, playtime, seasonal performance. Accepts player ID or battletag.',
          inputSchema: {
            type: 'object',
            properties: {
              identifier: {
                type: 'string',
                description: 'Player ID or username',
              },
            },
            required: ['identifier'],
          },
        },
        {
          name: 'searchPlayer',
          description: 'Find players by username/battletag. Returns matching profiles with basic stats for player lookup and comparison.',
          inputSchema: {
            type: 'object',
            properties: {
              username: {
                type: 'string',
                description: 'Username to search for',
              },
            },
            required: ['username'],
          },
        },
        {
          name: 'getPlayerMatchHistory',
          description: 'Recent match results with heroes played, performance metrics, map details, and outcome. Tracks improvement and hero performance trends.',
          inputSchema: {
            type: 'object',
            properties: {
              identifier: {
                type: 'string',
                description: 'Player ID',
              },
            },
            required: ['identifier'],
          },
        },
      ],
    };
  });

  // Handle call_tool request
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;
    
    try {
      let result;
      
      switch (name) {
        case 'listHeroes':
          result = await provider.listHeroes();
          break;
        
        case 'getHeroAbilities':
          result = await provider.getHeroAbilities(args.identifier as string);
          break;
        
        case 'getHeroInfo':
          result = await provider.getHeroInfo(args.identifier as string);
          break;
        
        case 'getHeroSkins':
          result = await provider.getHeroSkins(args.id as string);
          break;
        
        case 'listSkins':
          result = await provider.listSkins();
          break;
        
        case 'listAchievements':
          result = await provider.listAchievements();
          break;
        
        case 'searchAchievement':
          result = await provider.searchAchievement(args.name as string);
          break;
        
        case 'listItems':
          result = await provider.listItems();
          break;
        
        case 'getItemsByType':
          result = await provider.getItemsByType(args.type as 'NAMEPLATE' | 'MVP' | 'EMOTE' | 'SPRAY');
          break;
        
        case 'listMaps':
          result = await provider.listMaps();
          break;
        
        case 'filterMaps':
          result = await provider.filterMaps(args.filter as 'convoy' | 'convergence' | 'competitive' | 'casual');
          break;
        
        case 'getPlayerProfile':
          result = await provider.getPlayerProfile(args.identifier as string);
          break;
        
        case 'searchPlayer':
          result = await provider.searchPlayer(args.username as string);
          break;
        
        case 'getPlayerMatchHistory':
          result = await provider.getPlayerMatchHistory(args.identifier as string);
          break;
        
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      logger.error({ tool: name, args, error }, 'Tool execution failed');
      
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

export async function startMCPServer() {
  const server = await createMCPServer();
  const transport = new StdioServerTransport();
  
  await server.connect(transport);
  logger.info('MCP Marvel Rivals server started');
}