import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { IStation } from 'app/core/solar/stations.types';
import { LookupService } from 'app/core/solar/lookup.service';
import { concatMap, debounceTime, delay, from, map, of, queueScheduler, Subject, switchMap, takeUntil, throwError } from 'rxjs';
import { Assign } from 'app/core/solar/assign.types';
import { AssignService } from 'app/core/solar/assign.service';
import { UnAssign } from 'app/core/solar/UnAssign.types';
import { CloudUserService } from 'app/core/user/cloud.user.service';
import { UntypedFormControl } from '@angular/forms';
import { AvailableLangs, TranslocoService } from '@ngneat/transloco';
import { Router } from '@angular/router';
import { GlobalStateService } from 'app/core/solar/global-state.service';
import { FuseLoadingService } from '@fuse/services/loading';

@Component({
    selector: 'solarmanagement',
    templateUrl: './solarmanagement.component.html',
    styles: [
        `
            solarmanagement fuse-card {
                margin: 16px;
            }
        `,
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolarmanagementComponent implements OnInit {
    isValid: boolean = true;
    isShowAlert: boolean = false;
    alertType: string = 'info';
    alertMessage: string = '';
    alertIcon: string = 'heroicons_solid:exclamation';
    searchAssignUserCard = new Subject();
    searchStation: UntypedFormControl = new UntypedFormControl();

    public availableLangs: AvailableLangs;
    public activeLang: string;
    public activeLangTitle: string;
    public stations: IStation[] = [];
    public assignUserUpdateChanges: Subject<any> = new Subject();

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _fuseConfirmationService: FuseConfirmationService,
        private _lookupService: LookupService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _assignUserService: AssignService,
        private _globalState: GlobalStateService,
        private _unAssignService: AssignService,
        private _translateService: TranslocoService,
        private _CloudUserService: CloudUserService,
        private _fuseLoadingService: FuseLoadingService,
        private _router: Router
    ) {}

    async ngOnInit(): Promise<void> {
        setTimeout(() => {
            this._fuseLoadingService.show();
        }, 500);

        //Stations
        this._lookupService.getAllStation().then(
            (stations) => {
                queueScheduler.schedule(() => this.fetchStations(stations));
                this.stations = stations;
                this._fuseLoadingService.hide();
                this._changeDetectorRef.markForCheck();
                this._fuseLoadingService.hide();
            },
            (err) => {
                console.log(err);
            }
        );

        // search stations, locations, and users
        this.searchStation.valueChanges
        .pipe(
            takeUntil(this._unsubscribeAll),
            debounceTime(200),
            switchMap( async (query: string) => {
                this._fuseLoadingService.show();
                this._globalState.isStopLongRunningProcess = true;

                const stations = await this._lookupService.getAllStation(query);
                queueScheduler.schedule(() => this.fetchStations(stations));
                this.stations = stations
                this._changeDetectorRef.markForCheck();
                this._fuseLoadingService.hide();
            }),
            map(() => {

            })
        )
        .subscribe();

        this._translateService.langChanges$.subscribe((activeLang) => {

            // Get the active lang
            this.activeLang = activeLang;

            // Update the navigation
            this._changeDetectorRef.markForCheck();
        });
    };

    private async fetchStations(stations) {
        console.log('fetchStations', stations);

        // set isLoadingDataInProgress flag to true
        stations.forEach(station => {
            station.isLoadingDataInProgress = true;
        });
        this._changeDetectorRef.detectChanges();

        this._globalState.isStopLongRunningProcess = false;
        // sequentially call fetchStationInfo
        from(stations).pipe(
            // tap(station => console.log('schedule station', station)),
            concatMap(station => of(station).pipe(
                // tap(station => console.log('delay execute station', station)),
                delay(500),
                map(station => {
                    const result = this.fetchStationInfo(station);

                    if (this._globalState.isStopLongRunningProcess) {
                        const error = new Error("Expected error break because it's move to another screen");
                        throw(error);
                    }

                    return of(result);
                }),
                // retry(2),
                // catchError(err => {
                //     console.log('error fetchStationInfo', err);
                //     return of({});
                // })
                )
            )
        ).subscribe();
    }

    private async fetchStationInfo(station) {
        console.log('fetchStationInfo ' + station.stationId + ' started');

        station.isLoadingDataInProgress = true;
        this._changeDetectorRef.markForCheck();

        try {
            const entry = await this._lookupService.getSummary(station.stationId.toString());
            station.summary = entry;
            ///this.pvmaxkwh = moment(entry.pvMaxKwhUpdated).format("MMMM Do YYYY, HH:mm:ss")
            //this.pvmaxpower = moment(entry.pvMaxPowerUpdated).format("MMMM Do YYYY, HH:mm:ss")
            //this.plnTriger = entry.gridPower

            station.isLoadingDataInProgress = false;
            this._changeDetectorRef.markForCheck();

            console.log('fetchStationInfo ' + station.stationId, entry);

            return station.stationId;

        } catch (error) {
            station.isLoadingDataInProgress = false
            this._changeDetectorRef.markForCheck();
            console.log('fetchStationInfo ' + station.stationId + ' ended with error', error)

            return throwError(() => 'Error fetchStationInfo ' + station.stationId);
        }
    }

    public monitorStation(station) {
        this._globalState.isStopLongRunningProcess = true;
        const url = '/admin/dashboard/' + escape(station.stationId + '&' + station.stationName + '&' + station.latitude + '&' + station.longitude);
        console.log('url', url);

        this._router.navigateByUrl(url);
    }

    //assign
    assignUserToStation(event): void {
        const user = event.userId;
        const station = event.stationId;

        const confirmation = this._fuseConfirmationService.open({
            title: this.activeLang=='en'?`Invite User`:`Undang User`,
            message: this.activeLang=='en'?`Are you sure you want to invite user? This action cannot be undone!`:`Apakah anda yakin ingin mengudang user? Aksi tersebut tidak dapat dikembalikan`,
            icon: {
                show: true,
                name: 'heroicons_outline:user-add',
                color: 'basic',
            },
            actions: {
                confirm: {
                    show: true,
                    label: this.activeLang=='en'?'Invite':'Undang',
                    color: 'primary',
                },
            }
        });

        confirmation.afterClosed().subscribe((result) => {
            // If the confirm button pressed...
            if (result === 'confirmed') {

                this._fuseLoadingService.show();

                //declare body
                const assign: Assign = {
                    id: user.id,
                    insertList: [{ station: [station.stationId]},{ stationname: [station.stationName]}],
                };
                console.log("assign",assign);

                if (station.users.map(item => item.id).includes(user.id)) {
                    this._changeDetectorRef.markForCheck();
                    this.showErrorAlert('User already assign');
                } else {
                    this._assignUserService.assignStation(assign).then(
                        (result) => {
                            for (var s of this.stations) {
                                if (s.stationId === station.stationId) {
                                    let index = 0;
                                    s.users.push(user)
                                    index++;
                                    break;
                                }
                            }
                            this._fuseLoadingService.hide();
                            this.showSuccessAlert(`User successfully assign`);
                            this._changeDetectorRef.markForCheck();
                            this.assignUserUpdateChanges.next('success');
                        },
                        (err) => {
                            this._fuseLoadingService.hide();
                            this.showErrorAlert('User failed to update');
                            this._changeDetectorRef.markForCheck();
                            this.assignUserUpdateChanges.next('error');
                        }
                    );
                }
            }

        });
    }

    //uanssign
    UnassignUserToStation(event): void {
        const users = event.userId;
        const stationId = event.stationId;
        const stationName = event.stationName;

        const confirmation = this._fuseConfirmationService.open({
            title: this.activeLang=='en'? `Delete User`:`Hapus User`,
            message: this.activeLang=='en'?`Are you sure you want to delete user? This action cannot be undone!`:`Apakah anda yakin ingin menghapus user? Aksi tersbut tidak dapat dikembalikan`,
            icon: {
                show: true,
                name: 'heroicons_outline:exclamation',
                color: 'warn',
            },
            actions: {
                confirm: {
                    show: true,
                    label: this.activeLang=='en'?'Delete':'Hapus',
                    color: 'warn',
                },
            }
        });

        confirmation.afterClosed().subscribe((result) => {
            // If the confirm button pressed...
            if (result === 'confirmed') {
                this._fuseLoadingService.show();
                const unassign: UnAssign = {
                    id: users,
                    deleteList: [{ station: [stationId]},{stationname: [stationName] }],
                };

                this._unAssignService.unassignStation(unassign).then(
                    (result) => {
                        for (var station of this.stations) {
                            if (station.stationId === stationId) {
                                let index = 0;
                                for (var user of station.users) {
                                    if (user.id === users) {
                                        station.users.splice(index,1);
                                        break;
                                    }
                                    index++;
                                }
                                this._changeDetectorRef.markForCheck();
                                break;
                            }
                        }
                        this._fuseLoadingService.hide();
                        this.showSuccessAlert(`User successfully deleted`);
                        this.assignUserUpdateChanges.next('success');
                    },
                    (err) => {
                        this._fuseLoadingService.hide();
                        this.showErrorAlert('User failed to delete');
                        this.assignUserUpdateChanges.next('error');
                    }
                );
            }
        });
    }

    /**
     * Filter the solarmanagement based on the selected filter
     *
     * @private
     */
    private showSuccessAlert(message): void {
        this.showAlert(message, 'success', 'heroicons_solid:information-circle', 'success');
    }

    private showErrorAlert(message): void {
        this.showAlert(message, 'error', 'heroicons_solid:exclamation', 'danger');
    }

    public alertColor = 'red'

    private showAlert(message, type?: string, icon?: string, color?: string): void {
        if (type) {
            this.alertType = type;
        }
        if (icon) {
            this.alertIcon = icon;
        }
        this.alertMessage = message;
        this.isShowAlert = true;
        setTimeout(() => {
            this.isShowAlert = false;
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }, 3000);
    }

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
