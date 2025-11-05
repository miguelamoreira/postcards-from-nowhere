import type { Postcard } from "../types";

export const postcards: Postcard[] = [
    {
        id: 'first',
        to: '',
        message: `I bought some postcards I thought were beautiful. I think it's a good way to record my life. I hope that in the future I'll read them and savor the experience somehow. Maybe I'll write something enigmatic, But for that to work, I'll need time to forget.`,
        from: "-",
        postmarked: "-",
        isRead: false,
        illustration: ""
    },
    {
        id: 'house-main',
        to: "",
        message: `I have to be careful. Reliving things feels good, but getting stuck in them is dangerous. It's like remembering how happy I was playing my xylophone in the past without feeling like playing anything in the present.`,
        from: "-",
        postmarked: "The House of Forgotten Sounds",
        isRead: false,
        illustration: "",
        transitionLabel: "Where echoes remember what we’ve forgotten",
        choiceLabel: "Choose the echo you want to follow",
        image: "/assets/postcards/house.jpg"
    },
    {
        id: 'house-choice-1',
        to: "",
        message: `But sometimes reliving can also bring new desires, like wishing for a sequel to that game. But is wishing for a sequel really wishing for something new?`,
        from: "-",
        postmarked: "The House of Forgotten Sounds",
        isRead: false,
        illustration: "",
    },
    {
        id: 'house-choice-2',
        to: "",
        message: `It's funny how I forget voices, but they're still here somewhere. I miss some people.`,
        from: "-",
        postmarked: "The House of Forgotten Sounds",
        isRead: false,
        illustration: "",
    },
    {
        id: 'city-main',
        to: "",
        message: `I think I understand now why I started writing these postcards. It's easier to talk to paper than to those who once knew me. The city changed again. The café closed, the bookstore became a clinic. Still, I walk the same streets, as if my feet remember what I wanted to forget.`,
        from: "-",
        postmarked: "The City Between Seasons",
        isRead: false,
        illustration: "",
        transitionLabel: "Between the warmth that leaves and the cold that stays",
        choiceLabel: "Which season would you walk through again?"
    },
    {
        id: 'city-choice-1',
        to: "",
        message: `It was still cold when the light changed. The first day without a coat, the first window left open. I thought it meant something, but maybe I just missed the smell of sunlight.`,
        from: "-",
        postmarked: "The City Between Seasons",
        isRead: false,
        illustration: "",
    },
    {
        id: 'city-choice-2',
        to: "",
        message: `The city feels heavy at summer's end. The heat lingers, and the air tastes like goodbye. The leaves hesitate before falling as if they too don't want to leave.`,
        from: "-",
        postmarked: "The City Between Seasons",
        isRead: false,
        illustration: "",
    },
    {
        id: 'shore-main',
        to: "",
        message: `I came back to the shore. Nothing has change, or maybe I have. The sea never rushes anything. Waves arrive, leave, and always return, as if time breathes here, unhurried, unafraid to repeat itself. Sometimes staying is all you can do. And maybe that's enough.`,
        from: "-",
        postmarked: "The Shore Where Time Pauses",
        isRead: false,
        illustration: "",
        transitionLabel: "Where endings drift and beginnings wait",
        choiceLabel: "Listen to the waves and pick the one that calls back",
        image: "/assets/postcards/shore.jpg"
    },
    {
        id: 'shore-choice-1',
        to: "",
        message: `A bird fought the wind. It didn't fall, but it didn't move forward either. It hovered there, caught between going and staying. I thought about the quiet strength it takes just to keep going, even when nothing moves.`,
        from: "-",
        postmarked: "The Shore Where Time Pauses",
        isRead: false,
        illustration: "",
    },
    {
        id: 'shore-choice-2',
        to: "",
        message: `I sat on the sand and ate slowly. Bread, fruit, salty wind. Nothing special, just calm. The waves came and went as if carrying old secrets. Sometimes, peace arrives without asking.`,
        from: "-",
        postmarked: "",
        isRead: false,
        illustration: "The Shore Where Time Pauses",
    }
]

export const getPostcardById = (id:string): Postcard | undefined => {
    return postcards.find(p => p.id === id)
}

export const postcardFlow: { [key: string]: string } = {
    first: 'house-main',
    'house-main': 'house-choices',
    'house-choice-1': 'city-main',
    'house-choice-2': 'city-main',
    'city-main': 'city-choices',
    'city-choice-1': 'shore-main',
    'city-choice-2': 'shore-main',
    'shore-main': 'shore-choices',
    'shore-choice-1': 'writeBack',
    'shore-choice-2': 'writeBack'
}

export interface Choice {
    id: string;
    postcardId: string;
    title: string;
    subtitle: string;
}

export const houseChoices: Choice[] = [
    {
        id: 'house-choice-1',
        postcardId: "house-choice-1",
        title: "Old Videogame",
        subtitle: "An old game hums softly"
    },
    {
        id: 'house-choice-2',
        postcardId: "house-choice-2",
        title: "Familiar Face",
        subtitle: "Someone's voice lingers here"
    }
]

export const cityChoices: Choice[] = [
    {
        id: 'city-choice-1',
        postcardId: "city-choice-1",
        title: "Winter to Spring",
        subtitle: "The first light after a long cold"
    },
    {
        id: 'city-choice-2',
        postcardId: "city-choice-2",
        title: "Summer to Autumn",
        subtitle: "The last warmth before goodbye"
    }
]

export const shoreChoices: Choice[] = [
    {
        id: 'shore-choice-1',
        postcardId: "shore-choice-1",
        title: "Gray Day (Bird)",
        subtitle: "The wind holds its breath"
    },
    {
        id: 'shore-choice-2',
        postcardId: "shore-choice-2",
        title: "Meal by the Sea",
        subtitle: "The taste of calm"
    }
]