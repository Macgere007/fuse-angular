import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { FuseLoadingService } from '@fuse/services/loading';
import { TranslocoService } from '@ngneat/transloco';
import { IStation } from 'app/core/solar/stations.types';
import { CloudUserService } from 'app/core/user/cloud.user.service';
import { Subject, debounceTime, map, switchMap, takeUntil } from 'rxjs';


@Component({
    selector: 'station-card',
    templateUrl: './station-card.component.html',
    styleUrls: ['./station-card.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'station-card'

})
export class StationCardComponent implements OnInit, OnDestroy {
    @Input() isShowAlert: boolean;
    @Input() alertMessage: string;
    @Input() station: IStation;
    @Input() searchUserAssign: any[];
    @Input() generatedPower: number;
    @Input() isLoading: boolean;
    @Input() assignUserUpdateChanges: Subject<any>;

    @Output() onMonitorStationClicked: EventEmitter<any> = new EventEmitter();
    @Output() onUnAssignUserToStationClicked: EventEmitter<{userId: string, stationId: string, stationName: string}> = new EventEmitter();
    @Output() onAssignUserToStationClicked: EventEmitter<{userId: string, stationId: string}> = new EventEmitter();

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    public activeLang: string;
    public searchUser: UntypedFormControl = new UntypedFormControl();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _translateService: TranslocoService,
        private _fuseLoadingService: FuseLoadingService,
        private _CloudUserService: CloudUserService) {
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    async ngOnInit(): Promise<void> {
        // Subscribe to language changes
        this._translateService.langChanges$.subscribe((activeLang) => {

            // Get the active lang
            this.activeLang = activeLang;

            // Update the UI
            this._changeDetectorRef.markForCheck();
        });

        if (this.assignUserUpdateChanges) {
            this.assignUserUpdateChanges.subscribe((value) => {
                if (value=='success') {
                    this.searchUserAssign = [];
                    this.searchUser.setValue('');
                }
            })

        }

        this.searchUser.valueChanges
        .pipe(
            takeUntil(this._unsubscribeAll),
            debounceTime(200),
            switchMap( async (query: string) => {
                this._fuseLoadingService.show();

                if (query.length >= 1) {
                    let search = await this._CloudUserService.getUsers(11, query);
                    this.searchUserAssign = search.items;
                }
                else {
                    this.searchUserAssign = [];
                }

                this._changeDetectorRef.markForCheck();
                this._fuseLoadingService.hide();
            }),
            map(() => {

            })
        )
        .subscribe();
    }

    public monitorStation(event) {
        console.log('monitorStation clicked', event);
        this.onMonitorStationClicked.emit(event);
    }

    public assignUser(target) {
        console.log('assignUser', target);
        target.expanded = !target.expanded;
        if (!target.expanded) {
            this.searchUser.setValue('');
            this.searchUserAssign = [];
        }
    }

    public assignUserToStation(event) {
        this.onAssignUserToStationClicked.emit(event);
    }

    UnassignUserToStation(event) {
        this.onUnAssignUserToStationClicked.emit(event);
    }
}
