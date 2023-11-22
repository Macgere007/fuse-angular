import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { FuseLoadingService } from '@fuse/services/loading';
import { UserService } from 'app/core/user/user.service';
import { Company } from 'app/models/company.type';
import { DataOperation } from 'app/models/data-operation.type';
import { User } from 'app/models/user.type';
import { Observable, take, map, Subject } from 'rxjs';
import { CompanyService } from './company.service';
import { takeUntil } from 'rxjs';

@Component({
    selector       : 'settings-company',
    templateUrl    : './company.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class SettingsCompanyComponent implements OnInit, OnDestroy
{
    companyForm: FormGroup;
    company$: Observable<Company>;
    isLoadingError: boolean = false;
    flashMessage: 'success' | 'error' | null = null;
    isAllowWrite: boolean = false;
    isAllowDelete: boolean = false;
    user: User;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _companyService: CompanyService,
        private _fuseLoading: FuseLoadingService,
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
        // Create the form
        this.companyForm = this._formBuilder.group({
            id           : [''],
            name         : [''],
            address      : [''],
            phone        : [''],
            fax          : [''],
            taxId        : [''],
            websiteUrl   : [''],
            email        : ['', Validators.email],
            logo         : [''],
            createdAt    : [''],
            updatedAt    : ['']
        });

        // Subscribe to user changes
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;
                this.isAllowWrite = this._userService.isAllow(this.user, 'company', DataOperation.write);
                this.isAllowDelete = this._userService.isAllow(this.user, 'company', DataOperation.delete);
            }
        );

        // Get the company
        this.company$ = this._companyService.company$;

        //this.isLoadingStart = true;
        this._fuseLoading.show();

        this._companyService.getMyCompany().subscribe({
            next: (company) => {
                //this.isLoadingStart = false;
                this._fuseLoading.hide();
                // Fill the form
                this.companyForm.patchValue(company);
            },
            error: (err) => {
                console.log('error occured call getBanks', err);

                this.isLoadingError = true;
                //this.isLoadingStart = false;
                this._fuseLoading.hide();
                this._changeDetectorRef.markForCheck();
            }
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

    updateCompany(): void
    {
        // Get the company object
        const company = this.companyForm.getRawValue();
        console.log('updateCompany', company);

        console.log('call updateCompany service');
        //this.isLoading = true;
        this._fuseLoading.show();
        // Update the bank on the server
        this._companyService.updateCompany(company).subscribe({
            next: () => {
                // Show a success message
                this.showFlashMessage('success');
                //this.isLoading = false;
                this._fuseLoading.hide();
            },
            error:(err) => {
                console.log('error occured call updateCompany', err);
                this.showFlashMessage('error');
                //this.isLoading = false;
                this._fuseLoading.hide();
            }
        });
    }

    resetCompany(): void
    {
        console.log('resetCompany started');

        //this.isLoading = true;
        this._fuseLoading.show();
        // Update the bank on the server
        this.company$.subscribe(
            (company) => {
                console.log('resetCompany end');
                this.companyForm.patchValue(company);
                //this.isLoading = false;
                this._fuseLoading.hide();
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
