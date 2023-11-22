import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CloudUserService } from 'app/core/user/cloud.user.service';
import { user } from 'app/mock-api/common/user/data';
import { ChangePassword } from 'app/models/user.type';

@Component({
    selector       : 'settings-security',
    templateUrl    : './security.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserSettingsSecurityComponent implements OnInit
{
    securityForm: FormGroup;
    flashMessage: 'success' | 'error' | null = null;
    /**
     * Constructor
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _confirmPassword: CloudUserService,
        private _changeDetectorRef: ChangeDetectorRef,
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
        this.securityForm = this._formBuilder.group({
            currentPassword  : [''],
            newPassword      : [''],
            confirmPassword  : [''],
            twoStep          : [true],
            askPasswordChange: [false]
        });
    }
    public alert = 'success change password'

    SaveChangePassword(){
        const sendData:ChangePassword = {
            accessToken: localStorage.getItem("accessToken"),
            oldPassword: this.securityForm.value.currentPassword,
            newPassword: this.securityForm.value.newPassword,
            confirmPassword: this.securityForm.value.confirmPassword
        }

        this._confirmPassword.changePassword(sendData).then(
            (result) => {
                this.securityForm.reset();
                if (result === 'success change password') {
                    this.alert = result
                    this.showFlashMessage('success');
                } else {
                    this.alert = result
                    this.showFlashMessage('error');
                }
            },
            (err) => {
                this.securityForm.reset();
                this.alert = 'error change password'
                this.showFlashMessage('error');
            }
        )
    }
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
