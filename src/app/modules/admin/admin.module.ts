import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {RouterModule} from '@angular/router';
import {AdminRoutingModule} from './admin-routing.module';
import {AdminLayoutComponent} from './admin-layout/admin-layout.component';
import {AdminErrorPageComponent} from './admin-error-page/admin-error-page.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../shared/shared.module';
import {MatButton} from "@angular/material/button";
import {
  MatCell,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatRow,
  MatTable,
  MatTableModule
} from "@angular/material/table";
import {MatPaginator} from '@angular/material/paginator';
import {MatFormField, MatFormFieldModule} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatSortModule} from '@angular/material/sort';
import {MatIconModule} from '@angular/material/icon';
import {MatOption, MatSelect} from "@angular/material/select";
import {MatCard} from '@angular/material/card';
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatTooltipModule} from '@angular/material/tooltip';
import { CitiesComponent } from './cities/cities.component';
import { CitiesEditComponent } from './cities/cities-edit/cities-edit.component';


import { LanguagesComponent } from './languages/languages.component';
import { LanguagesEditComponent } from './languages/languages-edit/languages-edit.component';

import { UsersComponent } from './users/users.component';
import { AdminsComponent } from './admins/admins.component';



import {TranslateModule} from '@ngx-translate/core';
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

@NgModule({
  declarations: [
    AdminLayoutComponent,
    DashboardComponent,
    AdminErrorPageComponent,
    CitiesComponent,
    CitiesEditComponent,

    LanguagesComponent,
    LanguagesEditComponent,

    UsersComponent,
    AdminsComponent,

    BrandsComponent,
    CarsComponent,

    ColorsComponent,
    CountriesComponent,
    GenderComponent,
    ParkingSpotTypeComponent,
    ParkingSpotsComponent,
    ParkingZoneComponent,
    ReservationsComponent,
    ReservationTypeComponent,
    ReviewsComponent
  ],
    imports: [
        CommonModule,
        RouterModule,
        AdminRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        TranslateModule.forChild(),
        MatButton,
        MatTable,
        MatHeaderCell,
        MatCell,
        MatHeaderRow,
        MatRow,
        MatPaginator,
        MatFormField,
        MatInput,
        MatIconModule,
        MatColumnDef,
        MatTableModule,
        MatSortModule,
        MatFormFieldModule,
        MatSelect,
        MatOption,
        MatCard,
        MatProgressSpinner,
        MatTooltipModule,
        // Omogućava pristup svemu što je eksportovano iz SharedModule
    ],
  providers: []
})
export class AdminModule {
}
