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
    slugId: string;
    postcardId: string;
    title: string;
    subtitle: string;
}

export const houseChoices: Choice[] = [
    {
        slugId: 'house-choice-1',
        postcardId: "house-choice-1",
        title: "Old Videogame",
        subtitle: "An old game hums softly"
    },
    {
        slugId: 'house-choice-2',
        postcardId: "house-choice-2",
        title: "Familiar Face",
        subtitle: "Someone's voice lingers here"
    }
]

export const cityChoices: Choice[] = [
    {
        slugId: 'city-choice-1',
        postcardId: "city-choice-1",
        title: "Winter to Spring",
        subtitle: "The first light after a long cold"
    },
    {
        slugId: 'city-choice-2',
        postcardId: "city-choice-2",
        title: "Summer to Autumn",
        subtitle: "The last warmth before goodbye"
    }
]

export const shoreChoices: Choice[] = [
    {
        slugId: 'shore-choice-1',
        postcardId: "shore-choice-1",
        title: "Gray Day (Bird)",
        subtitle: "The wind holds its breath"
    },
    {
        slugId: 'shore-choice-2',
        postcardId: "shore-choice-2",
        title: "Meal by the Sea",
        subtitle: "The taste of calm"
    }
]