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
  dependencies: ["instance"],

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

          console.log(currentData);
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
        return await ctx.call("es.bulk", {
          index: "certificates",
          dataset: instances,
          id: "id",
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
  methods: {
    processInstance(instance) {
      const { attributes, enrollments, trackedEntityInstance } = instance;
      const enroll = enrollments.filter((en) => en.program === PROGRAM);
      const allEvents = flatten(enroll.map((en) => en.events));
      let results = fromPairs(attributes.map((a) => [a.attribute, a.value]));
      const id = `${results[NIN_ATTRIBUTE] || ""}${results[OTHER_ID] || ""}`;
      let processedEvents = allEvents
        .filter(
          (event) =>
            !!event.eventDate &&
            event.deleted === false &&
            event.programStage === PROGRAM_STAGE
        )
        .map(({ dataValues, relationships, notes, ...others }) => {
          return {
            ...others,
            ...fromPairs(dataValues.map((dv) => [dv.dataElement, dv.value])),
          };
        });
      const allFacilities = uniq(processedEvents.map((e) => e.orgUnit));
      const groupedData = groupBy(processedEvents, "LUIsbsm3okG");
      const pp = Object.entries(groupedData).map(([dose, allDoses]) => {
        const gotDoses = mergeByKey("LUIsbsm3okG", allDoses);
        return [dose, gotDoses.length > 0 ? gotDoses[0] : {}];
      });
      return {
        ...results,
        certificate: Math.floor(
          Math.random() * (99999999 - 10000000 + 1) + 10000000
        ),
        trackedEntityInstance,
        id,
        ...fromPairs(pp),
        facilities: allFacilities,
      };
    },
  },

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
