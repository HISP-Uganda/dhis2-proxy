"use strict";

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const axios = require("axios");
const { fromPairs, groupBy, uniq } = require("lodash");
const mergeByKey = require("array-merge-by-key");

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
const NIN_ATTRIBUTE = "Ewi7FUfcHAD";
const OTHER_ID = "YvnFn4IjKzx";
const PHONE_ATTRIBUTE = "ciCR6BBvIT4";

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
  dependencies: ["es"],

  /**
   * Actions
   */
  actions: {
    certificate: {
      async handler(ctx) {
        const { phone, identifier } = ctx.params;
        const previous = await ctx.call("es.search", {
          index: "certificates",
          body: {
            query: {
              match: { id: identifier },
            },
          },
        });

        let doseUnits = [];
        const data = this.fetchCertificate(identifier, phone);

        if (previous.length > 0) {
          const previousData = previous[0]._source;
          data = {
            ...data,
            certificate: previousData.certificate
              ? previousData.certificate
              : Math.floor(
                  Math.random() * (99999999 - 10000000 + 1) + 10000000
                ),
          };
        }

        if (data.DOSE1) {
          doseUnits.push(data.DOSE1.orgUnit);
        }

        if (data.DOSE2) {
          doseUnits.push(data.DOSE2.orgUnit);
        }

        const allFacilities = uniq(doseUnits);

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

        let DOSE1 = data.DOSE1;
        let DOSE2 = data.DOSE2;

        if (DOSE1) {
          const facility = foundFacilities[DOSE1.orgUnit] || {};
          DOSE1 = {
            ...DOSE1,
            ...facility,
          };
          const siteChange = defenceUnits[DOSE1.orgUnit];
          if (siteChange) {
            DOSE1 = {
              ...DOSE1,
              name: siteChange,
              orgUnitName: siteChange,
            };
          }
        }

        if (DOSE2) {
          const facility = foundFacilities[DOSE2.orgUnit] || {};
          DOSE2 = {
            ...DOSE2,
            ...facility,
          };
          const siteChange = defenceUnits[DOSE2.orgUnit];
          if (siteChange) {
            DOSE2 = {
              ...DOSE2,
              name: siteChange,
              orgUnitName: siteChange,
            };
          }
        }
        const currentData = { ...data, DOSE1, DOSE2, id: identifier };

        await ctx.call("es.bulk", {
          index: "certificates",
          dataset: [currentData],
          id: "id",
        });
        return currentData;
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
    async processTrackedEntityInstances(trackedEntityInstances) {
      const [{ attributes }] = trackedEntityInstances;
      const trackedEntityInstance = trackedEntityInstances
        .map((tei) => tei.trackedEntityInstance)
        .join(",");

      const allEvents = trackedEntityInstances.flatMap((tei) => {
        return tei.enrollments.flatMap((en) => {
          if (en.program === PROGRAM) {
            return en.events.map(
              ({ dataValues, relationships, notes, ...others }) => {
                return {
                  ...others,
                  ...fromPairs(
                    dataValues.map((dv) => [dv.dataElement, dv.value])
                  ),
                };
              }
            );
          }
          return [];
        });
      });
      const doses = groupBy(
        allEvents.filter(({ deleted }) => !deleted),
        "LUIsbsm3okG"
      );
      const pp = Object.entries(doses).map(([dose, allDoses]) => {
        const gotDoses = mergeByKey("LUIsbsm3okG", allDoses);
        return [dose, gotDoses.length > 0 ? gotDoses[0] : {}];
      });

      return {
        ...fromPairs(attributes.map((a) => [a.attribute, a.value])),
        ...fromPairs(pp),
        trackedEntityInstance,
      };
    },
    async fetchCertificate(identifier, phone) {
      const params = [
        {
          name: "program",
          value: PROGRAM,
        },
        {
          name: "filter",
          value: `${NIN_ATTRIBUTE}:EQ:${identifier}`,
        },
        {
          name: "filter",
          value: `${PHONE_ATTRIBUTE}:LIKE:${phone}`,
        },
        {
          name: "fields",
          value: "*",
        },
        {
          name: "ouMode",
          value: "ALL",
        },
      ];

      const params1 = [
        {
          name: "program",
          value: PROGRAM,
        },
        {
          name: "filter",
          value: `${OTHER_ID}:EQ:${identifier}`,
        },
        {
          name: "filter",
          value: `${PHONE_ATTRIBUTE}:LIKE:${phone}`,
        },
        {
          name: "fields",
          value: "*",
        },
        {
          name: "ouMode",
          value: "ALL",
        },
      ];

      const p1 = params.map((x) => `${x.name}=${x.value}`).join("&");
      const p2 = params1.map((x) => `${x.name}=${x.value}`).join("&");

      const [
        {
          data: { trackedEntityInstances: epivacByNIN },
        },
        {
          data: { trackedEntityInstances: epivacByOther },
        },
      ] = await Promise.all([
        epivac.get(`trackedEntityInstances.json?${p1}`),
        epivac.get(`trackedEntityInstances.json?${p2}`),
      ]);

      let epivacData = {};
      let defenceData = {};
      if (epivacByNIN.length > 0 && epivacByOther.length > 0) {
      } else if (epivacByNIN.length > 0) {
        epivacData = await this.processTrackedEntityInstances(epivacByNIN);
      } else if (epivacByOther.length > 0) {
        epivacData = await this.processTrackedEntityInstances(epivacByOther);
      }

      const [
        {
          data: { trackedEntityInstances: defenceByNIN },
        },
        {
          data: { trackedEntityInstances: defenceByOther },
        },
      ] = await Promise.all([
        defence.get(`trackedEntityInstances.json?${p1}`),
        defence.get(`trackedEntityInstances.json?${p2}`),
      ]);

      if (defenceByNIN.length > 0 && defenceByOther.length > 0) {
      } else if (defenceByNIN.length > 0) {
        defenceData = await this.processTrackedEntityInstances(defenceByNIN);
      } else if (defenceByOther.length > 0) {
        defenceData = await this.processTrackedEntityInstances(defenceByOther);
      }

      return { ...defenceData, ...epivacData };
    },

    processFacilities(organisationUnits) {
      return organisationUnits.map((unit) => {
        const { id, name } = unit;
        let facility = {
          id,
          name,
        };

        if (unit.parent) {
          const subCounty = unit.parent;
          facility = {
            ...facility,
            subCountyId: subCounty.id,
            subCountyName: subCounty.name,
          };
          if (subCounty.parent) {
            const district = subCounty.parent;
            facility = {
              ...facility,
              districtId: district.id,
              districtName: district.name,
            };

            if (district.parent) {
              const region = district.parent;
              facility = {
                ...facility,
                regionId: region.id,
                regionName: region.name,
              };

              if (region.parent) {
                const country = region.parent;
                facility = {
                  ...facility,
                  countryId: country.id,
                  countryName: country.name,
                };
              }
            }
          }
        }
        return facility;
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
  async started() {},

  /**
   * Service stopped lifecycle event handler
   */
  async stopped() {},
};
