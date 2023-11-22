import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, from, Subject } from 'rxjs';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { Auth, Hub } from 'aws-amplify';
import { CognitoUser} from 'amazon-cognito-identity-js';
import { AuthAmplify } from './auth.amplify';
import { AuthResponse } from './auth.types';
import { User } from 'app/models/user.type';
import { SignUpParams } from '@aws-amplify/auth';
import { ISignUpResult } from 'amazon-cognito-identity-js';
import { TranslocoService } from '@ngneat/transloco';
import { CloudUserService } from '../user/cloud.user.service';

@Injectable()
export class AuthService
{

    private _authenticated: boolean = false;
    private _signOutInProgress: boolean = false;
    private _signUpResult: ISignUpResult;
    private _forgotPasswordEmail: string;
    private _forgotPasswordResult: any;
    private _currentUser: any;
    private _currentUserReal: any;

    private _authState: Subject<CognitoUser|any> = new Subject<CognitoUser|any>();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    authState: Observable<CognitoUser|any> = this._authState.asObservable();
    jwtHelper: any;


    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService,
        private _translateService: TranslocoService,
        private _cloudeUserService: CloudUserService
    )
    {
        const unsubscribe = Hub.listen('auth',(data) => {
            const { channel, payload } = data;

            if (channel === 'auth') {
                switch(payload.event)
                {
                    case 'signIn':
                        const user = payload.data;

                        this._authenticated = true;

                        this.accessToken = AuthAmplify.getAccessToken(user);

                        AuthAmplify.getUserData(user).then(
                            (userData: User) => {
                                this._userService.user = userData;
                            },
                            (error) => {
                                // console.log('Hub signIn event getUserData error', error);
                            }
                        );

                        break;
                    case 'signOut':
                        break;
                    case 'customOAuthState':
                        // get customState return from federated login
                        // and set active language from the passing custom state
                        const customState = JSON.parse(payload.data);
                        this._translateService.setActiveLang(customState.lang);
                        break;
                }

                this._authState.next(payload.event);
            }
          });
    }
    public isAuthenticated(): boolean {
        const token = localStorage.getItem('token');
        // Check whether the token is expired and return
        // true or false
        return !this.jwtHelper.isTokenExpired(token);
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    get signupEmail(): string
    {
        if (!this._signUpResult) {
            return null;
        }

        return this._signUpResult.user.getUsername();
    }

    get forgotPasswordDestination(): string
    {
        if (!this._forgotPasswordResult) {
            return null;
        }

        return this._forgotPasswordResult.CodeDeliveryDetails.Destination;
    }

    get signupEmailDestination(): string
    {
        if (!this._signUpResult) {
            return null;
        }

        return this._signUpResult.codeDeliveryDetails.Destination;
    }

    get forgotPasswordEmail(): string
    {
        return this._forgotPasswordEmail;
    }

    get activeLanguage(): string
    {
        return localStorage.getItem('activeLanguage') ?? 'en';
    }

    get accessToken(): string
    {
        return localStorage.getItem('accessToken') ?? '';
    }

    get currentUser(): any
    {
        return this._currentUser;
    }

    get currentUserReal(): any
    {
        return this._currentUserReal;
    }

    // eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures
    set activeLanguage(lang: string) {
        localStorage.setItem('activeLanguage', lang);
    }

     // eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures
     set accessToken(token: string)
     {
        localStorage.setItem('accessToken', token);
     }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any>
    {
        const promise = new Promise<boolean>((resolve, reject) => {
            Auth.forgotPassword(email).then(
                (response) => {
                    this._forgotPasswordEmail = email;
                    this._forgotPasswordResult = response;
                    resolve(response);
                },
                (error) => {
                    this._forgotPasswordEmail = null;
                    reject(error);
                }
            );
        });

        return from(promise);

        //return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(user: {email: string; code: string; password: string}): Observable<any>
    {
        const promise = new Promise<boolean>((resolve, reject) => {
            Auth.forgotPasswordSubmit(user.email, user.code, user.password).then(
                (success) => {
                    resolve(true);
                },
                (error) => {
                    reject(error);
                }
            );
        });

        return from(promise);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<any>
    {

        // Throw error, if the user is already logged in
        if ( this._authenticated )
        {
            return throwError(() => new Error('User is already logged in.'));
        }

        const promise = new Promise<AuthResponse | any>((resolve, reject) => {

            Auth.signOut({global: true}).then(
                (result) => {
                    Auth.signIn(credentials.email, credentials.password).then(
                        (user: CognitoUser ) => {

                            this._authenticated = true;
                            this.accessToken = AuthAmplify.getAccessToken(user);

                            AuthAmplify.getUserData(user).then(
                                async (userData: User) => {
                                    this._userService.user = userData;
                                    this._currentUser = userData;

                                    const userReal = await this._cloudeUserService.getCurrentUser()
                                    this._currentUserReal = userReal.item

                                    const response: AuthResponse = {
                                        accessToken: this.accessToken,
                                        user: userData,
                                        tokenType: 'bearer'
                                    };
                                    resolve(response);
                                },
                                (error) => {
                                    reject(error);
                                }
                            );
                        },
                        (error) => {
                            reject(error);
                        }
                    );
                },
                (error) => {
                    Auth.signIn(credentials.email, credentials.password).then(
                        (user: CognitoUser ) => {

                            this._authenticated = true;
                            this.accessToken = AuthAmplify.getAccessToken(user);

                            AuthAmplify.getUserData(user).then(
                                async (userData: User) => {
                                    this._userService.user = userData;
                                    this._currentUser = userData;

                                    const userReal = await this._cloudeUserService.getCurrentUser()
                                    this._currentUserReal = userReal.item

                                    const response: AuthResponse = {
                                        accessToken: this.accessToken,
                                        user: userData,
                                        tokenType: 'bearer'
                                    };
                                    resolve(response);
                                },
                                (err) => {
                                    reject(err);
                                }
                            );
                        },
                        (err) => {
                            reject(err);
                        }
                    );
                }
            );
        });

        return from(promise);
    }

    /**
     * Sign out
     */
    signOut(): Observable<any>
    {
        if (this._signOutInProgress) {
            return of(true);
        }

        this._signOutInProgress = true;
        const promise = new Promise<boolean>((resolve, reject) => {
            Auth.signOut().then(
                    (success) => {
                        // Remove the access token from the local storage
                        localStorage.removeItem('accessToken');

                        // Set the authenticated flag to false
                        this._authenticated = false;
                        this._signOutInProgress = false;

                        resolve(true);
                    },
                    (error) => {
                        this._signOutInProgress = false;
                        reject(error);
                    }
                );
        });

        // Return the observable
        return from(promise);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: { name: string; email: string; password: string; company: string; companyType: string }): Observable<any>
    {

        const promise = new Promise<CognitoUser>((resolve, reject) => {

            const signupParams: SignUpParams = {
                username: user.email,
                password: user.password,
                attributes: {
                    'email': user.email,
                    'name': user.name,
                    'custom:company': user.company,
                    'custom:companyType': user.companyType,
                }
            };

            Auth.signUp(signupParams).then(
                (signupResult) => {

                    this._signUpResult = signupResult;
                    resolve(signupResult.user);
                },
                (error) => {
                    reject(error);
                }
            );
        });

        return from(promise);
        //return this._httpClient.post('api/auth/sign-up', user);
    }

    confirmSignUp(user: { email: string; code: string }): Observable<any>
    {
        const promise = new Promise<boolean>((resolve, reject) => {
            Auth.confirmSignUp(user.email, user.code).then(
                (success) => {
                    resolve(true);
                },
                (error) => {
                    reject(error);
                }
            );
        });

        return from(promise);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string }): Observable<any>
    {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean>
    {

        // Check if the user is logged in
        if ( this._authenticated )
        {
            return of(true);
        }

        // Check the access token availability
        if ( this.accessToken && this._currentUser !== undefined)
        {

            if ( AuthUtils.isTokenExpired(this.accessToken) ) {
                return of(false);
            }
            return of(true);
        }

        const promise = new Promise<boolean>((resolve, reject) => {
            Auth.currentSession().then(
                (session) => {
                    this._authenticated = session.isValid();
                    Auth.currentAuthenticatedUser().then(
                        (user) => {
                            AuthAmplify.getUserData(user).then(
                                async (userData) => {
                                    this._userService.user = userData;
                                    this._currentUser = userData;

                                    const userReal = await this._cloudeUserService.getCurrentUser()
                                    this._currentUserReal = userReal.item
                                    
                                    resolve(session.isValid());
                                }
                            );
                        }
                    );
                },
                (err) => {
                    resolve(false);
                }
            );
        });

        return from(promise);
    }
}
