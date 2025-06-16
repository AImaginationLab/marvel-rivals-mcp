export interface HeroMin {
  id: string;
  name: string;
  slug: string;
  role: 'VANGUARD' | 'DUELIST' | 'STRATEGIST';
  difficulty: number;
  description: string;
  avatar: string;
}

export interface Ability {
  id: string;
  heroId: string;
  name: string;
  description: string;
  type: string;
  icon: string;
  cooldown?: number;
  damage?: number;
}

export interface HeroFull extends HeroMin {
  abilities: Ability[];
  stats: {
    health: number;
    movementSpeed: number;
    damageReduction?: number;
  };
  lore?: string;
  releaseDate?: string;
}

export interface Skin {
  id: string;
  heroId?: string;
  name: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  description?: string;
  thumbnail: string;
  fullImage?: string;
  price?: {
    currency: string;
    amount: number;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  points: number;
  icon: string;
  isHidden: boolean;
  progress?: {
    current: number;
    total: number;
  };
}

export interface Item {
  id: string;
  name: string;
  type: 'NAMEPLATE' | 'MVP' | 'EMOTE' | 'SPRAY';
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  description?: string;
  thumbnail: string;
  heroId?: string;
}

export interface GameMap {
  id: string;
  name: string;
  type: 'CONVOY' | 'CONVERGENCE' | 'DOMINATION' | 'HYBRID';
  location: string;
  description: string;
  thumbnail: string;
  modes: string[];
}

export interface PlayerProfile {
  id: string;
  username: string;
  level: number;
  avatar: string;
  banner?: string;
  title?: string;
  stats: {
    totalMatches: number;
    wins: number;
    losses: number;
    winRate: number;
    kda: number;
    averageDamage: number;
    averageHealing: number;
    averageEliminations: number;
    mostPlayed: {
      heroId: string;
      heroName: string;
      timePlayed: number;
    }[];
  };
  ranks?: {
    current: {
      tier: string;
      division: number;
      points: number;
    };
    peak: {
      tier: string;
      division: number;
      season: number;
    };
  };
}

export interface PlayerSearchResult {
  id: string;
  username: string;
  level: number;
  avatar: string;
  platform?: string;
}

export interface Match {
  id: string;
  timestamp: string;
  duration: number;
  mode: string;
  map: string;
  result: 'VICTORY' | 'DEFEAT' | 'DRAW';
  heroPlayed: {
    id: string;
    name: string;
  };
  stats: {
    eliminations: number;
    deaths: number;
    assists: number;
    damage: number;
    healing: number;
    damageBlocked: number;
  };
}

export interface MatchHistory {
  playerId: string;
  matches: Match[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}