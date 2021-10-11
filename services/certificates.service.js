"use strict";
const QRCode = require("qrcode");
const { isEmpty } = require("lodash");
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const NAME_ATTRIBUTE = "sB1IHYu2xQT";
const SEX_ATTRIBUTE = "FZzQbW8AWVd";
const DOB_ATTRIBUTE = "NI0QRzJvQ0k";
const PHONE_ATTRIBUTE = "ciCR6BBvIT4";

module.exports = {
  name: "certificates",
  /**
   * Settings
   */
  settings: {},

  /**
   * Dependencies
   */
  dependencies: ["es", "vaccination"],

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
        method: "GET",
        path: "/",
      },
      async handler(ctx) {
        const data = await ctx.call("es.searchByIdAndPhone", ctx.params);
        if (!isEmpty(data) && data.DOSE1 && data.DOSE2) {
          const qr = await QRCode.toDataURL(
            `Name:${data[NAME_ATTRIBUTE]}\nIdentifier:${
              data.id
            }\nSex:${data[SEX_ATTRIBUTE]}\nDOB:${
              data[DOB_ATTRIBUTE] || " "
            }\nPHONE:${data[PHONE_ATTRIBUTE]}\n${
              data.DOSE1.bbnyNYD1wgS
            }:${new Intl.DateTimeFormat("fr").format(
              Date.parse(data.DOSE1.eventDate)
            )},${data.DOSE1.orgUnitName},${data.DOSE1.district || ""}\n${
              data.DOSE2.bbnyNYD1wgS
            }:${new Intl.DateTimeFormat("fr").format(
              Date.parse(data.DOSE2.eventDate)
            )},${data.DOSE2.orgUnitName},${
              data.DOSE2.district || ""
            }\n\nClick to verify\nhttps://epivac.health.go.ug/certificates/#/validate/${
              data.trackedEntityInstance
            }`,
            { margin: 0 }
          );
          return { ...data, qr };
        }
        return null;
      },
    },
    createIndex: {
      rest: {
        method: "GET",
        path: "/create-index",
      },
      async handler(ctx) {
        return await ctx.call("es.createIndex", ctx.params);
      },
    },
    epivac: {
      rest: {
        method: "POST",
        path: "/epivac",
      },
      async handler(ctx) {
        return await ctx.call("vaccination.epivacData", ctx.params);
      },
    },
    defence: {
      rest: {
        method: "POST",
        path: "/defence",
      },
      async handler(ctx) {
        return await ctx.call("vaccination.defenceData", ctx.params);
      },
    },
    facilities: {
      rest: {
        method: "POST",
        path: "/facilities",
      },
      async handler(ctx) {
        return await ctx.call("vaccination.facilities", ctx.params);
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
