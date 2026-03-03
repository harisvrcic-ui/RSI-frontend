import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminLayoutComponent} from './admin-layout/admin-layout.component';
import {AdminErrorPageComponent} from './admin-error-page/admin-error-page.component';
import {CitiesComponent} from './cities/cities.component';
import {CitiesEditComponent} from './cities/cities-edit/cities-edit.component';


import { LanguagesComponent } from './languages/languages.component';
import { LanguagesEditComponent } from './languages/languages-edit/languages-edit.component';


import { UsersComponent } from './users/users.component';
import { AdminsComponent } from './admins/admins.component';



import { BrandsComponent } from './brands/brand-component';
import { CarsComponent } from './cars/cars.component';
import {ColorsComponent} from './colors/colors.component';
import {CountriesComponent} from './countries/countries.component';
import {GenderComponent} from './genders/gender.component';
import {ParkingSpotTypeComponent} from './parking-spot-types/parking-spot-types.component';
import {ParkingSpotsComponent} from './parking-spots/parking-spot.component';
import {ParkingZoneComponent} from './parking-zones/parking-zone.component';
import {ReservationsComponent} from './reservations/reservation.component';
import {ReservationTypeComponent} from './reservation-types/reservation-type.component';
import {ReviewsComponent} from './reviews/review.component';
import {DashboardComponent} from './dashboard/dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
      {path: 'dashboard', component: DashboardComponent},
      {path: 'cities', component: CitiesComponent},
      {path: 'cities/edit/new', component: CitiesEditComponent},
      {path: 'cities/edit/:id', component: CitiesEditComponent},
      {path: 'languages', component: LanguagesComponent},
      {path: 'languages/edit/new', component: LanguagesEditComponent},
      {path: 'languages/edit/:id', component: LanguagesEditComponent},
      {path: 'users', component: UsersComponent},
      {path: 'admins', component: AdminsComponent},
      { path: 'brands', component: BrandsComponent },
      { path: 'cars', component: CarsComponent },
      { path: 'colors', component: ColorsComponent },
      { path: 'countries', component: CountriesComponent },
      { path: 'genders', component: GenderComponent },
      { path: 'parking-spot-types', component: ParkingSpotTypeComponent },
      { path: 'parking-spots', component: ParkingSpotsComponent },
      { path: 'parking-zones', component: ParkingZoneComponent },
      { path: 'reservations', component: ReservationsComponent },
      { path: 'reservation-types', component: ReservationTypeComponent },
      { path: 'reviews', component: ReviewsComponent },

      {path: '**', component: AdminErrorPageComponent} // Default ruta
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}
