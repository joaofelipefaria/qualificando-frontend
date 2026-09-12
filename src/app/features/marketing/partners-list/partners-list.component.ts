import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';
import { Partner, PLATINUM_PARTNERS, GOLD_PARTNERS, SILVER_PARTNERS, partnerSiteUrl } from '../data/partners.mock';

/**
 * "Parceiros" menu page - NOT the splash (see PartnersSplashComponent):
 * this one is a normal in-app screen (own nav item, no overlay/once-per-
 * session logic), and unlike the splash it DOES label each tier. Each card
 * opens the partner's institutional site in a new tab.
 */
@Component({
  selector: 'app-partners-list',
  standalone: true,
  imports: [NgFor, NgIf, MatIconModule, MatCardModule, TranslateModule],
  templateUrl: './partners-list.component.html',
  styleUrl: './partners-list.component.scss'
})
export class PartnersListComponent {
  platinumPartners: Partner[] = PLATINUM_PARTNERS;
  goldPartners: Partner[] = GOLD_PARTNERS;
  silverPartners: Partner[] = SILVER_PARTNERS;

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
