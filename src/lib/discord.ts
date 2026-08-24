export type WaitlistDiscordInput = {
  name: string;
  email: string;
  organisation?: string;
  workType: string;
  source?: string;
  referral?: string;
};

type DiscordWebhookPayload = {
  username: string;
  allowed_mentions: { parse: string[] };
  embeds: Array<{
    title: string;
    color: number;
    timestamp: string;
    fields: Array<{ name: string; value: string; inline: boolean }>;
  }>;
};

function fieldValue(value: string | undefined, fallback = "Not provided") {
  const trimmed = value?.trim();
  return (trimmed || fallback).slice(0, 1024);
}

export function buildWaitlistDiscordPayload(input: WaitlistDiscordInput, timestamp = new Date()): DiscordWebhookPayload {
  return {
    username: "ClientFold waitlist",
    allowed_mentions: { parse: [] },
    embeds: [
      {
        title: "New early-access signup",
        color: 0x667260,
        timestamp: timestamp.toISOString(),
        fields: [
          { name: "Name", value: fieldValue(input.name), inline: true },
          { name: "Email", value: fieldValue(input.email), inline: true },
          { name: "Organisation", value: fieldValue(input.organisation), inline: true },
          { name: "Work type", value: fieldValue(input.workType), inline: true },
          { name: "Source", value: fieldValue(input.source, "Direct"), inline: true },
          { name: "Referral", value: fieldValue(input.referral), inline: true },
        ],
      },
    ],
  };
}

function discordWebhookUrl(value: string): URL | undefined {
  try {
    const url = new URL(value);
    const discordHost = url.hostname === "discord.com" || url.hostname.endsWith(".discord.com") || url.hostname === "discordapp.com" || url.hostname.endsWith(".discordapp.com");
    if (url.protocol !== "https:" || !discordHost || !url.pathname.startsWith("/api/webhooks/")) return undefined;
    url.searchParams.set("wait", "true");
    return url;
  } catch {
    return undefined;
  }
}

export async function notifyWaitlistDiscord(input: WaitlistDiscordInput): Promise<boolean> {
  const configuredUrl = process.env.DISCORD_WAITLIST_WEBHOOK_URL;
  if (!configuredUrl) return false;
  const url = discordWebhookUrl(configuredUrl);
  if (!url) {
    console.warn("DISCORD_WAITLIST_WEBHOOK_URL is not a valid Discord webhook URL");
    return false;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(buildWaitlistDiscordPayload(input)),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) console.warn(`Discord waitlist notification failed with status ${response.status}`);
    return response.ok;
  } catch {
    console.warn("Discord waitlist notification could not be delivered");
    return false;
  }
}
