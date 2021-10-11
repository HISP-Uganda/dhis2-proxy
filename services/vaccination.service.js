"use strict";

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const axios = require("axios");
const { fromPairs, flatten, uniq } = require("lodash");
const { differenceInDays, parseISO } = require("date-fns");

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

const PROGRAM = "yDuAzyqYABS";

module.exports = {
  name: "vaccination",

  mixins: [],

  /**
   * Settings
   */
  settings: {},

  /**
   * Dependencies
   */
  dependencies: ["utils", "es"],

  /**
   * Actions
   */
  actions: {
    epivacData: {
      async handler(ctx) {
        const params = {
          program: PROGRAM,
          ouMode: "ALL",
          totalPages: true,
          page: 1,
          fields: "*",
          pageSize: 250,
          ...ctx.params,
        };
        const {
          data: {
            trackedEntityInstances,
            pager: { pageCount },
          },
        } = await epivac.get("trackedEntityInstances.json", {
          params,
        });

        await ctx.call("utils.processInstances", {
          trackedEntityInstances,
        });
        if (pageCount > 1) {
          for (let page = 2; page <= pageCount; page++) {
            console.log(`Processing ${page} of ${pageCount}`);
            const {
              data: { trackedEntityInstances },
            } = await epivac.get("trackedEntityInstances.json", {
              params: { ...params, page },
            });
            await ctx.call("utils.processInstances", {
              trackedEntityInstances,
            });
          }
        }
        return "finished";
      },
    },
    defenceData: {
      async handler(ctx) {
        const params = {
          program: PROGRAM,
          ouMode: "ALL",
          totalPages: true,
          page: 1,
          pageSize: 250,
          fields: "*",
          ...ctx.params,
        };
        const {
          data: {
            trackedEntityInstances,
            pager: { pageCount },
          },
        } = await defence.get("trackedEntityInstances.json", {
          params,
        });

        const response = await ctx.call("utils.processInstances", {
          trackedEntityInstances,
        });
        if (pageCount > 1) {
          for (let page = 2; page <= pageCount; page++) {
            console.log(`Processing ${page} of ${pageCount}`);
            const {
              data: { trackedEntityInstances },
            } = await defence.get("trackedEntityInstances.json", {
              params: { ...params, page },
            });
            await ctx.call("utils.processInstances", {
              trackedEntityInstances,
            });
          }
        }
        return response;
      },
    },
    facilities: {
      async handler(ctx) {
        const params = {
          level: 5,
          page: 1,
          fields:
            "id,name,parent[id,name,parent[id,name,parent[id,name,parent[id,name]]]]",
          pageSize: 250,
        };
        const {
          data: {
            organisationUnits,
            pager: { pageCount },
          },
        } = await epivac.get(`organisationUnits`, { params });

        await ctx.call("es.bulk", {
          index: "facilities",
          dataset: this.processFacilities(organisationUnits),
          id: "id",
        });
        if (pageCount > 1) {
          for (let page = 2; page <= pageCount; page++) {
            console.log(`Processing ${page} of ${pageCount}`);
            const {
              data: { organisationUnits },
            } = await epivac.get(`organisationUnits`, {
              params: { ...params, page },
            });

            await ctx.call("es.bulk", {
              index: "facilities",
              dataset: this.processFacilities(organisationUnits),
              id: "id",
            });
          }
        }
      },
    },
    index: {
      async handler(ctx) {
        return await ctx.call("es.createIndex", { index: "certificates" });
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
  methods: {
    processFacilities(organisationUnits) {
      return organisationUnits.map((unit) => {
        const {
          id,
          name,
          parent: {
            id: subCountyId,
            name: subCountyName,
            parent: {
              id: districtId,
              name: districtName,
              parent: {
                id: regionId,
                name: regionName,
                parent: { id: countryId, name: countryName },
              },
            },
          },
        } = unit;

        return {
          id,
          name,
          subCountyId,
          subCountyName,
          districtId,
          districtName,
          regionId,
          regionName,
          countryId,
          countryName,
        };
      });
    },
  },

  /**
   * Service created lifecycle event handler
   */
  created() {},

  /**
   * Service started lifecycle event handler
   */
  async started() {
    // try {
    //   console.log(this.actions.index("certificates"));
    // } catch (error) {
    //   console.log(error.message);
    // }
  },

  /**
   * Service stopped lifecycle event handler
   */
  async stopped() {},
};
