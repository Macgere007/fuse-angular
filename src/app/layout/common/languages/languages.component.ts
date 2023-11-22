import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject, take, takeUntil } from 'rxjs';
import { AvailableLangs, LangDefinition, TranslocoService } from '@ngneat/transloco';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/models/user.type';

@Component({
    selector       : 'languages',
    templateUrl    : './languages.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'languages'
})
export class LanguagesComponent implements OnInit, OnDestroy
{
    @Input() showTitle: boolean = false;
    availableLangs: AvailableLangs;
    activeLang: string;
    activeLangTitle: string;
    flagCodes: any;
    currentUser: User;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseNavigationService: FuseNavigationService,
        private _translocoService: TranslocoService,
        private _userService: UserService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Get the available languages from transloco
        this.availableLangs = this._translocoService.getAvailableLangs();

        // Subscribe to language changes
        this._translocoService.langChanges$.subscribe((activeLang) => {

            // Get the active lang
            this.activeLang = activeLang;
            this.activeLangTitle = this._getLangLabel(activeLang);

            // Update the navigation
            this._updateNavigation(activeLang);
            this._changeDetectorRef.markForCheck();
        });

        // Set the country iso codes for languages for flags
        this.flagCodes = {
            'en': 'us',
            'id': 'id'
        };

        this._userService.user$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((user: User) => {
                this.currentUser = user;
                if (user.language) {
                    this.setActiveLang(user.language);
                }
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Set the active lang
     *
     * @param lang
     */
    setActiveLang(lang: string): void
    {
        // Set the active lang
        this._translocoService.setActiveLang(lang);
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Update the navigation
     *
     * @param lang
     * @private
     */
    private _updateNavigation(lang: string): void
    {
        // For the demonstration purposes, we will only update the Dashboard names
        // from the navigation but you can do a full swap and change the entire
        // navigation data.
        //
        // You can import the data from a file or request it from your backend,
        // it's up to you.

        // Get the component -> navigation data -> item
        const navComponent = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>('mainNavigation');

        // Return if the navigation component does not exist
        if ( !navComponent )
        {
            return null;
        }

        // Get the flat navigation data
        const navigation = navComponent.navigation;

        const navItems: {[index: string]: string} = {
            'dashboards.project': 'Project',
            'dashboard.user-analytics': 'Analytics',
            'dashboard': 'Dashboard',
            'report': 'Reports',
            'pages.contracts': 'Contracts',
            'settings': 'Settings',
            'pages.client': 'Clients',
            'pages.vendor': 'Vendors',
            'tkdn.services': 'Domestic Content',
            'pages.others': 'Other List',
            'addons': 'Add-Ons',
            'main': 'Main',
            'clientgroup': 'Clients',
            'vendorgroup': 'Vendors',
            'lookupgroup': 'Lookup & System',
            'mastergroup': 'Master Data',
            'systemgroup': 'System Configuration',
            'pages.masters.client': 'Clients',
            'pages.masters.bank': 'Banks',
            'pages.masters.currency': 'Currencies',
            'pages.masters.risk.category': 'Risk Categories'
        };

        const subtitleItems: {[index: string]: string} = {
            'clientgroup': 'Client Information',
            'vendorgroup': 'Vendor Information',
            'lookupgroup': 'Lookup and system configuration',
            'systemgroup': 'System Configuration',
            'mastergroup': 'Master Data'
        };

        // translate all navigation items
        Object.keys(navItems).forEach((key) => {
            const value = navItems[key];
            const item = this._fuseNavigationService.getItem(key, navigation);

            if ( item ) {
                this._translocoService.selectTranslate(value).pipe(take(1))
                    .subscribe((translation) => {
                        item.title = translation;
                        navComponent.refresh();
                    });
                const sub = subtitleItems[key];
                if (sub) {
                    this._translocoService.selectTranslate(sub).pipe(take(1))
                        .subscribe((translation) => {
                            item.subtitle = translation;
                            navComponent.refresh();
                        });
                }
            }
        });
    }

    private _getLangLabel(languageId): string
    {
        for (const lang of this.availableLangs) {
            const langDef = lang;
            if (langDef['id'] === languageId) {
                return langDef['label'];
            }
        }

        return 'Unknown';
    }
}
