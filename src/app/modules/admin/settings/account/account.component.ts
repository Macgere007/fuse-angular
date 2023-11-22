import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FuseLoadingService } from '@fuse/services/loading';
import { TranslocoService } from '@ngneat/transloco';
import { User } from 'app/models/user.type';
import { Observable } from 'rxjs';
import { AccountService } from './account.service';

@Component({
    selector       : 'settings-account',
    templateUrl    : './account.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsAccountComponent implements OnInit
{
    accountForm: FormGroup;
    account$: Observable<User>;
    // isLoading: boolean = false;
    // isLoadingStart: boolean = false;
    isLoadingError: boolean = false;
    flashMessage: 'success' | 'error' | null = null;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _accountService: AccountService,
        private _translocoService: TranslocoService,
        private _fuseLoading: FuseLoadingService,
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
        // Create the form
        this.accountForm = this._formBuilder.group({
            id         : [''],
            companyId  : [''],
            name       : [''],
            username   : [''],
            title      : [''],
            company    : [''],
            about      : [''],
            email      : ['', Validators.email],
            phone      : [''],
            country    : [''],
            language   : [''],
            cognito    : ['']
        });

        // Get the account
        this.account$ = this._accountService.account$;

        //this.isLoadingStart = true;
        this._fuseLoading.show();

        this._accountService.getCurrentUser().subscribe({
            next: (account) => {
                //this.isLoadingStart = false;
                this._fuseLoading.hide();
                // Fill the form
                this.accountForm.patchValue(account);
                this._changeDetectorRef.markForCheck();
            },
            error: (err) => {
                console.log('error occured call getAccount', err);

                this.isLoadingError = true;
                //this.isLoadingStart = false;
                this._fuseLoading.hide();
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    updateAccount(): void
    {
        // Get the account object
        const account = this.accountForm.getRawValue();
        console.log('updateAccount', account);

        console.log('call updateAccount service');
        //this.isLoading = true;
        this._fuseLoading.show();

        if (account.cognito) {
            console.log('updateAccount call createAccount', account);
            // Update the account on the server
            this._accountService.createAccount(account).subscribe({
                next: () => {
                    console.log('crateAccount success', account);
                    this._translocoService.setActiveLang(account.language);
                    // Show a success message
                    this.showFlashMessage('success');
                    //this.isLoading = false;
                    this._fuseLoading.hide();
                    this._changeDetectorRef.markForCheck();
                },
                error:(err) => {
                    console.log('error occured call updateAccount', err);
                    this.showFlashMessage('error');
                    //this.isLoading = false;
                    this._fuseLoading.hide();
                }
            });
        }
        else {
            // Update the account on the server
            this._accountService.updateAccount(account).subscribe({
                next: () => {
                    console.log('updateAccount success', account);
                    this._translocoService.setActiveLang(account.language);
                    // Show a success message
                    this.showFlashMessage('success');
                    //this.isLoading = false;
                    this._fuseLoading.hide();
                    this._changeDetectorRef.markForCheck();
                },
                error:(err) => {
                    console.log('error occured call updateAccount', err);
                    this.showFlashMessage('error');
                    //this.isLoading = false;
                    this._fuseLoading.hide();
                }
            });
        }
    }

    resetAccount(): void
    {
        console.log('resetAccount started');

        //this.isLoading = true;
        this._fuseLoading.show();
        // Update the bank on the server
        this.account$.subscribe(
            (account) => {
                console.log('resetAccount end', account);

                this._translocoService.setActiveLang(account.language);
                this.accountForm.patchValue(account);
                //this.isLoading = false;
                this._fuseLoading.hide();
                this._changeDetectorRef.markForCheck();
            }
        );
    }

    /**
     * Show flash message
     */
     showFlashMessage(type: 'success' | 'error'): void
     {
         // Show the message
         this.flashMessage = type;

         // Mark for check
         this._changeDetectorRef.markForCheck();

         // Hide it after 3 seconds
         setTimeout(() => {

             this.flashMessage = null;

             // Mark for check
             this._changeDetectorRef.markForCheck();
         }, 3000);
     }
}
