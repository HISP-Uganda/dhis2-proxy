"use strict";

const { MoleculerError } = require("moleculer").Errors;
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const primaryKeys = {
  organisationunits: "organisationid",
  programinstance: "programinstanceid",
  programstageinstance: "programstageinstanceid",
  foo: "a",
};

module.exports = {
  name: "wal",
  /**
   * Settings
   */
  settings: {},

  /**
   * Dependencies
   */
  dependencies: ["es"],

  /**
   * Actions
   */
  actions: {
    post: {
      rest: {
        method: "GET",
        path: "/",
      },
      async handler(ctx) {
        return {};
      },
    },
    index: {
      rest: {
        method: "POST",
        path: "/index",
      },
      async handler(ctx) {
        const { index, ...data } = ctx.params;
        if (primaryKeys[index]) {
          return await ctx.call("es.bulk", {
            index,
            dataset: [data],
            id: primaryKeys[index],
          });
        }
        throw new MoleculerError("Something happened", 501, "ERR_SOMETHING", {
          a: 5,
          nodeID: "node-666",
        });
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
