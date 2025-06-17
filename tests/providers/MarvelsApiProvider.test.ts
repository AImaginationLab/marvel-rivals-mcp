import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MarvelsApiProvider } from '../../src/providers/MarvelsApiProvider.js';

const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe('MarvelsApiProvider', () => {
  const baseUrl = 'http://test.api';
  const provider = new MarvelsApiProvider(baseUrl);

  describe('listHeroes', () => {
    it('should return a list of heroes', async () => {
      const mockHeroes = [
        { id: '1', name: 'Spider-Man', role: 'Duelist' },
        { id: '2', name: 'Hulk', role: 'Vanguard' },
      ];

      server.use(
        http.get(`${baseUrl}/heroes`, () => {
          return HttpResponse.json(mockHeroes);
        })
      );

      const result = await provider.listHeroes();
      expect(result).toEqual(mockHeroes);
    });

    it('should handle API errors gracefully', async () => {
      server.use(
        http.get(`${baseUrl}/heroes`, () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      await expect(provider.listHeroes()).rejects.toThrow('HTTP 500: Internal Server Error');
    });
  });

  describe('getHeroInfo', () => {
    it('should return hero information by identifier', async () => {
      const mockHeroInfo = {
        id: '1',
        name: 'Spider-Man',
        role: 'Duelist',
      };
      const mockAbilities = [
        { name: 'Web Swing', cooldown: 5 },
        { name: 'Web Shot', cooldown: 3 },
      ];

      server.use(
        http.get(`${baseUrl}/heroes/information/spider-man`, () => {
          return HttpResponse.json(mockHeroInfo);
        }),
        http.get(`${baseUrl}/heroes/abilities/identifier`, ({ request }) => {
          const url = new URL(request.url);
          if (url.searchParams.get('id') === 'spider-man') {
            return HttpResponse.json(mockAbilities);
          }
          return HttpResponse.json([]);
        })
      );

      const result = await provider.getHeroInfo('spider-man');
      expect(result).toEqual({ ...mockHeroInfo, abilities: mockAbilities });
    });
  });

  describe('searchPlayer', () => {
    it('should return player search results', async () => {
      const mockPlayers = [
        { id: '123', username: 'testplayer', rank: 'Gold' },
      ];

      server.use(
        http.get(`${baseUrl}/search_player/testplayer`, () => {
          return HttpResponse.json(mockPlayers);
        })
      );

      const result = await provider.searchPlayer('testplayer');
      expect(result).toEqual(mockPlayers);
    });

    it('should properly encode special characters in usernames', async () => {
      const mockPlayers = [
        { id: '456', username: 'test player', rank: 'Silver' },
      ];

      server.use(
        http.get(`${baseUrl}/search_player/test%20player`, () => {
          return HttpResponse.json(mockPlayers);
        })
      );

      const result = await provider.searchPlayer('test player');
      expect(result).toEqual(mockPlayers);
    });
  });
});