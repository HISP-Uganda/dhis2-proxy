"use strict";

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const axios = require("axios");
const MailerService = require("moleculer-mail");

module.exports = {
  name: "email",

  mixins: [MailerService],

  /**
   * Settings
   */
  settings: {
    from: "colupot@hispuganda.org",
    transport: {
      service: "mailjet",
      auth: {
        user: "02255d90a62b476dcb1129082cbc91be",
        pass: "8c795fd335f2d3a4f230b6e3864ebc79",
      },
    },
  },

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
        path: "/",
      },
      handler(ctx) {
        return {};
        // return ctx.call("mail.send", {
        //   to: "olupotcharles@gmail.com",
        //   subject: "Hello Friends!",
        //   html: "This is the <b>content</b>!",
        // });
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
