"use strict";
const Cron = require("moleculer-cron");

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
  name: "schedule",

  mixins: [Cron],
  /**
   * Settings
   */
  settings: {},

  crons: [
    // {
    //   name: "epivac",
    //   cronTime: "* * * * *",
    //   onTick: async function () {
    //     const patients = await this.getLocalService("schedule").actions.epivac(
    //       {}
    //     );
    //     console.log(patients);
    //   },
    //   runOnInit: function () {
    //     console.log("epivac is created");
    //   },
    // },
    // {
    //   name: "defence",
    //   cronTime: "* * * * *",
    //   onTick: async function () {
    //     const patients = await this.getLocalService(
    //       "schedule"
    //     ).actions.vaccinations();
    //     console.log(patients);
    //   },
    //   runOnInit: function () {
    //     console.log("defence is created");
    //   },
    // },
  ],

  /**
   * Dependencies
   */
  dependencies: ["vaccination"],

  /**
   * Actions
   */
  actions: {
    epivac: {
      async handler(ctx) {
        return ctx.call("vaccination.epivacData", ctx.params);
      },
    },
    defence: {
      async handler(ctx) {
        return ctx.call("vaccination.defenceData", ctx.params);
      },
    },
  },

  /**
   * Events
   */
  events: {},

  /**
   * Methods
   */
  methods: {},

  /**
   * Service created lifecycle event handler
   */
  created() {},

  /**
   * Service started lifecycle event handler
   */
  async started() {},

  /**
   * Service stopped lifecycle event handler
   */
  async stopped() {},
};
