import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, Subject, takeUntil, takeWhile, tap, timer } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { TranslocoService } from '@ngneat/transloco';

@Component({
    selector     : 'auth-sign-out',
    templateUrl  : './sign-in-transition.component.html',
    encapsulation: ViewEncapsulation.None
})
export class AuthSignInTransitionComponent implements OnInit, OnDestroy
{
    message: string = '';
    countdown: number = 5;
    countdownMapping: any = {
        '=1'   : this._translocoService.translate('# second'),
        'other': this._translocoService.translate('# seconds')
    };
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _router: Router,
        private _translocoService: TranslocoService
    )
    {
        this._loadDataFromCaller();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // // Sign out
        // this._authService.signOut();

        // Redirect after the countdown
        timer(1000, 1000)
            .pipe(
                finalize(() => {
                    this._router.navigate(['sign-in']);
                }),
                takeWhile(() => this.countdown > 0),
                takeUntil(this._unsubscribeAll),
                tap(() => this.countdown--)
            )
            .subscribe();
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

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    _loadDataFromCaller(): void
    {
        const nav = this._router.getCurrentNavigation();
        if (nav) {
          const state = nav.extras.state as {
            message: string;
          };

          if (state) {
            this.message = this._translocoService.translate(state.message);
          }
        }
      }
}
