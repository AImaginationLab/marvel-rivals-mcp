# MCP Marvel Rivals

A Model Context Protocol (MCP) server that provides access to Marvel Rivals game data through a standardized interface.

## Installation

```bash
npx @aimaginationlab/mcp-marvel-rivals
```

## Usage

### With Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "marvel-rivals": {
      "command": "npx",
      "args": ["@aimaginationlab/mcp-marvel-rivals"]
    }
  }
}
```

### Available Tools

- `listHeroes` - Get a list of all Marvel Rivals heroes
- `getHeroAbilities` - Get abilities for a specific hero
- `getHeroInfo` - Get detailed information about a hero
- `getHeroSkins` - Get skins for a specific hero
- `listSkins` - Get all available skins
- `listAchievements` - Get all achievements
- `searchAchievement` - Search achievements by name
- `listItems` - Get all items
- `getItemsByType` - Get items by type (NAMEPLATE, MVP, EMOTE, SPRAY)
- `listMaps` - Get all game maps
- `filterMaps` - Filter maps by type
- `getPlayerProfile` - Get player profile information
- `searchPlayer` - Search for a player by username
- `getPlayerMatchHistory` - Get player match history

## License

MIT
