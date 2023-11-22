import { Injectable } from '@angular/core';
import { BehaviorSubject, from, map, Observable, of, switchMap, take, tap, throwError, catchError } from 'rxjs';
import { User } from 'app/models/user.type';
import { CloudUserService } from 'app/core/user/cloud.user.service';
import { UserService } from 'app/core/user/user.service';

const camelcaseKeysDeep = require('camelcase-keys-deep');

@Injectable({
    providedIn: 'root'
})
export class AccountService
{
    // Private
    private _account: BehaviorSubject<User | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
     constructor(
        private _cloudUserService: CloudUserService,
        private _userService: UserService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for account
     */
     get account$(): Observable<User>
     {
        return this._account.asObservable();
     }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get account
     */
    getCurrentUser(): Observable<User>
    {
        const promise = new Promise<User>((resolve, reject) => {
            this._cloudUserService.getCurrentUser().then(
                (result) => {
                    if (result.error) {
                        // do nothing
                        this._account.error(result.error);
                        reject(result.error);
                        return;
                    }

                    const account = camelcaseKeysDeep(result.item);
                    console.log('getCurrentUser', account);

                    this._account.next(account);

                    resolve(account);
                },
                (err) => {
                    console.log('catch error', err.response);
                    reject(err);
                }
            );
        });

        return from(promise);
    }

    /**
     * Create account
     */
     createAccount(newAcount: User): Observable<User>
     {
        return this.account$.pipe(
            take(1),
            switchMap(account => from(this._cloudUserService.createUser(newAcount))
                .pipe(
                    catchError((err) => {
                        if (err.detail) {
                            console.log('createUser error', err);
                            return throwError(() => new Error(err.detail));
                        }
                        else if (err.response) {
                            console.log('createUser error', err.response);
                            return throwError(() => new Error(err.response.data.message.error));
                        }
                        console.log('createUser error', err);
                        return throwError(() => new Error(`Database error ${err.routine} (${err.code})`));
                    }),
                    switchMap(insertedAccount => this.account$.pipe(
                        take(1),
                        tap(() => {
                        console.log('after switchMap insertedAccount', insertedAccount);

                        // Push to account subject
                        this._account.next(insertedAccount);

                        // Return the inerted account
                        return insertedAccount;
                        })
                    ))
                )
            )
        );
    }

    /**
     * Update account
     *
     * @param targetAccount
     */
    updateAccount(targetAccount: User): Observable<User>
    {
        return this.account$.pipe(
            take(1),
            switchMap(account => from(this._cloudUserService.updateUser(targetAccount))
                .pipe(
                    catchError((err) => {
                        if (err.detail) {
                            console.log('updateUser error', err);
                            return throwError(() => new Error(err.detail));
                        }
                        else if (err.response) {
                            console.log('updateUser error', err.response);
                            return throwError(() => new Error(err.response.data.message.error));
                        }
                        console.log('updateUser error', err);
                        return throwError(() => new Error(`Database error ${err.routine} (${err.code})`));
                    }),
                    switchMap(updatedAccount => this.account$.pipe(
                        take(1),
                        tap(() => {
                            console.log('after switchMap updatedAccount', updatedAccount);

                            // Push to account subject
                            this._account.next(updatedAccount);

                            // Return the updated account
                            return updatedAccount;
                        })
                    ))
                )
            )
        );
    }
}
