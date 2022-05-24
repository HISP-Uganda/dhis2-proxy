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
const DOSE_PLACE = "AmTw4pWCCaJ";
const ELSEWHERE_IN_COUNTRY_DISTRICT = "ObwW38YrQHu";
const ELSEWHERE_IN_COUNTRY_FACILITY = "X7tI86pr1y0";
const ELSEWHERE_OUT_COUNTRY_FACILITY = "OW3erclrDW8";
const ELSEWHERE_OUT_COUNTRY = "ONsseOxElW9";
const ELSEWHERE_VACCINE = "wwX1eEiYLGR";
const ELSEWHERE_MAN = "taGJD9hkX0s";
const ELSEWHERE_BATCH = "muCgXjnCfnS";

const findDistrictAndFacility = (data, dose = "DOSE2") => {
  const where = data[dose][DOSE_PLACE];

  if (where === "Outside the country") {
    return {
      facility: data[dose][ELSEWHERE_OUT_COUNTRY_FACILITY],
      district: data[dose][ELSEWHERE_OUT_COUNTRY],
    };
  }

  return {
    facility: data[dose][ELSEWHERE_IN_COUNTRY_FACILITY],
    district: data[dose][ELSEWHERE_IN_COUNTRY_DISTRICT],
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
        const qr = await this.generate(data);
        if (
          data.BOOSTER1 &&
          data.BOOSTER1.vk2nF6wZwY4 &&
          data.BOOSTER1.lySxMCMSo8Z
        ) {
          const { facility, district } = findDistrictAndFacility(
            data,
            "BOOSTER1"
          );
          const event = {
            ...data.BOOSTER1,
            bbnyNYD1wgS: data.BOOSTER1[ELSEWHERE_VACCINE] || "",
            orgUnitName: facility,
            rpkH9ZPGJcX: data.BOOSTER1[ELSEWHERE_MAN] || "",
            Yp1F4txx8tm: data.BOOSTER1[ELSEWHERE_BATCH] || "",
            districtName: district,
          };
          data = { ...data, BOOSTER1: event };
        }
        if (
          data.BOOSTER2 &&
          data.BOOSTER2.vk2nF6wZwY4 &&
          data.BOOSTER2.lySxMCMSo8Z
        ) {
          const { facility, district } = findDistrictAndFacility(
            data,
            "BOOSTER2"
          );
          const event = {
            ...data.BOOSTER2,
            bbnyNYD1wgS: data.BOOSTER2[ELSEWHERE_VACCINE] || "",
            orgUnitName: facility,
            rpkH9ZPGJcX: data.BOOSTER2[ELSEWHERE_MAN] || "",
            Yp1F4txx8tm: data.BOOSTER2[ELSEWHERE_BATCH] || "",
            districtName: district,
          };
          data = { ...data, BOOSTER2: event };
        }
        if (
          !isEmpty(data) &&
          data.DOSE1 &&
          data.DOSE1.bbnyNYD1wgS === "Johnson and Johnson"
        ) {
          return { ...data, qr, eligible: true, type: "Fully", doses: 1 };
        } else if (!isEmpty(data) && data.DOSE1 && data.DOSE2) {
          return { ...data, type: "Fully", qr, eligible: true, doses: 2 };
        } else if (
          !isEmpty(data) &&
          data.DOSE2 &&
          data.DOSE2.vk2nF6wZwY4 &&
          data.DOSE2.lySxMCMSo8Z
        ) {
          const eventDate = data.DOSE2.lySxMCMSo8Z;

          const { facility, district } = findDistrictAndFacility(data, "DOSE2");
          const event = {
            ...data.DOSE2,
            bbnyNYD1wgS: data.DOSE2[ELSEWHERE_VACCINE] || "",
            event_execution_date:eventDate,
            orgUnitName: facility,
            rpkH9ZPGJcX: data.DOSE2[ELSEWHERE_MAN] || "",
            Yp1F4txx8tm: data.DOSE2[ELSEWHERE_BATCH] || "",
            districtName: district,
          };
          data = { ...data, DOSE1: event, eligible: true, doses: 2 };
          return { ...data, type: "Fully", qr, doses: 2 };
        } else if (
          !isEmpty(data) &&
          data.DOSE1 &&
          data.DOSE1.vk2nF6wZwY4 &&
          data.DOSE1.lySxMCMSo8Z
        ) {
          const eventDate = data.DOSE1.lySxMCMSo8Z;
          const { facility, district } = findDistrictAndFacility(data, "DOSE1");
          const event = {
            ...data.DOSE1,
            bbnyNYD1wgS: data.DOSE1[ELSEWHERE_VACCINE] || "",
            event_execution_date:eventDate,
            orgUnitName: facility,
            rpkH9ZPGJcX: data.DOSE1[ELSEWHERE_MAN] || "",
            Yp1F4txx8tm: data.DOSE1[ELSEWHERE_BATCH] || "",
            districtName: district,
          };
          data = { ...data, DOSE2: event, eligible: true, doses: 2 };
          return { ...data, qr, type: "Fully", doses: 2 };
        } else if (!isEmpty(data) && data.DOSE2) {
          return {
            ...data,
            eligible: true,
            type: "Partial",
            qr,
          };
        } else if (!isEmpty(data) && data.DOSE1 && !data.DOSE1.vk2nF6wZwY4) {
          return {
            ...data,
            type: "Partially",
            qr,
            eligible: true,
          };
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
        return await ctx.call("es.searchTrackedEntityInstance", ctx.params);
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
      const names = `Name:${data[NAME_ATTRIBUTE]}\nIdentifier:${data.id}\nSex:${
        data[SEX_ATTRIBUTE]
      }\nDOB:${data[DOB_ATTRIBUTE] || " "}\nPHONE:${data[PHONE_ATTRIBUTE]}\n`;

      let dose1 = "";
      let dose2 = "";
      let booster1 = "";

      let booster2 = "";

      if (data.DOSE1) {
        dose1 = `${data.DOSE1.bbnyNYD1wgS}:${new Intl.DateTimeFormat(
          "fr"
        ).format(Date.parse(data.DOSE1.event_execution_date))},${data.DOSE1.orgUnitName},${
          data.DOSE1.districtName || ""
        }\n`;
      }

      if (data.DOSE2) {
        dose2 = `${data.DOSE2.bbnyNYD1wgS}:${new Intl.DateTimeFormat(
          "fr"
        ).format(Date.parse(data.DOSE2.event_execution_date))},${data.DOSE2.orgUnitName},${
          data.DOSE2.districtName || ""
        }\n`;
      }

      if (data.BOOSTER1) {
        booster1 = `${data.BOOSTER1.bbnyNYD1wgS}:${new Intl.DateTimeFormat(
          "fr"
        ).format(Date.parse(data.BOOSTER1.event_execution_date))},${
          data.BOOSTER1.orgUnitName
        },${data.BOOSTER1.districtName || ""}\n`;
      }

      if (data.BOOSTER2) {
        booster2 = `${data.BOOSTER2.bbnyNYD1wgS}:${new Intl.DateTimeFormat(
          "fr"
        ).format(Date.parse(data.BOOSTER2.event_execution_date))},${
          data.BOOSTER2.orgUnitName
        },${data.BOOSTER2.districtName || ""}\n`;
      }

      const qr = await QRCode.toDataURL(
        `${names}${dose1}${dose2}${booster1}${booster2}\nClick to verify\nhttps://epivac.health.go.ug/certificates/#/validate/${data.trackedEntityInstance}`,
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
