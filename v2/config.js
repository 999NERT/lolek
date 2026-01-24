// CONFIG.JS - Konfiguracja strony i dane współprac

const SITE_CONFIG = {
    siteName: "ANGELKACS",
    siteUrl: "https://angelkacs.pl",
    apiKeys: {
        youtube: "AIzaSyCbVpM4gFJJt3vZvLl6Dv1SYScUK-WT4QY",
        youtubeChannelId: "UCb4KZzyxv9-PL_BcKOrpFyQ"
    },
    refreshIntervals: {
        video: 300000, // 5 minut
        streams: 60000 // 1 minuta
    }
};

// Dane współprac - można ładować z zewnętrznego JSON
const PARTNERS_DATA = [
    {
        id: "logitech",
        name: "Logitech",
        logo: "https://logitechg-emea.sjv.io/vPmBE3", // To będzie obsługiwane przez favicon
        description: "Najlepsze peryferia gamingowe - myszki, klawiatury, słuchawki i nie tylko.",
        code: "ANGELKACS",
        discount: "-5% na cały asortyment",
        link: "https://logitechg-emea.sjv.io/vPmBE3",
        contests: [
            "Regularne konkursy na Discordzie",
            "Nagrody: myszki, klawiatury, słuchawki"
        ],
        color: "#00FFFF",
        category: "gaming"
    },
    {
        id: "pirateswap",
        name: "PirateSwap",
        logo: "",
        description: "Platforma do doładowań gamingowych i nie tylko z najlepszymi bonusami.",
        code: "ANGELKACS",
        discount: "+35% więcej do doładowania",
        link: "https://pirateswap.com/?ref=angelkacs",
        contests: [],
        color: "#ff4300",
        category: "finance"
    },
    {
        id: "csgoskins",
        name: "CSGOSKINS",
        logo: "",
        description: "Platforma do zakupu i sprzedaży skinów CS:GO/CS2. Bezpieczne transakcje.",
        code: "ANGELKACS",
        discount: "Konkurs z nagrodami 3x $50",
        link: "https://csgo-skins.com/?ref=ANGELKACS",
        contests: [
            "Wpłać 10 PLN z kodem ANGELKACS",
            "Weź udział w konkursie discordowym",
            "Nagrody: 3x $50 dla pojedynczej osoby"
        ],
        color: "#14A3C7",
        category: "gaming",
        ageRestricted: true
    },
    {
        id: "skinplace",
        name: "SKIN.PLACE",
        logo: "",
        description: "Kupuj i sprzedawaj skiny wygodnie z dodatkowym bonusem.",
        code: "ANGELKACS",
        discount: "+2% do ceny przy sprzedaży",
        link: "https://skin.place/?ref=ANGELKACS",
        contests: [],
        color: "#FF6B00",
        category: "gaming",
        isNew: true
    },
    {
        id: "wkdzik",
        name: "WKDZIK",
        logo: "",
        description: "Sklep z akcesoriami gamingowymi i elektroniką.",
        code: "ANGELKA",
        discount: "-5% na cały asortyment",
        link: "https://wkdzik.pl",
        contests: [],
        color: "#de74ff",
        category: "gaming"
    },
    {
        id: "fcoins",
        name: "FCOINS",
        logo: "",
        description: "Kupuj taniej coinsy do gier lub sprzedawaj z zyskiem.",
        code: "ANGELKACS",
        discount: "+5% więcej monet",
        link: "http://fcoins.gg/?code=ANGELKACS",
        contests: [],
        color: "#07E864",
        category: "finance"
    }
];

// Ustawienia streamów
const STREAM_CONFIG = {
    twitch: {
        username: "angelkacs",
        apiUrl: "https://decapi.me/twitch/uptime/angelkacs"
    },
    kick: {
        username: "angelkacs",
        apiUrl: "https://kick.com/api/v2/channels/angelkacs"
    },
    discord: {
        inviteUrl: "https://discord.gg/rKGKQbuBxm"
    }
};

// Eksport dla modułów (jeśli używamy ES6 modules)
// window.SITE_CONFIG = SITE_CONFIG;
// window.PARTNERS_DATA = PARTNERS_DATA;
// window.STREAM_CONFIG = STREAM_CONFIG;
