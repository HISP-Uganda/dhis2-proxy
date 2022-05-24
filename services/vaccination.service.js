"use strict";

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const axios = require("axios");
const { fromPairs, groupBy, uniq, orderBy } = require("lodash");
const mergeByKey = require("array-merge-by-key");
const defenceSites = require("./defenceSites.json");

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
const DOSE = "LUIsbsm3okG";
const OTHER_ID = "YvnFn4IjKzx";
const PHONE_ATTRIBUTE = "ciCR6BBvIT4";
let defenceUnits = {};

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
  dependencies: ["es", "epivac"],

  /**
   * Actions
   */
  actions: {
    certificate: {
      async handler(ctx) {
        const { phone, identifier } = ctx.params;
        let must = [
          {
            bool: {
              should: [
                { match: { [NIN_ATTRIBUTE]: identifier } },
                { match: { [OTHER_ID]: identifier } },
              ],
            },
          },
          {
            wildcard: {
              [PHONE_ATTRIBUTE]: {
                value: `*${phone}`,
              },
            },
          },
          {
            match: {
              event_deleted: false,
            },
          },
          {
            match: {
              tei_deleted: false,
            },
          },
        ];

        const previous = await ctx.call("es.search2", {
          index: "epivac",
          body: {
            query: {
              bool: { must },
            },
          },
        });

        if (previous.length > 0) {
          const allFacilityIds = uniq(
            previous.map((facility) => facility.orgunit)
          );
          const facilities = ctx.call("es.search2", {
            index: "facilities",
            body: {
              query: {
                terms: { id: allFacilityIds },
              },
            },
          });

          console.log(facilities);
        }

        // let doseUnits = [];
        // let data = await this.fetchCertificate(identifier, phone);
        // if (previous.length > 0) {
        //   const previousData = previous[0]._source;
        //   data = {
        //     ...data,
        //     certificate: previousData.certificate
        //       ? previousData.certificate
        //       : Math.floor(
        //           Math.random() * (99999999 - 10000000 + 1) + 10000000
        //         ),
        //   };
        // } else {
        //   data = {
        //     ...data,
        //     certificate: Math.floor(
        //       Math.random() * (99999999 - 10000000 + 1) + 10000000
        //     ),
        //   };
        // }

        // if (data.DOSE1) {
        //   doseUnits.push(data.DOSE1.orgUnit);
        // }

        // if (data.DOSE2) {
        //   doseUnits.push(data.DOSE2.orgUnit);
        // }

        // if (data.BOOSTER1) {
        //   doseUnits.push(data.BOOSTER1.orgUnit);
        // }

        // if (data.BOOSTER2) {
        //   doseUnits.push(data.BOOSTER2.orgUnit);
        // }

        // const allFacilities = uniq(doseUnits);

        // const facilities = await Promise.all(
        //   allFacilities.map((id) => {

        //   })
        // );
        // let foundFacilities = fromPairs(
        //   facilities
        //     .map((response) => {
        //       const [data] = response?.hits?.hits;
        //       if (data && data._source) {
        //         const {
        //           _source: { id, ...rest },
        //         } = data;
        //         return [id, { id, ...rest }];
        //       }
        //       return null;
        //     })
        //     .filter((d) => d !== null)
        // );

        // let DOSE1 = data.DOSE1;
        // let DOSE2 = data.DOSE2;
        // let BOOSTER1 = data.BOOSTER1;
        // let BOOSTER2 = data.BOOSTER2;

        // if (DOSE1) {
        //   const facility = foundFacilities[DOSE1.orgUnit] || {};
        //   DOSE1 = {
        //     ...DOSE1,
        //     ...facility,
        //   };
        //   const siteChange = defenceUnits[DOSE1.orgUnit];
        //   if (siteChange) {
        //     DOSE1 = {
        //       ...DOSE1,
        //       name: siteChange,
        //       orgUnitName: siteChange,
        //     };
        //   }
        // }

        // if (DOSE2) {
        //   const facility = foundFacilities[DOSE2.orgUnit] || {};
        //   DOSE2 = {
        //     ...DOSE2,
        //     ...facility,
        //   };
        //   const siteChange = defenceUnits[DOSE2.orgUnit];
        //   if (siteChange) {
        //     DOSE2 = {
        //       ...DOSE2,
        //       name: siteChange,
        //       orgUnitName: siteChange,
        //     };
        //   }
        // }

        // if (BOOSTER1) {
        //   const facility = foundFacilities[BOOSTER1.orgUnit] || {};
        //   BOOSTER1 = {
        //     ...BOOSTER1,
        //     ...facility,
        //   };
        //   const siteChange = defenceUnits[BOOSTER1.orgUnit];
        //   if (siteChange) {
        //     BOOSTER1 = {
        //       ...BOOSTER1,
        //       name: siteChange,
        //       orgUnitName: siteChange,
        //     };
        //   }
        // }

        // if (BOOSTER2) {
        //   const facility = foundFacilities[BOOSTER2.orgUnit] || {};
        //   BOOSTER2 = {
        //     ...BOOSTER2,
        //     ...facility,
        //   };
        //   const siteChange = defenceUnits[BOOSTER2.orgUnit];
        //   if (siteChange) {
        //     BOOSTER2 = {
        //       ...BOOSTER2,
        //       name: siteChange,
        //       orgUnitName: siteChange,
        //     };
        //   }
        // }

        // const currentData = {
        //   ...data,
        //   DOSE1,
        //   DOSE2,
        //   BOOSTER2,
        //   BOOSTER1,
        //   id: identifier,
        // };
        // await ctx.call("es.bulk", {
        //   index: "certificates",
        //   dataset: [currentData],
        //   id: "id",
        // });
        return {};
      },
    },
    updateTrackedEntityInstance: {
      async handler(ctx) {
        const { identifier, dob, phone } = ctx.params;
        let result1 = {};
        let result2 = {};
        try {
          result1 = await ctx.call("epivac.update", {
            identifier,
            phone,
            dob,
            isEpivac: true,
          });
        } catch (error) {
          result1 = {
            updated: false,
            reason: error.message,
          };
        }

        try {
          result2 = await ctx.call("epivac.update", {
            identifier,
            phone,
            dob,
            isEpivac: false,
          });
        } catch (error) {
          result2 = {
            updated: false,
            reason: error.message,
          };
        }

        if (!result1.updated && !result2.updated) {
          return result1;
        }
        return { updated: true, reason: "" };
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

      const boosters = doses["BOOSTER"];
      let foundBoosters = {};
      if (boosters) {
        const sortedByEventDate = orderBy(boosters, ["eventDate"], ["desc"])
          .slice(0, 2)
          .reverse()
          .map((d, i) => [`BOOSTER${i + 1}`, d]);
        foundBoosters = fromPairs(sortedByEventDate);
      }
      const pp = Object.entries(doses).map(([dose, allDoses]) => {
        const gotDoses = mergeByKey("LUIsbsm3okG", allDoses);
        return [dose, gotDoses.length > 0 ? gotDoses[0] : {}];
      });

      return {
        ...fromPairs(attributes.map((a) => [a.attribute, a.value])),
        ...fromPairs(pp),
        ...foundBoosters,
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

      let others = [];
      let nin = [];

      try {
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

        if (epivacByNIN.length > 0 && epivacByOther.length > 0) {
        } else if (epivacByNIN.length > 0) {
          nin = [...nin, ...epivacByNIN];
          // epivacData = await this.processTrackedEntityInstances(epivacByNIN);
        } else if (epivacByOther.length > 0) {
          others = [...others, ...epivacByOther];
          // epivacData = await this.processTrackedEntityInstances(epivacByOther);
        }
      } catch (error) {}

      try {
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
          nin = [...nin, ...defenceByNIN];
          // defenceData = await this.processTrackedEntityInstances(defenceByNIN);
        } else if (defenceByOther.length > 0) {
          others = [...others, ...defenceByOther];
          // defenceData = await this.processTrackedEntityInstances(
          //   defenceByOther
          // );
        }
      } catch (error) {}

      if (nin.length > 0) {
        return await this.processTrackedEntityInstances(nin);
      }
      if (others.length > 0) {
        return await this.processTrackedEntityInstances(others);
      }
      return {};
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
  async started() {
    defenceUnits = fromPairs(defenceSites.map((ou) => [ou.id, ou.name]));
  },

  /**
   * Service stopped lifecycle event handler
   */
  async stopped() {},
};
