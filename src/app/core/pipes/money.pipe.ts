import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { NumberWrapper } from '@angular/core/src/facade/lang';

import { constMap } from '../consts';
import { ISku, IProduct } from '../product';

export interface Pricer {
  SalePrice?: number;
  Price?: number;
  sku?: ISku;
  product?: IProduct;
}

// Cannot read property 'product' of undefined: value is null!!!
@Pipe({ name: 'priceNo' })
export class PriceNoPipe implements PipeTransform {
  base = new DecimalPipe('zh-CN');
  // accept number, sku or any object which has Price
  transform(value: Pricer, product?: IProduct) {
    let isVpn = NumberWrapper.isNumeric(product);
    let vpn = (isVpn && product as any as number);
    product = (!isVpn && product) || value.product || (value.sku && value.sku.product);
    let price = (NumberWrapper.isNumeric(value) && <number>value) || value.Price || value.SalePrice || (value.sku && value.sku.SalePrice) ||
      (product && product.skus && product.skus[0] && product.skus[0].SalePrice);
    price = price || 0;
    vpn = vpn || (product && product.Vpn);
    let isPoints = vpn === constMap.VpnType.TVpnPoints;
    return isPoints ? `${price}` : `${this.base.transform(price / 100, '1.2-2')}`;
  }
}

@Pipe({ name: 'price' })
export class PricePipe implements PipeTransform {
  base = new DecimalPipe('zh-CN');
  // accept number, sku or any object which has Price
  transform(value: Pricer, product?: IProduct) {
    let isVpn = NumberWrapper.isNumeric(product);
    let vpn = (isVpn && product as any as number);
    product = (!isVpn && product) || value.product || (value.sku && value.sku.product);
    let price = (NumberWrapper.isNumeric(value) && <number>value) || value.Price || value.SalePrice || (value.sku && value.sku.SalePrice) ||
      (product && product.skus && product.skus[0] && product.skus[0].SalePrice);
    price = price || 0;
    vpn = vpn || (product && product.Vpn);
    let isPoints = vpn === constMap.VpnType.TVpnPoints;
    return isPoints ? `${price}积分` : `￥${this.base.transform(price / 100, '1.2-2')}`;
  }
}

@Pipe({ name: 'money' })
export class MoneyPipe implements PipeTransform {
  base = new DecimalPipe('zh-CN');
  transform(value: number) {
    return this.base.transform((value ? value : 0) / 100, '1.2-2');
  }
}

@Pipe({ name: 'yuan' })
export class YuanPipe implements PipeTransform {
  base = new DecimalPipe('zh-CN');
  transform(value: number) {
    return this.base.transform((value ? value : 0) / 100, '1.2-2').slice(0, -3);
  }
}

@Pipe({ name: 'cent' })
export class CentPipe implements PipeTransform {
  base = new DecimalPipe('zh-CN');
  transform(value: number) {
    return this.base.transform((value ? value : 0) / 100, '1.2-2').slice(-3);
  }
}
