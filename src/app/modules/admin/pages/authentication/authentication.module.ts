import { NgModule } from '@angular/core';
import { AuthSignInModule } from 'app/modules/auth/sign-in/sign-in.module';
import { AuthSignUpModule } from 'app/modules/auth/sign-up/sign-up.module';
import { AuthSignOutModule } from 'app/modules/auth/sign-out/sign-out.module';
import { ForgotPasswordModule } from 'app/modules/admin/pages/authentication/forgot-password/forgot-password.module';
import { ResetPasswordModule } from 'app/modules/admin/pages/authentication/reset-password/reset-password.module';
import { UnlockSessionModule } from 'app/modules/admin/pages/authentication/unlock-session/unlock-session.module';
import { ConfirmationRequiredModule } from 'app/modules/admin/pages/authentication/confirmation-required/confirmation-required.module';

@NgModule({
    imports: [
        AuthSignInModule,
        AuthSignUpModule,
        AuthSignOutModule,
        ForgotPasswordModule,
        ResetPasswordModule,
        UnlockSessionModule,
        ConfirmationRequiredModule
    ],
    exports: [
        AuthSignInModule,
        AuthSignUpModule,
        AuthSignOutModule,
        ForgotPasswordModule,
        ResetPasswordModule,
        UnlockSessionModule,
        ConfirmationRequiredModule
    ]
})
export class AuthenticationModule
{
}
