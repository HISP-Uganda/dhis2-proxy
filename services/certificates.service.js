"use strict";
const QRCode = require("qrcode");
const { isEmpty, groupBy, fromPairs, orderBy } = require("lodash");
const mergeByKey = require("array-merge-by-key");

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const NAME_ATTRIBUTE = "sB1IHYu2xQT";
const SEX_ATTRIBUTE = "FZzQbW8AWVd";
const DOB_ATTRIBUTE = "NI0QRzJvQ0k";
const PHONE_ATTRIBUTE = "ciCR6BBvIT4";
const DOSE_PLACE = "AmTw4pWCCaJ";
const ELSEWHERE_IN_COUNTRY_DISTRICT = "ObwW38YrQHu";
const ELSEWHERE_IN_COUNTRY_FACILITY = "X7tI86pr1y0";
const ELSEWHERE_OUT_COUNTRY_FACILITY = "OW3erclrDW8";
const ELSEWHERE_OUT_COUNTRY = "ONsseOxElW9";

const findDistrictAndFacility2 = (data) => {
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
        let data = await ctx.call("vaccination.certificate", ctx.params);
        if (
          !isEmpty(data) &&
          data.DOSE1 &&
          (data.DOSE1.bbnyNYD1wgS === "Johnson and Johnson" ||
            data.DOSE1.bbnyNYD1wgS === "Johnson & Johnson")
        ) {
          const qr = await this.generate(data);
          return { ...data, qr, eligible: true, type: "Fully", doses: 1 };
        } else if (!isEmpty(data) && data.DOSE1 && data.DOSE2) {
          const qr = await this.generate(data);
          return { ...data, type: "Fully", qr, eligible: true, doses: 2 };
        } else if (!isEmpty(data) && data.DOSE2) {
          const updatedData = {
            ...data,
            eligible: true,
            type: "Partial",
          };
          const qr = await this.generate(updatedData);
          return { ...updatedData, qr };
        } else if (!isEmpty(data) && data.DOSE1) {
          const updatedData = {
            ...data,
            type: "Partially",
            eligible: true,
          };
          const qr = await this.generate(updatedData);
          return { ...updatedData, qr };
        } else if (!isEmpty(data) && data.BOOSTER1) {
          const updatedData = {
            ...data,
            type: "Partially",
            eligible: true,
          };
          const qr = await this.generate(updatedData);
          return { ...updatedData, qr };
        } else if (!isEmpty(data) && (data.DOSE1 || data.DOSE2)) {
          return {
            eligible: false,
            message:
              "We could not be able to generate your certificate because of missing or invalid registration information",
          };
        }

        return {
          eligible: false,
          message: "You have no registered vaccination information",
        };
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
    updateBirthDate: {
      rest: {
        method: "POST",
        path: "/update-birth",
      },
      async handler(ctx) {
        return await ctx.call(
          "vaccination.updateTrackedEntityInstance",
          ctx.params
        );
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
    validate: {
      rest: {
        method: "GET",
        path: "/validate/:trackedEntityInstance",
      },
      async handler(ctx) {
        const allData = await ctx.call("es.search2", {
          index: "epivac",
          body: {
            query: {
              bool: {
                should: [
                  {
                    match: {
                      matched: String(
                        ctx.params.trackedEntityInstance
                      ).toLowerCase(),
                    },
                  },
                  {
                    match: {
                      tei_uid: String(
                        ctx.params.trackedEntityInstance
                      ).toLowerCase(),
                    },
                  },
                ],
              },
            },
          },
        });

        let found = allData.flatMap((p) => {
          if (
            p.vk2nF6wZwY4 &&
            p.vk2nF6wZwY4 !== null &&
            p.vk2nF6wZwY4 !== undefined
          ) {
            const { facility, district } = findDistrictAndFacility2(p);
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
        const doses = groupBy(found, "LUIsbsm3okG");
        const { BOOSTER, ...others } = doses;
        let foundBoosters = {};
        if (BOOSTER) {
          const sortedByEventDate = orderBy(
            mergeByKey("event_execution_date", BOOSTER),
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
      },
    },
    search: {
      rest: {
        method: "GET",
        path: "/confirm/:identifier",
      },
      async handler(ctx) {
        return await ctx.call("es.searchByIdentifier", ctx.params);
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
  methods: {
    generate: async (data) => {
      const attributes =
        data["DOSE1"] || data["DOSE2"] || data["BOOSTER1"] || data["BOOSTER1"];
      const names = `Name:${attributes[NAME_ATTRIBUTE] || ""}\nIdentifier:${
        attributes.identifier
      }\nSex:${attributes[SEX_ATTRIBUTE]}\nDOB:${
        attributes[DOB_ATTRIBUTE] || " "
      }\nPHONE:${attributes[PHONE_ATTRIBUTE]}\n`;

      let dose1 = "";
      let dose2 = "";
      let booster1 = "";

      let booster2 = "";

      if (data.DOSE1) {
        dose1 = `${data.DOSE1.bbnyNYD1wgS}:${new Intl.DateTimeFormat(
          "fr"
        ).format(Date.parse(data.DOSE1.event_execution_date))},${
          data.DOSE1.name
        },${data.DOSE1.districtName || ""}\n`;
      }

      if (data.DOSE2) {
        dose2 = `${data.DOSE2.bbnyNYD1wgS}:${new Intl.DateTimeFormat(
          "fr"
        ).format(Date.parse(data.DOSE2.event_execution_date))},${
          data.DOSE2.name
        },${data.DOSE2.districtName || ""}\n`;
      }

      if (data.BOOSTER1) {
        booster1 = `${data.BOOSTER1.bbnyNYD1wgS}:${new Intl.DateTimeFormat(
          "fr"
        ).format(Date.parse(data.BOOSTER1.event_execution_date))},${
          data.BOOSTER1.name
        },${data.BOOSTER1.districtName || ""}\n`;
      }

      if (data.BOOSTER2) {
        booster2 = `${data.BOOSTER2.bbnyNYD1wgS}:${new Intl.DateTimeFormat(
          "fr"
        ).format(Date.parse(data.BOOSTER2.event_execution_date))},${
          data.BOOSTER2.name
        },${data.BOOSTER2.districtName || ""}\n`;
      }

      const qr = await QRCode.toDataURL(
        `${names}${dose1}${dose2}${booster1}${booster2}\nClick to verify\nhttps://epivac.health.go.ug/certificates/#/validate/${attributes.matched}`,
        { margin: 0 }
      );
      return qr;
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
