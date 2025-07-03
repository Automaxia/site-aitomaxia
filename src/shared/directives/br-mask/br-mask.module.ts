import {CommonModule} from '@angular/common';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {BrMaskDirective} from './br-mask';


@NgModule({
    declarations: [
        BrMaskDirective
    ],
    exports: [
        BrMaskDirective
    ],
    imports: [
        CommonModule
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class BrMaskerModule {
}
