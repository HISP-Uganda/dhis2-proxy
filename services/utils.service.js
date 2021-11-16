"use strict";

const { fromPairs, flatten, uniq, groupBy } = require("lodash");
const mergeByKey = require("array-merge-by-key");

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const PROGRAM = "yDuAzyqYABS";
const NIN_ATTRIBUTE = "Ewi7FUfcHAD";
const PROGRAM_STAGE = "a1jCssI2LkW";
const OTHER_ID = "YvnFn4IjKzx";

module.exports = {
  name: "utils",
  /**
   * Settings
   */
  settings: {},
  /**
   * Dependencies
   */
  dependencies: ["instance", "es"],

  /**
   * Actions
   */
  actions: {
    processInstances: {
      async handler(ctx) {
        const { trackedEntityInstances } = ctx.params;
        let instances = [];
        for (const instance of trackedEntityInstances) {
          let currentData = await ctx.call(
            "instance.processInstance",
            instance
          );
          if (currentData.id) {
            const previous = await ctx.call("es.search", {
              index: "certificates",
              body: {
                query: {
                  match: { id: currentData.id },
                },
              },
            });
            if (previous.length > 0) {
              const previousData = previous[0]._source;
              currentData = {
                ...previousData,
                ...currentData,
                certificate: previousData.certificate
                  ? previousData.certificate
                  : currentData.certificate,
              };
            }
            instances.push(currentData);
          }
        }
        const response = await ctx.call("es.bulk", {
          index: "certificates",
          dataset: instances,
          id: "id",
        });
        return response;
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
