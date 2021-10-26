"use strict";

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const axios = require("axios");

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
const ATTRIBUTE = "sB1IHYu2xQT";
const NAME_ATTRIBUTE = "sB1IHYu2xQT";
const NIN_ATTRIBUTE = "Ewi7FUfcHAD";
const PROGRAM_STAGE = "a1jCssI2LkW";
const OTHER_ID = "YvnFn4IjKzx";
const VACCINATION_CARD_NO = "hDdStedsrHN";
const SEX_ATTRIBUTE = "FZzQbW8AWVd";
const DOB_ATTRIBUTE = "NI0QRzJvQ0k";
const PHONE_ATTRIBUTE = "ciCR6BBvIT4";
const BATCH_ATTRIBUTE = "Yp1F4txx8tm";
const VACCINE_ATTRIBUTE = "bbnyNYD1wgS";
const MFG_ATTRIBUTE = "rpkH9ZPGJcX";
const ELSEWHERE_DATE = "lySxMCMSo8Z";
const ELSEWHERE_IN_COUNTRY_DISTRICT = "ObwW38YrQHu";
const ELSEWHERE_IN_COUNTRY_FACILITY = "X7tI86pr1y0";
const ELSEWHERE_OUT_COUNTRY = "ONsseOxElW9";
const ELSEWHERE_OUT_COUNTRY_FACILITY = "OW3erclrDW8";
const ELSEWHERE_VACCINE = "wwX1eEiYLGR";
const ELSEWHERE_MAN = "taGJD9hkX0s";
const ELSEWHERE_BATCH = "muCgXjnCfnS";

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
  dependencies: ["utils", "es"],

  /**
   * Actions
   */
  actions: {
    epivacData: {
      async handler(ctx) {
        const params = {
          program: PROGRAM,
          ouMode: "ALL",
          totalPages: true,
          page: 1,
          fields: "*",
          pageSize: 1000,
          ...ctx.params,
        };
        const {
          data: {
            trackedEntityInstances,
            pager: { pageCount },
          },
        } = await epivac.get("trackedEntityInstances.json", {
          params,
        });

        await ctx.call("utils.processInstances", {
          trackedEntityInstances,
        });
        if (pageCount > 1) {
          for (let page = 2; page <= pageCount; page++) {
            console.log(`Processing ${page} of ${pageCount}`);
            const {
              data: { trackedEntityInstances },
            } = await epivac.get("trackedEntityInstances.json", {
              params: { ...params, page },
            });
            await ctx.call("utils.processInstances", {
              trackedEntityInstances,
            });
          }
        }
        return "finished";
      },
    },
    updateTrackedEntityInstance: {
      async handler(ctx) {
        const { identifier, dob } = ctx.params;
        let results = {};
        const [
          {
            data: { trackedEntityInstances: epivacByNIN },
          },
          {
            data: { trackedEntityInstances: epivacByOther },
          },
          // {
          //   data: { trackedEntityInstances: defenceByNIN },
          // },
          // {
          //   data: { trackedEntityInstances: defenceByOther },
          // },
        ] = await Promise.all([
          epivac.get("trackedEntityInstances.json", {
            params: {
              program: PROGRAM,
              ouMode: "ALL",
              filter: `${NIN_ATTRIBUTE}:EQ:${identifier}`,
            },
          }),
          epivac.get("trackedEntityInstances.json", {
            params: {
              program: PROGRAM,
              ouMode: "ALL",
              filter: `${OTHER_ID}:EQ:${identifier}`,
            },
          }),
          // defence.get("trackedEntityInstances.json", {
          //   params: {
          //     program: PROGRAM,
          //     ouMode: "ALL",
          //     filter: `${NIN_ATTRIBUTE}:EQ:${identifier}`,
          //   },
          // }),
          // defence.get("trackedEntityInstances.json", {
          //   params: {
          //     program: PROGRAM,
          //     ouMode: "ALL",
          //     filter: `${OTHER_ID}:EQ:${identifier}`,
          //   },
          // }),
        ]);
        if (epivacByNIN.length === 1) {
          let [instance] = epivacByNIN;
          const attributes = instance.attributes.map((a) => {
            if (a.attribute === DOB_ATTRIBUTE) {
              return { ...a, value: dob };
            }
            return a;
          });
          instance = { ...instance, attributes };
          await epivac.post("trackedEntityInstances", instance);
          const { data } = await epivac.get(
            `trackedEntityInstances/${instance.trackedEntityInstance}`,
            {
              params: {
                program: PROGRAM,
                fields: "*",
              },
            }
          );
          await ctx.call("utils.processInstances", {
            trackedEntityInstances: [data],
          });
          results = { ...results, epivac: true };
        } else if (epivacByNIN.length > 1) {
          results = {
            ...results,
            epivac: false,
            reason: `More than one record found with identifier ${identifier}`,
          };
        }
        if (epivacByOther.length === 1) {
          let [instance] = epivacByNIN;
          const attributes = instance.attributes.map((a) => {
            if (a.attribute === DOB_ATTRIBUTE) {
              return { ...a, value: dob };
            }
            return a;
          });
          instance = { ...instance, attributes };
          await epivac.post("trackedEntityInstances", instance);
          const { data } = await epivac.get(
            `trackedEntityInstances/${instance.trackedEntityInstance}`,
            {
              params: {
                program: PROGRAM,
                fields: "*",
              },
            }
          );
          await ctx.call("utils.processInstances", {
            trackedEntityInstances: [data],
          });
          results = { ...results, epivac: true };
        } else if (epivacByOther.length > 1) {
          results = {
            ...results,
            epivac: false,
            reason: `More than one record found with identifier ${identifier}`,
          };
        }
        return results;
      },
    },
    defenceData: {
      async handler(ctx) {
        const params = {
          program: PROGRAM,
          ouMode: "ALL",
          totalPages: true,
          page: 1,
          pageSize: 1000,
          fields: "*",
          ...ctx.params,
        };
        const {
          data: {
            trackedEntityInstances,
            pager: { pageCount },
          },
        } = await defence.get("trackedEntityInstances.json", {
          params,
        });

        const response = await ctx.call("utils.processInstances", {
          trackedEntityInstances,
        });
        if (pageCount > 1) {
          for (let page = 2; page <= pageCount; page++) {
            console.log(`Processing ${page} of ${pageCount}`);
            const {
              data: { trackedEntityInstances },
            } = await defence.get("trackedEntityInstances.json", {
              params: { ...params, page },
            });
            await ctx.call("utils.processInstances", {
              trackedEntityInstances,
            });
          }
        }
        return response;
      },
    },
    facilities: {
      async handler(ctx) {
        const params = {
          fields:
            "organisationUnits[id,name,parent[id,name,parent[id,name,parent[id,name,parent[id,name]]]]]",
        };
        const {
          data: { organisationUnits },
        } = await epivac.get(`programs/yDuAzyqYABS`, { params });
        const processed = this.processFacilities(organisationUnits);
        await ctx.call("es.bulk", {
          index: "facilities",
          dataset: processed,
          id: "id",
        });
      },
    },
    index: {
      async handler(ctx) {
        return await ctx.call("es.createIndex", { index: "certificates" });
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
    // try {
    //   console.log(this.actions.index("certificates"));
    // } catch (error) {
    //   console.log(error.message);
    // }
  },

  /**
   * Service stopped lifecycle event handler
   */
  async stopped() {},
};
