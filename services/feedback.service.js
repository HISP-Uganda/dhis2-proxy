"use strict";

const DbMixin = require("../mixins/db.mixin");

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
  name: "feedbacks",
  // version: 1
  /**
   * Mixins
   */
  mixins: [DbMixin("feedbacks")],

  /**
   * Settings
   */
  settings: {
    // Available fields in the responses
    fields: [
      "_id",
      "fullName",
      "registrationId",
      "secondDoseDate",
      "secondDosePlace",
      "cardNo",
      "district",
      "facility",
      "phone",
      "email",
    ],
    // Validator for the `create` & `insert` actions.
    entityValidator: {},
  },

  /**
   * Action Hooks
   */
  hooks: {
  },

  /**
   * Actions
   */
  actions: {
  },

  /**
   * Methods
   */
  methods: {
  },

  /**
   * Fired after database connection establishing.
   */
  async afterConnected() {
    // await this.adapter.collection.createIndex({ name: 1 });
  },
};
