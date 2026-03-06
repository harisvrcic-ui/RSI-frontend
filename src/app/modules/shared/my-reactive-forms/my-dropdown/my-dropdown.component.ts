import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {MyBaseFormControlComponent} from '../my-base-form-control-component';
import {ControlContainer} from '@angular/forms';

@Component({
  selector: 'app-my-dropdown',
  standalone: false,

  templateUrl: './my-dropdown.component.html',
  styleUrl: './my-dropdown.component.css'
})
export class MyDropdownComponent extends MyBaseFormControlComponent implements OnInit, OnChanges {
  @Input() myLabel!: string; // Label for dropdown
  @Input() myId: string = ''; // ID for dropdown (used in <label for>)
  @Input() myPlaceholder: string = ''; // Placeholder text
  @Input() options: { id: number | string; name: string }[] = []; // Dropdown options
  @Input() defaultValue: number | string | null = null; // Podrazumijevana vrijednost

  @Input() override customMessages: Record<string, string> = {}; // Dodano!
  @Input() override myControlName: string = "";

  constructor(protected override controlContainer: ControlContainer) {
    super(controlContainer);
  }

  ngOnInit(): void {
    // Ako nije eksplicitno postavljen id, koristi naziv kontrola
    if (!this.myId && this.formControl) {
      this.myId = this.getControlName();
    }
  }

  compareFn(option: any, value: any): boolean {
    return option == value;// Loose comparison
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] || changes['defaultValue']) {
      // Check if options are loaded and set default value
      if (this.options.length > 0 && this.defaultValue !== null && !this.formControl.value) {
        this.formControl.patchValue(this.defaultValue, {emitEvent: true});
      }
    }
  }

}

