import type { Core } from '@strapi/strapi';

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Grant the public role read access to articles so 11ty can fetch
    // without an API token. Re-runs on every boot — idempotent.
    const publicRole = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    if (!publicRole) {
      strapi.log.warn('[terasu] Could not find public role — skipping permission bootstrap');
      return;
    }

    const actions = [
      'api::article.article.find',
      'api::article.article.findOne',
    ];

    for (const action of actions) {
      const exists = await strapi.db
        .query('plugin::users-permissions.permission')
        .findOne({ where: { action, role: publicRole.id } });

      if (!exists) {
        await strapi.db
          .query('plugin::users-permissions.permission')
          .create({ data: { action, role: publicRole.id } });
        strapi.log.info(`[terasu] Granted public access: ${action}`);
      }
    }
  },
};
