import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject, takeUntil, take, Observable } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { User } from 'app/models/user.type';
import { Role } from 'app/models/role.type';
import { TeamService } from './team/team.service';
import { UserService } from 'app/core/user/user.service';
import { GlobalStateService } from 'app/core/solar/global-state.service';

@Component({
    selector       : 'settings',
    templateUrl    : './settings.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements OnInit, OnDestroy
{
    @ViewChild('drawer') drawer: MatDrawer;

    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    panels: any[] = [];
    selectedPanel: string = 'account';

    teamLookup$: Observable<User[]>;
    roleLookup$: Observable<Role[]>;

    private _unsubscribeAll: Subject<any> = new Subject<any>();


    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _teamService: TeamService,
        private _userService: UserService,
        private _globalState: GlobalStateService
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
        this.teamLookup$ = this._teamService.teamLookup$;
        this.roleLookup$ = this._teamService.roleLookup$;

        // Setup available panels
        // set the title and description in assets/i18n/en.json & id.json
        const defaultPanels = [
            {
                id         : 'account',
                icon       : 'heroicons_outline:user-circle',
                title      : 'Account',
                //description: 'Manage your public profile and private information'
            },
            {
                id         : 'security',
                icon       : 'heroicons_outline:lock-closed',
                title      : 'Security',
                description: 'Manage your password and 2-step verification preferences'
            },
            // {
            //     id         : 'company',
            //     icon       : 'heroicons_outline:office-building',
            //     title      : 'Company',
            //     //description: 'Manage your company information'
            // },
            {
                id         : 'team',
                icon       : 'heroicons_outline:user-group',
                title      : 'User',
                //description: 'Manage your existing users and change roles/permissions'
            },
            // {
            //     id         : 'plan-billing',
            //     icon       : 'heroicons_outline:credit-card',
            //     title      : 'Plan & Billing',
            //     //description: 'Manage your subscription plan, payment method and billing information'
            // },
        ];

        const userPanels = [
            {
                id         : 'account',
                icon       : 'heroicons_outline:user-circle',
                title      : 'Account',
                //description: 'Manage your public profile and private information'
            },
            {
                id         : 'security',
                icon       : 'heroicons_outline:lock-closed',
                title      : 'Security',
                description: 'Manage your password and 2-step verification preferences'
            },
        ];


        // Subscribe to user changes
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                // if (this._userService.isServerAdmin(user)) {
                //     this.panels = adminPanels;
                // }
                // else if (this._userService.isSKK(user)) {
                //     this.panels = skkPanels;
                // }
                // else {
                    this.panels = defaultPanels;
                // }
            }
        );

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                // Set the drawerMode and drawerOpened
                if ( matchingAliases.includes('lg') )
                {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                }
                else
                {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngAfterViewInit() {
        console.log('user setting ngAfterViewInit');
        this._globalState.isStopLongRunningProcess = true;
      }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Navigate to the panel
     *
     * @param panel
     */
    goToPanel(panel: string): void
    {
        this.selectedPanel = panel;

        // Close the drawer on 'over' mode
        if ( this.drawerMode === 'over' )
        {
            this.drawer.close();
        }
    }

    /**
     * Get the details of the panel
     *
     * @param id
     */
    getPanelInfo(id: string): any
    {
        return this.panels.find(panel => panel.id === id);
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
}
