import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ViewChildren, QueryList, ChangeDetectorRef, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { MyPagedList } from '../../../helper/my-paged-list';
import {
  ParkingSpotsGetAllEndpointService,
  ParkingSpotsGetAllRequest,
  ParkingSpotsGetAllResponse
} from '../../../endpoints/parking-spot-endpoints/parking-spot-get-all-endpoint.service';
import { MapInfoWindow, MapMarker } from '@angular/google-maps';
import { TranslateService } from '@ngx-translate/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { environment } from '../../../../environments/environment';
import * as L from 'leaflet';

export const SORT_OPTIONS = [
  { value: 'name', key: 'HOME.SORT_NAME' },
  { value: 'price', key: 'HOME.SORT_PRICE' },
  { value: 'availability', key: 'HOME.SORT_AVAILABILITY' }
] as const;

export interface MapLocation {
  lat: number;
  lng: number;
  titleKey: string;
  descKey: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: false
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  parkingSpots: MyPagedList<ParkingSpotsGetAllResponse> | null = null;
  currentSpotIndex = 0;

  isLoading = false;
  errorMessage: string | null = null;
  selectedFeatureIndex: number | null = null;

  filterForm!: FormGroup;
  /** Zona 1 = Vijećnica + Baščaršija, Zona 2 = Aria */
  readonly zoneGroups = [
    { value: null as number | null, labelKey: 'HOME.ALL_ZONES' },
    { value: 1, labelKey: 'HOME.ZONE_1' },
    { value: 2, labelKey: 'HOME.ZONE_2' }
  ];
  readonly sortOptions = SORT_OPTIONS;
  private destroy$ = new Subject<void>();

  mapApiLoaded = false;
  mapCenter: { lat: number; lng: number } = { lat: 43.858152, lng: 18.4165706 };
  mapZoom = 15;
  isHandset = false;
  isTablet = false;
  markerPositions: MapLocation[] = [
    { lat: 43.858152, lng: 18.4165706, titleKey: 'HOME.FEATURE_1_TITLE', descKey: 'HOME.FEATURE_1_DESC' },
    { lat: 43.86055, lng: 18.43085, titleKey: 'HOME.FEATURE_2_TITLE', descKey: 'HOME.FEATURE_2_DESC' },
    { lat: 43.85818, lng: 18.43363, titleKey: 'HOME.FEATURE_3_TITLE', descKey: 'HOME.FEATURE_3_DESC' }
  ];

  /** Open in Maps – poseban Google Maps link za svaku od 3 lokacije */
  openInMapsUrls: string[] = [
    'https://www.google.com/maps/place/Gara%C5%BEa+ARIA+mall/@43.8581378,18.4143502,1093m/data=!3m2!1e3!4b1!4m6!3m5!1s0x4758c900585eaeb9:0xca3446b046b27af8!8m2!3d43.858134!4d18.4169251!16s%2Fg%2F11vwnqmtld!5m1!1e2?entry=ttu',
    'https://www.google.com/maps/place/Sagrd%C5%BEije+29a,+Sarajevo+71000/@43.8608782,18.4303185,163m/data=!3m1!1e3!4m6!3m5!1s0x4758c8c976937cdd:0x115e64925aef7e7a!8m2!3d43.8608028!4d18.4310373!16s%2Fg%2F11c43w6828!5m1!1e2?entry=ttu',
    'https://www.google.com/maps/place/Underground+Garage/@43.8572189,18.4296348,773m/data=!3m1!1e3!4m14!1m7!3m6!1s0x4758c900585eaeb9:0xca3446b046b27af8!2sGara%C5%BEa+ARIA+mall!8m2!3d43.858134!4d18.4169251!16s%2Fg%2F11vwnqmtld!3m5!1s0x4758c90052e8dfb7:0xe373a0ce19c2a441!8m2!3d43.8581906!4d18.4334657!16s%2Fg%2F11w9m68l40!5m1!1e2?entry=ttu'
  ];

  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;
  @ViewChildren(MapMarker) markerDirectives!: QueryList<MapMarker>;
  @ViewChild('leafletMap') leafletMapRef!: ElementRef<HTMLDivElement>;

  private autoSlideInterval: ReturnType<typeof setInterval> | null = null;
  private leafletMap: L.Map | null = null;
  private leafletMarkers: L.Marker[] = [];

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      name: [''],
      zoneGroup: [null as number | null],
      onlyAvailable: [false],
      openNow: [false],
      sortBy: ['name']
    });
    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.fetchSpots());
    this.fetchSpots();
  }

  ngAfterViewInit(): void {
    const hasKey = (environment as { googleMapsApiKey?: string }).googleMapsApiKey?.trim();
    if (hasKey && hasKey !== 'YOUR_GOOGLE_MAPS_API_KEY') {
      this.loadGoogleMapsThenCheck();
    } else {
      setTimeout(() => this.initLeaflet(), 150);
    }
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
      .subscribe(() => {
        this.isHandset = this.breakpointObserver.isMatched(Breakpoints.Handset);
        this.isTablet = this.breakpointObserver.isMatched(Breakpoints.TabletPortrait);
      });
  }

  private initLeaflet(): void {
    const el = this.leafletMapRef?.nativeElement;
    if (!el || this.leafletMap) return;
    const pinIcon = L.divIcon({
      className: 'leaflet-custom-marker',
      html: `<span class="marker-pin"></span><span class="marker-dot"></span>`,
      iconSize: [30, 42],
      iconAnchor: [15, 42],
      popupAnchor: [0, -42]
    });
    this.leafletMap = L.map(el).setView([this.mapCenter.lat, this.mapCenter.lng], this.mapZoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.leafletMap);
    this.updateLeafletMarkers();
    setTimeout(() => this.leafletMap?.invalidateSize(), 200);
  }

  /** Ažurira Leaflet markere prema broju trenutno prikazanih spotova (nakon promjene filtera). */
  private updateLeafletMarkers(): void {
    if (!this.leafletMap) return;
    this.leafletMarkers.forEach(m => m.remove());
    this.leafletMarkers = [];
    const pinIcon = L.divIcon({
      className: 'leaflet-custom-marker',
      html: `<span class="marker-pin"></span><span class="marker-dot"></span>`,
      iconSize: [30, 42],
      iconAnchor: [15, 42],
      popupAnchor: [0, -42]
    });
    const positions = this.getMarkerPositionsForCurrentSpots();
    positions.forEach((loc, i) => {
      const title = this.getMarkerTitle(i);
      const content = this.getMarkerInfoContent(i);
      const marker = L.marker([loc.lat, loc.lng], { icon: pinIcon }).addTo(this.leafletMap!);
      marker.bindPopup(content, { className: 'leaflet-popup-custom' });
      marker.bindTooltip(title, { permanent: false, direction: 'top', offset: [0, -42] });
      const index = i;
      marker.on('click', () => {
        this.selectedFeatureIndex = index;
        this.cdr.detectChanges();
      });
      this.leafletMarkers.push(marker);
    });
  }

  private loadGoogleMapsThenCheck(): void {
    const key = (environment as { googleMapsApiKey?: string }).googleMapsApiKey?.trim();
    if (key && key !== 'YOUR_GOOGLE_MAPS_API_KEY') {
      if (typeof (window as unknown as { google?: unknown }).google !== 'undefined') {
        this.mapApiLoaded = true;
        this.cdr.detectChanges();
        return;
      }
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.mapApiLoaded = true;
        this.cdr.detectChanges();
      };
      script.onerror = () => {
        this.mapApiLoaded = false;
        this.cdr.detectChanges();
      };
      document.head.appendChild(script);
    } else {
      this.checkMapApiPoll();
    }
  }

  private checkMapApiPoll(): void {
    if (typeof (window as unknown as { google?: unknown }).google !== 'undefined') {
      this.mapApiLoaded = true;
      this.cdr.detectChanges();
      return;
    }
    const check = setInterval(() => {
      if (typeof (window as unknown as { google?: unknown }).google !== 'undefined') {
        this.mapApiLoaded = true;
        clearInterval(check);
        this.cdr.detectChanges();
      }
    }, 200);
    setTimeout(() => {
      clearInterval(check);
      this.cdr.detectChanges();
    }, 8000);
  }

  constructor(
    private parkingSpotService: ParkingSpotsGetAllEndpointService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private breakpointObserver: BreakpointObserver,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
    if (this.leafletMap) {
      this.leafletMap.remove();
      this.leafletMap = null;
    }
    this.leafletMarkers = [];
  }





  /** Pozvano kad korisnik promijeni zonu u filteru – odmah učitaj s filterom. */
  onZoneFilterChange(): void {
    this.fetchSpots();
  }

  private fetchSpots(): void {
    this.isLoading = true;
    this.errorMessage = null;
    const v = this.filterForm.getRawValue();
    const zoneGroupRaw = v.zoneGroup;
    const zoneGroup = zoneGroupRaw === null || zoneGroupRaw === undefined || zoneGroupRaw === ''
      ? undefined
      : Number(zoneGroupRaw);

    const request: ParkingSpotsGetAllRequest = {
      pageNumber: 1,
      pageSize: 50,
      name: v.name?.trim() || undefined,
      zoneGroup,
      onlyAvailable: v.onlyAvailable || undefined,
      openNow: v.openNow || undefined,
      sortBy: v.sortBy || undefined
    };
    this.parkingSpotService.handleAsync(request).subscribe({
      next: (result: MyPagedList<ParkingSpotsGetAllResponse>) => {
        this.parkingSpots = result;
        this.currentSpotIndex = 0;
        this.selectedFeatureIndex = null;
        this.isLoading = false;
        this.startAutoSlide();
        this.updateLeafletMarkers();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'ERROR_LOADING_PARKING';
        this.cdr.detectChanges();
      }
    });
  }

  getFilteredSpotItems(): ParkingSpotsGetAllResponse[] {
    return this.parkingSpots?.dataItems ?? [];
  }

  getAvailableCount(): number {
    return this.getFilteredSpotItems().filter(s => s.isActive).length;
  }

  /** Hover na karticu: odmah prikaži parking na mapi (bez klika). */
  hoverFeature(index: number): void {
    this.selectedFeatureIndex = index;
    this.centerMapOnFeature(index);
    this.openMarkerPopup(index);
    this.cdr.detectChanges();
  }

  /** Napusti karticu – ukloni selekciju i zatvori popup na mapi. */
  leaveFeatureCard(): void {
    this.selectedFeatureIndex = null;
    this.leafletMarkers.forEach(m => m.closePopup());
    this.infoWindow?.close();
    this.cdr.detectChanges();
  }

  /** Centriraj mapu na lokaciju (Leaflet ili Google) – pozicija prema lokaciji spota, ne indeksu u listi. */
  private centerMapOnFeature(index: number): void {
    const positions = this.getMarkerPositionsForCurrentSpots();
    const loc = positions[index];
    if (!loc) return;
    if (this.leafletMap) {
      this.leafletMap.setView([loc.lat, loc.lng], this.mapZoom);
    } else {
      this.mapCenter = { lat: loc.lat, lng: loc.lng };
    }
  }

  /** Otvori popup na markeru (Leaflet ili Google). */
  private openMarkerPopup(index: number): void {
    if (this.leafletMap && this.leafletMarkers[index]) {
      this.leafletMarkers[index].openPopup();
    }
    if (this.mapApiLoaded && this.markerDirectives?.get(index) && this.infoWindow) {
      const marker = this.markerDirectives.get(index);
      const content = this.getMarkerInfoContent(index);
      setTimeout(() => this.infoWindow.open(marker, false, content), 0);
    }
  }

  /**
   * Mapiranje spota na lokaciju: 0 = Aria, 1 = Baščaršija, 2 = Vijećnica.
   * Zone 2 → Aria; Zone 1, parking 1 → Vijećnica; Zone 1, parking 2 → Baščaršija.
   */
  getFeatureIndexForSpot(spot: ParkingSpotsGetAllResponse): number {
    if (!spot) return 0;
    if (spot.zoneId === 2) return 0; // Aria
    if (spot.zoneId === 1 && spot.parkingNumber === 1) return 2; // Vijećnica
    if (spot.zoneId === 1 && spot.parkingNumber === 2) return 1; // Baščaršija
    return 0;
  }

  getFeatureTitleKey(spot: ParkingSpotsGetAllResponse): string {
    const keys = ['HOME.FEATURE_1_TITLE', 'HOME.FEATURE_2_TITLE', 'HOME.FEATURE_3_TITLE'];
    return keys[this.getFeatureIndexForSpot(spot)] ?? 'HOME.FEATURE_1_TITLE';
  }

  getFeatureDescKey(spot: ParkingSpotsGetAllResponse): string {
    const keys = ['HOME.FEATURE_1_DESC', 'HOME.FEATURE_2_DESC', 'HOME.FEATURE_3_DESC'];
    return keys[this.getFeatureIndexForSpot(spot)] ?? 'HOME.FEATURE_1_DESC';
  }

  /** URL za "Get directions" za spot (prema lokaciji Aria/Baščaršija/Vijećnica). */
  getMapsUrlForSpot(spot: ParkingSpotsGetAllResponse): string {
    const idx = this.getFeatureIndexForSpot(spot);
    return this.openInMapsUrls[idx] ?? this.openInMapsUrls[0];
  }

  /** URL za indeks u listi (za mapu). */
  getMapsUrlForIndex(index: number): string {
    const spot = this.getSpotItems()[index];
    return spot ? this.getMapsUrlForSpot(spot) : (this.openInMapsUrls[index] ?? this.openInMapsUrls[0]);
  }

  /** Broj slobodnih mjesta za prikaz na kartici: Aria=3, Baščaršija=5, Vijećnica=10. */
  getAvailableSpotsForSpot(spot: ParkingSpotsGetAllResponse): number {
    if (!spot?.isActive) return 0;
    const idx = this.getFeatureIndexForSpot(spot);
    const counts: number[] = [2, 5, 10]; // 0=Aria, 1=Baščaršija, 2=Vijećnica
    return counts[idx] ?? 0;
  }

  selectFeature(index: number): void {
    this.selectedFeatureIndex = index;
    document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
    this.centerMapOnFeature(index);
    this.openMarkerPopup(index);
  }

  onMarkerClick(index: number): void {
    this.selectedFeatureIndex = index;
    const content = this.getMarkerInfoContent(index);
    setTimeout(() => {
      const marker = this.markerDirectives?.get(index);
      if (marker && this.infoWindow) {
        this.infoWindow.open(marker, false, content);
      }
    }, 0);
  }

  /** Pozicije markera za trenutne spotove – svaki spot dobiva koordinate svoje lokacije (Aria=0, Baščaršija=1, Vijećnica=2). */
  getMarkerPositionsForCurrentSpots(): MapLocation[] {
    return this.getSpotItems().map(spot => this.markerPositions[this.getFeatureIndexForSpot(spot)] ?? this.markerPositions[0]);
  }

  getMarkerTitle(index: number): string {
    const spot = this.getSpotItems()[index];
    if (spot) return this.translate.instant(this.getFeatureTitleKey(spot));
    const loc = this.markerPositions[index];
    return loc ? this.translate.instant(loc.titleKey) : '';
  }

  getMarkerInfoContent(index: number): string {
    const spot = this.getSpotItems()[index];
    const getDirections = this.translate.instant('HOME.GET_DIRECTIONS');
    if (spot) {
      const title = this.translate.instant(this.getFeatureTitleKey(spot));
      const desc = this.translate.instant(this.getFeatureDescKey(spot));
      const url = this.getMapsUrlForSpot(spot);
      return `
      <div class="map-popup-card">
        <strong class="map-popup-title">${title}</strong>
        <p class="map-popup-desc">${desc}</p>
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="map-popup-link">${getDirections}</a>
      </div>
    `.trim();
    }
    const loc = this.markerPositions[index];
    const url = this.openInMapsUrls[index] ?? this.openInMapsUrls[0];
    if (!loc) return '';
    const title = this.translate.instant(loc.titleKey);
    const desc = this.translate.instant(loc.descKey);
    return `
      <div class="map-popup-card">
        <strong class="map-popup-title">${title}</strong>
        <p class="map-popup-desc">${desc}</p>
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="map-popup-link">${getDirections}</a>
      </div>
    `.trim();
  }

  getSelectedFeatureTitle(): string {
    if (this.selectedFeatureIndex === null) return '';
    const keys = ['HOME.FEATURE_1_TITLE', 'HOME.FEATURE_2_TITLE', 'HOME.FEATURE_3_TITLE'];
    return keys[this.selectedFeatureIndex] ?? '';
  }

  getSelectedFeatureDesc(): string {
    if (this.selectedFeatureIndex === null) return '';
    const keys = ['HOME.FEATURE_1_DESC', 'HOME.FEATURE_2_DESC', 'HOME.FEATURE_3_DESC'];
    return keys[this.selectedFeatureIndex] ?? '';
  }

  getSelectedFeatureMapsUrl(): string {
    const idx = this.selectedFeatureIndex ?? 0;
    return this.openInMapsUrls[idx] ?? this.openInMapsUrls[0];
  }

  private startAutoSlide() {
    const items = this.getFilteredSpotItems();
    if (items.length > 1) {
      this.autoSlideInterval = setInterval(() => {
        this.nextSpot();
      }, 3000);
    }
  }

  nextSpot() {
    const items = this.getFilteredSpotItems();
    if (items.length === 0) return;
    this.currentSpotIndex = (this.currentSpotIndex + 1) % items.length;
  }

  previousSpot() {
    const items = this.getFilteredSpotItems();
    if (items.length === 0) return;
    this.currentSpotIndex = this.currentSpotIndex === 0 ? items.length - 1 : this.currentSpotIndex - 1;
  }

  goToSpot(index: number) {
    const items = this.getFilteredSpotItems();
    if (index >= 0 && index < items.length) this.currentSpotIndex = index;
  }

  getCurrentSpot(): ParkingSpotsGetAllResponse | null {
    const items = this.getFilteredSpotItems();
    if (items.length === 0) return null;
    this.currentSpotIndex = Math.min(this.currentSpotIndex, items.length - 1);
    return items[this.currentSpotIndex] ?? null;
  }

  getSpotItems(): ParkingSpotsGetAllResponse[] {
    return this.getFilteredSpotItems();
  }

  /** Broj pronađenih parking mjesta za prikaz u naslovu (koristi totalCount iz API-ja ako postoji). */
  getTotalParkingCount(): number {
    const total = this.parkingSpots?.totalCount;
    if (total != null && total >= 0) return total;
    return this.getSpotItems().length;
  }

  getSpotImageUrl(imageData: string | undefined): string {
    if (!imageData) return '';
    return imageData.startsWith('data:image/')
      ? imageData
      : `data:image/jpeg;base64,${imageData}`;
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) imgElement.style.display = 'none';
  }

}
