import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as keyBy from 'lodash/keyBy';
import { URLS } from '../profile';
import { RetryHttp } from '../user';
import { IProduct } from '../product';
import { IWishItem, IWishListResponse, IWishlistSavePayload } from './wishlist';

@Injectable()
export class WishlistService {

  private _items: Observable<IWishItem[]> = null;

  constructor(private http: RetryHttp) { }

  clearCache() {
    this._items = null;
  }

  getItems(): Observable<IWishItem[]> {
    if (!this._items) {
      this._items = this.http.get(URLS.WISH_LIST_ALL).
        map(res => this.parseResponse(res.json() || {})).publishReplay(1).refCount();
    }
    return this._items;
  }

  has(productId: number): Observable<boolean> {
    return this.getItems().map(items => items.some(item => item.ProductID === productId));
  }

  add(product: IProduct, price: number): Observable<void> {
    // tslint:disable-next-line:variable-name
    let {Name, Img, ID: ProductID} = product;
    let payload: IWishlistSavePayload = { ProductID, Name, Img, Price: price };
    return this.http.post(URLS.WISH_LIST_ALL, JSON.stringify(payload)).flatMap(res => {
      return this._items ? this._items.map(items => {
        let item = this.initItem(res.json(), product);
        let index = items.findIndex(i => i.ID === item.ID);
        if (~index) {
          items[index] = item;
          items = [...items];
        } else {
          items = [item, ...items];
        }
        this._items = Observable.of(items);
      }) : Observable.of<void>(null);
    });
  }

  delete(productIds: number[]): Observable<void> {
    // DELETE /cart/:id
    return this.http.delete(URLS.WISH_LIST_ALL, { search: productIds.map(id => `s=${id}`).join('&') }).flatMap(res => {
      return this._items ? this._items.map(items => {
        items = items.filter(item => !~productIds.indexOf(item.ProductID));
        this._items = Observable.of(items);
      }) : Observable.of<void>(null);
    });
  }

  private parseResponse(res: IWishListResponse): IWishItem[] {
    let items = res.Items || [];
    let products = res.Products || [];
    let productMap = keyBy(products, item => item.ID);

    return items.map(item => this.initItem(item, productMap[item.ProductID])).sort((b, a) => a.CreatedAt - b.CreatedAt);
  }

  private initItem(item: IWishItem, product: IProduct): IWishItem {
    item.product = product;
    item.invalid = !product;
    item.Img = product ? product.Img : item.Img;
    item.Name = product ? product.Name : item.Name;
    item.Price = (product && product.skus && product.skus[0] && product.skus[0].SalePrice) || item.Price;

    // TODO add sku price/img

    return item;
  }

}
