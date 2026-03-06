import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { ClientDashboardComponent } from './dashboard.component';
import { MyAuthService } from '../../../services/auth-services/my-auth.service';
import {
  ReservationsGetAllEndpointService,
  ReservationsGetAllResponse
} from '../../../endpoints/reservation-endpoints/reservation-get-all-endpoint.service';
import { MyPagedList } from '../../../helper/my-paged-list';

function mockPagedList(
  items: ReservationsGetAllResponse[]
): MyPagedList<ReservationsGetAllResponse> {
  return {
    dataItems: items,
    currentPage: 1,
    totalPages: items.length ? 1 : 0,
    pageSize: 100,
    totalCount: items.length,
    hasPrevious: false,
    hasNext: false
  };
}

describe('ClientDashboardComponent', () => {
  let component: ClientDashboardComponent;
  let fixture: ComponentFixture<ClientDashboardComponent>;
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<MyAuthService>;
  let reservationsService: jasmine.SpyObj<ReservationsGetAllEndpointService>;

  const mockReservation = (
    overrides: Partial<ReservationsGetAllResponse> = {}
  ): ReservationsGetAllResponse =>
    ({
      id: 1,
      userId: 1,
      carID: 1,
      parkingSpotID: 1,
      parkingSpotDisplayName: 'Spot A',
      reservationTypeID: 1,
      startDate: '2025-03-01T10:00:00',
      endDate: '2025-03-01T12:00:00',
      finalPrice: 5.0,
      ...overrides
    }) as ReservationsGetAllResponse;

  beforeEach(async () => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    authService = jasmine.createSpyObj('MyAuthService', [
      'isLoggedIn',
      'getMyAuthInfo'
    ]);
    reservationsService = jasmine.createSpyObj(
      'ReservationsGetAllEndpointService',
      ['handleAsync']
    );

    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [ClientDashboardComponent],
      providers: [
        { provide: Router, useValue: router },
        { provide: MyAuthService, useValue: authService },
        {
          provide: ReservationsGetAllEndpointService,
          useValue: reservationsService
        }
      ]
    }).compileComponents();

    authService.isLoggedIn.and.returnValue(true);
    authService.getMyAuthInfo.and.returnValue({ userId: 42 } as ReturnType<
      MyAuthService['getMyAuthInfo']
    >);
    reservationsService.handleAsync.and.returnValue(of(mockPagedList([])));
  });

  it('should create', () => {
    fixture = TestBed.createComponent(ClientDashboardComponent);
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  describe('business logic', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(ClientDashboardComponent);
      component = fixture.componentInstance;
    });

    describe('formatDate', () => {
      it('should return empty string for empty or falsy value', () => {
        expect(component.formatDate('')).toBe('');
        expect(component.formatDate(null as unknown as string)).toBe('');
      });

      it('should format valid ISO date string using current locale', () => {
        const value = '2025-03-05T14:30:00';
        const result = component.formatDate(value);
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });
    });

    describe('isActiveReservation', () => {
      it('should return false when reservation or endDate is missing', () => {
        expect(component.isActiveReservation(null!)).toBe(false);
        expect(
          component.isActiveReservation(
            mockReservation({ endDate: undefined as unknown as string })
          )
        ).toBe(false);
      });

      it('should return true when endDate is in the future', () => {
        const future = new Date();
        future.setFullYear(future.getFullYear() + 1);
        expect(
          component.isActiveReservation(
            mockReservation({ endDate: future.toISOString() })
          )
        ).toBe(true);
      });

      it('should return false when endDate is in the past', () => {
        const past = new Date();
        past.setFullYear(past.getFullYear() - 1);
        expect(
          component.isActiveReservation(
            mockReservation({ endDate: past.toISOString() })
          )
        ).toBe(false);
      });
    });

    describe('goToNewReservation', () => {
      it('should navigate to client reservation page', () => {
        component.goToNewReservation();
        expect(router.navigate).toHaveBeenCalledWith(['/client/reservation']);
      });
    });

    describe('ngOnInit', () => {
      it('should redirect to login when user is not logged in', () => {
        authService.isLoggedIn.and.returnValue(false);
        fixture.detectChanges();
        expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
        expect(reservationsService.handleAsync).not.toHaveBeenCalled();
      });

      it('should redirect to login when userId is missing', () => {
        authService.getMyAuthInfo.and.returnValue(null);
        fixture.detectChanges();
        expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
        expect(reservationsService.handleAsync).not.toHaveBeenCalled();
      });

      it('should load reservations with correct params when logged in', () => {
        fixture.detectChanges();
        expect(reservationsService.handleAsync).toHaveBeenCalledWith({
          pageNumber: 1,
          pageSize: 100,
          userId: 42
        });
      });

      it('should set reservations from dataItems on successful load', () => {
        const items = [
          mockReservation({ id: 1 }),
          mockReservation({ id: 2 })
        ];
        reservationsService.handleAsync.and.returnValue(
          of(mockPagedList(items))
        );
        fixture.detectChanges();
        expect(component.reservations).toEqual(items);
        expect(component.isLoading).toBe(false);
        expect(component.errorMessage).toBeNull();
      });

      it('should set reservations from DataItems (PascalCase) when API returns that shape', () => {
        const items = [mockReservation({ id: 1 })];
        reservationsService.handleAsync.and.returnValue(
          of({ DataItems: items } as unknown as MyPagedList<ReservationsGetAllResponse>)
        );
        fixture.detectChanges();
        expect(component.reservations).toEqual(items);
      });

      it('should set errorMessage and stop loading on API error', () => {
        reservationsService.handleAsync.and.returnValue(
          throwError(() => new Error('API error'))
        );
        fixture.detectChanges();
        expect(component.errorMessage).toBe('CLIENT.DASHBOARD_LOAD_ERROR');
        expect(component.isLoading).toBe(false);
      });
    });
  });
});
