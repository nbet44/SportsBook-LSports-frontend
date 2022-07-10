export const mainConfig = {
    server: {
        url: process.env.NODE_ENV === "development" ? "http://127.0.0.1:8000/" : "http://164.92.155.203:8000/",
        request_url: process.env.NODE_ENV === "development" ? "http://127.0.0.1:8000/admin" : "http://164.92.155.203:8000/admin",
        image_url: process.env.NODE_ENV === "development" ? "http://127.0.0.1:8000/images" : "http://164.92.155.203:8000/images",
        upload_url: process.env.NODE_ENV === "development" ? "http://127.0.0.1:8000/uploads" : "http://164.92.155.203:8000/uploads",
        socket_url: process.env.NODE_ENV === "development" ? "http://127.0.0.1:8000" : "https://app.gambabet.com"
    },
    siteId: "2002",
    socket: null
}

export const topFootballLeagues = [
    // { RegionId: 14, RegionName: "England", LeagueName: "Premier League" },
    // { RegionId: 17, RegionName: "Germany", LeagueName: "Bundesliga" },
    // { RegionId: 16, RegionName: "France", LeagueName: "Ligue 1" },

    // { RegionId: 28, RegionName: "Spain", LeagueName: "La Liga" },
    // { RegionId: 20, RegionName: "Italy ", LeagueName: "Serie A" },
    // { RegionId: 6, RegionName: "World", LeagueName: "FIFA World Cup" },
    // { RegionId: 7, RegionName: "Europe", LeagueName: "UEFA Champions League" },
    // { RegionId: 7, RegionName: "Europe", LeagueName: "UEFA European Championship" },
    // { RegionId: 233, RegionName: "America", LeagueName: "Copa America" },
    // { RegionId: 233, RegionName: "America", LeagueName: "Copa Libertadores" },
    // { RegionId: 7, RegionName: "Europe", LeagueName: "UEFA Europa League" },
    // { RegionId: 11, RegionName: "Africa", LeagueName: "Africa Cup of Nations" },
    // { RegionId: 6, RegionName: "World", LeagueName: "FA Cup" },
    // { RegionId: 6, RegionName: "World", LeagueName: "Confederations Cup" },
    // { RegionId: 28, RegionName: "Spain", LeagueName: "Copa del Rey" }


    { RegionId: 67, RegionName: "England", LeagueName: "Premier League" },
    { RegionId: 65, RegionName: "Germany", LeagueName: "Bundesliga" },
    { RegionId: 61, RegionName: "France", LeagueName: "Ligue 1" }
]

export const mainMarketResultBySportId = {
    4: [[["MarketType", "3way"], ["MarketType", "Handicap"], ["MarketType", "Over/Under"]], [["MarketType", "3way"], ["MarketType", "Handicap"], ["MarketType", "Over/Under"]]],
    5: [[["categoryId", 33], ["categoryId", 35], ["categoryId", 36]], [["categoryId", 333], ["categoryId", 335], ["categoryId", 336]]],
    16: [[["categoryId", 85], ["categoryId", 87], ["categoryId", 89]], [["categoryId", 885], ["categoryId", 887], ["categoryId", 889]]],
    12: [[["categoryId", 64], ["categoryId", 65], ["categoryId", 67]], [["categoryId", 731], ["categoryId", 732], ["categoryId", 733]]],
    11: [[["categoryId", 58], ["categoryId", 57], ["categoryId", 63]], [["categoryId", 1338], ["categoryId", 738], ["categoryId", 736]]],
    56: [[["categoryId", 341], ["categoryId", 1218]], [["categoryId", 3341], ["categoryId", 12218]]],
    24: [[["categoryId", 115]], [["categoryId", 1115]]],
    18: [[["categoryId", 93], ["categoryId", 95], ["categoryId", 96]], [["categoryId", 993], ["categoryId", 995], ["categoryId", 996]]],
    7: [[["categoryId", 43], ["categoryId", 44], ["categoryId", 48]], [["categoryId", 623], ["categoryId", 728], ["categoryId", 730]]],
    23: [[["categoryId", 110], ["categoryId", 243], ["categoryId", 112]], [["categoryId", 1110], ["categoryId", 2243], ["categoryId", 1112]]]
}

export const baseMarketsBySportId = {
    6046: [
        {
            Id: 1,
            Name: "1X2",
            Mark: "1X2",
            length: 3
        },
        {
            Id: 2,
            Name: "Under/Over",
            Mark: "OU",
            length: 2
        },
        {
            Id: 3,
            Mark: "HDP",
            Name: "Asian Handicap",
            length: 2
        }
        // {
        //     Id: 7,
        //     Mark: "DC",
        //     Name: "Double Chance",
        //     length: 3
        // }
    ]
}

export const sportsNameById = {
    4: "Football",
    6046: "Football",

    56: "Table Tennis",
    265917: "Table Tennis",

    7: "Baketball",
    48242: "Baketball",

    5: "Tennis",
    54094: "Tennis",

    12: "Ice Hockey",
    35232: "Ice Hockey",

    18: "Volleyball",
    154830: "Volleyball",

    16: "Handball",
    11: "American Football",
    24: "Boxing"
    // 70: "Futsal",
    // 32: "Rugby Union",
    // 6: "Formula 1",
    // 40: "Motorbikes",
    // 9: "Alpine Skiing",
    // 100: "E-sports",
    // 23: "Baseball"
    // 33: "Snooker",
    // 22: "Cricket",
    // 34: "Darts",
    // 44: "Badminton",
    // 31: "Rugby League",
    // 36: "Aussie Rules",
    // 13: "Golf",
    // 10: "Cycling",
    // 64: "Biathon",
    // 63: "Beach Volleyball"
}

export const flagsByRegionName = {
    Ecuador2: "Ecuador",
    NorthMacedonia: "",
    HongKong: "Hongkong",
    NorthernIreland: "north_ireland",
    SaudiArabia: "Saudiarabia",
    UnitedKingdom: "United-Kingdom",
    Africa: "all_leagues",
    Asia: "all_leagues",
    SouthAfrica: "all_leagues",
    NewZealand: "New_Zealand",
    America: "United-States",
    SouthAmerica: "all_leagues",
    KoreaSouth: "South-Korea",
    SouthKorea: "South-Korea",
    "South Korea": "South-Korea",
    USA: "United-States",
    UnitedStates: "United-States",
    Europe: "all_leagues",
    World: "all_leagues",
    NorthAmerica: "all_leagues",
    BosniaandHerzegovina: "Bosnia-and-Herzegovina",
    CzechRepublic: "Czech",
    FaroeIslands: "Faroes",
    CostaRica: "Costa_Rica",
    DominicanRepublic: "Dominican-Republic",
    ElSalvador: "El-Salvador",
    PuertoRico: "Puerto-Rico",
    UnitedArabEmirates: "United-Arab-Emirates"
}

export const IconsBySportType = {
    4: "title-soccer.png",
    6046: "title-soccer.png",
    7: "title-basketball.png",
    5: "title-tennis.png",
    23: "title-baseball.png",
    11: "title-football.png",
    12: "title-icehockey.png",
    24: "title-boxing3.png",
    16: "title-soccer.png",
    18: "title-basketball.png",
    56: "title-tennis.png"
}

export default mainConfig