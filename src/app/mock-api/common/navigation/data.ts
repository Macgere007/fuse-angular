/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';


export const defaultNavigation: FuseNavigationItem[] = [
    {
        id      : 'main',
        title   : 'Main',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id   : 'dashboard',
                title: 'Dashboard',
                type : 'basic',
                icon : 'heroicons_outline:home',
                link : 'dashboard',
            },
            {
                id   : 'settings',
                title: 'Settings',
                type : 'basic',
                icon : 'heroicons_outline:cog',
                link : 'settings',
            },

        ]
    },

];
export const adminNavigation: FuseNavigationItem[] = [
    {
        id      : 'main',
        title   : 'Main',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id   : 'dashboard',
                title: 'Dashboard',
                type : 'basic',
                icon : 'heroicons_outline:home',
                link : 'dashboard',
            },
            {
                id   : 'solarmanagement',
                title: 'Solar Management',
                type : 'basic',
                icon : 'heroicons_outline:adjustments',
                link : 'solarmanagement'
            },
            {
                id   : 'settings',
                title: 'Settings',
                type : 'basic',
                icon : 'heroicons_outline:cog',
                link : 'settings',
            },

        ]
    },

];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id   : 'dashboard',
        title: 'Dashboard',
        type : 'basic',
        icon : 'heroicons_outline:home',
        link : 'dashboard',
    },
    {
        id   : 'settings',
        title: 'Settings',
        type : 'basic',
        icon : 'heroicons_outline:cog',
        link : 'settings',
    },
    {
        id      : 'main',
        title   : 'Main',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [ ]
    },
];
export const futuristicNavigation: FuseNavigationItem[] = [

    {
        id      : 'main',
        title   : 'Main',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: []
    },
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id   : 'dashboard',
        title: 'Dashboard',
        type : 'basic',
        icon : 'heroicons_outline:home',
        link : 'dashboard',
    },
    {
        id   : 'settings',
        title: 'Settings',
        type : 'basic',
        icon : 'heroicons_outline:cog',
        link : 'settings',
    },
];

