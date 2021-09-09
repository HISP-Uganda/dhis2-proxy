"use strict";

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const axios = require("axios");
let organisationUnits = {};
const mapping = require("./mapping.json");

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
        for (const record of data) {
          const dataValues = Object.entries(record).flatMap(([de, value]) => {
            if (mapping[de] && value) {
              return [{ dataElement: mapping[de], value }];
            }
            return [];
          });
          dataValues.push({ dataElement: "V9RentkWZEz", value: ip });
          const orgUnit = String(
            `${record.district}/${record.subcounty}/${record.facility}`
          ).replaceAll("_", " ");
          const event = {
            program: "ifCYpT4mFPu",
            orgUnit: organisationUnits[orgUnit],
            eventDate: record.date,
            dataValues,
            status: "COMPLETED",
            completedDate: record["*meta-date-marked-as-complete*"],
          };
          if (organisationUnits[orgUnit]) {
            events.push(event);
          }
        }
        try {
          const { data } = await instance.post("events", { events });
          return data;
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
    const {
      data: { organisationUnits: units },
    } = await instance.get("programs/ifCYpT4mFPu", {
      params: {
        fields: "organisationUnits[id,name,parent[id,name,parent[id,name]]]",
      },
    });
    for (const ou of units) {
      const key = `${ou.parent.parent.name}/${ou.parent.name}/${ou.name}`;
      organisationUnits[key] = ou.id;
    }
  },

  /**
   * Service stopped lifecycle event handler
   */
  async stopped() {},
};
