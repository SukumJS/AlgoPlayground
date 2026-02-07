export type Tutorial = {
    title: string,
    description: string,
}

export type TutorialStep = {
    id: number;
    instruction: string;
    action: 'drag' | 'tap' | 'connect' | 'delete' | 'click';
    targetSelector?: string;
    completed: boolean;
}

export type TutorialType = 'tree' | 'sort' | 'graph' | 'linear';