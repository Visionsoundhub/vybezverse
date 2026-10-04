// Μία φορά τη μέρα καλεί το /api/vmt-reminders του site (αυτόματα email του VMT store).
export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(fetch('https://blackvybez.gr/api/vmt-reminders', {
      method: 'POST',
      headers: { 'X-Cron-Secret': env.CRON_SECRET },
    }).then(async (r) => console.log('vmt-reminders', r.status, await r.text())));
  },
};
