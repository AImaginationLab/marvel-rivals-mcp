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
          description: 'Get a list of all Marvel Rivals heroes',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'getHeroAbilities',
          description: 'Get abilities for a specific hero',
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
          description: 'Get detailed information about a hero including abilities',
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
          description: 'Get skins for a specific hero',
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
          description: 'Get a list of all available skins',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'listAchievements',
          description: 'Get a list of all achievements',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'searchAchievement',
          description: 'Search for achievements by name',
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
          description: 'Get a list of all items',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'getItemsByType',
          description: 'Get items filtered by type',
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
          description: 'Get a list of all game maps',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'filterMaps',
          description: 'Get maps filtered by type or mode',
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
          description: 'Get detailed player profile information',
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
          description: 'Search for a player by username',
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
          description: 'Get match history for a player',
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