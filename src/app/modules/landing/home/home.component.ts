import { Component, ViewEncapsulation } from '@angular/core';
import { environment } from 'environments/environment';

@Component({
    selector     : 'landing-home',
    templateUrl  : './home.component.html',
    encapsulation: ViewEncapsulation.None
})
export class LandingHomeComponent
{
    appTitle = environment.appTitle;
    /**
     * Constructor
     */
    constructor()
    {
    }
}
