export interface SlashCommandParam {
  name: string;
  description: string;
  required?: boolean;
  /** If true, the param accepts a user mention or "all" */
  isUserTarget?: boolean;
}

export interface SlashCommand {
  name: string;
  description: string;
  usage: string;
  params: SlashCommandParam[];
  /** Category for grouping in the command list */
  category: "moderation" | "utility" | "fun";
  /** Whether this command requires server context (not available in DMs) */
  serverOnly?: boolean;
}

export const BUILT_IN_COMMANDS: SlashCommand[] = [
  {
    name: "clear",
    description: "Delete recent messages in this channel",
    usage: "/clear [amount:100] [user:all]",
    category: "moderation",
    serverOnly: true,
    params: [
      {
        name: "amount",
        description: "Number of messages to clear (1-100)",
        required: false,
      },
      {
        name: "user",
        description: "Only clear messages from this user (mention or 'all')",
        required: false,
        isUserTarget: true,
      },
    ],
  },
  {
    name: "kick",
    description: "Kick a member from the server",
    usage: "/kick @user [reason]",
    category: "moderation",
    serverOnly: true,
    params: [
      {
        name: "user",
        description: "The member to kick (mention)",
        required: true,
        isUserTarget: true,
      },
      {
        name: "reason",
        description: "Reason for the kick",
        required: false,
      },
    ],
  },
  {
    name: "ban",
    description: "Ban a member from the server",
    usage: "/ban @user [reason]",
    category: "moderation",
    serverOnly: true,
    params: [
      {
        name: "user",
        description: "The member to ban (mention)",
        required: true,
        isUserTarget: true,
      },
      {
        name: "reason",
        description: "Reason for the ban",
        required: false,
      },
    ],
  },
  {
    name: "timeout",
    description: "Temporarily prevent a member from sending messages",
    usage: "/timeout @user <duration> [reason]",
    category: "moderation",
    serverOnly: true,
    params: [
      {
        name: "user",
        description: "The member to timeout (mention)",
        required: true,
        isUserTarget: true,
      },
      {
        name: "duration",
        description: "Duration (e.g. 60s, 5m, 1h, 1d)",
        required: true,
      },
      {
        name: "reason",
        description: "Reason for the timeout",
        required: false,
      },
    ],
  },
  {
    name: "nick",
    description: "Change your nickname in this server",
    usage: "/nick <new nickname>",
    category: "utility",
    serverOnly: true,
    params: [
      {
        name: "nickname",
        description: "Your new nickname (leave empty to reset)",
        required: false,
      },
    ],
  },
  {
    name: "tts",
    description: "Send a message that will be spoken aloud using text-to-speech",
    usage: "/tts <message>",
    category: "fun",
    params: [
      {
        name: "message",
        description: "The text to speak and send",
        required: true,
      },
    ],
  },
];

export interface ParsedCommand {
  name: string;
  args: string[];
  raw: string;
}

/**
 * Parse a raw message string into a command + arguments.
 * Returns null if the string doesn't start with `/` or the command is unknown.
 */
export function parseSlashCommand(input: string): ParsedCommand | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith("/")) return null;

  // Split on whitespace but keep quoted strings together
  const parts: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === " " && !inQuotes) {
      if (current) {
        parts.push(current);
        current = "";
      }
      continue;
    }
    current += char;
  }
  if (current) parts.push(current);

  if (parts.length === 0) return null;
  const name = parts[0].slice(1).toLowerCase();
  const command = BUILT_IN_COMMANDS.find((c) => c.name === name);
  if (!command) return null;

  return {
    name: command.name,
    args: parts.slice(1),
    raw: trimmed,
  };
}

/**
 * Extract a user ID from a mention token like `<@123>` or `<@!123>`.
 * Returns null if the string is not a valid mention.
 */
export function parseUserMention(text: string): string | null {
  const match = text.match(/^<@!?(\w+)>$/);
  return match ? match[1] : null;
}

/**
 * Parse a duration string like "60s", "5m", "1h", "1d" into milliseconds.
 * Returns null if the string is not a valid duration.
 */
export function parseDuration(text: string): number | null {
  const match = text.match(/^(\d+)\s*([smhd])$/i);
  if (!match) return null;
  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return value * multipliers[unit];
}

/**
 * Get filtered command suggestions based on a query string.
 * If query is empty, returns all commands.
 */
export function getCommandSuggestions(query: string, isServer: boolean): SlashCommand[] {
  const q = query.toLowerCase();
  return BUILT_IN_COMMANDS.filter((cmd) => {
    if (cmd.serverOnly && !isServer) return false;
    if (!q) return true;
    return cmd.name.startsWith(q) || cmd.description.toLowerCase().includes(q);
  });
}
