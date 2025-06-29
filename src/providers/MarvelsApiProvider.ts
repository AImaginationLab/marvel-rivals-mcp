import PQueue from 'p-queue';
import { fetchJSON } from '../utils/fetch.js';
import type { IProvider } from './IProvider.js';
import type {
  HeroMin,
  Ability,
  HeroFull,
  Skin,
  Achievement,
  Item,
  GameMap,
  PlayerProfile,
  PlayerSearchResult,
  MatchHistory,
} from '../types/index.js';

export class MarvelsApiProvider implements IProvider {
  private readonly baseUrl: string;
  private readonly queue: PQueue;

  constructor(baseUrl = 'https://marvelsapi.com/api') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.queue = new PQueue({ concurrency: 5, interval: 1000, intervalCap: 30 });
  }

  private async request<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.queue.add(async () => {
      const url = new URL(`${this.baseUrl}${endpoint}`);

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.set(key, value);
        });
      }

      const urlString = url.toString();
      return fetchJSON<T>(urlString);
    }) as Promise<T>;
  }

  async listHeroes(): Promise<HeroMin[]> {
    return this.request<HeroMin[]>('/heroes');
  }

  async getHeroAbilities(identifier: string): Promise<Ability[]> {
    return this.request<Ability[]>('/heroes/abilities/identifier', { id: identifier });
  }

  async getHeroInfo(identifier: string): Promise<HeroFull> {
    const [info, abilities] = await Promise.all([
      this.request<HeroFull>(`/heroes/information/${encodeURIComponent(identifier)}`),
      this.getHeroAbilities(identifier),
    ]);
    return { ...info, abilities };
  }

  async getHeroSkins(id: string): Promise<Skin[]> {
    return this.request<Skin[]>('/heroes/skins/id', { id });
  }

  async listSkins(): Promise<Skin[]> {
    return this.request<Skin[]>('/skins');
  }

  async listAchievements(): Promise<Achievement[]> {
    return this.request<Achievement[]>('/achievements');
  }

  async searchAchievement(name: string): Promise<Achievement[]> {
    return this.request<Achievement[]>(`/achievements/${encodeURIComponent(name)}`);
  }

  async listItems(): Promise<Item[]> {
    return this.request<Item[]>('/items');
  }

  async getItemsByType(type: 'NAMEPLATE' | 'MVP' | 'EMOTE' | 'SPRAY'): Promise<Item[]> {
    return this.request<Item[]>(`/items/${encodeURIComponent(type)}`, { item_type: type });
  }

  async listMaps(): Promise<GameMap[]> {
    return this.request<GameMap[]>('/maps');
  }

  async filterMaps(
    filter: 'convoy' | 'convergence' | 'competitive' | 'casual',
  ): Promise<GameMap[]> {
    return this.request<GameMap[]>(`/maps/${encodeURIComponent(filter)}`);
  }

  async getPlayerProfile(identifier: string): Promise<PlayerProfile> {
    return this.request<PlayerProfile>(`/player/profile/${encodeURIComponent(identifier)}`);
  }

  async searchPlayer(username: string): Promise<PlayerSearchResult> {
    return this.request<PlayerSearchResult>(`/search_player/${encodeURIComponent(username)}`);
  }

  async getPlayerMatchHistory(identifier: string): Promise<MatchHistory> {
    return this.request<MatchHistory>(`/player/${encodeURIComponent(identifier)}/match-history`);
  }
}
