"use strict";

const { fromPairs, flatten, uniq, groupBy } = require("lodash");
const mergeByKey = require("array-merge-by-key");
const defenceSites = require("./defenceSites.json");

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const PROGRAM = "yDuAzyqYABS";
const NIN_ATTRIBUTE = "Ewi7FUfcHAD";
const PROGRAM_STAGE = "a1jCssI2LkW";
const OTHER_ID = "YvnFn4IjKzx";

let defenceUnits = {};

module.exports = {
  name: "instance",
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
    processInstance: {
      async handler(ctx) {
        const { attributes, enrollments, trackedEntityInstance } = ctx.params;
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

        const facilities = await Promise.all(
          allFacilities.map((id) => {
            return ctx.call("es.search", {
              index: "facilities",
              body: {
                query: {
                  match: { id },
                },
              },
            });
          })
        );

        let foundFacilities = fromPairs(
          facilities
            .map(([data]) => {
              if (data && data._source) {
                const {
                  _source: { id, ...rest },
                } = data;
                return [id, { id, ...rest }];
              }
              return null;
            })
            .filter((d) => d !== null)
        );
        processedEvents = processedEvents.map((event) => {
          const facility = foundFacilities[event.orgUnit] || {};
          let newEvent = { ...event, ...facility };
          const siteChange = defenceUnits[event.orgUnit];
          if (siteChange) {
            newEvent = {
              ...newEvent,
              name: siteChange,
              orgUnitName: siteChange,
            };
          }
          return newEvent;
        });
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
        };
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
    processInstance(instance) {},
  },

  /**
   * Service created lifecycle event handler
   */
  created() {},

  /**
   * Service started lifecycle event handler
   */
  async started() {
    defenceUnits = fromPairs(defenceSites.map((ou) => [ou.id, ou.name]));
  },

  /**
   * Service stopped lifecycle event handler
   */
  async stopped() {},
};
