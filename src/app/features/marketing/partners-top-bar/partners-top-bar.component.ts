import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Partner, PLATINUM_PARTNERS, partnerSiteUrl } from '../data/partners.mock';

/**
 * Slim strip shown at the top of the app (above the main toolbar) with the
 * platinum partners' logos only. Each logo opens the partner's
 * institutional site in a new tab; hovering (or focusing, for keyboard/a11y)
 * reveals the partner's descriptive text via a small popover.
 */
@Component({
  selector: 'app-partners-top-bar',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './partners-top-bar.component.html',
  styleUrl: './partners-top-bar.component.scss'
})
export class PartnersTopBarComponent {
  platinumPartners: Partner[] = PLATINUM_PARTNERS;

  siteUrl(partner: Partner): string {
    return partnerSiteUrl(partner);
  }

  initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(word => word[0]?.toUpperCase())
      .join('');
  }
}
