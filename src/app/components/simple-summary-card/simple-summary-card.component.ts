import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { Subject } from 'rxjs';


@Component({
    selector: 'simple-summary-card',
    templateUrl: './simple-summary-card.component.html',
    styleUrls: ['./simple-summary-card.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'simple-summary-card'

})

export class SimpleSummaryCardComponent implements OnInit, OnDestroy {
    @Input() icon: string;
    @Input() title: string;
    @Input() summaryValue?: number;
    @Input() imageValue?: string;
    @Input() unit: string;
    @Input() isLoading: boolean;
    @Input() valueColor: string;
    @Input() valueUnitColor: string;
    @Input() valuePrecisionDigit: number = 2;
    @Input() summaryValueNumberFormatOptions?: Intl.NumberFormatOptions;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public activeLang: string;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _translateService: TranslocoService) {
    }

   // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Subscribe to language changes
        this._translateService.langChanges$.subscribe((activeLang) => {

            // Get the active lang
            this.activeLang = activeLang;

            // Update the UI
            this._changeDetectorRef.markForCheck();
        });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

}
