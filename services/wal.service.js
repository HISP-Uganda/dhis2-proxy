"use strict";

const { MoleculerError } = require("moleculer").Errors;
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const primaryKeys = {
  organisationunit: "organisationid",
  programinstance: "programinstanceid",
  programstageinstance: "programstageinstanceid",
  foo: "a",
  datavalues: "id",
  epivac: "id",
};

module.exports = {
  name: "wal",
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
    search: {
      rest: {
        method: "POST",
        path: "/search",
      },
      async handler(ctx) {
        const { index, ...body } = ctx.params;
        return await ctx.call("es.search", {
          index,
          body,
        });
      },
    },
    scroll: {
      rest: {
        method: "POST",
        path: "/scroll",
      },
      async handler(ctx) {
        const { index, ...body } = ctx.params;
        return await ctx.call("es.scroll", {
          index,
          body,
        });
      },
    },
    receive: {
      rest: {
        method: "POST",
        path: "/receive",
      },
      async handler(ctx) {
        return ctx.params;
      },
    },
    aggregate: {
      rest: {
        method: "POST",
        path: "/",
      },
      async handler(ctx) {
        const { index, ...body } = ctx.params;
        return await ctx.call("es.aggregations", {
          index,
          body,
        });
      },
    },
    bulk: {
      rest: {
        method: "POST",
        path: "/bulk",
      },
      async handler(ctx) {
        const { index, data } = ctx.params;
        return await ctx.call("es.bulk", {
          index,
          dataset: data,
          id: primaryKeys[index] || "id",
        });
      },
    },
    index: {
      rest: {
        method: "POST",
        path: "/index",
      },
      async handler(ctx) {
        const {
          index,
          [primaryKeys[index]]: otherId,
          id,
          ...body
        } = ctx.params;
        return await ctx.call("es.index", {
          index,
          id,
          body: { ...body, id: id || otherId },
        });
      },
    },
    delete: {
      rest: {
        method: "POST",
        path: "/delete",
      },
      async handler(ctx) {
        return await ctx.call("es.delete", ctx.params);
      },
    },
    get: {
      rest: {
        method: "GET",
        path: "/get",
      },
      async handler(ctx) {
        const { index, id } = ctx.params;
        return await ctx.call("es.get", { index, id });
      },
    },
    sql: {
      rest: {
        method: "POST",
        path: "/sql",
      },
      async handler(ctx) {
        return await ctx.call("es.sql", ctx.params);
      },
    },
    exchange: {
      rest: {
        method: "POST",
        path: "/exchange",
      },
      async handler(ctx) {
        const { source, destination } = ctx.params;
        const dashboards = await ctx.call("es.scroll", {
          index: "i-dashboards",
          body: {
            query: {
              term: { "systemId.keyword": source },
            },
          },
        });
        const visualizations = await ctx.call("es.scroll", {
          index: "i-visualization-queries",
          body: {
            query: {
              term: { "systemId.keyword": source },
            },
          },
        });
        const categories = await ctx.call("es.scroll", {
          index: "i-categories",
          body: {
            query: {
              term: { "systemId.keyword": source },
            },
          },
        });
        const dataSources = await ctx.call("es.scroll", {
          index: "i-data-sources",
          body: {
            query: {
              term: { "systemId.keyword": source },
            },
          },
        });

        const settings = await ctx.call("es.scroll", {
          index: "i-dashboard-settings",
          body: {
            query: {
              term: { "systemId.keyword": source },
            },
          },
        });

        if (dashboards.length > 0) {
          await ctx.call("es.bulk", {
            index: "i-dashboards",
            dataset: dashboards.map((dashboard) => {
              return { ...dashboard, systemId: destination };
            }),
            id: "id",
          });
        }
        if (visualizations.length > 0) {
          await ctx.call("es.bulk", {
            index: "i-visualization-queries",
            dataset: visualizations.map((visualization) => {
              return { ...visualization, systemId: destination };
            }),
            id: "id",
          });
        }

        if (categories.length > 0) {
          await ctx.call("es.bulk", {
            index: "i-categories",
            dataset: categories.map((category) => {
              return { ...category, systemId: destination };
            }),
            id: "id",
          });
        }

        if (dataSources.length > 0) {
          await ctx.call("es.bulk", {
            index: "i-data-sources",
            dataset: dataSources.map((dataSource) => {
              return { ...dataSource, systemId: destination };
            }),
            id: "id",
          });
        }
        if (settings.length > 0) {
          await ctx.call("es.bulk", {
            index: "i-dashboard-settings",
            dataset: settings.map((setting) => {
              return { ...setting, systemId: destination };
            }),
            id: "id",
          });
        }
        return {
          finished: true,
        };
      },
    },
    population: {
      rest: {
        method: "GET",
        path: "/population",
      },
      async handler(ctx) {
        return {
          2015: [
            {
              district: "ABIM",
              value: 55200,
              sex: "male",
            },
            {
              district: "ABIM",
              value: 58200,
              sex: "female",
            },
            {
              district: "ADJUMANI",
              value: 108800,
              sex: "male",
            },
            {
              district: "ADJUMANI",
              value: 117700,
              sex: "female",
            },

            {
              district: "AGAGO",
              value: 112000,
              sex: "male",
            },
            {
              district: "AGAGO",
              value: 118800,
              sex: "female",
            },

            {
              district: "Alebtong",
              value: 113500,
              sex: "male",
            },
            {
              district: "Alebtong",
              value: 118900,
              sex: "female",
            },
            {
              district: "Amolatar",
              value: 74600,
              sex: "male",
            },
            {
              district: "Amolatar",
              value: 75500,
              sex: "female",
            },
            {
              district: "Amudat",
              value: 56000,
              sex: "male",
            },
            {
              district: "Amudat",
              value: 53400,
              sex: "female",
            },
            {
              district: "Amuru",
              value: 93200,
              sex: "male",
            },
            {
              district: "Amuru",
              value: 97300,
              sex: "female",
            },
            {
              district: "Apac",
              value: 94000,
              sex: "male",
            },
            {
              district: "Apac",
              value: 96500,
              sex: "female",
            },
            {
              district: "Kwania",
              value: 91800,
              sex: "male",
            },
            {
              district: "Kwania",
              value: 95700,
              sex: "female",
            },
            {
              district: "Dokolo",
              value: 91600,
              sex: "male",
            },
            {
              district: "Dokolo",
              value: 95600,
              sex: "female",
            },
            {
              district: "GuluCity",
              value: 87900,
              sex: "male",
            },
            {
              district: "GuluCity",
              value: 92400,
              sex: "female",
            },
            {
              district: "Gulu",
              value: 49900,
              sex: "male",
            },
            {
              district: "Gulu",
              value: 51800,
              sex: "female",
            },
            {
              district: "Omoro",
              value: 81200,
              sex: "male",
            },
            {
              district: "Omoro",
              value: 84100,
              sex: "female",
            },
            {
              district: "Kitgum",
              value: 100600,
              sex: "male",
            },
            {
              district: "Kitgum",
              value: 106000,
              sex: "female",
            },
            {
              district: "Koboko",
              value: 105600,
              sex: "male",
            },
            {
              district: "Koboko",
              value: 107400,
              sex: "female",
            },
            {
              district: "Kole",
              value: 120200,
              sex: "male",
            },
            {
              district: "Kole",
              value: 124900,
              sex: "female",
            },
            {
              district: "Kotido",
              value: 87900,
              sex: "male",
            },
            {
              district: "Kotido",
              value: 96400,
              sex: "female",
            },
            {
              district: "Lamwo",
              value: 65600,
              sex: "male",
            },
            {
              district: "Lamwo",
              value: 70000,
              sex: "female",
            },
            {
              district: "LiraCity",
              value: 101200,
              sex: "male",
            },
            {
              district: "LiraCity",
              value: 110900,
              sex: "female",
            },
            {
              district: "Lira",
              value: 99800,
              sex: "male",
            },
            {
              district: "Lira",
              value: 105100,
              sex: "female",
            },
            {
              district: "Maracha",
              value: 89300,
              sex: "male",
            },
            {
              district: "Maracha",
              value: 99600,
              sex: "female",
            },
            {
              district: "Moroto",
              value: 50700,
              sex: "male",
            },
            {
              district: "Moroto",
              value: 54700,
              sex: "female",
            },
            {
              district: "Nakapiripirit",
              value: 44100,
              sex: "male",
            },
            {
              district: "Nakapiripirit",
              value: 47300,
              sex: "female",
            },
            {
              district: "Nabilatuk",
              value: 33400,
              sex: "male",
            },
            {
              district: "Nabilatuk",
              value: 37700,
              sex: "female",
            },
            {
              district: "Napak",
              value: 66400,
              sex: "male",
            },
            {
              district: "Napak",
              value: 77900,
              sex: "female",
            },
            {
              district: "Nebbi",
              value: 117600,
              sex: "male",
            },
            {
              district: "Nebbi",
              value: 126700,
              sex: "female",
            },
            {
              district: "Pakwach",
              value: 78900,
              sex: "male",
            },
            {
              district: "Pakwach",
              value: 84000,
              sex: "female",
            },
            {
              district: "Nwoya",
              value: 71600,
              sex: "male",
            },
            {
              district: "Nwoya",
              value: 73100,
              sex: "female",
            },
            {
              district: "Otuke",
              value: 53000,
              sex: "male",
            },
            {
              district: "Otuke",
              value: 54900,
              sex: "female",
            },
            {
              district: "Oyam",
              value: 191700,
              sex: "male",
            },
            {
              district: "Oyam",
              value: 200900,
              sex: "female",
            },
            {
              district: "Pader",
              value: 87800,
              sex: "male",
            },
            {
              district: "Pader",
              value: 92600,
              sex: "female",
            },
            {
              district: "Yumbe",
              value: 240400,
              sex: "male",
            },
            {
              district: "Yumbe",
              value: 266200,
              sex: "female",
            },
            {
              district: "Zombo",
              value: 118700,
              sex: "male",
            },
            {
              district: "Zombo",
              value: 126900,
              sex: "female",
            },
            {
              district: "Moyo",
              value: 48200,
              sex: "male",
            },
            {
              district: "Moyo",
              value: 49500,
              sex: "female",
            },
            {
              district: "Obongi",
              value: 22100,
              sex: "male",
            },
            {
              district: "Obongi",
              value: 21700,
              sex: "female",
            },
            {
              district: "AruaCity",
              value: 149700,
              sex: "male",
            },
            {
              district: "AruaCity",
              value: 166300,
              sex: "female",
            },
            {
              district: "Arua",
              value: 65500,
              sex: "male",
            },
            {
              district: "Arua",
              value: 70900,
              sex: "female",
            },
            {
              district: "Terego",
              value: 98300,
              sex: "male",
            },
            {
              district: "Terego",
              value: 105300,
              sex: "female",
            },
            {
              district: "MADIOKOLLO",
              value: 69900,
              sex: "male",
            },
            {
              district: "MADIOKOLLO",
              value: 73300,
              sex: "female",
            },
            {
              district: "Kaabong",
              value: 51500,
              sex: "male",
            },
            {
              district: "Kaabong",
              value: 59300,
              sex: "female",
            },
            {
              district: "Karenga",
              value: 29400,
              sex: "male",
            },
            {
              district: "Karenga",
              value: 31000,
              sex: "female",
            },
            {
              district: "Amuria",
              value: 92200,
              sex: "male",
            },
            {
              district: "Amuria",
              value: 96400,
              sex: "female",
            },
            {
              district: "Kapelebyong",
              value: 44200,
              sex: "male",
            },
            {
              district: "Kapelebyong",
              value: 45400,
              sex: "female",
            },
            {
              district: "Budaka",
              value: 103600,
              sex: "male",
            },
            {
              district: "Budaka",
              value: 103600,
              sex: "female",
            },
            {
              district: "Bududa",
              value: 109800,
              sex: "male",
            },
            {
              district: "Bududa",
              value: 108000,
              sex: "female",
            },
            {
              district: "Bugiri",
              value: 192200,
              sex: "male",
            },
            {
              district: "Bugiri",
              value: 203000,
              sex: "female",
            },
            {
              district: "Bukedea",
              value: 102300,
              sex: "male",
            },
            {
              district: "Bukedea",
              value: 108300,
              sex: "female",
            },
            {
              district: "Bukwo",
              value: 47000,
              sex: "male",
            },
            {
              district: "Bukwo",
              value: 46000,
              sex: "female",
            },
            {
              district: "Bulambuli",
              value: 89600,
              sex: "male",
            },
            {
              district: "Bulambuli",
              value: 91800,
              sex: "female",
            },
            {
              district: "Busia",
              value: 160500,
              sex: "male",
            },
            {
              district: "Busia",
              value: 170900,
              sex: "female",
            },
            {
              district: "Butaleja",
              value: 123200,
              sex: "male",
            },
            {
              district: "Butaleja",
              value: 128100,
              sex: "female",
            },
            {
              district: "Buyende",
              value: 164500,
              sex: "male",
            },
            {
              district: "Buyende",
              value: 170000,
              sex: "female",
            },
            {
              district: "Iganga",
              value: 166600,
              sex: "male",
            },
            {
              district: "Iganga",
              value: 180800,
              sex: "female",
            },
            {
              district: "Bugweri",
              value: 80500,
              sex: "male",
            },
            {
              district: "Bugweri",
              value: 87800,
              sex: "female",
            },
            {
              district: "JinjaCity",
              value: 121600,
              sex: "male",
            },
            {
              district: "JinjaCity",
              value: 128400,
              sex: "female",
            },
            {
              district: "Jinja",
              value: 111500,
              sex: "male",
            },
            {
              district: "Jinja",
              value: 115300,
              sex: "female",
            },
            {
              district: "Kaliro",
              value: 119400,
              sex: "male",
            },
            {
              district: "Kaliro",
              value: 123500,
              sex: "female",
            },
            {
              district: "Katakwi",
              value: 83700,
              sex: "male",
            },
            {
              district: "Katakwi",
              value: 86200,
              sex: "female",
            },
            {
              district: "Kibuku",
              value: 100600,
              sex: "male",
            },
            {
              district: "Kibuku",
              value: 107600,
              sex: "female",
            },
            {
              district: "Kween",
              value: 48600,
              sex: "male",
            },
            {
              district: "Kween",
              value: 47100,
              sex: "female",
            },
            {
              district: "Luuka",
              value: 115500,
              sex: "male",
            },
            {
              district: "Luuka",
              value: 126300,
              sex: "female",
            },
            {
              district: "Manafwa",
              value: 76400,
              sex: "male",
            },
            {
              district: "Manafwa",
              value: 79800,
              sex: "female",
            },
            {
              district: "Namisindwa",
              value: 100800,
              sex: "male",
            },
            {
              district: "Namisindwa",
              value: 103500,
              sex: "female",
            },
            {
              district: "Mayuge",
              value: 235200,
              sex: "male",
            },
            {
              district: "Mayuge",
              value: 249700,
              sex: "female",
            },
            {
              district: "MbaleCity",
              value: 129500,
              sex: "male",
            },
            {
              district: "MbaleCity",
              value: 143900,
              sex: "female",
            },
            {
              district: "Mbale",
              value: 109700,
              sex: "male",
            },
            {
              district: "Mbale",
              value: 118300,
              sex: "female",
            },
            {
              district: "Namayingo",
              value: 107900,
              sex: "male",
            },
            {
              district: "Namayingo",
              value: 110300,
              sex: "female",
            },
            {
              district: "Namutumba",
              value: 127500,
              sex: "male",
            },
            {
              district: "Namutumba",
              value: 131900,
              sex: "female",
            },
            {
              district: "Ngora",
              value: 70000,
              sex: "male",
            },
            {
              district: "Ngora",
              value: 75000,
              sex: "female",
            },
            {
              district: "Serere",
              value: 144200,
              sex: "male",
            },
            {
              district: "Serere",
              value: 150900,
              sex: "female",
            },
            {
              district: "Sironko",
              value: 123100,
              sex: "male",
            },
            {
              district: "Sironko",
              value: 123400,
              sex: "female",
            },
            {
              district: "SorotiCity",
              value: 28400,
              sex: "male",
            },
            {
              district: "SorotiCity",
              value: 30400,
              sex: "female",
            },
            {
              district: "Soroti",
              value: 120900,
              sex: "male",
            },
            {
              district: "Soroti",
              value: 125600,
              sex: "female",
            },
            {
              district: "Tororo",
              value: 256100,
              sex: "male",
            },
            {
              district: "Tororo",
              value: 271300,
              sex: "female",
            },
            {
              district: "Pallisa",
              value: 138900,
              sex: "male",
            },
            {
              district: "Pallisa",
              value: 138900,
              sex: "female",
            },
            {
              district: "Butebo",
              value: 54900,
              sex: "male",
            },
            {
              district: "Butebo",
              value: 58100,
              sex: "female",
            },
            {
              district: "Kapchorwa",
              value: 52900,
              sex: "male",
            },
            {
              district: "Kapchorwa",
              value: 54700,
              sex: "female",
            },
            {
              district: "Kumi",
              value: 119500,
              sex: "male",
            },
            {
              district: "Kumi",
              value: 125500,
              sex: "female",
            },

            {
              district: "Kamuli",
              value: 241400,
              sex: "male",
            },
            {
              district: "Kamuli",
              value: 254200,
              sex: "female",
            },
            {
              district: "Kalaki",
              value: 56100,
              sex: "male",
            },
            {
              district: "Kalaki",
              value: 57400,
              sex: "female",
            },
            {
              district: "Kaberamaido",
              value: 53700,
              sex: "male",
            },
            {
              district: "Kaberamaido",
              value: 55000,
              sex: "female",
            },
            {
              district: "Buhweju",
              value: 60600,
              sex: "male",
            },
            {
              district: "Buhweju",
              value: 63100,
              sex: "female",
            },
            {
              district: "Buliisa",
              value: 60300,
              sex: "male",
            },
            {
              district: "Buliisa",
              value: 57300,
              sex: "female",
            },
            {
              district: "Bundibugyo",
              value: 111100,
              sex: "male",
            },
            {
              district: "Bundibugyo",
              value: 118300,
              sex: "female",
            },
            {
              district: "Bushenyi",
              value: 115200,
              sex: "male",
            },
            {
              district: "Bushenyi",
              value: 120900,
              sex: "female",
            },
            {
              district: "HoimaCity",
              value: 49000,
              sex: "male",
            },
            {
              district: "HoimaCity",
              value: 53900,
              sex: "female",
            },
            {
              district: "Hoima",
              value: 107100,
              sex: "male",
            },
            {
              district: "Hoima",
              value: 104300,
              sex: "female",
            },
            {
              district: "Kikuube",
              value: 142300,
              sex: "male",
            },
            {
              district: "Kikuube",
              value: 136400,
              sex: "female",
            },
            {
              district: "Ibanda",
              value: 123300,
              sex: "male",
            },
            {
              district: "Ibanda",
              value: 129900,
              sex: "female",
            },
            {
              district: "Isingiro",
              value: 242700,
              sex: "male",
            },
            {
              district: "Isingiro",
              value: 257600,
              sex: "female",
            },
            {
              district: "Kabale",
              value: 111300,
              sex: "male",
            },
            {
              district: "Kabale",
              value: 121500,
              sex: "female",
            },
            {
              district: "FortPortalCity",
              value: 51400,
              sex: "male",
            },
            {
              district: "FortPortalCity",
              value: 52400,
              sex: "female",
            },
            {
              district: "Kabarole",
              value: 100800,
              sex: "male",
            },
            {
              district: "Kabarole",
              value: 99400,
              sex: "female",
            },
            {
              district: "Kanungu",
              value: 122800,
              sex: "male",
            },
            {
              district: "Kanungu",
              value: 132600,
              sex: "female",
            },
            {
              district: "Kasese",
              value: 345000,
              sex: "male",
            },
            {
              district: "Kasese",
              value: 362600,
              sex: "female",
            },
            {
              district: "Kibaale",
              value: 74500,
              sex: "male",
            },
            {
              district: "Kibaale",
              value: 73400,
              sex: "female",
            },
            {
              district: "Kiryandongo",
              value: 136100,
              sex: "male",
            },
            {
              district: "Kiryandongo",
              value: 136100,
              sex: "female",
            },
            {
              district: "Kisoro",
              value: 128100,
              sex: "male",
            },
            {
              district: "Kisoro",
              value: 157900,
              sex: "female",
            },
            {
              district: "Kyegegwa",
              value: 150100,
              sex: "male",
            },
            {
              district: "Kyegegwa",
              value: 150000,
              sex: "female",
            },
            {
              district: "Kyenjojo",
              value: 217500,
              sex: "male",
            },
            {
              district: "Kyenjojo",
              value: 217700,
              sex: "female",
            },
            {
              district: "Masindi",
              value: 151600,
              sex: "male",
            },
            {
              district: "Masindi",
              value: 145900,
              sex: "female",
            },
            {
              district: "Mitooma",
              value: 87300,
              sex: "male",
            },
            {
              district: "Mitooma",
              value: 97500,
              sex: "female",
            },
            {
              district: "Ntoroko",
              value: 34700,
              sex: "male",
            },
            {
              district: "Ntoroko",
              value: 33400,
              sex: "female",
            },
            {
              district: "Ntungamo",
              value: 236400,
              sex: "male",
            },
            {
              district: "Ntungamo",
              value: 254800,
              sex: "female",
            },
            {
              district: "Rubirizi",
              value: 62700,
              sex: "male",
            },
            {
              district: "Rubirizi",
              value: 68300,
              sex: "female",
            },
            {
              district: "Rukungiri",
              value: 151400,
              sex: "male",
            },
            {
              district: "Rukungiri",
              value: 165700,
              sex: "female",
            },
            {
              district: "Sheema",
              value: 100100,
              sex: "male",
            },
            {
              district: "Sheema",
              value: 108900,
              sex: "female",
            },
            {
              district: "Rubanda",
              value: 92900,
              sex: "male",
            },
            {
              district: "Rubanda",
              value: 105400,
              sex: "female",
            },
            {
              district: "Kakumiro",
              value: 157800,
              sex: "male",
            },
            {
              district: "Kakumiro",
              value: 155900,
              sex: "female",
            },
            {
              district: "Kagadi",
              value: 176900,
              sex: "male",
            },
            {
              district: "Kagadi",
              value: 184200,
              sex: "female",
            },
            {
              district: "Rukiga",
              value: 48500,
              sex: "male",
            },
            {
              district: "Rukiga",
              value: 52700,
              sex: "female",
            },
            {
              district: "Bunyangabu",
              value: 85800,
              sex: "male",
            },
            {
              district: "Bunyangabu",
              value: 87700,
              sex: "female",
            },
            {
              district: "MbararaCity",
              value: 97300,
              sex: "male",
            },
            {
              district: "MbararaCity",
              value: 101400,
              sex: "female",
            },
            {
              district: "Mbarara",
              value: 73400,
              sex: "male",
            },
            {
              district: "Mbarara",
              value: 78600,
              sex: "female",
            },
            {
              district: "Rwampara",
              value: 63500,
              sex: "male",
            },
            {
              district: "Rwampara",
              value: 66500,
              sex: "female",
            },
            {
              district: "Kiruhura",
              value: 80500,
              sex: "male",
            },
            {
              district: "Kiruhura",
              value: 74800,
              sex: "female",
            },
            {
              district: "Kazo",
              value: 90800,
              sex: "male",
            },
            {
              district: "Kazo",
              value: 91500,
              sex: "female",
            },
            {
              district: "Kamwenge",
              value: 136900,
              sex: "male",
            },
            {
              district: "Kamwenge",
              value: 142000,
              sex: "female",
            },
            {
              district: "Kitagwenda",
              value: 72200,
              sex: "male",
            },
            {
              district: "Kitagwenda",
              value: 75800,
              sex: "female",
            },
            {
              district: "Bukomansimbi",
              value: 75600,
              sex: "male",
            },
            {
              district: "Bukomansimbi",
              value: 76400,
              sex: "female",
            },
            {
              district: "Butambala",
              value: 50600,
              sex: "male",
            },
            {
              district: "Butambala",
              value: 51100,
              sex: "female",
            },
            {
              district: "Buvuma",
              value: 50800,
              sex: "male",
            },
            {
              district: "Buvuma",
              value: 43700,
              sex: "female",
            },
            {
              district: "Gomba",
              value: 83300,
              sex: "male",
            },
            {
              district: "Gomba",
              value: 78400,
              sex: "female",
            },
            {
              district: "Kalangala",
              value: 32200,
              sex: "male",
            },
            {
              district: "Kalangala",
              value: 23700,
              sex: "female",
            },
            {
              district: "Kalungu",
              value: 86100,
              sex: "male",
            },
            {
              district: "Kalungu",
              value: 89600,
              sex: "female",
            },
            {
              district: "Kayunga",
              value: 183600,
              sex: "male",
            },
            {
              district: "Kayunga",
              value: 189600,
              sex: "female",
            },
            {
              district: "Kiboga",
              value: 77500,
              sex: "male",
            },
            {
              district: "Kiboga",
              value: 73700,
              sex: "female",
            },
            {
              district: "Kyankwanzi",
              value: 116200,
              sex: "male",
            },
            {
              district: "Kyankwanzi",
              value: 107000,
              sex: "female",
            },
            {
              district: "Luwero",
              value: 231500,
              sex: "male",
            },
            {
              district: "Luwero",
              value: 234000,
              sex: "female",
            },
            {
              district: "Lwengo",
              value: 134600,
              sex: "male",
            },
            {
              district: "Lwengo",
              value: 142300,
              sex: "female",
            },
            {
              district: "Lyantonde",
              value: 47900,
              sex: "male",
            },
            {
              district: "Lyantonde",
              value: 48000,
              sex: "female",
            },
            {
              district: "MasakaCity",
              value: 97200,
              sex: "male",
            },
            {
              district: "MasakaCity",
              value: 105200,
              sex: "female",
            },
            {
              district: "Masaka",
              value: 55400,
              sex: "male",
            },
            {
              district: "Masaka",
              value: 53000,
              sex: "female",
            },
            {
              district: "Mpigi",
              value: 127900,
              sex: "male",
            },
            {
              district: "Mpigi",
              value: 127300,
              sex: "female",
            },
            {
              district: "Mukono",
              value: 296200,
              sex: "male",
            },
            {
              district: "Mukono",
              value: 314000,
              sex: "female",
            },
            {
              district: "Nakaseke",
              value: 107900,
              sex: "male",
            },
            {
              district: "Nakaseke",
              value: 94300,
              sex: "female",
            },
            {
              district: "Nakasongola",
              value: 95800,
              sex: "male",
            },
            {
              district: "Nakasongola",
              district: "",
              value: 90300,
              sex: "female",
            },
            {
              district: "Rakai",
              value: 138900,
              sex: "male",
            },
            {
              district: "Rakai",
              value: 143100,
              sex: "female",
            },
            {
              district: "Kyotera",
              value: 119900,
              sex: "male",
            },
            {
              district: "Kyotera",
              value: 122400,
              sex: "female",
            },
            {
              district: "Ssembabule",
              value: 129100,
              sex: "male",
            },
            {
              district: "Ssembabule",
              value: 129100,
              sex: "female",
            },
            {
              district: "KampalaCityAuthority",
              value: 723700,
              sex: "male",
            },
            {
              district: "KampalaCityAuthority",
              value: 805700,
              sex: "female",
            },
            {
              district: "Mubende",
              value: 216800,
              sex: "male",
            },
            {
              district: "Mubende",
              value: 213400,
              sex: "female",
            },
            {
              district: "Kassanda",
              value: 142100,
              sex: "male",
            },
            {
              district: "Kassanda",
              value: 134700,
              sex: "female",
            },
            {
              district: "Wakiso",
              value: 1001400,
              sex: "male",
            },
            {
              district: "Wakiso",
              district: "",
              value: 1106100,
              sex: "female",
            },

            {
              district: "Mityana",
              value: 168200,
              sex: "male",
            },
            {
              district: "Mityana",
              value: 165100,
              sex: "female",
            },
            {
              district: "Buikwe",
              value: 210700,
              sex: "male",
            },
            {
              district: "Buikwe",
              value: 218600,
              sex: "female",
            },
          ],
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
