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

export interface IProvider {
  listHeroes(): Promise<HeroMin[]>;
  getHeroAbilities(identifier: string): Promise<Ability[]>;
  getHeroInfo(identifier: string): Promise<HeroFull>;
  getHeroSkins(id: string): Promise<Skin[]>;

  listSkins(): Promise<Skin[]>;

  listAchievements(): Promise<Achievement[]>;
  searchAchievement(name: string): Promise<Achievement[]>;

  listItems(): Promise<Item[]>;
  getItemsByType(type: 'NAMEPLATE' | 'MVP' | 'EMOTE' | 'SPRAY'): Promise<Item[]>;

  listMaps(): Promise<GameMap[]>;
  filterMaps(filter: 'convoy' | 'convergence' | 'competitive' | 'casual'): Promise<GameMap[]>;

  getPlayerProfile(identifier: string): Promise<PlayerProfile>;
  searchPlayer(username: string): Promise<PlayerSearchResult>;
  getPlayerMatchHistory(identifier: string): Promise<MatchHistory>;
}