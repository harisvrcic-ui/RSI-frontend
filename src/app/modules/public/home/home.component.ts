import { Component, OnInit, OnDestroy } from '@angular/core';
import { MyPagedList } from '../../../helper/my-paged-list';
import {
  ParkingSpotsGetAllEndpointService,
  ParkingSpotsGetAllRequest,
  ParkingSpotsGetAllResponse
} from '../../../endpoints/parking-spot-endpoints/parking-spot-get-all-endpoint.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: false
})
export class HomeComponent implements OnInit, OnDestroy {
  parkingSpots: MyPagedList<ParkingSpotsGetAllResponse> | null = null;
  currentSpotIndex = 0;



  private autoSlideInterval: any;
  private parkingSpotGetAllEndpointService: any;


  ngOnInit(): void {
    this.fetchSpots();
  }


  constructor(private parkingSpotService: ParkingSpotsGetAllEndpointService) {}


  ngOnDestroy(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }







  private fetchSpots() {
    const request: ParkingSpotsGetAllRequest = {
      pageNumber: 1,
      pageSize: 15,
      q: ''
    };

    this.parkingSpotService.handleAsync(request).subscribe({
      next: (result: MyPagedList<ParkingSpotsGetAllResponse>) => {
        this.parkingSpots = result;
        this.startAutoSlide();
      },
      error: (err: any) => {
        console.error('Failed to load parking spots:', err);
      }
    });
  }

  private startAutoSlide() {
    const items = this.parkingSpots?.dataItems ?? [];
    if (items.length > 1) {
      this.autoSlideInterval = setInterval(() => {
        this.nextSpot();
      }, 3000);
    }
  }

  nextSpot() {
    const items = this.parkingSpots?.dataItems ?? [];
    if (items.length === 0) return;

    this.currentSpotIndex = (this.currentSpotIndex + 1) % items.length;
  }

  previousSpot() {
    const items = this.parkingSpots?.dataItems ?? [];
    if (items.length === 0) return;

    this.currentSpotIndex = this.currentSpotIndex === 0
      ? items.length - 1
      : this.currentSpotIndex - 1;
  }

  goToSpot(index: number) {
    const items = this.parkingSpots?.dataItems ?? [];
    if (index >= 0 && index < items.length) {
      this.currentSpotIndex = index;
    }
  }

  getCurrentSpot(): ParkingSpotsGetAllResponse | null {
    const items = this.parkingSpots?.dataItems ?? [];
    if (items.length === 0) return null;

    return items[this.currentSpotIndex] ?? null;
  }

  getSpotItems(): ParkingSpotsGetAllResponse[] {
    return this.parkingSpots?.dataItems ?? [];
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
