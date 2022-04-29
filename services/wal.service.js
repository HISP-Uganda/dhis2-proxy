"use strict";

const { MoleculerError } = require("moleculer").Errors;
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const primaryKeys = {
  organisationunit: "organisationid",
  programinstance: "programinstanceid",
  programstageinstance: "programstageinstanceid",
  foo: "a",
  datavalues: "id",
  epivac: "id",
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
    search: {
      rest: {
        method: "POST",
        path: "/search",
      },
      async handler(ctx) {
        const { index, ...body } = ctx.params;
        return await ctx.call("es.search", {
          index,
          body,
        });
      },
    },
    receive: {
      rest: {
        method: "POST",
        path: "/receive",
      },
      async handler(ctx) {
        console.log(ctx.params);
        return ctx.params;
      },
    },
    aggregate: {
      rest: {
        method: "POST",
        path: "/",
      },
      async handler(ctx) {
        const { index, ...body } = ctx.params;
        return await ctx.call("es.aggregations", {
          index,
          body,
        });
      },
    },
    index: {
      rest: {
        method: "POST",
        path: "/index",
      },
      async handler(ctx) {
        const { index, data } = ctx.params;
        try {
          if (primaryKeys[index]) {
            return await ctx.call("es.bulk", {
              index,
              dataset: data,
              id: primaryKeys[index],
            });
          }
        } catch (error) {
          console.log(error);
          return error;
        }
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
