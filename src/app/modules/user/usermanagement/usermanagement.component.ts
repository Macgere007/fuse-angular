import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FuseLoadingService } from '@fuse/services/loading';
import { IStation } from 'app/core/solar/stations.types';
import { LookupService } from 'app/core/solar/lookup.service';
import { debounceTime, map, Subject, switchMap, takeUntil } from 'rxjs';
import { UserService } from 'app/core/user/user.service';
import { Assign } from 'app/core/solar/assign.types';
import { User } from 'app/models/user.type';
import { AssignService } from 'app/core/solar/assign.service';
import { UnAssign } from 'app/core/solar/UnAssign.types';
import { CloudUserService } from 'app/core/user/cloud.user.service';
import { user } from 'app/mock-api/common/user/data';
import { UntypedFormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'usermanagement',
    templateUrl: './usermanagement.component.html',
    styles: [
        `
            usermanagement fuse-card {
                margin: 16px;
            }
        `,
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsermanagementComponent implements OnInit {
    public stations: IStation[] = [];
    isValid: boolean = true;
    searchNotifier = new Subject();
    public inputSearch = ''
    public searchUserAssign = [];
    userStations = [""];
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    currentuser: User;
    public stationMe: string = ''
    public stationname: string = ''
    public stationMe0: boolean = false

    // filters: string[] = ['all', 'article', 'listing', 'list', 'info', 'shopping', 'pricing', 'testimonial', 'post', 'interactive'];
    // numberOfCards: any = {};
    // selectedFilter: string = 'all';

    /**
     * Constructor
     */
    constructor(
        private _fuseConfirmationService: FuseConfirmationService,
        private _fuseLoading: FuseLoadingService,
        private _lookupService: LookupService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _userService: UserService,
        private _assignUserService: AssignService,
        private _unAssignService: AssignService,
        private _CloudUserService: CloudUserService,
        private _activeRouter: ActivatedRoute,
    ) {}
    async ngOnInit(): Promise<void> {

        this.searchNotifier.pipe().subscribe((data) => this.changeSearch(data))
        await this.searchNotifier
            .pipe(debounceTime(300))
            .subscribe(async (data: string) => {
                if (data.length > 1) {
                    let search = await this._CloudUserService.getUsers(11, data);
                    this.searchUserAssign = search.items;
                } else {
                    this.searchUserAssign = [];
                }
            });



        //Stations
        this._lookupService.getAllStation().then(
            (result) => {
                this.stations = result;
                this._changeDetectorRef.markForCheck();
            },
            (err) => {
                console.log(err);
            }
        );

        this._CloudUserService.getCurrentUser().then(
            (result) => {
                this.currentuser = result.item;
                this.userStations = this.currentuser.station;


                this._changeDetectorRef.detectChanges();
            },
            (err) => {
            }


        )

        this.searchInputControl.valueChanges
        .pipe(
            takeUntil(this._unsubscribeAll),
            debounceTime(100),
            switchMap(async (query) => {
                const result = await this._lookupService.getAllStation(query);
                this.stations = result
                this._changeDetectorRef.markForCheck();
            }),
            map(() => {

            })
        )
        .subscribe()

        };



    public changeSearch(item) {
        this.inputSearch = item
    }




    /**
     * Filter the solarmanagement based on the selected filter
     *
     * @private
     */

    // private _filterCards(): void
    // {
    //     // Go through all fuse-cards
    //     this._fuseCards.forEach((fuseCard) => {

    //         // If the 'all' filter is selected...
    //         if ( this.selectedFilter === 'all' )
    //         {
    //             // Remove hidden class from all solarmanagement
    //             fuseCard.nativeElement.classList.remove('hidden');
    //         }
    //         // Otherwise...
    //         else
    //         {
    //             // If the card has the class name that matches the selected filter...
    //             if ( fuseCard.nativeElement.classList.contains('filter-' + this.selectedFilter) )
    //             {
    //                 // Remove the hidden class
    //                 fuseCard.nativeElement.classList.remove('hidden');
    //             }
    //             // Otherwise
    //             else
    //             {
    //                 // Add the hidden class
    //                 fuseCard.nativeElement.classList.add('hidden');
    //             }
    //         }
    //     });
    // }
    // openConfirmationDialog(): void
    // {
    //     // Open the dialog and save the reference of it
    //     const dialogRef = this._fuseConfirmationService.open({"title": " Success ",
    //     "message": "This user is assigned to this station.",
    //     "icon": {
    //       "show": true,
    //       "name": "heroicons_outline:check",
    //       "color": "success"
    //     },
    //     "actions": {
    //       "confirm": {
    //         "show": false,
    //         "label": "Remove",
    //         "color": "warn"
    //       },
    //       "cancel": {
    //         "show": false,
    //         "label": "Cancel"
    //       }
    //     },
    //     "dismissible": true});

    //     // Subscribe to afterClosed from the dialog reference
    //     dialogRef.afterClosed().subscribe((result) => {
    //         console.log(result);
    //     });
    // }
    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
