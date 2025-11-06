export type Screen = 'home' | 'namePrompt' | 'postcardView' | 'postcardChoice' | 'writeBack' | 'end';

export interface Postcard {
    id: string;
    to: string;
    message: string;
    postmarked: string;
    isRead: boolean;
    illustration: string;
    transitionLabel?: string;
    choiceLabel?: string;
    image?: string;
    date?: string;
}

export interface AppState {
    screen: Screen;
    userName: string;
    postcards: Postcard[];
    currentPostcardId: string | null;
}