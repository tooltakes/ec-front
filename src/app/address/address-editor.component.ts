import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { config, IAddress, AddressService } from '../core';
import { ChinaRegionService, RegionPair } from './china-region.service';

@Component({
  selector: 'address-editor',
  templateUrl: './address-editor.html',
  styleUrls: ['./address-editor.css'],
  viewProviders: [ChinaRegionService],
})
export class AddressEditorComponent {

  @Input() addr: IAddress;
  @Output() saved = new EventEmitter<IAddress>();

  form: FormGroup;
  failed: boolean = false;
  provinceControl: FormControl;
  cityControl: FormControl;
  districtControl: FormControl;

  showErr = config.showErr;

  provinces: RegionPair[];
  private _province: RegionPair;
  private _city: RegionPair;
  private _district: RegionPair;

  constructor(
    private location: Location,
    private fb: FormBuilder,
    private chinaRegionService: ChinaRegionService,
    private addressService: AddressService) { }

  ngOnInit() {
    this.provinces = this.chinaRegionService.provinces;
    this.addr = this.addr || <IAddress>{};

    this._province = this.addr.Province ? this.provinces.find(item => item[1] === this.addr.Province) : null;
    this._city = this.province && this.addr.City ? this.cities.find(item => item[1] === this.addr.City) : null;
    this._district = this.city && this.addr.District ? this.districts.find(item => item[1] === this.addr.District) : null;

    this.provinceControl = new FormControl(this.province, Validators.required);
    this.cityControl = new FormControl(this.city, Validators.required);
    this.districtControl = new FormControl(this.district, Validators.required);
    this.form = this.fb.group({
      Contact: [this.addr.Contact || '', Validators.compose([Validators.required, Validators.maxLength(10), Validators.minLength(2)])],
      Phone: [this.addr.Phone || '', Validators.compose([Validators.required, Validators.pattern(`1[3|4|5|7|8]\\d{9}`)])],
      House: [this.addr.House || '', Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(255)])],
      province: this.provinceControl,
      city: this.cityControl,
      district: this.districtControl,
    });
  }

  get cities() {
    return this.province ? this.chinaRegionService.getCities(this.province[0]) : null;
  }

  get districts() {
    return (this.province && this.city) ? this.chinaRegionService.getDistricts(this.city[0]) : null;
  }

  get province() { return this._province; }
  get city() { return this._city; }
  get district() { return this._district; }

  set province(province: RegionPair) {
    if (this._province !== province) {
      this._province = province;
      this._city = null;
      this._district = null;
    }
  }

  set city(city: RegionPair) {
    if (this._city !== city) {
      this._city = city;
      this._district = null;
      this.addr.District = null;
    }
  }

  set district(district: RegionPair) {
    if (this._district !== district) {
      this._district = district;
    }
  }

  get valid() { return this.form.valid && !this.failed; }

  onSubmit() {
    // tslint:disable-next-line:all
    let {Contact, Phone, House, province: [, Province], city: [, City], district: [, District]} = this.form.value;
    let value = <IAddress>{ Contact, Phone, House, Province, City, District };
    if (this.addr.ID) { value.ID = this.addr.ID; }
    if (this.addr.Pos) { value.Pos = this.addr.Pos; }
    this.addressService.save(value).subscribe(
      addr => this.saved.next(addr),
      e => {
        this.failed = true;
        setTimeout(_ => this.failed = false, 1000);
      }
    );
  }

}
