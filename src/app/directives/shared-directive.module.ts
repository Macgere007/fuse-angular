import { NgModule } from '@angular/core';
import { DndDirective } from './dnd.directive';
import { LocalizedNumericInputDirective } from './localized-numeric-input.directive';
import { SelectOnClickDirective } from './select-on-click.directive';
import { CountUpDirective } from './count-up.directive';

@NgModule({
  exports: [DndDirective, LocalizedNumericInputDirective, SelectOnClickDirective, CountUpDirective],
  declarations: [DndDirective, LocalizedNumericInputDirective, SelectOnClickDirective, CountUpDirective],
  providers: []
})
export class SharedDirectiveModule {}
