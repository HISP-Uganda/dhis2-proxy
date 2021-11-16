"use strict";

const axios = require("axios");

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const PROGRAM = "yDuAzyqYABS";
const NIN_ATTRIBUTE = "Ewi7FUfcHAD";
const OTHER_ID = "YvnFn4IjKzx";
const DOB_ATTRIBUTE = "NI0QRzJvQ0k";

const epivac = axios.create({
  baseURL: "https://epivac.health.go.ug/api/",
  auth: {
    username: process.env.EPIVAC_USERNAME,
    password: process.env.EPIVAC_PASSWORD,
  },
});

const defence = axios.create({
  baseURL: "http://covax.upf.go.ug:8080/api/",
  auth: {
    username: process.env.DEFENCE_USERNAME,
    password: process.env.DEFENCE_PASSWORD,
  },
});

module.exports = {
  name: "epivac",
  /**
   * Settings
   */
  settings: {},
  /**
   * Dependencies
   */
  dependencies: ["utils"],

  /**
   * Actions
   */
  actions: {
    update: {
      async handler(ctx) {
        const { identifier, dob, phone, isEpivac } = ctx.params;
        const api = isEpivac ? epivac : defence;
        let results = {
          updated: false,
          reason: `No record with Registration Id ${identifier} and Telephone ending ${phone} was found`,
        };
        const [
          {
            data: { trackedEntityInstances: byNIN },
          },
          {
            data: { trackedEntityInstances: byOther },
          },
        ] = await Promise.all([
          api.get("trackedEntityInstances.json", {
            params: {
              program: PROGRAM,
              ouMode: "ALL",
              filter: `${NIN_ATTRIBUTE}:EQ:${identifier}`,
            },
          }),
          api.get("trackedEntityInstances.json", {
            params: {
              program: PROGRAM,
              ouMode: "ALL",
              filter: `${OTHER_ID}:EQ:${identifier}`,
            },
          }),
        ]);
        if (byNIN.length > 0) {
          for (let instance of byNIN) {
            const attributes = instance.attributes.map((a) => {
              if (a.attribute === DOB_ATTRIBUTE) {
                return { ...a, value: dob };
              }
              return a;
            });
            await api.post("trackedEntityInstances", {
              ...instance,
              attributes,
            });
            const { data } = await api.get(
              `trackedEntityInstances/${instance.trackedEntityInstance}`,
              {
                params: {
                  program: PROGRAM,
                  fields: "*",
                },
              }
            );
            // await ctx.call("utils.processInstances", {
            //   trackedEntityInstances: [data],
            // });
          }
          results = { ...results, updated: true, reason: "" };
        }
        if (byOther.length > 0) {
          for (let instance of byOther) {
            const attributes = instance.attributes.map((a) => {
              if (a.attribute === DOB_ATTRIBUTE) {
                return { ...a, value: dob };
              }
              return a;
            });
            instance = { ...instance, attributes };
            await api.post("trackedEntityInstances", instance);
            const { data } = await api.get(
              `trackedEntityInstances/${instance.trackedEntityInstance}`,
              {
                params: {
                  program: PROGRAM,
                  fields: "*",
                },
              }
            );
            // await ctx.call("utils.processInstances", {
            //   trackedEntityInstances: [data],
            // });
            results = { ...results, updated: true, reason: "" };
          }
        }
        return results;
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
