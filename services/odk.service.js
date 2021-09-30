"use strict";

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const axios = require("axios");
const mapping = require("./mapping.json");
const ouMapping = require("./oumapping.json");
const { fromPairs } = require("lodash");

let organisationUnits = {};

const instance = axios.create({
  baseURL: "https://ipc.hispuganda.org/ipc/api/",
  auth: {
    username: process.env.IPC_USERNAME,
    password: process.env.IPC_PASSWORD,
  },
});

module.exports = {
  name: "odk",
  /**
   * Settings
   */
  settings: {},

  /**
   * Dependencies
   */
  dependencies: [],

  /**
   * Actions
   */
  actions: {
    /**
     * Welcome, a username
     *
     * @param {String} name - User name
     */
    post: {
      rest: {
        method: "POST",
        path: "/:ip",
      },
      async handler(ctx) {
        const { data, ip } = ctx.params;
        const events = [];
        const processed = data.flatMap((d) => {
          if (d.pre) {
            const { pre, ...others } = d;
            return pre.map((preData) => {
              return { ...others, ...preData };
            });
          }
          return [d];
        });
        for (const record of processed) {
          const dataValues = Object.entries(record).flatMap(([de, value]) => {
            if (mapping[de] && String(value)) {
              return [{ dataElement: mapping[de], value }];
            }
            return [];
          });
          dataValues.push({ dataElement: "V9RentkWZEz", value: ip });
          console.log(dataValues);
          const orgUnit = String(
            `${record.district}${record.subcounty}${record.facility}`
          )
            .toLowerCase()
            .replaceAll("_", "")
            .replaceAll(" ", "");
          const event = {
            program: "ifCYpT4mFPu",
            orgUnit: organisationUnits[orgUnit],
            eventDate: record.date,
            dataValues,
            status: "COMPLETED",
            completedDate:
              record["*meta-date-marked-as-complete*"] || "2021-05-02",
          };
          if (organisationUnits[orgUnit]) {
            events.push(event);
          }
        }
        try {
          const { data } = await instance.post("events", { events });
          return data.response.importSummaries;
        } catch (error) {
          return error.response.data.response.importSummaries;
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
  async started() {
    organisationUnits = fromPairs(
      ouMapping.map((ou) => [ou.name, ou.DHIS2HFUIDs])
    );
  },

  /**
   * Service stopped lifecycle event handler
   */
  async stopped() {},
};
