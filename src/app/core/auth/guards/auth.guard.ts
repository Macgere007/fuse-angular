import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
// import { CompanyType } from 'app/models/company.type';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad
{
    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _router: Router
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Can activate
     *
     * @param route
     * @param state
     */
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean
    {
        const redirectUrl = state.url === '/sign-out' ? '/' : state.url;
        return this._check(redirectUrl);
    }

    /**
     * Can activate child
     *
     * @param childRoute
     * @param state
     */
    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
    {
        const redirectUrl = state.url === '/sign-out' ? '/' : state.url;
        return this._check(redirectUrl);
    }
    

    /**
     * Can load
     *
     * @param route
     * @param segments
     */
    canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean
    {
        return this._check('/dashboard');
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Check the authenticated status
     *
     * @param redirectURL
     * @private
     */
    private _check(redirectURL: string): Observable<boolean>
    {
        // Check the authentication status
        return this._authService.check()
                   .pipe(
                       switchMap((authenticated) => {

                            // If the user is not authenticated...
                            if ( !authenticated )
                            {
                                // Redirect to the sign-in page
                                this._router.navigate(['sign-in'], {queryParams: {redirectURL}});
                                //this._router.navigate(['home'], {queryParams: {redirectURL}});
                                // Prevent the access
                                return of(false);
                            }

                            // if (redirectURL.startsWith('/master')) {
                            //     const currentUser = this._authService.currentUser;
                            //     if (currentUser === undefined) {
                            //         this._router.navigate(['/']);
                            //         return of(false);
                            //     }
                            //      else

                            //     this._router.navigate(['/']);
                            //     return of(false);
                            // }


                            // Allow the access
                            return of(true);
                       })
                   );
    }

    private _limit(redirectURL: string): Observable<boolean>
    {
        // Check the authentication status
        return this._authService.check()
                   .pipe(
                       switchMap((authenticated) => {
                        if ( !authenticated )
                            {
                                // Redirect to the sign-in page
                                this._router.navigate(['sign-in'], {queryParams: {redirectURL}});
                                //this._router.navigate(['home'], {queryParams: {redirectURL}});
                                // Prevent the access
                                return of(false);
                            }

                            if (redirectURL.startsWith('/master')) {
                                const currentUser = this._authService.currentUser;
                                if (currentUser.isAdmin ===  true) {
                                    this._router.navigate(['admin/dashboard']);
                                    return of(true);
                                }
                                 else if ( currentUser.isAdmin === false) {
                                    this._router.navigate(['/dashboard'])
                                    return of(false)
                                 }


                                this._router.navigate(['/']);
                                return of(false);
                            }
                       })
                   );
    }
}
