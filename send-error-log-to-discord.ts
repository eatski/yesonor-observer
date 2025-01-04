import { spawn } from "node:child_process";
import { setTimeout } from "node:timers/promises";

const WEBHOOK_URL = Deno.env.get("DISCORD_WEBHOOK_URL");
const VERCEL_TOKEN = Deno.env.get("VERCEL_TOKEN");

if (!WEBHOOK_URL) {
  console.error("DISCORD_WEBHOOK_URL is not set");
  Deno.exit(1);
}

if (!VERCEL_TOKEN) {
  console.error("VERCEL_TOKEN is not set");
  Deno.exit(1);
}

const safeJsonParse = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
};

const spawnProcess = spawn("npx", [
  "vercel",
  "logs",
  "--token",
  VERCEL_TOKEN,
  "-j",
  "https://iesona.com",
]);
spawnProcess.stdout.on("data", (data) => {
  const log = safeJsonParse(data.toString());
  if (log) {
    console.log(log);
  }
  if (log && log.level === "info") {
    console.log("Error found");
    fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: data.toString(),
      }),
    });
  }
});

spawnProcess.stderr.on("data", (data) => {
  console.error(data.toString());
});

await setTimeout(1000 * 10);

spawnProcess.kill();
console.log("Done");
Deno.exit(0);
