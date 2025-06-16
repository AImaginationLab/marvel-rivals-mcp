import PQueue from 'p-queue';
import pino from 'pino';
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

const logger = pino({ name: 'marvels-api-provider' }, pino.destination({ dest: 2, sync: false }));

export class MarvelsApiProvider implements IProvider {
  private readonly baseUrl: string;
  private readonly queue: PQueue;

  constructor(baseUrl = 'https://marvelsapi.com/api') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.queue = new PQueue({ concurrency: 5, interval: 1000, intervalCap: 30 });
  }

  private async request<T>(endpoint: string): Promise<T> {
    return this.queue.add(async () => {
      const url = `${this.baseUrl}${endpoint}`;
      logger.debug(`Fetching: ${url}`);
      return fetchJSON<T>(url);
    }) as Promise<T>;
  }

  async listHeroes(): Promise<HeroMin[]> {
    return this.request<HeroMin[]>('/heroes');
  }

  async getHeroAbilities(identifier: string): Promise<Ability[]> {
    return this.request<Ability[]>(`/heroes/abilities/${identifier}`);
  }

  async getHeroInfo(identifier: string): Promise<HeroFull> {
    const [info, abilities] = await Promise.all([
      this.request<HeroFull>(`/heroes/information/${identifier}`),
      this.getHeroAbilities(identifier),
    ]);
    return { ...info, abilities };
  }

  async getHeroSkins(id: string): Promise<Skin[]> {
    return this.request<Skin[]>(`/heroes/skins/${id}`);
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
    return this.request<Item[]>(`/items/${type}`);
  }

  async listMaps(): Promise<GameMap[]> {
    return this.request<GameMap[]>('/maps');
  }

  async filterMaps(
    filter: 'convoy' | 'convergence' | 'competitive' | 'casual',
  ): Promise<GameMap[]> {
    return this.request<GameMap[]>(`/maps/${filter}`);
  }

  async getPlayerProfile(identifier: string): Promise<PlayerProfile> {
    return this.request<PlayerProfile>(`/player/profile/${identifier}`);
  }

  async searchPlayer(username: string): Promise<PlayerSearchResult> {
    return this.request<PlayerSearchResult>(`/search_player/${encodeURIComponent(username)}`);
  }

  async getPlayerMatchHistory(identifier: string): Promise<MatchHistory> {
    return this.request<MatchHistory>(`/player/${identifier}/match-history`);
  }
}