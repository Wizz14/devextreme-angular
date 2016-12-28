<#? it.inputs #>/* tslint:disable:use-input-property-decorator */
<#?#>
import {
    Component,
    NgModule,
    Host,
    ElementRef,
    SkipSelf<#? it.properties #>,
    Input<#?#><#? it.collectionNestedComponents.length #>,
    ContentChildren,
    forwardRef,
    QueryList<#?#>
} from '@angular/core';

import { NestedOptionHost } from '../../core/nested-option';
import { <#= it.baseClass #> } from '<#= it.basePath #>';
<#~ it.collectionNestedComponents :component:i #><#? component.className !== it.className #>import { <#= component.className #>Component } from './<#= component.path #>';
<#?#><#~#>

@Component({
    selector: '<#= it.selector #>',
    template: '<#? it.hasTemplate #><ng-content></ng-content><#?#>',
    providers: [NestedOptionHost]<#? it.inputs #>,
    inputs: [<#~ it.inputs :input:i #>
        '<#= input.name #>'<#? i < it.inputs.length-1 #>,<#?#><#~#>
    ]<#?#>
})
export class <#= it.className #>Component extends <#= it.baseClass #> {<#~ it.properties :prop:i #>
    @Input()
    get <#= prop.name #>() {
        return this._getOption('<#= prop.name #>');
    }
    set <#= prop.name #>(value: any) {
        this._setOption('<#= prop.name #>', value);
    }
<#~#>
    protected get _optionPath() {
        return '<#= it.optionName #>';
    }

<#~ it.collectionNestedComponents :component:i #>
    @ContentChildren(forwardRef(() => <#= component.className #>Component))
    get <#= component.propertyName #>Children(): QueryList<<#= component.className #>Component> {
        return this._getOption('<#= component.propertyName #>');
    }
    set <#= component.propertyName #>Children(value) {
        this.setChildren('<#= component.propertyName #>', value);
    }
<#~#>

    constructor(@SkipSelf() @Host() parentOptionHost: NestedOptionHost, @Host() optionHost: NestedOptionHost, element: ElementRef) {
        super(element);
<#? it.hasTemplate #>
        this.template = this._template.bind(this);
<#?#>
        parentOptionHost.setNestedOption(this);
        optionHost.setHost(this, this._getOptionPath.bind(this));
    }
}

@NgModule({
  declarations: [
    <#= it.className #>Component
  ],
  exports: [
    <#= it.className #>Component
  ],
})
export class <#= it.className #>Module { }
