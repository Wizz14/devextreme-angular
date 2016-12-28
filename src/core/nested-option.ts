import { QueryList, ElementRef } from '@angular/core';

export interface INestedOptionContainer {
    instance: any;
}

export interface OptionPathGetter { (): string; }

export abstract class NestedOption implements INestedOptionContainer, ICollectionNestedOptionContainer {
    protected _host: INestedOptionContainer;
    protected _hostOptionPath: OptionPathGetter;
    private _collectionContainerImpl: ICollectionNestedOptionContainer;
    protected _initialOptions = {};

    protected _getOptionPath() {
        return this._hostOptionPath() + this._optionPath + '.';
    }

    protected _getOption(name: string): any {
        if (this.instance) {
            return this.instance.option(this._getOptionPath() + name);
        } else {
            return this._initialOptions[name];
        }
    }

    protected _setOption(name: string, value: any) {
        if (this.instance) {
            this.instance.option(this._getOptionPath() + name, value);
        } else {
            this._initialOptions[name] = value;
        }
    }

    protected abstract get _optionPath(): string;

    constructor(private _element: ElementRef) {
        this._collectionContainerImpl = new CollectionNestedOptionContainerImpl(this._setOption.bind(this), this._filterItems.bind(this));
    }

    setHost(host: INestedOptionContainer, optionPath: OptionPathGetter) {
        this._host = host;
        this._hostOptionPath = optionPath;
        this._host[this._optionPath] = this._initialOptions;
    }

    _template(...args) {
        let container = args[2] || args[1] || args[0];
        return container.append(this._element.nativeElement);
    }

    setChildren<T extends ICollectionNestedOption>(propertyName: string, items: QueryList<T>) {
        return this._collectionContainerImpl.setChildren(propertyName, items);
    }

    _filterItems(items: QueryList<NestedOption>) {
        return items.filter((item) => { return item !== this; });
    }

    get instance() {
        return this._host && this._host.instance;
    }

}

export interface ICollectionNestedOptionContainer {
    setChildren<T>(propertyName: string, items: QueryList<T>);
}

export class CollectionNestedOptionContainerImpl implements ICollectionNestedOptionContainer {
    private _activatedQueries = {};
    constructor(private _setOption: Function, private _filterItems?: Function) {
    }
    setChildren<T extends ICollectionNestedOption>(propertyName: string, items: QueryList<T>) {
        if (items.length) {
            this._activatedQueries[propertyName] = true;
        }
        if (this._activatedQueries[propertyName]) {
            if (this._filterItems) {
                items = this._filterItems(items);
            }
            let widgetItems = items.map((item, index) => {
                item._index = index;
                return item._value;
            });
            this._setOption(propertyName, widgetItems);
        }
    }
}

export interface ICollectionNestedOption {
    _index: number;
    _value: Object;
}

export abstract class CollectionNestedOption extends NestedOption implements ICollectionNestedOption {
    _index: number;

    protected _getOptionPath() {
        if (this._index !== undefined) {
            return this._hostOptionPath() + this._optionPath + '[' + this._index + ']' + '.';
        }
        return '';
    }

    get _value() {
        return this._initialOptions;
    }
}

export class NestedOptionHost {
    private _host: INestedOptionContainer;
    private _optionPath: OptionPathGetter;

    setHost(host: INestedOptionContainer, optionPath?: OptionPathGetter) {
        this._host = host;
        this._optionPath = optionPath || (() => '');
    }

    setNestedOption(nestedOption: NestedOption) {
        nestedOption.setHost(this._host, this._optionPath);
    }
}
