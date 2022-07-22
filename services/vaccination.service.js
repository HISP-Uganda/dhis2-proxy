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
const OTHER_ID = "YvnFn4IjKzx";
const PHONE_ATTRIBUTE = "ciCR6BBvIT4";
const DOSE_PLACE = "AmTw4pWCCaJ";
const ELSEWHERE_IN_COUNTRY_DISTRICT = "ObwW38YrQHu";
const ELSEWHERE_IN_COUNTRY_FACILITY = "X7tI86pr1y0";
const ELSEWHERE_OUT_COUNTRY_FACILITY = "OW3erclrDW8";
const ELSEWHERE_OUT_COUNTRY = "ONsseOxElW9";
let defenceUnits = {};

const findDistrictAndFacility = (data) => {
  const where = data[DOSE_PLACE];
  if (where === "Outside the country") {
    return {
      facility: data[ELSEWHERE_OUT_COUNTRY_FACILITY],
      district: data[ELSEWHERE_OUT_COUNTRY],
    };
  }

  return {
    facility: data[ELSEWHERE_IN_COUNTRY_FACILITY],
    district: data[ELSEWHERE_IN_COUNTRY_DISTRICT],
  };
};

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
          {
            match: {
              pi_deleted: false,
            },
          },
          {
            exists: {
              field: "bbnyNYD1wgS",
            },
          },
          {
            exists: {
              field: "LUIsbsm3okG",
            },
          },
        ];

        let previous = await ctx.call("es.search2", {
          index: "epivac",
          body: {
            query: {
              bool: { must },
            },
          },
        });

        if (previous.length > 0) {
          const allFacilityIds = uniq(
            previous.map((record) => String(record.orgunit).toLowerCase())
          );
          const allTies = uniq(
            previous.map((record) => String(record.tei_uid).toLowerCase())
          );
          const allCertificateNos = uniq(
            previous.flatMap((record) => {
              if (record.certificate) {
                return [record.certificate];
              }
              return [];
            })
          );

          if (allCertificateNos.length === 0) {
            previous = previous.map((p) => {
              return {
                ...p,
                certificate: Math.floor(
                  Math.random() * (99999999 - 10000000 + 1) + 10000000
                ),
              };
            });
          } else if (allCertificateNos.length > 0) {
            previous = previous.map((p) => {
              return { ...p, certificate: allCertificateNos[0] };
            });
          }
          const facilities = await ctx.call("es.search2", {
            index: "facilities",
            body: {
              query: {
                terms: { id: allFacilityIds },
              },
            },
          });

          let foundFacilities = fromPairs(
            facilities.map(({ id, ...rest }) => {
              return [id, { id, ...rest }];
            })
          );

          previous = previous.map((p) => {
            const facility = foundFacilities[p.orgunit] || {};
            p = {
              ...p,
              ...facility,
              identifier: p[NIN_ATTRIBUTE] || p[OTHER_ID],
              matched: allTies.join("").toLowerCase(),
            };
            const siteChange = defenceUnits[p.orgunit];
            if (siteChange) {
              p = {
                ...p,
                name: siteChange,
                orgUnitName: siteChange,
              };
            }
            if (p.views) {
              p = {
                ...p,
                views: p.views + 1,
              };
            } else {
              p = { ...p, views: 1 };
            }
            return p;
          });

          await ctx.call("es.bulk", {
            index: "epivac",
            dataset: previous,
            id: "id",
          });

          previous = previous.flatMap((p) => {
            if (
              p.vk2nF6wZwY4 &&
              p.vk2nF6wZwY4 !== null &&
              p.vk2nF6wZwY4 !== undefined
            ) {
              const { facility, district } = findDistrictAndFacility(p);
              if (identifier === "CM60106105FGFG") {
                console.log(
                  ObwW38YrQHu,
                  X7tI86pr1y0,
                  OW3erclrDW8,
                  ONsseOxElW9,
                  wwX1eEiYLGR,
                  taGJD9hkX0s,
                  muCgXjnCfnS,
                  lySxMCMSo8Z,
                  vk2nF6wZwY4,
                  AmTw4pWCCaJ,
                  AoHMuBgBlkc
                );
              }
              const {
                ObwW38YrQHu,
                X7tI86pr1y0,
                OW3erclrDW8,
                ONsseOxElW9,
                wwX1eEiYLGR,
                taGJD9hkX0s,
                muCgXjnCfnS,
                lySxMCMSo8Z,
                vk2nF6wZwY4,
                AmTw4pWCCaJ,
                AoHMuBgBlkc,
                ...others
              } = p;
              return [
                others,
                {
                  ...others,
                  bbnyNYD1wgS: wwX1eEiYLGR || "",
                  event_execution_date: lySxMCMSo8Z,
                  name: facility,
                  rpkH9ZPGJcX: taGJD9hkX0s || "",
                  Yp1F4txx8tm: muCgXjnCfnS || "",
                  LUIsbsm3okG: AoHMuBgBlkc,
                  districtName: district,
                },
              ];
            }
            return p;
          });

          const doses = groupBy(previous, "LUIsbsm3okG");

          const { BOOSTER, ...others } = doses;
          let foundBoosters = {};
          if (BOOSTER) {
            const sortedByEventDate = orderBy(
              BOOSTER,
              ["event_execution_date"],
              ["desc"]
            )
              .slice(0, 2)
              .reverse()
              .map((d, i) => [`BOOSTER${i + 1}`, d]);
            foundBoosters = fromPairs(sortedByEventDate);
          }
          const pp = Object.entries(others).map(([dose, allDoses]) => {
            const gotDoses = mergeByKey("LUIsbsm3okG", allDoses);
            return [dose, gotDoses.length > 0 ? gotDoses[0] : {}];
          });
          return {
            ...fromPairs(pp),
            ...foundBoosters,
          };
        }
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
